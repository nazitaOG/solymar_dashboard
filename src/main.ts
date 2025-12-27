// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { PrismaService } from './common/prisma/prisma.service';

// Tipos para CORS (evita any y arregla eslint @typescript-eslint/no-unsafe-*)
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// alternativamente: import type { CorsOptions } from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const isProd = config.get<string>('NODE_ENV') === 'production';

  // Puerto: evita NaN (si PORT no existe, usa 3000)
  const port = Number(config.get<string>('PORT') ?? '3000');

  // ===== Helmet (seguridad de headers) =====
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            useDefaults: true,
            directives: {
              // controla el origen por defecto
              'default-src': ['self'],
              // dónde pueden cargarse imágenes
              'img-src': ['self', 'data:', 'https:'],
              // scripts ejecutables
              'script-src': ['self'],
              // hojas de estilo (idealmente usar nonces/hashes en prod)
              'style-src': ['self', 'unsafe-inline'],
              // conexiones salientes desde páginas servidas por tu API
              'connect-src': ['self'],
              // deshabilita object/embed/applet
              'object-src': ['none'],
              // restringe <base>
              'base-uri': ['self'],
              // anti-clickjacking
              'frame-ancestors': ['none'],
            },
          }
        : false, // en dev desactivamos CSP para no pelear con HMR/evals
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  // ===== CORS dinámico =====
  const corsEnabled =
    config.get('CORS_ENABLED') === true ||
    config.get('CORS_ENABLED') === 'true';

  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // permitir Postman, curl, etc.
      if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
      return callback(new Error(`CORS: Origin ${origin} no permitido`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-admin-secret',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'If-None-Match',
    ],
    optionsSuccessStatus: 204,
    maxAge: 86400, // 1 día
  };

  if (corsEnabled) {
    app.enableCors(corsOptions);
    console.log('CORS habilitado para:', corsOrigins.join(', ') || 'todos (*)');
  } else {
    console.warn('⚠️  CORS deshabilitado');
  }

  // ===== Pipes de validación =====
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ===== Prefijo global =====
  app.setGlobalPrefix('api');

  // ===== Graceful shutdown (Nest + Prisma) =====
  app.enableShutdownHooks(); // habilita manejo de SIGTERM/SIGINT en Nest
  const prisma = app.get(PrismaService);
  prisma.enableShutdownHooks(app); // enlaza 'beforeExit' de Prisma -> app.close()

  await app.listen(port);
}
void bootstrap();
