// routes/auth.js - Rotas de autenticação
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login - Login do usuário
router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, senha } = req.body;

        // Buscar usuário
        const userResult = await query('SELECT * FROM usuarios WHERE email = $1 AND ativo = true', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        const user = userResult.rows[0];

        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'sua_chave_jwt_segura_aqui',
            { expiresIn: '24h' }
        );

        // Remover senha do objeto de resposta
        delete user.senha;

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// GET /api/auth/profile - Buscar perfil do usuário logado
router.get('/profile', auth, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
