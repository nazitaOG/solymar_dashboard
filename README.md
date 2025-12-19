# Solymar Dashboard — Backend (NestJS + Prisma + PostgreSQL + Docker)

Lightweight backend for reservations built with NestJS, Prisma and PostgreSQL. This README explains how to run the project locally, with Docker or with npm/pnpm, how to run tests, and lists required environment variables.

Prerequisites

- Docker & docker-compose (recommended)
- Node.js 22+ (only if running locally without Docker)
- pnpm or npm (both supported)

Quick start (Docker)

1. Copy example env: `cp .env.example .env`
2. Build and start: `docker compose up -d --build`
3. Check logs: `docker compose logs -f app`
4. API available at: `http://localhost:3000`

Run locally (pnpm)

1. Install deps: `pnpm install`
2. Start PostgreSQL with Docker (optional): `docker compose up -d db`
3. Run Prisma migrations and generate client:
   - `pnpm prisma:migrate` or `pnpm prisma migrate dev`
   - `pnpm prisma:generate`
4. Start dev server: `pnpm start:dev`

Run locally (npm)

1. Install deps: `npm install`
2. Prisma commands:
   - `npm run prisma:migrate` or `npm run prisma migrate dev`
   - `npm run prisma:generate`
3. Start dev server: `npm run start:dev`

Build & Production

- Build: `pnpm build` or `npm run build`
- Start production: `pnpm start:prod` or `npm run start:prod` (runs `node dist/main`)

Tests, lint & format

- Run all tests: `pnpm test` or `npm run test`
- Run a single test file: `pnpm test -- src/path/to/file.spec.ts` or `npm run test -- src/path/to/file.spec.ts`
- Run a single test by name: `pnpm test -- -t "partial test name"` or `npm run test -- -t "partial test name"`
- Lint (autofix): `pnpm run lint` or `npm run lint`
- Format: `pnpm run format` or `npm run format`

Prisma

- Generate client: `pnpm prisma:generate` / `npm run prisma:generate`
- Run migrations: `pnpm prisma:migrate` / `npm run prisma:migrate`
- Seed DB: `pnpm prisma:seed` / `npm run prisma:seed`

Docker notes

- Compose file provides app and db services. To rebuild after code changes: `docker compose up -d --build`
- To run only the DB: `docker compose up -d db`
- To run migrations from host against container DB, use the Prisma CLI with correct `DATABASE_URL`.

Required environment (example `.env`)

```
# Postgres connection
DATABASE_URL=postgresql://postgres:postgres@db:5432/solymar?schema=public

# App
PORT=3000
NODE_ENV=development

# Security
PEPPER=some-random-pepper-value
JWT_SECRET=some-long-secret-for-jwt

# Optional
# SENTRY_DSN=...
```

Security notes

- Keep `PEPPER` and `JWT_SECRET` secret and rotate when necessary.
- Prefer running DB in Docker for local development to match production.
