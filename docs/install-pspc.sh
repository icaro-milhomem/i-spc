#!/bin/bash
# Auto-instalador do PSPC - Produção
# Uso: sudo bash docs/install-pspc.sh



sudo bash install-pspc.sh

set -e

# 1. Atualizar sistema
apt update && apt upgrade -y

# 2. Instalar dependências
apt install -y git curl nginx postgresql postgresql-contrib

# 3. Instalar Node.js 22.x e npm
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 4. Instalar PM2 e serve globalmente
npm install -g pm2 serve

# 5. Clonar repositório (se não existir)
if [ ! -d "i-spc" ]; then
  git clone https://github.com/icaro-milhomem/i-spc.git
  cd i-spc
else
  cd i-spc
  git pull
fi

# 6. Instalar dependências Node
cd backend
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

# 9. Banco de dados
# Usa as credenciais do .env já existente
sudo -u postgres psql -c "CREATE DATABASE pspc;" || echo "Banco já existe."
npx prisma migrate deploy

# 10. Rodar backend com PM2
pm2 delete pspc-backend || true
pm2 start dist/index.js --name pspc-backend || pm2 start index.js --name pspc-backend

# 11. Rodar frontend (serve)
cd ../frontend
pkill -f "serve -s dist" || true
nohup serve -s dist -l 5173 &

# 12. Sugerir configuração do Nginx
cat <<EOF

---

ATENÇÃO: Configure o Nginx manualmente com o seguinte exemplo:

/etc/nginx/sites-available/pspc.com.br

server {
    listen 80;
    server_name pspc.com.br www.pspc.com.br;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:5173/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

Depois rode:
sudo ln -s /etc/nginx/sites-available/pspc.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

---

Acesse: http://pspc.com.br

Tudo pronto! Se precisar de SSL, use Let's Encrypt (certbot).
EOF 