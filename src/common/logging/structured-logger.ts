// common/logging/structured-logger.ts
import { Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export interface LogContext {
  op?: string; // ej: 'PlanesService.create'
  requestId?: string; // si tenés un middleware de correlación
  actorId?: string; // usuario autenticado
  extras?: Record<string, unknown>;
}

export interface StructuredLogger {
  error(message: string, error: unknown, context?: LogContext): void;
}

/** Type guards utilitarios */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isErrorLike(
  value: unknown,
): value is { name?: unknown; message?: unknown; stack?: unknown } {
  return (
    isRecord(value) &&
    ('message' in value || 'stack' in value || 'name' in value)
  );
}

function isPrismaKnownRequestError(
  value: unknown,
): value is Prisma.PrismaClientKnownRequestError {
  return (
    isRecord(value) &&
    (value as { code?: unknown }).code !== undefined &&
    // la clase real no siempre está disponible en distintos builds,
    // por eso chequeamos shape mínimo + name opcional
    (value as { name?: unknown }).name === 'PrismaClientKnownRequestError'
  );
}

/** Convierte unknown a string SIN caer en "[object Object]" */
function toSafeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (value === null || value === undefined) return '';
  // No intentamos stringify de objetos arbitrarios acá para evitar no-base-to-string
  return '[non-primitive]';
}

/** Extrae campos “seguros” de un Error-like, sin forzar a string objetos complejos */
function pickErrorFields(err: unknown): {
  name?: string;
  message?: string;
  stack?: string;
  code?: string | number;
} {
  if (!isErrorLike(err)) return {};
  const name = toSafeString((err as { name?: unknown }).name);
  const message = toSafeString((err as { message?: unknown }).message);
  const stackRaw = (err as { stack?: unknown }).stack;
  const stack = typeof stackRaw === 'string' ? stackRaw : undefined;
  const codeRaw = (err as { code?: unknown }).code;
  const code =
    typeof codeRaw === 'string' || typeof codeRaw === 'number'
      ? codeRaw
      : undefined;

  return {
    name: name || undefined,
    message: message || undefined,
    stack,
    code,
  };
}

// Implementación por defecto con Nest Logger
export class NestStructuredLogger implements StructuredLogger {
  private readonly logger = new Logger('App');

  error(message: string, error: unknown, context?: LogContext): void {
    const base: Record<string, unknown> = {
      level: 'error',
      msg: toSafeString(message),
      ...context,
    };

    // Bloque de detalles de error
    const errBasic = pickErrorFields(error);
    if (Object.keys(errBasic).length > 0) {
      base.error = errBasic;
    } else {
      // cuando error es primitivo (string/number/boolean) o null/undefined
      base.error = { message: toSafeString(error) };
    }

    // Meta de Prisma (sin any), sólo si es el tipo correcto y la meta es objeto
    if (isPrismaKnownRequestError(error)) {
      const meta = error.meta;
      if (isRecord(meta)) {
        // copiamos plano para evitar getters/proxies
        base.prisma = { ...meta } as Record<string, unknown>;
      }
    }

    // Nest Logger imprime string; serializamos nosotros de forma controlada
    this.logger.error(JSON.stringify(base));
  }
}
