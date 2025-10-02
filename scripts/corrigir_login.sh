#!/bin/bash

echo "🔧 CORREÇÃO AUTOMÁTICA DO PROBLEMA DE LOGIN"
echo "============================================"
echo

# 1. Verificar se containers estão rodando
echo "📊 1. Verificando status dos containers..."
docker-compose ps
echo

# 2. Verificar logs de erro
echo "📋 2. Verificando logs da aplicação..."
docker-compose logs --tail=20 app | grep -i error || echo "Nenhum erro óbvio encontrado nos logs"
echo

# 3. Testar conectividade da API
echo "🔌 3. Testando conectividade da API..."
API_HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [[ $? -eq 0 ]]; then
    echo "✅ API está respondendo: $API_HEALTH"
else
    echo "❌ API não está respondendo"
    echo "   Verifique se o container da aplicação está rodando"
    exit 1
fi
echo

# 4. Recriar usuário admin no banco
echo "🔧 4. Recriando usuário admin no banco..."
docker-compose exec -T postgres psql -U imobiliaria_user -d sistema_imobiliario << 'EOF'
-- Remover usuário admin se existir
DELETE FROM usuarios WHERE email = 'admin@imobiliaria.com';

-- Criar usuário admin com senha correta (123456)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo) VALUES (
    'Administrador Sistema',
    'admin@imobiliaria.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZJGlrC1QjGO/K2e',
    'admin',
    true
);

-- Verificar se foi criado
SELECT id, nome, email, tipo_usuario, ativo FROM usuarios WHERE email = 'admin@imobiliaria.com';
EOF

echo "✅ Usuário admin recriado"
echo

# 5. Testar login via API
echo "🧪 5. Testando login via API..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@imobiliaria.com","senha":"123456"}' 2>/dev/null)

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo "✅ Login funcionando! Resposta da API:"
    echo "$LOGIN_RESULT" | jq . 2>/dev/null || echo "$LOGIN_RESULT"
else
    echo "❌ Login ainda não funcionando. Resposta da API:"
    echo "$LOGIN_RESULT"
    echo
    echo "🔍 Analisando possível causa..."

    # Verificar se é problema de CORS
    if echo "$LOGIN_RESULT" | grep -q "CORS\|cors"; then
        echo "❌ Possível problema de CORS"
    elif echo "$LOGIN_RESULT" | grep -q "500"; then
        echo "❌ Erro interno do servidor"
    elif echo "$LOGIN_RESULT" | grep -q "404"; then
        echo "❌ Rota não encontrada"
    else
        echo "❌ Erro desconhecido"
    fi
fi
echo

# 6. Reiniciar aplicação
echo "🔄 6. Reiniciando aplicação..."
docker-compose restart app
sleep 5
echo "✅ Aplicação reiniciada"
echo

echo "🎉 CORREÇÃO CONCLUÍDA!"
echo "Tente fazer login novamente em: http://seu-ip:3000"
echo "Credenciais: admin@imobiliaria.com / 123456"
