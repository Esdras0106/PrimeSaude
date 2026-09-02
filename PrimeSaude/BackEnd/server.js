const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { verifyTokenAndRole, JWT_SECRET } = require('./AuthMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// RF-003 / RNF-001: Cadastro de Usuário Dinâmico
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha, perfil, crm, especialidade, cpf, dataNascimento } = req.body;

    if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios básicos.' });
    }

    const perfilUpper = perfil.trim().toUpperCase();

    try {
        const [existing] = await db.execute('SELECT idUsuario FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado.' });
        }

        const hashSenha = await bcrypt.hash(senha, 10);

        const [resultUser] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, perfil, ativo, dataCadastro) VALUES (?, ?, ?, ?, TRUE, NOW())',
            [nome, email, hashSenha, perfilUpper]
        );

        const idUsuarioGerado = resultUser.insertId;

        if (perfilUpper === 'MEDICO') {
            if (!crm || !especialidade) {
                return res.status(400).json({ error: 'CRM e Especialidade são obrigatórios para Médicos.' });
            }
            await db.execute(
                'INSERT INTO medicos (nome, crm, especialidade, email, idUsuario) VALUES (?, ?, ?, ?, ?)',
                [nome, crm, especialidade, email, idUsuarioGerado]
            );
        } else if (perfilUpper === 'PACIENTE') {
            if (!cpf || !dataNascimento) {
                return res.status(400).json({ error: 'CPF e Data de Nascimento são obrigatórios para Pacientes.' });
            }
            await db.execute(
                'INSERT INTO pacientes (nome, cpf, dataNascimento, email, idUsuario) VALUES (?, ?, ?, ?, ?)',
                [nome, cpf, dataNascimento, email, idUsuarioGerado]
            );
        }

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', idUsuario: idUsuarioGerado });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário. Verifique se CRM ou CPF já existem.' });
    }
});

// RF-001 / RNF-001: Autenticação de Usuário e Geração do Token JWT
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    try {
        const [users] = await db.execute(
            'SELECT idUsuario, nome, email, senha, perfil, ativo FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const user = users[0];

        if (!user.ativo) {
            return res.status(403).json({ error: 'Usuário desativado. Entre em contato com o administrador.' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign(
            { idUsuario: user.idUsuario, nome: user.nome, email: user.email, perfil: user.perfil },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                idUsuario: user.idUsuario,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao realizar login.' });
    }
});

// RF-026 / RN-005 / RN-006 / RF-039: Agendamento de Consulta
app.post('/api/consultas', verifyTokenAndRole(['ADMIN', 'ATENDENTE']), async (req, res) => {
    const { idPaciente, idMedico, dataConsulta, horaConsulta, motivo, observacoes } = req.body;
    const idUsuarioAgendador = req.user.idUsuario;

    if (!idPaciente || !idMedico || !dataConsulta || !horaConsulta) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        if (dataConsulta < dataHoje) {
            return res.status(400).json({ error: 'A data da consulta não pode ser anterior à data atual.' });
        }

        const [medicoOcupado] = await db.execute(
            'SELECT idConsulta FROM consultas WHERE idMedico = ? AND dataConsulta = ? AND horaConsulta = ? AND status != "CANCELADA"',
            [idMedico, dataConsulta, horaConsulta]
        );

        if (medicoOcupado.length > 0) {
            return res.status(400).json({ error: 'O médico já possui uma consulta agendada para este dia e horário.' });
        }

        const [result] = await db.execute(
            'INSERT INTO consultas (idPaciente, idMedico, dataConsulta, horaConsulta, motivo, observacoes, status, idUsuario) VALUES (?, ?, ?, ?, ?, ?, "AGENDADA", ?)',
            [idPaciente, idMedico, dataConsulta, horaConsulta, motivo || null, observacoes || null, idUsuarioAgendador]
        );

        res.status(201).json({
            message: 'Consulta agendada com sucesso!',
            idConsulta: result.insertId
        });
    } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        res.status(500).json({ error: 'Erro interno ao agendar consulta.' });
    }
});

// Rota para listar consultas (Retorna também 'motivo' e 'observacoes' para ATENDENTE, MEDICO, ADMIN e PACIENTE)
app.get('/api/consultas', verifyTokenAndRole(['ADMIN', 'ATENDENTE', 'MEDICO', 'PACIENTE']), async (req, res) => {
    const { idUsuario, perfil } = req.user;
    const perfilUpper = perfil ? perfil.toUpperCase() : '';

    try {
        let baseQuery = `
            SELECT c.idConsulta, c.dataConsulta, c.horaConsulta, c.status, c.motivo, c.observacoes,
                   COALESCE(p.nome, 'Paciente não cadastrado') AS pacienteNome, 
                   COALESCE(m.nome, 'Médico não cadastrado') AS medicoNome
            FROM consultas c
            LEFT JOIN pacientes p ON c.idPaciente = p.idPaciente
            LEFT JOIN medicos m ON c.idMedico = m.idMedico
        `;
        
        let params = [];

        if (perfilUpper === 'PACIENTE') {
            baseQuery += ` WHERE p.idUsuario = ?`;
            params.push(idUsuario);
        } else if (perfilUpper === 'MEDICO') {
            baseQuery += ` WHERE m.idUsuario = ?`;
            params.push(idUsuario);
        }

        baseQuery += ` ORDER BY c.dataConsulta DESC, c.horaConsulta DESC`;

        const [consultas] = await db.execute(baseQuery, params);
        res.status(200).json(consultas);
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ error: 'Erro ao carregar o histórico de agendamentos.' });
    }
});

// Rota para médico/admin concluir a consulta e salvar observações
app.put('/api/consultas/:id', verifyTokenAndRole(['MEDICO', 'ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    try {
        const novoStatus = status || 'CONCLUIDO';
        await db.execute(
            'UPDATE consultas SET status = ?, observacoes = ? WHERE idConsulta = ?',
            [novoStatus, observacoes || null, id]
        );

        res.status(200).json({ message: 'Consulta concluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar consulta:', error);
        res.status(500).json({ error: 'Erro ao atualizar consulta.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});