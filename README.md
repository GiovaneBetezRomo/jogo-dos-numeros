# DESAFIO DOS NÚMEROS

Jogo competitivo de adivinhação de números com visual inspirado em **VALORANT**, desenvolvido com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM** e **Neon PostgreSQL**, pronto para deploy na **Vercel**.

## Modalidades

- 🟢 **Fácil:** número secreto de `1` até `10` (`10` pts base + até `+20` bônus)
- 🟡 **Médio:** número secreto de `1` até `100` (`30` pts base + até `+70` bônus)
- 🔴 **Difícil:** número secreto de `1` até `1000` (`100` pts base + até `+200` bônus)

## Banco de Dados Neon (`DATABASE_URL`)

O schema do Prisma em `prisma/schema.prisma` cria as tabelas:
- `users`
- `games`
- `guesses`
- `scores`

As migrations ficam em `prisma/migrations/`.

### Como pegar a URL correta no Neon
1. Acesse [console.neon.tech](https://console.neon.tech) e abra seu projeto.
2. Clique em **Connect** (ou **Connection Details**).
3. Selecione **Connection string** (URL que começa com `postgresql://...`, e **não** a Data API REST `https://.../rest/v1`).

## Rodando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@seu-host.neon.tech/neondb?sslmode=require"
   JWT_SECRET="sua-chave-secreta-longa"
   ```
3. Aplique as migrations no banco Neon:
   ```bash
   npm run db:migrate:deploy
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy na Vercel

1. Envie o repositório para o GitHub.
2. Na [Vercel](https://vercel.com), clique em **Add New Project** e importe `jogo-dos-numeros`.
3. Em **Settings → Environment Variables**, adicione:
   - `DATABASE_URL`: sua Connection String do Neon (`postgresql://...`) — recomendado usar a URL *pooled* (`-pooler`) do Neon.
   - `JWT_SECRET`: uma string secreta longa e aleatória para assinar os cookies de sessão.
4. O script `vercel-build` configurado no `package.json` executa automaticamente:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```
   criando todas as tabelas no Neon durante o deploy.
