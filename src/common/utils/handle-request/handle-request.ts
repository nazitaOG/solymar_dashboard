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
    // 1️⃣ Si ya es una HttpException (ej. lanzada manualmente en el servicio)
    if (error instanceof HttpException) {
      logger.error(error.message, error, ctx);
      throw error;
    }

    // 2️⃣ Intentamos mapear con manejadores específicos (como Prisma)
    for (const handler of errorHandlers) {
      try {
        await handler(error);
      } catch (handled) {
        // Si el handler tradujo el error a una HttpException (ej. NotFound, BadRequest)
        if (handled instanceof HttpException) {
          logger.error(`Mapped domain error: ${handled.message}`, error, ctx);
          // 🚀 LANZAMOS EL ERROR MANEJADO DIRECTAMENTE (sin envolverlo en 500)
          throw handled;
        }
      }
    }

    // 3️⃣ SI LLEGAMOS AQUÍ, ES UN ERROR REALMENTE NO MANEJADO
    logger.error('Unhandled error captured in handleRequest', error, ctx);

    // Intentamos extraer el mensaje real del error de la base de datos o sistema
    const originalMessage =
      error instanceof Error ? error.message : 'Internal Server Error';

    // Limpiamos el mensaje de Prisma si tiene el formato largo de "Invalid invocation..."
    const cleanMsg = originalMessage.includes('No se puede eliminar')
      ? originalMessage
          .split('\n')
          .find((l) => l.includes('No se puede eliminar'))
          ?.trim()
      : 'Internal Server Error';

    throw new InternalServerErrorException(
      cleanMsg || 'Internal Server Error',
      {
        cause: error,
      },
    );
  }
}
