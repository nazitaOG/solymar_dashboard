// src/tasks/cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { seed } from '../../prisma/seed.demo';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // Se ejecuta todos los días a las 4 AM
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    // 1. VERIFICACIÓN DE SEGURIDAD (El "Interruptor")
    const isDemoMode =
      this.configService.get<string>('IS_DEMO_MODE') === 'true';

    if (!isDemoMode) {
      this.logger.debug('🛡️ Omitiendo purga: No es entorno DEMO.');
      return;
    }

    this.logger.warn(
      '🔥 MODO DEMO DETECTADO: Iniciando purga de base de datos...',
    );

    try {
      await seed(this.prisma);
      this.logger.log('✅ Base de datos purgada exitosamente.');
    } catch (error) {
      this.logger.error('❌ Error ejecutando seed.demo:', error);
    }
  }
}
