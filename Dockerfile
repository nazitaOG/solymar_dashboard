# ---- Build stage ----
    FROM node:22.20.0-alpine3.22 AS builder
    WORKDIR /app
    
    RUN apk add --no-cache openssl
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    COPY prisma ./prisma
    RUN pnpm prisma generate
    
    COPY nest-cli.json ./
    
    COPY tsconfig*.json ./
    COPY tsconfig.build.json ./
    COPY tsconfig.seed.json ./
    COPY src ./src
    
    RUN pnpm build && pnpm exec tsc -p tsconfig.seed.json
    RUN pnpm prune --prod
    

    
    # ---- Runtime stage ----
    FROM node:22.20.0-alpine3.22 AS runner
    ENV NODE_ENV=production
    ENV TZ=America/Argentina/Buenos_Aires
    STOPSIGNAL SIGINT
    WORKDIR /app
    
    RUN apk add --no-cache tini openssl
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    RUN adduser -D -h /home/appuser appuser
    USER appuser
    
    COPY --chown=appuser:appuser --from=builder /app/node_modules ./node_modules
    COPY --chown=appuser:appuser --from=builder /app/dist ./dist
    COPY --chown=appuser:appuser --from=builder /app/prisma ./prisma
    COPY --chown=appuser:appuser package.json ./
    
    ENV PORT=3000
    EXPOSE 3000
    
    ENTRYPOINT ["/sbin/tini","--"]
    CMD ["sh","-lc","pnpm dlx prisma generate && pnpm dlx prisma migrate deploy && if [ \"$SEED\" = \"true\" ]; then node dist/prisma/seed.js; fi && node dist/main.js"]
    