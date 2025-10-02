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
  constructor(config: ConfigService) {
    // Lee la URL completa (Compose ya le pone host = db)
    const url = config.get<string>('DATABASE_URL');
    super({ datasources: { db: { url } } });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Se dispara cuando Nest procesa señales si usás app.enableShutdownHooks()
  async onApplicationShutdown(): Promise<void> {
    // doble seguro: si ya se desconectó, no pasa nada
    await this.$disconnect();
  }

  // Conecta el evento beforeExit de Prisma con el ciclo de shutdown de Nest
  enableShutdownHooks(app: INestApplication): void {
    (this as unknown as { $on: (e: 'beforeExit', cb: () => void) => void }).$on(
      'beforeExit',
      () => {
        void app.close();
      },
    );
  }
}
