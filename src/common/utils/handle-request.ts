import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

function metaTarget(meta?: unknown): string | undefined {
  try {
    const t = (meta as { target: unknown })?.target as string | undefined;
    return t ? String(t) : undefined;
  } catch {
    return undefined;
  }
}

export class HandleRequest {
  static async prisma<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op();
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const target = metaTarget(err.meta);
        switch (err.code) {
          case 'P2000':
            throw new BadRequestException(
              'Valor demasiado largo para un campo.',
            );
          case 'P2001':
            throw new NotFoundException('Registro no encontrado.');
          case 'P2002':
            throw new ConflictException(
              `Valor único duplicado${target ? ` (${target})` : ''}.`,
            );
          case 'P2003':
            throw new BadRequestException('Violación de clave foránea.');
          case 'P2004':
            throw new BadRequestException(
              'Se violó una restricción de base de datos.',
            );
          case 'P2005':
          case 'P2006':
          case 'P2007':
          case 'P2008':
          case 'P2009':
          case 'P2010':
          case 'P2011':
          case 'P2012':
          case 'P2013':
          case 'P2016':
          case 'P2017':
          case 'P2019':
          case 'P2020':
          case 'P2026':
            throw new BadRequestException(
              `Datos inválidos o consulta inválida (${err.code}).`,
            );
          case 'P2014':
            throw new ConflictException(
              'La operación violaría una relación requerida.',
            );
          case 'P2015':
          case 'P2018':
            throw new NotFoundException('Registro relacionado no encontrado.');
          case 'P2021':
          case 'P2022':
          case 'P2023':
            throw new InternalServerErrorException(
              'Inconsistencia de esquema/tabla en la base de datos.',
            );
          case 'P2024':
            throw new ServiceUnavailableException(
              'Timeout al obtener conexión de base de datos.',
            );
          case 'P1010':
            throw new ForbiddenException(
              'Permiso denegado por el servidor de base de datos.',
            );
          default:
            throw new BadRequestException(`Prisma error: ${err.code}`);
        }
      }

      if (err instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Datos inválidos para la operación.');
      }

      if (err instanceof Prisma.PrismaClientInitializationError) {
        throw new ServiceUnavailableException(
          'No se pudo inicializar la conexión a la base de datos.',
        );
      }

      if (err instanceof Prisma.PrismaClientRustPanicError) {
        throw new InternalServerErrorException(
          'El motor de base de datos sufrió un panic.',
        );
      }

      if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        throw new InternalServerErrorException(
          'Error desconocido al ejecutar la consulta.',
        );
      }

      if (err instanceof Error) {
        throw new InternalServerErrorException(err.message);
      }

      throw new InternalServerErrorException('Error desconocido.');
    }
  }
}
