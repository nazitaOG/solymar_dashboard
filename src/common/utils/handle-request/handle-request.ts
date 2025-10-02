import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { handlePrismaErrors } from './handle-request-prisma';
import {
  NestStructuredLogger,
  StructuredLogger,
  type LogContext,
} from '../../../common/logging/structured-logger';

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
    if (error instanceof HttpException) {
      logger.error(error.message, error, ctx);
      throw error;
    }

    for (const handler of errorHandlers) {
      try {
        await handler(error);
      } catch (handled) {
        if (handled instanceof HttpException) {
          logger.error('Mapped domain/DB error', error, ctx);
          throw new (handled.constructor as new (
            m?: string,
            o?: unknown,
          ) => HttpException)(handled.message, { cause: error as unknown });
        }
      }
    }

    logger.error('Unhandled error', error, ctx);
    throw new InternalServerErrorException('Internal Server Error', {
      cause: error as unknown,
    });
  }
}
