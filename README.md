# PSPC - Sistema de Proteção de Crédito para Provedores

## Visão Geral

O PSPC é um sistema web completo para provedores de internet e empresas, permitindo:
- Cadastro e gestão de empresas (tenants)
- Cadastro de clientes e dívidas
- Consulta de inadimplentes
- Dashboard com indicadores
- Integração automática com ReceitaWS/Speedio e ViaCEP
- Upload de logo da empresa
- Perfis: SuperAdmin, Admin

---

## Requisitos

- Node.js 18+
- PostgreSQL
- Redis
- Yarn ou NPM
- (Opcional) Docker para banco de dados

---

## Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd <seu-repo>

# Instale as dependências
cd backend
yarn install
cd ../frontend
yarn install

# Instale o Redis (obrigatório)
sudo apt update && sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure o banco de dados
# Edite o arquivo .env com as credenciais do PostgreSQL e Redis

# Rode as migrations do Prisma
cd ../backend
npx prisma migrate deploy

# Inicie o backend
yarn dev

# Em outro terminal, inicie o frontend
cd ../frontend
yarn dev
```

---

## Observação sobre o Redis

O Redis é utilizado para cache de dados e performance no backend. Certifique-se de que o serviço está rodando antes de iniciar o backend. As variáveis de ambiente do Redis estão no arquivo `.env` do backend.

---

## Estrutura do Projeto

```
backend/
  src/
    controllers/
    routes/
    database/
    middleware/
    utils/
    ...
  prisma/
    schema.prisma
frontend/
  src/
    pages/
    components/
    contexts/
    services/
    ...
```

---

## Principais Funcionalidades

- **Cadastro de empresa:** Validação de CNPJ, busca automática na ReceitaWS/Speedio, upload de logo.
- **Cadastro de clientes:** Relacionados à empresa, com busca e filtros.
- **Cadastro de dívidas:** Relacionadas a clientes, com controle de status.
- **Dashboard:** Indicadores, gráficos e estatísticas.
- **Login/Admin/SuperAdmin:** Perfis com permissões distintas.
- **Tema claro/escuro:** Interface moderna e responsiva.

---

## Endpoints Principais (Backend)

### Empresas (Tenants)
- `POST /tenants` — Cadastrar empresa (requer autenticação)
- `GET /tenants` — Listar empresas (superadmin)
- `GET /tenants/cnpj/:cnpj` — Buscar empresa por CNPJ
- `POST /tenants/logo` — Upload de logo da empresa

### Integração ReceitaWS/Speedio
- `GET /speedio/cnpj/:cnpj` — Buscar dados públicos do CNPJ

### Clientes
- `POST /clientes` — Cadastrar cliente
- `GET /clientes` — Listar clientes

### Dívidas
- `POST /dividas` — Cadastrar dívida
- `GET /dividas` — Listar dívidas

### Autenticação
- `POST /auth/login` — Login
- `GET /auth/me` — Dados do usuário logado

---

## Exemplo de Cadastro de Empresa (Frontend)

1. Preencha o CNPJ (com ou sem máscara)
2. O sistema busca dados na ReceitaWS/Speedio e preenche os campos automaticamente
3. Preencha os demais campos obrigatórios
4. (Opcional) Faça upload da logo da empresa
5. Clique em "Cadastrar"

---

## Integrações

- **ViaCEP:** Busca automática de endereço pelo CEP
- **ReceitaWS/Speedio:** Busca automática de dados do CNPJ
- **Upload de logo:** Suporte a imagens até 2MB

---

## Dicas de Manutenção

- Sempre rode as migrations do Prisma ao atualizar o banco
- Use variáveis de ambiente para segredos e URLs
- Para produção, rode `yarn build` no frontend
- O backend pode ser facilmente adaptado para outros bancos suportados pelo Prisma

---

## Possíveis Melhorias Futuras

- Máscara visual para CPF/CNPJ (input mask)
- Logs de auditoria
- Testes automatizados (Jest, Cypress)
- Documentação Swagger para API

---

## Contato e Suporte

Dúvidas ou sugestões? Abra uma issue ou entre em contato com o desenvolvedor responsável.
