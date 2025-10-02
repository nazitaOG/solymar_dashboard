// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

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
              // controla el origen por defecto: de dónde se puede cargar cualquier recurso
              // que no tenga una regla específica. 'self' = mismo origen (el dominio de tu backend).
              // Ejemplo: si tu API sirve Swagger en http://api.miapp.com, entonces los recursos
              // por defecto solo se cargarán desde http://api.miapp.com
              'default-src': ['self'],
              // controla dónde pueden cargarse imágenes.
              // 'self' = tu backend, 'data:' = imágenes embebidas en base64,
              // 'https:' = cualquier dominio https (ej. CDN del front).
              'img-src': ['self', 'data:', 'https:'],
              // controla scripts ejecutables (<script>).
              // "'self'" asegura que solo scripts de tu propio dominio se pueden correr.
              // Importante: evita que se cuelen scripts maliciosos (XSS).
              'script-src': ['self'],
              // controla las hojas de estilo.
              // "'unsafe-inline'" permite CSS inline, pero puede ser usado en ataques XSS.
              // Idealmente, en producción deberías reemplazarlo con nonces o hashes.
              'style-src': ['self', 'unsafe-inline'],
              // controla conexiones salientes hechas por el navegador desde páginas servidas por tu API.
              // Incluye fetch(), XHR, EventSource, y WebSockets.
              // Con "'self'" solo se permite conectar al mismo dominio del backend.
              'connect-src': ['self'],
              // deshabilita la carga de recursos en <object>, <embed>, <applet>.
              // Esto elimina vectores antiguos como Flash.
              'object-src': ['none'],
              // controla la etiqueta <base> usada para cambiar la URL base de las rutas relativas.
              // Con 'self', solo podés usar <base> apuntando a tu propio dominio.
              'base-uri': ['self'],
              // controla qué sitios pueden embeber tu página en un <iframe>.
              // 'none' = nadie puede hacerlo (previene clickjacking).
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
    // Usamos callback tipado para controlar requests sin Origin
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      // Requests sin Origin (curl/Postman) -> permitir
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
    credentials: false, // sin cookies/sesión
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

  await app.listen(port);
}
void bootstrap();
