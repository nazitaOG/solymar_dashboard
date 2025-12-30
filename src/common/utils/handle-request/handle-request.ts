import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { handlePrismaErrors } from './handle-request-prisma';
import {
  NestStructuredLogger,
  StructuredLogger,
  type LogContext,
} from '../../logging/structured-logger';

type ErrorHandler = (error: unknown) => Promise<never> | never;

const errorHandlers: ErrorHandler[] = [handlePrismaErrors];

export async function handleRequest<T>(
  op: () => Promise<T>,
  logger: StructuredLogger = new NestStructuredLogger(),
  ctx?: LogContext,
): Promise<T> {
  try {
    return await op();
  } catch (error) {
    // 1️⃣ Si ya es una HttpException (lanzada por handlePrismaErrors o manualmente)
    if (error instanceof HttpException) {
      logger.error(error.message, error, ctx);
      throw error;
    }

    // 2️⃣ Intentamos mapear con manejadores
    for (const handler of errorHandlers) {
      try {
        await handler(error);
      } catch (handled) {
        if (handled instanceof HttpException) {
          logger.error(`Mapped domain error: ${handled.message}`, error, ctx);
          throw handled;
        }
      }
    }

    // 3️⃣ SI LLEGAMOS AQUÍ, es un error no manejado
    const originalMessage =
      error instanceof Error ? error.message : 'Internal Server Error';

    // Doble chequeo de seguridad para mensajes de Trigger
    if (
      originalMessage.includes('No se puede eliminar') ||
      originalMessage.includes('no puede quedar sin pasajeros')
    ) {
      const cleanMsg = originalMessage.includes('no puede quedar sin pasajeros')
        ? 'No se puede eliminar: el pasajero es el único en una reserva activa. Por favor, elimine primero la reserva.'
        : originalMessage
            .split('\n')
            .find((l) => l.includes('No se puede eliminar'))
            ?.trim();

      throw new InternalServerErrorException(
        cleanMsg || 'Error de integridad en base de datos',
        { cause: error },
      );
    }

    logger.error('Unhandled error captured in handleRequest', error, ctx);
    throw new InternalServerErrorException('Internal Server Error', {
      cause: error,
    });
  }
}
