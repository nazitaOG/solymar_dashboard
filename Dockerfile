# ---- Build stage ----
    FROM node:22.19.0-alpine3.22 AS builder
    WORKDIR /app
    
    # Instalar dependencias
    RUN apk add --no-cache openssl
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # Generar cliente de Prisma
    COPY prisma ./prisma
    RUN pnpm prisma generate
    
    # Copiar configs
    COPY nest-cli.json ./
    COPY tsconfig*.json ./
    COPY tsconfig.build.json ./
    COPY tsconfig.seed.json ./
    
    # Copiar código
    COPY src ./src
    
    # 👇 AQUÍ ESTA LA MAGIA DEL FIX:
    # 1. Instalamos tsc-alias (herramienta para arreglar rutas)
    # 2. Compilamos la app (build) y el seed (tsc)
    # 3. Ejecutamos tsc-alias para reemplazar los '@/' por rutas relativas '../../'
    RUN pnpm add -D tsc-alias && \
        pnpm build && \
        pnpm exec tsc-alias -p tsconfig.build.json && \
        pnpm exec tsc -p tsconfig.seed.json && \
        pnpm exec tsc-alias -p tsconfig.seed.json
    
    # Limpiar basura
    RUN pnpm prune --prod
    
    # ---- Runtime stage ----
    FROM node:22.19.0-alpine3.22 AS runner
    ENV NODE_ENV=production
    ENV TZ=America/Argentina/Buenos_Aires
    STOPSIGNAL SIGINT
    WORKDIR /app
    
    # Deps de prod
    RUN apk add --no-cache tini openssl
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    RUN adduser -D -h /home/appuser appuser
    USER appuser
    
    # Copiar todo lo compilado
    COPY --chown=appuser:appuser --from=builder /app/node_modules ./node_modules
    COPY --chown=appuser:appuser --from=builder /app/dist ./dist
    COPY --chown=appuser:appuser --from=builder /app/prisma ./prisma
    COPY --chown=appuser:appuser package.json ./
    
    ENV PORT=3000
    EXPOSE 3000
    
    ENTRYPOINT ["/sbin/tini","--"]
    
    # Arranque (Igual que antes)
    CMD ["sh","-lc","./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]