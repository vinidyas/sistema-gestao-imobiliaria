// routes/imoveis.js - Rotas para gestão de imóveis
const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, withTransaction } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Função para gerar próximo código
async function getProximoCodigo() {
    try {
        const result = await query(`
            SELECT CONCAT('IMV', LPAD(COALESCE(MAX(CAST(SUBSTRING(codigo, 4) AS INTEGER)), 0) + 1, 3, '0')) AS proximo_codigo
            FROM imoveis 
            WHERE codigo LIKE 'IMV%'
        `);
        return result.rows[0]?.proximo_codigo || 'IMV001';
    } catch (error) {
        console.error('Erro ao gerar código:', error);
        return 'IMV001';
    }
}

// GET /api/imoveis - Listar todos os imóveis
router.get('/', auth, async (req, res) => {
    try {
        const { search, finalidade, disponibilidade, cidade, limit = 50, offset = 0 } = req.query;

        let queryText = `
            SELECT i.*, 
                   COUNT(*) OVER() as total_count,
                   CASE WHEN i.disponibilidade = 'locado' THEN 'Locado'
                        WHEN i.disponibilidade = 'disponivel' THEN 'Disponível'
                        ELSE 'Indisponível' END as status_display
            FROM imoveis i
            WHERE i.ativo = true
        `;

        const queryParams = [];
        let paramCount = 1;

        // Filtros
        if (search) {
            queryText += ` AND (i.nome_imovel ILIKE $${paramCount} OR i.codigo ILIKE $${paramCount} OR i.logradouro ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        queryText += ` ORDER BY i.data_criacao DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        queryParams.push(limit, offset);

        const result = await query(queryText, queryParams);

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
        console.error('Erro ao listar imóveis:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar imóveis' });
    }
});

// POST /api/imoveis - Criar novo imóvel
router.post('/', auth, async (req, res) => {
    try {
        const codigo = await getProximoCodigo();

        const result = await query(`
            INSERT INTO imoveis (
                codigo, nome_imovel, tipo_imovel, finalidade, disponibilidade,
                cidade, estado, nome_condominio, cep, bairro, logradouro, numero, complemento,
                dormitorios, banheiros, vagas_garagem, area_construida_total,
                valor_locacao, valor_venda, valor_iptu, valor_condominio, outros_valores,
                observacoes_internas, criado_por
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING *
        `, [
            codigo, req.body.nome_imovel, req.body.tipo_imovel, req.body.finalidade,
            req.body.disponibilidade || 'disponivel', req.body.cidade, req.body.estado,
            req.body.nome_condominio, req.body.cep, req.body.bairro, req.body.logradouro,
            req.body.numero, req.body.complemento, req.body.dormitorios || 0,
            req.body.banheiros || 0, req.body.vagas_garagem || 0, req.body.area_construida_total,
            req.body.valor_locacao, req.body.valor_venda, req.body.valor_iptu,
            req.body.valor_condominio, req.body.outros_valores, req.body.observacoes_internas,
            req.user.id
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar imóvel:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar imóvel' });
    }
});

// GET /api/imoveis/disponiveis/select - Buscar imóveis disponíveis
router.get('/disponiveis/select', auth, async (req, res) => {
    try {
        const result = await query(`
            SELECT id, codigo, nome_imovel, logradouro, numero, nome_condominio, cidade
            FROM imoveis 
            WHERE ativo = true AND disponibilidade = 'disponivel'
            ORDER BY nome_imovel
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar imóveis disponíveis:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar imóveis disponíveis' });
    }
});

module.exports = router;
