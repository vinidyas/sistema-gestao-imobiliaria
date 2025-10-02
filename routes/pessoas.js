// routes/pessoas.js - Rotas para gestão de pessoas
const express = require('express');
const { query } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/pessoas - Listar todas as pessoas
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;

        const queryText = `
            SELECT *, COUNT(*) OVER() as total_count
            FROM pessoas
            WHERE ativo = true
            ORDER BY nome LIMIT $1 OFFSET $2
        `;

        const result = await query(queryText, [limit, offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(result.rows[0]?.total_count) || 0,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Erro ao listar pessoas:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar pessoas' });
    }
});

// POST /api/pessoas - Criar nova pessoa
router.post('/', auth, async (req, res) => {
    try {
        const result = await query(`
            INSERT INTO pessoas (nome, cpf_cnpj, email, telefone, endereco, tipo_pessoa, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            req.body.nome, req.body.cpf_cnpj, req.body.email,
            req.body.telefone, req.body.endereco, req.body.tipo_pessoa,
            req.body.observacoes
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar pessoa:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar pessoa' });
    }
});

module.exports = router;
