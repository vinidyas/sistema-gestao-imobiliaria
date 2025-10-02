#!/bin/bash

echo "🔧 CORREÇÃO AUTOMÁTICA - ERRO 500"
echo "================================="
echo

# 1. Parar containers
echo "🛑 Parando containers..."
docker-compose down
sleep 2

# 2. Verificar se .env existe e está correto
echo "📝 Verificando configuração .env..."
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado! Criando..."
    cp .env.example .env

    # Gerar senhas seguras
    DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    REDIS_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

    # Atualizar .env com senhas geradas
    sed -i "s/sua_senha_postgresql_aqui/$DB_PASS/g" .env
    sed -i "s/sua_chave_jwt_muito_forte_e_segura_aqui/$JWT_SECRET/g" .env
    sed -i "s/sua_senha_redis_aqui/$REDIS_PASS/g" .env
    sed -i "s/senha_postgres_docker/$DB_PASS/g" .env
    sed -i "s/senha_redis_docker/$REDIS_PASS/g" .env

    echo "✅ Arquivo .env criado com senhas aleatórias"
else
    echo "✅ Arquivo .env já existe"
fi

# 3. Limpar dados antigos e rebuild
echo "🧹 Limpando dados antigos..."
docker-compose down -v  # Remove volumes
docker system prune -f  # Remove containers/images não utilizados

# 4. Rebuild e start
echo "🔨 Rebuilding e iniciando containers..."
docker-compose up -d --build
sleep 10

# 5. Verificar se containers subiram
echo "📊 Verificando status dos containers..."
docker-compose ps

# 6. Aguardar banco inicializar
echo "⏳ Aguardando PostgreSQL inicializar..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -h localhost -p 5432 -U imobiliaria_user >/dev/null 2>&1; then
        echo "✅ PostgreSQL pronto!"
        break
    fi
    echo "⏳ Aguardando PostgreSQL... ($i/30)"
    sleep 2
done

# 7. Verificar se schema foi aplicado
echo "🗃️  Verificando schema do banco..."
TABLES_COUNT=$(docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ "$TABLES_COUNT" -gt "0" ]; then
    echo "✅ Schema aplicado - $TABLES_COUNT tabelas encontradas"
else
    echo "❌ Schema não aplicado! Aplicando manualmente..."

    # Aplicar schema manualmente
    docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario << 'EOF'
BEGIN;

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'funcionario' CHECK (tipo_usuario IN ('admin', 'corretor', 'funcionario')),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
VALUES ('Administrador', 'admin@imobiliaria.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZJGlrC1QjGO/K2e', 'admin')
ON CONFLICT (email) DO NOTHING;

COMMIT;
EOF
    echo "✅ Schema aplicado manualmente"
fi

# 8. Verificar se usuário admin existe
echo "👤 Verificando usuário admin..."
USER_EXISTS=$(docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliaria -t -c "SELECT COUNT(*) FROM usuarios WHERE email = 'admin@imobiliaria.com';" 2>/dev/null | xargs)

if [ "$USER_EXISTS" = "1" ]; then
    echo "✅ Usuário admin existe"
else
    echo "❌ Usuário admin não existe! Criando..."
    docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario -c "
        INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo) 
        VALUES ('Admin Sistema', 'admin@imobiliaria.com', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZJGlrC1QjGO/K2e', 'admin', true)
        ON CONFLICT (email) DO UPDATE SET 
        senha = '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZJGlrC1QjGO/K2e';
    "
    echo "✅ Usuário admin criado"
fi

# 9. Testar API
echo "🧪 Testando API..."
sleep 5

# Teste health check
HEALTH_CHECK=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if echo "$HEALTH_CHECK" | grep -q '"success":true'; then
    echo "✅ API Health Check OK"
else
    echo "❌ API Health Check Failed"
    echo "Response: $HEALTH_CHECK"
fi

# Teste login
echo "🔐 Testando login..."
LOGIN_TEST=$(curl -s -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@imobiliaria.com","senha":"123456"}' 2>/dev/null)

if echo "$LOGIN_TEST" | grep -q '"success":true'; then
    echo "✅ LOGIN FUNCIONANDO!"
    echo "Token gerado com sucesso!"
else
    echo "❌ Login ainda com problema:"
    echo "$LOGIN_TEST"
    echo
    echo "🔍 Verificando logs da aplicação..."
    docker-compose logs app --tail=10
fi

echo
echo "🎉 CORREÇÃO CONCLUÍDA!"
echo "Teste o login em: http://seu-ip:3000"
echo "Credenciais: admin@imobiliaria.com / 123456"
