// src/tasks/cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';

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
      await this.cleanDatabase();
      this.logger.log('✅ Base de datos purgada exitosamente.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `❌ Error crítico en purga: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          '❌ Error desconocido en purga',
          String(error as string),
        );
      }
    }
  }

  private async cleanDatabase() {
    // Transacción para borrar todo o nada
    await this.prisma.$transaction([
      // AQUI AJUSTA LOS NOMBRES SEGÚN TU SCHEMA.PRISMA SI DIFIEREN
      this.prisma.reservation.deleteMany(),

      // 2. ELIMINAR PASAJEROS (PAX)
      // Esto disparará CASCADE a:
      // - Dni, Passport, PaxReservation (si quedara alguna)
      this.prisma.pax.deleteMany(),
    ]);
    this.logger.debug('✨ Tablas limpiadas correctamente.');
  }
}
