#!/bin/bash

echo "🔧 APLICANDO FRONTEND SIMPLIFICADO"
echo "================================="
echo

echo "🎯 ESTRATÉGIA: Frontend HTML único e testado"
echo "✅ BENEFÍCIOS: Mais simples, menos bugs, fácil debug"
echo

echo "💾 Fazendo backup dos arquivos atuais..."
cp public/index.html public/index.html.backup 2>/dev/null || echo "Backup HTML: arquivo não encontrado"
cp public/app.js public/app.js.backup 2>/dev/null || echo "Backup JS: arquivo não encontrado"  
cp public/style.css public/style.css.backup 2>/dev/null || echo "Backup CSS: arquivo não encontrado"

echo "📝 Aplicando frontend simplificado..."
cp index_simplificado.html public/index.html

echo "🔄 Reiniciando aplicação..."
docker-compose restart app
sleep 5

echo "✅ Frontend simplificado aplicado!"
echo

echo "🧪 TESTE IMEDIATO:"
echo "1. Acesse: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SEU-IP'):3000"
echo "2. A página deve carregar instantaneamente"
echo "3. Login: admin@imobiliaria.com / password"
echo "4. O sistema deve funcionar perfeitamente"
echo

echo "🎯 CARACTERÍSTICAS DO NOVO FRONTEND:"
echo "   ✅ HTML único (sem arquivos separados)"
echo "   ✅ CSS inline (sem dependências)"
echo "   ✅ JavaScript simplificado"
echo "   ✅ Logs detalhados no console"
echo "   ✅ Interface moderna e responsiva"
echo "   ✅ Dashboard funcional"
echo "   ✅ Teste de conectividade automático"
echo

echo "📋 Se ainda houver problema:"
echo "   1. Abra console do navegador (F12)"
echo "   2. Procure mensagens de erro em vermelho"
echo "   3. Verifique se a API responde: curl http://localhost:3000/api/health"
echo

echo "🏁 FRONTEND SIMPLIFICADO APLICADO!"
