#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DO FRONTEND"
echo "=================================="
echo

echo "1️⃣ VERIFICANDO ARQUIVOS DO FRONTEND:"
echo "-----------------------------------"
echo "📂 Estrutura public/:"
ls -la public/ 2>/dev/null || echo "❌ Pasta public não encontrada"
echo

echo "📄 Tamanho dos arquivos:"
ls -lh public/*.html public/*.css public/*.js 2>/dev/null || echo "❌ Arquivos frontend não encontrados"
echo

echo "2️⃣ TESTANDO ACESSO AOS ARQUIVOS:"
echo "-------------------------------"
echo "🧪 Testando index.html:"
curl -s -I http://localhost:3000/ | head -3

echo "🧪 Testando app.js:"
curl -s -I http://localhost:3000/app.js | head -3

echo "🧪 Testando style.css:"
curl -s -I http://localhost:3000/style.css | head -3
echo

echo "3️⃣ TESTANDO API DO NAVEGADOR:"
echo "----------------------------"
echo "🧪 Testando CORS (simulando navegador):"
curl -s -H "Origin: http://localhost:3000"      -H "Content-Type: application/json"      -X POST http://localhost:3000/api/auth/login      -d '{"email":"admin@imobiliaria.com","senha":"password"}' | head -200
echo
echo

echo "4️⃣ VERIFICANDO LOGS EM TEMPO REAL:"
echo "---------------------------------"
echo "📋 Últimos logs da aplicação:"
docker-compose logs app --tail=10
echo

echo "5️⃣ TESTE MANUAL SIMPLIFICADO:"
echo "-----------------------------"
echo "🌐 Tente acessar: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP'):3000"
echo "📝 E observe se:"
echo "   ✅ Página carrega"
echo "   ✅ Formulário aparece"
echo "   ✅ Botão responde ao clique"
echo "   ✅ Console do navegador (F12) mostra mensagens"
echo

echo "🏁 DIAGNÓSTICO COMPLETO CONCLUÍDO!"
echo "Execute este script e analise os resultados."
