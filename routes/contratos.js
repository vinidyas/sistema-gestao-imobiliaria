// routes/contratos.js - Rotas para gestão de contratos
const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, withTransaction } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/contratos - Listar todos os contratos
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const queryText = `
            SELECT c.*, 
                   i.nome_imovel, i.nome_condominio, i.logradouro, i.numero,
                   COUNT(*) OVER() as total_count
            FROM contratos c
            JOIN imoveis i ON c.imovel_id = i.id
            WHERE c.ativo = true
            ORDER BY c.data_criacao DESC LIMIT $1 OFFSET $2
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
        console.error('Erro ao listar contratos:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar contratos' });
    }
});

// POST /api/contratos - Criar novo contrato
router.post('/', auth, async (req, res) => {
    try {
        const result = await withTransaction(async (client) => {
            // Gerar código do contrato
            const codigoResult = await client.query(`
                SELECT CONCAT('CONT', LPAD(COALESCE(MAX(CAST(SUBSTRING(codigo_contrato, 5) AS INTEGER)), 0) + 1, 3, '0')) AS proximo_codigo
                FROM contratos 
                WHERE codigo_contrato LIKE 'CONT%'
            `);
            const codigo = codigoResult.rows[0]?.proximo_codigo || 'CONT001';

            // Inserir contrato
            const contratoResult = await client.query(`
                INSERT INTO contratos (
                    codigo_contrato, imovel_id, data_inicio, duracao_meses,
                    valor_aluguel, dia_vencimento_aluguel, status_contrato, criado_por
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [
                codigo, req.body.imovel_id, req.body.data_inicio, req.body.duracao_meses,
                req.body.valor_aluguel, req.body.dia_vencimento_aluguel, 'ativo', req.user.id
            ]);

            // Atualizar status do imóvel para locado
            await client.query(`
                UPDATE imoveis SET disponibilidade = 'locado', ocupacao = 'locado'
                WHERE id = $1
            `, [req.body.imovel_id]);

            return contratoResult.rows[0];
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error('Erro ao criar contrato:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar contrato' });
    }
});

module.exports = router;
