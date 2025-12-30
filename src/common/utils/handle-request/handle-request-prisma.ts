import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

function metaString(meta: unknown, key: string): string | undefined {
  if (typeof meta !== 'object' || meta === null) return undefined;
  const v = (meta as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : undefined;
}

function metaStringList(meta: unknown, key: string): string[] | undefined {
  if (typeof meta !== 'object' || meta === null) return undefined;
  const v = (meta as Record<string, unknown>)[key];
  if (!Array.isArray(v)) return undefined;
  const out = (v as unknown[]).filter(
    (x): x is string => typeof x === 'string',
  );
  return out.length ? out : undefined;
}

function metaModel(meta: unknown): string | undefined {
  return metaString(meta, 'modelName');
}

function metaTarget(meta: unknown): string | undefined {
  const s = metaString(meta, 'target');
  if (s) return s;
  const arr = metaStringList(meta, 'target');
  return arr?.length ? arr.join(', ') : undefined;
}

function relatedModelFromCause(cause?: string): string | undefined {
  if (!cause) return undefined;
  const m = cause.match(/No '(.+?)' record/i);
  return m?.[1];
}

export function handlePrismaErrors(error: unknown): never {
  // Si no es un error de Prisma, lo dejamos pasar al siguiente manejador
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;

  const code = error.code;
  const model = metaModel(error.meta);
  const target = metaTarget(error.meta);
  const cause = metaString(error.meta, 'cause');
  const constraint = metaString(error.meta, 'constraint');

  // --- 🚨 CAPTURA DE TRIGGERS POSTGRES (P0001) ---
  // Prisma suele envolver errores de triggers en P2010 (Raw query failed)
  // o P2030. Buscamos el mensaje que definiste en el trigger.
  if (
    code === 'P2010' ||
    code === 'P2030' ||
    code === 'P2002' ||
    code === 'P2003'
  ) {
    const rawMessage = error.message;
    if (rawMessage.includes('No se puede eliminar')) {
      // Extraemos la última línea que suele ser el mensaje del error de Postgres
      const lines = rawMessage.split('\n');
      const cleanMsg =
        lines.find((l) => l.includes('No se puede eliminar')) || rawMessage;
      throw new BadRequestException(cleanMsg.trim());
    }
  }

  if (code === 'P2002') {
    const msg = `Valor duplicado para el campo único${
      target ? ` (${target})` : ''
    }${model ? ` en ${model}` : ''}`;
    throw new ConflictException(msg);
  }

  if (code === 'P2025') {
    const related = relatedModelFromCause(cause);
    const base = model
      ? `Registro no encontrado en ${model}`
      : 'Registro no encontrado';
    const msg = related
      ? `Registro relacionado ${related} no encontrado${
          model ? ` (usado en ${model})` : ''
        }`
      : base;
    throw new NotFoundException(msg);
  }

  if (code === 'P2003') {
    let msg = `Fallo en la referencia de clave externa${model ? ` en ${model}` : ''}`;
    if (constraint?.includes('user_id')) msg = 'Usuario no encontrado';
    else if (constraint?.includes('paxId')) msg = 'Pasajero no encontrado';
    throw new BadRequestException(msg);
  }

  if (code === 'P2001') {
    const msg = model
      ? `Registro no encontrado en ${model}`
      : 'Registro no encontrado';
    throw new NotFoundException(msg);
  }

  // Lista de errores de validación de datos
  const badRequestCodes = [
    'P2004',
    'P2005',
    'P2006',
    'P2007',
    'P2008',
    'P2009',
    'P2011',
    'P2012',
    'P2013',
    'P2016',
    'P2017',
    'P2019',
    'P2020',
    'P2026',
  ];

  if (badRequestCodes.includes(code)) {
    const msg = `Datos o consulta inválida (${code})${model ? ` en ${model}` : ''}`;
    throw new BadRequestException(msg);
  }

  throw error;
}
