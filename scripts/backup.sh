#!/bin/bash

# Script de backup do sistema imobiliário
BACKUP_DIR="/var/backups/sistema-imobiliario"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Iniciando backup..."

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
echo "📊 Fazendo backup do banco de dados..."
docker-compose exec -T postgres pg_dump -U imobiliaria_user -d sistema_imobiliario > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos uploads
echo "📁 Fazendo backup dos arquivos..."
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads/

# Limpar backups antigos (manter apenas 30)
echo "🧹 Limpando backups antigos..."
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup concluído: $BACKUP_DIR"
