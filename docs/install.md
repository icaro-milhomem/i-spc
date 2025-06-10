# Tutorial de Instalação e Deploy - PSPC

Este guia mostra como instalar e rodar o sistema em produção no domínio **pspc.com.br**.

## Pré-requisitos
- Ubuntu Server 20.04+ (ou similar)
- Node.js 18+
- npm 9+
- PostgreSQL 13+
- Git
- PM2 (gerenciador de processos Node)
- Nginx (proxy reverso)

---

## 0. Instalando dependências do sistema
Execute os comandos abaixo como root ou com sudo:

```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale Git, curl, Nginx e PostgreSQL
sudo apt install -y git curl nginx postgresql postgresql-contrib

# Instale Node.js 18.x e npm
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instale PM2 globalmente
sudo npm install -g pm2

# Instale serve globalmente (para servir o frontend)
sudo npm install -g serve
```

---

## 1. Clonar o repositório
```bash
git clone https://github.com/icaro-milhomem/i-spc.git
cd i-spc
```

## 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `backend` com as variáveis:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/pspc
JWT_SECRET=sua_chave_secreta
API_URL=https://pspc.com.br
```

## 3. Instalar dependências
```bash
cd backend
npm install
cd ../frontend
npm install
```

## 4. Configurar o banco de dados
- Crie o banco no PostgreSQL:
```sql
CREATE DATABASE pspc;
```
- Rode as migrações:
```bash
cd backend
npx prisma migrate deploy
```

## 5. Build do frontend
```bash
cd frontend
npm run build
```

## 6. Build do backend (opcional, se usar TypeScript)
Se o backend for em TypeScript:
```bash
cd backend
npm run build
```

## 7. Rodar em produção com PM2
No backend:
```bash
cd backend
pm run start:prod # ou pm2 start dist/index.js --name pspc-backend
```
No frontend (serve arquivos estáticos):
```bash
cd frontend
serve -s dist -l 5173 &
```

## 8. Configurar Nginx
Exemplo de configuração para `/etc/nginx/sites-available/pspc.com.br`:
```nginx
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
```
Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pspc.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Acesso
- Frontend: https://pspc.com.br
- API: https://pspc.com.br/api/

---

## 10. Dicas de produção
- Use HTTPS (Let's Encrypt)
- Faça backup regular do banco
- Monitore os processos com `pm2 monit`
- Configure firewall (UFW)

---

## 11. SSL com Cloudflare e Certbot (HTTPS)

### a) Instale o Certbot e o plugin Cloudflare
```bash
sudo apt install -y certbot python3-certbot-nginx python3-certbot-dns-cloudflare
```

### b) Crie o arquivo de credenciais Cloudflare
```bash
sudo mkdir -p /root/.secrets/certbot
sudo tee /root/.secrets/certbot/cloudflare.ini > /dev/null <<EOF
dns_cloudflare_email = econectfibra@gmail.com
dns_cloudflare_api_key = 48daa72a7dea841904528c5d425c6a9ba55de
EOF
sudo chmod 600 /root/.secrets/certbot/cloudflare.ini
```

### c) Emita o certificado para seu domínio
```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/certbot/cloudflare.ini \
  -d pspc.com.br -d www.pspc.com.br
```

### d) Exemplo de configuração Nginx com HTTPS
```nginx
server {
    listen 80;
    server_name pspc.com.br www.pspc.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name pspc.com.br www.pspc.com.br;

    ssl_certificate /etc/letsencrypt/live/pspc.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pspc.com.br/privkey.pem;

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
```

### e) Renovação automática
O Certbot já configura a renovação automática. Para testar:
```bash
sudo certbot renew --dry-run
```

---

Agora seu sistema estará protegido com HTTPS usando Cloudflare!

---

**Dúvidas?**
Entre em contato com o suporte do sistema. 