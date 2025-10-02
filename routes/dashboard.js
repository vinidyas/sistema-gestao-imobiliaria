// routes/dashboard.js - Rotas para dashboard e estatísticas
const express = require('express');
const { query } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats - Estatísticas gerais
router.get('/stats', auth, async (req, res) => {
    try {
        const [imoveisStats, contratosStats, faturasStats] = await Promise.all([
            query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE disponibilidade = 'disponivel') as disponiveis,
                    COUNT(*) FILTER (WHERE disponibilidade = 'locado') as locados
                FROM imoveis 
                WHERE ativo = true
            `),
            query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status_contrato = 'ativo') as ativos
                FROM contratos 
                WHERE ativo = true
            `),
            query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status_fatura = 'em_aberto') as pendentes
                FROM faturas 
                WHERE ativo = true
            `)
        ]);

        res.json({
            success: true,
            data: {
                imoveis: {
                    total: parseInt(imoveisStats.rows[0].total),
                    disponiveis: parseInt(imoveisStats.rows[0].disponiveis),
                    locados: parseInt(imoveisStats.rows[0].locados)
                },
                contratos: {
                    total: parseInt(contratosStats.rows[0].total),
                    ativos: parseInt(contratosStats.rows[0].ativos)
                },
                faturas: {
                    total: parseInt(faturasStats.rows[0].total),
                    pendentes: parseInt(faturasStats.rows[0].pendentes)
                }
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
});

// GET /api/dashboard/ultimos-imoveis - Últimos imóveis
router.get('/ultimos-imoveis', auth, async (req, res) => {
    try {
        const result = await query(`
            SELECT i.id, i.codigo, i.nome_imovel, i.cidade, i.estado, 
                   i.disponibilidade, i.data_criacao
            FROM imoveis i
            WHERE i.ativo = true
            ORDER BY i.data_criacao DESC
            LIMIT 5
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar últimos imóveis:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar últimos imóveis' });
    }
});

module.exports = router;
