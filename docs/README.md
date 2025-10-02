# 🏠 Sistema de Gestão Imobiliária

![Sistema Imobiliário](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Sistema completo para gerenciamento de imóveis, contratos e faturas com backend Node.js + PostgreSQL e frontend moderno.

## ✨ Funcionalidades

- ✅ **Gestão de Imóveis** - Cadastro completo com código auto-incremento
- ✅ **Gestão de Contratos** - Sistema de garantias (Caução, Fiança)
- ✅ **Fechamento Financeiro** - Faturas mensais com controle de pagamentos
- ✅ **Cadastro de Pessoas** - Proprietários, locatários e envolvidos
- ✅ **Dashboard Analítico** - Visão geral do negócio
- ✅ **Sistema de Login** - JWT com diferentes níveis de acesso
- ✅ **API RESTful** - Endpoints completos para todos os módulos
- ✅ **Dados Persistentes** - PostgreSQL com transações seguras

## 🚀 Demo Online

**Credenciais de demonstração:**
- **Email:** admin@imobiliaria.com
- **Senha:** 123456

## 🏃‍♂️ Instalação Rápida

### Via Docker (Recomendado)

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/sistema-gestao-imobiliaria.git
cd sistema-gestao-imobiliaria

# 2. Configurar variáveis
cp .env.example .env
nano .env  # Alterar senhas

# 3. Iniciar com Docker
docker-compose up -d

# 4. Acessar sistema
open http://localhost:3000
```

## 🌐 Deploy em Produção

### VPS Hostinger com Docker

```bash
# Deploy automático via script
./scripts/deploy.sh
```

### Especificações Mínimas VPS:
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 80GB SSD
- **OS:** Ubuntu 20.04+

## 🛡️ Segurança

- JWT Authentication
- Rate limiting
- SQL injection protection
- Input validation
- CORS configurado
- SSL ready

## 📊 Tecnologias

- **Backend:** Node.js + Express
- **Banco:** PostgreSQL
- **Frontend:** HTML5 + CSS3 + JavaScript
- **Containerização:** Docker + Docker Compose
- **Proxy:** Nginx
- **Cache:** Redis

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para facilitar a gestão imobiliária**
