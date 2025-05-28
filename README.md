# p-spc
Proteção de Crédito para Provedores


Criar um sistema completo, estilo SPC/Serasa, focado em provedores de internet, para:

Registrar dívidas de clientes inadimplentes (ex.: mensalidade atrasada, roteador não devolvido).

Consultar CPF antes de instalar novos serviços, verificando histórico de dívidas.

🎨 Nome do projeto:
P-SPC (Proteção de Crédito para Provedores).

🚀 Passo a Passo Detalhado
📌 1️⃣ Setup da Máquina (Linux/Ubuntu)
✅ Instalar Docker e Docker Compose:

bash
Copiar
Editar
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo usermod -aG docker $USER
Verificar:

bash
Copiar
Editar
docker --version
docker-compose --version
✅ Instalar Node.js (versão 20.x ou superior):

bash
Copiar
Editar
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
Verificar:

bash
Copiar
Editar
node -v
npm -v
✅ Instalar Nginx (proxy reverso):

bash
Copiar
Editar
sudo apt install nginx -y
sudo systemctl enable nginx
Verificar:

bash
Copiar
Editar
systemctl status nginx
✅ Ferramentas adicionais (opcionais):

bash
Copiar
Editar
sudo apt install postgresql-client
📌 2️⃣ Estrutura do Projeto (Monorepo organizado)
bash
Copiar
Editar
/p-spc
│
├── /backend (API Node.js + Express + PostgreSQL)
│    ├── package.json
│    ├── .env (variáveis de ambiente)
│    ├── src/
│         ├── server.ts
│         ├── routes/
│         ├── controllers/
│         ├── services/
│         ├── models/
│
├── /frontend (React + Vite)
│    ├── package.json
│    ├── .env
│    ├── src/
│
├── /nginx
│    ├── pspc.conf (configuração proxy reverso)
│
├── /postgres-data (dados persistentes do banco)
│
└── docker-compose.yml (PostgreSQL e outros serviços)
📌 3️⃣ Banco de Dados (PostgreSQL)
✅ Rodar PostgreSQL via Docker (docker-compose.yml):

yaml
Copiar
Editar
version: '3.8'

services:
  db:
    image: postgres:16
    container_name: pspc_db
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: pspc_user
      POSTGRES_PASSWORD: pspc_pass
      POSTGRES_DB: pspc_db
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
Rodar:

bash
Copiar
Editar
docker-compose up -d
✅ Checkpoints:

docker ps → container pspc_db rodando.

Conectar: psql -h localhost -U pspc_user pspc_db.

✅ Tabelas principais:

clientes (cpf, nome, telefone, status)

dividas (id_cliente, descrição, valor, data, status)

consultas (cpf_consultado, data_consulta, resultado)

📌 4️⃣ Backend (Node.js + Express + PostgreSQL)
✅ Rotas principais:

POST /api/clientes → Cadastrar cliente.

POST /api/dividas → Registrar dívida.

GET /api/consulta/:cpf → Consultar CPF.

GET /api/relatorio → Buscar todos inadimplentes.

✅ Funcionalidades:

API REST com JWT (autenticação segura).

Validação de CPF (regex).

Criptografia de senhas (bcrypt).

Logs detalhados no console.

📌 5️⃣ Frontend (React + Vite)
✅ Telas:

Login/Administração.

Cadastro de clientes.

Registro de dívidas.

Consulta de CPF (informando nome, dívidas, status, etc.).

Relatório geral.

✅ Design:

Inspirado no Serasa/SPC.

Cores: Azul, verde e cinza.

Dashboard com cards e tabelas.

📌 6️⃣ Nginx (Proxy Reverso)
✅ Arquivo /etc/nginx/sites-available/pspc.conf:

nginx
Copiar
Editar
server {
    listen 80;
    server_name p-spc.local;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:5173/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
✅ Ativar e testar:

bash
Copiar
Editar
sudo ln -s /etc/nginx/sites-available/pspc.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
✅ Checkpoints:

Backend acessível em http://p-spc.local/api/.

Frontend acessível em http://p-spc.local/.

📌 7️⃣ Funcionalidades Principais do Sistema (MVP)
✅ Registro de dívidas:

Exemplo: "Fulano CPF 123.456.789-00 deve R$120,00 (roteador TP-Link não devolvido)".

✅ Consulta de CPF:

Exibe nome, telefone, dívidas ativas, data das dívidas.

✅ Relatórios para o provedor:

Lista de clientes inadimplentes.

Histórico de consultas.

✅ Segurança:

Senhas criptografadas (bcrypt).

JWT para autenticação.

Proteção de rotas sensíveis.

📌 8️⃣ Validações e Checkpoints
✅ docker ps → Containers rodando.
✅ node -v e npm -v → Node instalado.
✅ p-spc.local acessível no navegador.
✅ API funcionando via Insomnia/Postman.
✅ Frontend renderizando corretamente.
✅ Teste de fluxo completo: Cadastro → Dívida → Consulta → Relatório.

🏁 Finalização
💻 Projeto P-SPC: Solução para provedores de internet consultarem e registrarem inadimplentes, protegendo o crédito e evitando perdas.
