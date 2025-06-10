# Tutorial de Instalação - i-spc

## Pré-requisitos

- Node.js 18+
- npm 9+
- Docker
- Git

## 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd i-spc
```

## 2. Suba o banco de dados PostgreSQL com Docker

```bash
docker run -d \
  --name postgres-i-spc \
  -e POSTGRES_USER=pspc \
  -e POSTGRES_PASSWORD=pspc \
  -e POSTGRES_DB=i-spc \
  -e TZ="America/Sao_Paulo" \
  -p 5432:5432 \
  --restart=always \
  -v /data/postgres:/var/lib/postgresql/data \
  postgres
```

## 3. Instale as dependências do backend

```bash
cd backend
npm install
```

## 4. Configure o arquivo `.env` do backend

Exemplo de `.env`:
```
DB_DIALECT=postgres
DB_TIMEZONE=-03:00
DB_HOST=localhost
DB_PORT=5432
DB_NAME=i-spc
DB_USER=pspc
DB_PASSWORD=pspc

PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://pspc:pspc@localhost:5432/i-spc?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN=24h
LOG_LEVEL=debug
```

## Limpesa do do cache NPM
```bash
npm cache verify
```
```bash
npm cache clean --force && rm -rf node_modules && rm package-lock.json
```

```bash
rm -rf node_modules package-lock.json && cd ../backend && rm -rf node_modules package-lock.json
```
## 5. Rode as migrações e o seed do banco

```bash
npx prisma migrate deploy
npx ts-node prisma/seed.ts
npx prisma db seed
```
## Resetar o banco
```bash
npx prisma migrate reset
```

## 6. Inicie o backend

```bash
npm run dev
```

## 7. Instale as dependências do frontend

```bash
cd ../frontend
npm install
```

## 8. Inicie o frontend

```bash
npm run dev
```

## 9. Acesse o sistema

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Prisma Studio: http://localhost:5555

## 10. Login padrão

- E-mail: super@pspc.com
- Senha: super123