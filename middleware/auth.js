// middleware/auth.js - Middleware de autenticação JWT
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de acesso não fornecido' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_jwt_segura_aqui');

        // Verificar se usuário ainda existe e está ativo
        const userResult = await query(
            'SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = $1 AND ativo = true', 
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário não encontrado ou inativo' 
            });
        }

        req.user = userResult.rows[0];
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
};

module.exports = auth;
