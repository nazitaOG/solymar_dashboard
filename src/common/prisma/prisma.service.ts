import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const user = config.get<string>('DB_USER') ?? '';
    const pass = config.get<string>('DB_PASSWORD') ?? '';
    const host = config.get<string>('DB_HOST') ?? '';
    const port = config.get<string>('DB_PORT') ?? '';
    const db = config.get<string>('DB_NAME') ?? '';
    const url = `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=public`;

    super({ datasources: { db: { url } } });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
