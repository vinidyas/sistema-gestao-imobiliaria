#!/bin/bash

echo "🔧 CORREÇÃO ESPECÍFICA - PROBLEMA SSL POSTGRESQL"
echo "==============================================="
echo

echo "🎯 PROBLEMA: The server does not support SSL connections"
echo "✅ SOLUÇÃO: Desabilitar SSL na configuração do PostgreSQL"
echo

# 1. Backup do arquivo atual
echo "💾 Fazendo backup do config/database.js atual..."
cp config/database.js config/database.js.backup 2>/dev/null || echo "Arquivo não encontrado, continuando..."

# 2. Criar versão corrigida do database.js
echo "📝 Criando config/database.js corrigido (sem SSL)..."
mkdir -p config
cat > config/database.js << 'EOF'
// config/database.js - VERSÃO CORRIGIDA (SEM SSL)
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'imobiliaria_user',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'sistema_imobiliario',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    // SSL DESABILITADO para ambiente Docker
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão PostgreSQL:', err);
    process.exit(-1);
});

// Função helper para executar queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Query executada:', { 
            text: text.substring(0, 50), 
            duration, 
            rows: res.rowCount 
        });
        return res;
    } catch (error) {
        console.error('Erro na query:', error);
        throw error;
    }
};

// Função para transações
const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    pool,
    query,
    withTransaction
};
EOF

echo "✅ Arquivo config/database.js corrigido criado"

# 3. Verificar .env
echo "📝 Verificando arquivo .env..."
if grep -q "DB_HOST=postgres" .env 2>/dev/null; then
    echo "✅ DB_HOST está correto"
else
    echo "⚠️  Corrigindo DB_HOST..."
    sed -i 's/DB_HOST=localhost/DB_HOST=postgres/' .env 2>/dev/null || echo "DB_HOST=postgres" >> .env
fi

# 4. Reiniciar apenas a aplicação (não o banco)
echo "🔄 Reiniciando aplicação..."
docker-compose restart app
sleep 5

# 5. Testar conexão
echo "🧪 Testando conexão corrigida..."
sleep 3

# Teste da API
HEALTH_CHECK=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if echo "$HEALTH_CHECK" | grep -q '"success":true'; then
    echo "✅ API funcionando!"
else
    echo "❌ API ainda com problema"
    echo "Logs da aplicação:"
    docker-compose logs app --tail=5
fi

# Teste do login
echo "🔐 Testando login..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@imobiliaria.com","senha":"123456"}' 2>/dev/null)

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "🎉 LOGIN FUNCIONANDO PERFEITAMENTE!"
    echo "✅ Token JWT gerado com sucesso"
    echo "✅ Problema de SSL resolvido"
else
    echo "❌ Login ainda com problema:"
    echo "$LOGIN_RESULT"
    echo
    echo "📋 Logs mais recentes:"
    docker-compose logs app --tail=8
fi

echo
echo "🎯 CORREÇÃO ESPECÍFICA CONCLUÍDA!"
echo "Se funcionou, o sistema está pronto para uso!"
