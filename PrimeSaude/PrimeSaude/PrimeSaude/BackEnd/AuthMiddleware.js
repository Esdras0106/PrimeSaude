<<<<<<< HEAD:PrimeSaude/BackEnd/AuthMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'primesaude_chave_secreta_2026';

const verifyTokenAndRole = (roles = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
        }

        try {
            // Decodifica e valida o token JWT (RNF-002)
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Contém: { idUsuario, nome, email, perfil }

            const [users] = await db.execute(
                'SELECT ativo FROM usuarios WHERE idUsuario = ?',
                [decoded.idUsuario]
            );

            if (users.length === 0 || !users[0].ativo) {
                return res.status(403).json({ error: 'Usuário desativado. Entre em contato com o administrador.' });
            }

            // Validação de Perfil de Ac    esso (RF-002)
            if (roles.length > 0 && !roles.includes(req.user.perfil)) {
                return res.status(403).json({ error: 'Acesso negado. Perfil não autorizado para esta operação.' });
            }

            next();
        } catch (error) {
            return res.status(403).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
        }
    };
};

=======
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'primesaude_chave_secreta_2026';

const verifyTokenAndRole = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
        }

        try {
            // Decodifica e valida o token JWT (RNF-002)
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Contém: { idUsuario, nome, email, perfil }

            // Validação de Perfil de Ac    esso (RF-002)
            if (roles.length > 0 && !roles.includes(req.user.perfil)) {
                return res.status(403).json({ error: 'Acesso negado. Perfil não autorizado para esta operação.' });
            }

            next();
        } catch (error) {
            return res.status(403).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
        }
    };
};

>>>>>>> d3be3dbb19c39ca375a42ee876b31c9ea6ebb110:PrimeSaude/PrimeSaude/BackEnd/AuthMiddleware.js
module.exports = { verifyTokenAndRole, JWT_SECRET };