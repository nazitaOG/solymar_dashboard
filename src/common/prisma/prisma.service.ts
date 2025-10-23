// src/common/prisma/prisma.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    super({ datasources: { db: { url } } });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Maneja el cierre limpio del proceso (sin ESLint warnings)
  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      // No devolvemos una promesa — Nest manejará el cierre
      void app.close(); // `void` indica intencionalmente que no esperamos resultado
    });
  }
}
