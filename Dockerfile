# ---- Build stage ----
    FROM node:22.19.0-alpine3.22 AS builder
    WORKDIR /app
    
    # Instalar dependencias del sistema necesarias
    RUN apk add --no-cache openssl
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    # Instalar dependencias de Node
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # Generar cliente de Prisma
    COPY prisma ./prisma
    RUN pnpm prisma generate
    
    # Copiar archivos de configuración
    COPY nest-cli.json ./
    COPY tsconfig*.json ./
    COPY tsconfig.build.json ./
    COPY tsconfig.seed.json ./
    
    # Copiar código fuente
    COPY src ./src
    
    # Compilar la aplicación y el seed
    RUN pnpm build && pnpm exec tsc -p tsconfig.seed.json
    
    # Limpiar dependencias de desarrollo (Prisma debe estar en 'dependencies' para sobrevivir esto)
    RUN pnpm prune --prod
    
    
    # ---- Runtime stage ----
    FROM node:22.19.0-alpine3.22 AS runner
    ENV NODE_ENV=production
    ENV TZ=America/Argentina/Buenos_Aires
    STOPSIGNAL SIGINT
    WORKDIR /app
    
    # Instalar dependencias del sistema para producción
    RUN apk add --no-cache tini openssl
    RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
    
    # Crear usuario sin privilegios por seguridad
    RUN adduser -D -h /home/appuser appuser
    USER appuser
    
    # Copiar solo lo necesario desde el builder
    COPY --chown=appuser:appuser --from=builder /app/node_modules ./node_modules
    COPY --chown=appuser:appuser --from=builder /app/dist ./dist
    COPY --chown=appuser:appuser --from=builder /app/prisma ./prisma
    COPY --chown=appuser:appuser package.json ./
    
    ENV PORT=3000
    EXPOSE 3000
    
    ENTRYPOINT ["/sbin/tini","--"]
    
    # 👇 COMANDO DE ARRANQUE OPTIMIZADO:
    # 1. Usa ./node_modules/.bin/prisma (local) -> Cero descargas.
    # 2. Solo hace 'migrate deploy' -> Rápido.
    # 3. Corre el seed si hace falta y arranca la app.
    CMD ["sh","-lc","./node_modules/.bin/prisma migrate deploy && if [ \"$SEED\" = \"true\" ]; then node dist/prisma/seed.js; fi && node dist/main.js"]