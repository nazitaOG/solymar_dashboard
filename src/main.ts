// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { PrismaService } from './common/prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  // ===== CORS explícito =====
  const corsEnabled =
    config.get('CORS_ENABLED') === true ||
    config.get('CORS_ENABLED') === 'true';

  const rawOrigins = (config.get<string>('CORS_ORIGINS') ?? '*').trim();
  const allowedOrigins =
    rawOrigins === '*'
      ? ['*']
      : rawOrigins
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

  // Para evitar O(n) includes y tener tipado estricto
  const allowedOriginSet = new Set(allowedOrigins);

  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOriginSet.has('*') || allowedOriginSet.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS: Origin ${origin} no permitido`));
    },
    credentials: false,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    maxAge: 86_400, // 1 día
  };

  if (corsEnabled) {
    app.enableCors(corsOptions);
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

  // ===== Swagger / OpenAPI =====
  const openApiConfig = new DocumentBuilder()
    .setTitle('Solymar Dashboard API')
    .setDescription('Documentación de la API de reservas (NestJS + Prisma)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('docs', app, openApiDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ===== Graceful shutdown (Nest + Prisma) =====
  app.enableShutdownHooks(); // habilita manejo de SIGTERM/SIGINT en Nest
  const prisma = app.get(PrismaService);
  prisma.enableShutdownHooks(app); // enlaza 'beforeExit' de Prisma -> app.close()

  await app.listen(port);
}
void bootstrap();
