# ---- Build stage ----

FROM node:22-bookworm-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
RUN corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json  pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpm prisma generate

COPY tsconfig*.json ./
COPY src ./src
RUN pnpm build
RUN pnpm prune --prod



# ---- Runtime stage ----

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV TZ=America/Argentina/Buenos_Aires
STOPSIGNAL SIGINT
WORKDIR /app
RUN apt-get update -y && apt-get install -y tini openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
RUN corepack prepare pnpm@9.12.0 --activate

# Usuario no root
RUN useradd -m appuser
USER appuser

COPY --chown=appuser:appuser --from=builder /app/node_modules ./node_modules
COPY --chown=appuser:appuser --from=builder /app/dist ./dist
COPY --chown=appuser:appuser --from=builder /app/prisma ./prisma
COPY --chown=appuser:appuser package.json ./

ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["bash","-lc","npx prisma migrate deploy && node dist/main.js"]