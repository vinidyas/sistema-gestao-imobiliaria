// routes/faturas.js - Rotas para gestão de faturas
const express = require('express');
const { query } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/faturas - Listar todas as faturas
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const queryText = `
            SELECT f.*, 
                   c.codigo_contrato,
                   i.nome_imovel,
                   COUNT(*) OVER() as total_count
            FROM faturas f
            LEFT JOIN contratos c ON f.contrato_id = c.id
            LEFT JOIN imoveis i ON c.imovel_id = i.id
            WHERE f.ativo = true
            ORDER BY f.data_vencimento DESC LIMIT $1 OFFSET $2
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
        console.error('Erro ao listar faturas:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar faturas' });
    }
});

// POST /api/faturas - Criar nova fatura
router.post('/', auth, async (req, res) => {
    try {
        const result = await query(`
            INSERT INTO faturas (
                contrato_id, numero_fatura, competencia, data_vencimento, 
                valor_total, status_fatura, criado_por
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            req.body.contrato_id, req.body.numero_fatura, req.body.competencia,
            req.body.data_vencimento, req.body.valor_total, 'em_aberto', req.user.id
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar fatura:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar fatura' });
    }
});

// PUT /api/faturas/:id - Atualizar fatura
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
            UPDATE faturas 
            SET status_fatura = $1, data_pagamento = $2, 
                atualizado_por = $3, data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = $4 AND ativo = true
            RETURNING *
        `, [req.body.status_fatura, req.body.data_pagamento, req.user.id, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Fatura não encontrada' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar fatura:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar fatura' });
    }
});

module.exports = router;
