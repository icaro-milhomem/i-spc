#!/bin/bash

# Remover frontend antigo se existir
rm -rf frontend

# Criar novo frontend
npm create vite@latest frontend -- --template react-ts

# Instalar dependências do frontend
cd frontend
npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios react-router-dom @types/react-router-dom

# Voltar para a raiz
cd ..

# Tornar o script executável
chmod +x start.sh

echo "Estrutura do projeto corrigida!"
echo "Execute ./start.sh para iniciar o sistema" 