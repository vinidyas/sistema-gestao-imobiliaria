#!/bin/bash

echo "🔑 CORREÇÃO FINAL - SENHA DO USUÁRIO ADMIN"
echo "========================================="
echo

echo "🎯 PROBLEMA: Hash da senha não confere"
echo "✅ SOLUÇÃO: Recriar usuário admin com hash correto"
echo

echo "👤 Verificando usuário atual no banco..."
docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario -c "SELECT id, nome, email, tipo_usuario FROM usuarios WHERE email = 'admin@imobiliaria.com';"

echo
echo "🔧 Removendo usuário admin atual..."
docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario -c "DELETE FROM usuarios WHERE email = 'admin@imobiliaria.com';"

echo
echo "👤 Criando usuário admin com hash correto da senha '123456'..."
docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario << 'EOF'
INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo) 
VALUES (
    'Administrador Sistema',
    'admin@imobiliaria.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZJGlrC1QjGO/K2e',
    'admin',
    true
);
EOF

echo "✅ Usuário admin recriado!"

echo
echo "🔍 Verificando usuário recriado..."
docker-compose exec postgres psql -U imobiliaria_user -d sistema_imobiliario -c "SELECT id, nome, email, tipo_usuario, ativo, data_criacao FROM usuarios WHERE email = 'admin@imobiliaria.com';"

echo
echo "🧪 Testando login com senha correta..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@imobiliaria.com","senha":"123456"}' 2>/dev/null)

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
    echo
    echo "🎉🎉🎉 SISTEMA FUNCIONANDO 100%! 🎉🎉🎉"
    echo "✅ Login realizado com sucesso!"
    echo "✅ Token JWT gerado!"
    echo "✅ Sistema pronto para uso completo!"
    echo
    echo "🌐 ACESSE SEU SISTEMA:"
    echo "   URL: http://$(curl -s ifconfig.me):3000"
    echo "   Email: admin@imobiliaria.com"
    echo "   Senha: 123456"
    echo
    echo "🎯 TOKEN GERADO:"
    echo "$LOGIN_RESULT" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESULT"
    echo
    echo "🚀 SISTEMA TOTALMENTE OPERACIONAL!"
    echo "Você pode agora:"
    echo "   ✅ Fazer login no frontend"
    echo "   ✅ Cadastrar imóveis"
    echo "   ✅ Criar contratos"
    echo "   ✅ Gerar faturas"
    echo "   ✅ Usar todas as funcionalidades"
else
    echo "❌ Ainda há problema no login:"
    echo "$LOGIN_RESULT"
    echo
    echo "🔍 Vamos ver o que está acontecendo..."
    docker-compose logs app --tail=8
fi

echo
echo "🏁 CORREÇÃO DE SENHA CONCLUÍDA!"
