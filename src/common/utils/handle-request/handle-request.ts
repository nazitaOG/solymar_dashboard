import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { handlePrismaErrors } from './handle-request-prisma';

type ErrorHandler = (error: unknown) => Promise<never> | never;

const errorHandlers: ErrorHandler[] = [handlePrismaErrors];

export async function handleRequest<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (error) {
    if (error instanceof HttpException) throw error;

    for (const handler of errorHandlers) {
      try {
        await handler(error);
      } catch (handled) {
        if (handled instanceof HttpException) throw handled;
      }
    }

    throw new InternalServerErrorException('Internal Server Error');
  }
}
