# Senaibank Backend

Backend em Express + TypeScript usando Supabase como banco, bcrypt para senhas, JWT para autenticação e Jest para testes.

## Requisitos

- Node.js 18+
- Um projeto no Supabase
- Variáveis de ambiente configuradas

## Configuração

1. Copie `.env.example` para `.env`
2. Preencha:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `CORS_ORIGIN` com a URL do frontend

## Banco de dados

Execute o arquivo `supabase/schema.sql` no SQL Editor do Supabase.

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
```

## Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /accounts`
- `POST /accounts`
- `PUT /accounts/me`
- `DELETE /accounts/:id`
- `GET /accounts/:id/balance`
- `GET /accounts/:id/statement`
- `POST /accounts/:id/deposit`
- `POST /accounts/:id/withdraw`
- `POST /accounts/:id/transfer`

## Observação

O frontend está configurado para chamar a API em `http://localhost:4000`.