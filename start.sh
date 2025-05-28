#!/bin/bash

# Função para limpar processos ao sair
cleanup() {
    echo "Limpando processos..."
    docker-compose down
    exit 0
}

# Capturar CTRL+C
trap cleanup SIGINT

# Iniciar o banco de dados
echo "Iniciando banco de dados..."
docker-compose up -d db

# Aguardar o banco de dados estar pronto
echo "Aguardando banco de dados..."
sleep 10

# Instalar dependências do backend
echo "Instalando dependências do backend..."
cd backend
npm install

# Compilar o backend
echo "Compilando o backend..."
npm run build

# Voltar para a raiz
cd ..

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
cd frontend
npm install

# Compilar o frontend
echo "Compilando o frontend..."
npm run build

# Voltar para a raiz
cd ..

# Iniciar os serviços
echo "Iniciando serviços..."
docker-compose up -d

# Configurar o Nginx
echo "Configurando Nginx..."
cp nginx/frontend.conf nginx/default.conf

echo "Sistema iniciado com sucesso!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost"

# Manter o script rodando
while true; do
    sleep 1
done 