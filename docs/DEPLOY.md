# 🚀 Guia de Deploy

## Deploy com Docker na VPS

### Pré-requisitos
- VPS com Ubuntu 20.04+
- 2GB+ RAM
- Docker e Docker Compose instalados

### Passo a Passo

1. **Preparar VPS:**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
```

2. **Clonar repositório:**
```bash
git clone https://github.com/seu-usuario/sistema-gestao-imobiliaria.git
cd sistema-gestao-imobiliaria
```

3. **Configurar ambiente:**
```bash
cp .env.example .env
nano .env  # Alterar senhas
```

4. **Deploy:**
```bash
docker-compose up -d
```

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Restart aplicação
docker-compose restart app

# Backup banco
docker-compose exec postgres pg_dump -U imobiliaria_user -d sistema_imobiliario > backup.sql
```
