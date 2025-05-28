# P-SPC Frontend

Frontend do sistema P-SPC (Proteção de Crédito para Provedores) desenvolvido com React, TypeScript e Material-UI.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Build

Para criar uma build de produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist`.

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── contexts/       # Contextos React
  ├── services/       # Serviços (API, etc)
  ├── types/          # Definições de tipos TypeScript
  ├── App.tsx         # Componente principal
  └── main.tsx        # Ponto de entrada
```

## Tecnologias Utilizadas

- React
- TypeScript
- Material-UI
- React Router
- Axios
- Vite

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma build de produção
- `npm run lint` - Executa o linter
- `npm run preview` - Visualiza a build de produção localmente
