<<<<<<< HEAD:PrimeSaude/BackEnd/server.js
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

        const [paciente] = await db.execute(
            `SELECT p.idPaciente, u.ativo
             FROM pacientes p
             INNER JOIN usuarios u ON u.idUsuario = p.idUsuario
             WHERE p.idPaciente = ?`,
            [idPaciente]
        );

        if (paciente.length === 0) {
            return res.status(404).json({ error: 'Paciente não encontrado.' });
        }

        if (!paciente[0].ativo) {
            return res.status(409).json({ error: 'Não é possível agendar consulta para um paciente inativo.' });
        }

        const [medico] = await db.execute(
            `SELECT m.idMedico, u.ativo
             FROM medicos m
             INNER JOIN usuarios u ON u.idUsuario = m.idUsuario
             WHERE m.idMedico = ?`,
            [idMedico]
        );

        if (medico.length === 0) {
            return res.status(404).json({ error: 'Médico não encontrado.' });
        }

        if (!medico[0].ativo) {
            return res.status(409).json({ error: 'Não é possível agendar consulta com um médico inativo.' });
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

// Rota para listar usuários cadastrados
app.get('/api/usuarios', verifyTokenAndRole(['ADMIN', 'ATENDENTE']), async (req, res) => {
    try {
        const [usuarios] = await db.execute(
            'SELECT idUsuario, nome, email, perfil, ativo, dataCadastro FROM usuarios ORDER BY nome ASC'
        );

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao carregar usuários cadastrados.' });
    }
});

// RF-XXX: Administrador altera o status do usuário (ativo/inativo)
const atualizarStatusUsuario = async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;

    if (ativo === undefined || ativo === null || typeof ativo !== 'boolean') {
        return res.status(400).json({ error: 'Informe o campo "ativo" como booleano.' });
    }

    try {
        const [usuarioExistente] = await db.execute(
            'SELECT idUsuario FROM usuarios WHERE idUsuario = ?',
            [id]
        );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        await db.execute(
            'UPDATE usuarios SET ativo = ? WHERE idUsuario = ?',
            [ativo, id]
        );

        const [usuarioAtualizado] = await db.execute(
            'SELECT idUsuario, nome, email, perfil, ativo, dataCadastro FROM usuarios WHERE idUsuario = ?',
            [id]
        );

        res.status(200).json({
            message: `Status do usuário ${usuarioAtualizado[0].nome} atualizado com sucesso!`,
            usuario: usuarioAtualizado[0]
        });
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        res.status(500).json({ error: 'Erro ao alterar o status do usuário.' });
    }
};

app.put('/api/usuarios/:id/estado', verifyTokenAndRole(['ADMIN']), atualizarStatusUsuario);
app.patch('/api/usuarios/:id/estado', verifyTokenAndRole(['ADMIN']), atualizarStatusUsuario);

// Rota para listar pacientes cadastrados
app.get('/api/pacientes', verifyTokenAndRole(['ADMIN', 'ATENDENTE', 'MEDICO']), async (req, res) => {
    try {
        const [pacientes] = await db.execute(
            'SELECT idPaciente, nome, cpf, dataNascimento, email, idUsuario FROM pacientes ORDER BY nome ASC'
        );

        res.status(200).json(pacientes);
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ error: 'Erro ao carregar pacientes cadastrados.' });
    }
});

// Rota para listar médicos cadastrados
app.get('/api/medicos', verifyTokenAndRole(['ADMIN', 'ATENDENTE', 'MEDICO', 'PACIENTE']), async (req, res) => {
    try {
        const [medicos] = await db.execute(
            'SELECT idMedico, nome, crm, especialidade, email, idUsuario FROM medicos ORDER BY nome ASC'
        );

        res.status(200).json(medicos);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).json({ error: 'Erro ao carregar médicos cadastrados.' });
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
=======
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

// Rota para listar usuários cadastrados
app.get('/api/usuarios', verifyTokenAndRole(['ADMIN', 'ATENDENTE']), async (req, res) => {
    try {
        const [usuarios] = await db.execute(
            'SELECT idUsuario, nome, email, perfil, ativo, dataCadastro FROM usuarios ORDER BY nome ASC'
        );

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao carregar usuários cadastrados.' });
    }
});

// Rota para listar pacientes cadastrados
app.get('/api/pacientes', verifyTokenAndRole(['ADMIN', 'ATENDENTE', 'MEDICO']), async (req, res) => {
    try {
        const [pacientes] = await db.execute(
            'SELECT idPaciente, nome, cpf, dataNascimento, email, idUsuario FROM pacientes ORDER BY nome ASC'
        );

        res.status(200).json(pacientes);
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ error: 'Erro ao carregar pacientes cadastrados.' });
    }
});

// Rota para listar médicos cadastrados
app.get('/api/medicos', verifyTokenAndRole(['ADMIN', 'ATENDENTE', 'MEDICO', 'PACIENTE']), async (req, res) => {
    try {
        const [medicos] = await db.execute(
            'SELECT idMedico, nome, crm, especialidade, email, idUsuario FROM medicos ORDER BY nome ASC'
        );

        res.status(200).json(medicos);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).json({ error: 'Erro ao carregar médicos cadastrados.' });
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
>>>>>>> d3be3dbb19c39ca375a42ee876b31c9ea6ebb110:PrimeSaude/PrimeSaude/BackEnd/server.js
});