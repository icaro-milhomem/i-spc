#!/bin/bash
# Auto-instalador completo do PSPC
# Uso: sudo bash install-pspc.sh
set -e

# 1. Atualizar sistema
apt update && apt upgrade -y

# 2. Instalar dependências
apt install -y git curl nginx postgresql postgresql-contrib ufw redis-server

# Iniciar e habilitar Redis
systemctl enable redis-server
systemctl start redis-server

# 3. Instalar Node.js 22.x e npm
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 4. Instalar PM2 e serve globalmente
npm install -g pm2 serve

# 5. Criar .env do backend se não existir
cd backend
if [ ! -f .env ]; then
  echo "DATABASE_URL=postgresql://pspc_user:senha@localhost:5432/pspc" > .env
  echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
  echo "API_URL=https://pspc.com.br" >> .env
  echo "FRONTEND_URL=https://pspc.com.br" >> .env
  echo "BACKEND_URL=https://pspc.com.br/api" >> .env
  echo ".env criado em backend/.env. Edite com as credenciais corretas do banco!"
fi

# 6. Instalar dependências Node
npm install
cd ../frontend
npm install

# 7. Build do frontend
npm run build

# 8. Build do backend (se usar TypeScript)
cd ../backend
if [ -f tsconfig.json ]; then
  npm run build
fi

# 9. Backup do banco antes de atualizar
echo "Fazendo backup do banco de dados..."
sudo -u postgres pg_dump pspc > /tmp/pspc_backup_$(date +%Y%m%d_%H%M%S).sql || echo "Banco não existe ainda."

# 10. Banco de dados: criar usuário e banco conforme .env
# Extrai usuário e senha do .env
DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)
DB_USER=$(echo $DB_URL | sed -E 's|postgresql://([^:]+):.*|\1|')
DB_PASS=$(echo $DB_URL | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
DB_NAME=$(echo $DB_URL | sed -E 's|.*/([a-zA-Z0-9_]+)(\?.*)?$|\1|')

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;" || true
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

npx prisma migrate deploy

# 11. Rodar backend com PM2
pm2 delete pspc-backend || true
pm2 start dist/server.js --name pspc-backend

# 12. Rodar frontend (serve)
cd ../frontend
pkill -f "serve -s dist" || true
nohup serve -s dist -l 5173 &

# 13. Configurar firewall UFW
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# 14. Instalar Certbot e plugin Cloudflare para SSL
apt install -y certbot python3-certbot-nginx python3-certbot-dns-cloudflare
mkdir -p /root/.secrets/certbot
cat <<EOF > /root/.secrets/certbot/cloudflare.ini
dns_cloudflare_email = econectfibra@gmail.com
dns_cloudflare_api_key = 48daa72a7dea841904528c5d425c6a9ba55de
EOF
chmod 600 /root/.secrets/certbot/cloudflare.ini

# 15. Emitir certificado SSL
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/certbot/cloudflare.ini \
  -d pspc.com.br -d www.pspc.com.br || echo "Certbot pode pedir interação manual."

# 16. Configurar Nginx automaticamente
cat <<EOF > /etc/nginx/sites-available/pspc.com.br
server {
    listen 80;
    server_name pspc.com.br www.pspc.com.br;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name pspc.com.br www.pspc.com.br;

    ssl_certificate /etc/letsencrypt/live/pspc.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pspc.com.br/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://localhost:5173/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/pspc.com.br /etc/nginx/sites-enabled/pspc.com.br
nginx -t && systemctl reload nginx

# 17. Fim
cat <<EOF

---
Instalação e configuração concluídas!
Acesse: https://pspc.com.br
Se precisar restaurar o banco, use o backup em /tmp/pspc_backup_*.sql
---
EOF 