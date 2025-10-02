#!/bin/bash

# Script de deploy automatizado
echo "🚀 Iniciando deploy..."

# Pull das últimas alterações
echo "📥 Atualizando código..."
git pull origin main

# Build da nova versão
echo "🔨 Construindo aplicação..."
docker-compose build

# Deploy com zero downtime
echo "🔄 Fazendo deploy..."
docker-compose up -d

# Verificar saúde da aplicação
echo "🏥 Verificando saúde da aplicação..."
sleep 10
curl -f http://localhost/api/health || {
    echo "❌ Deploy falhou!"
    exit 1
}

echo "✅ Deploy concluído com sucesso!"
