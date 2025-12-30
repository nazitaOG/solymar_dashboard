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
  // Capturamos el mensaje crudo antes de filtrar por tipo de clase
  const rawMessage = error instanceof Error ? error.message : '';

  // 🚨 CAPTURA DE TRIGGERS (Incluso si Prisma no reconoce el código)
  // Buscamos tanto tu mensaje personalizado como el de la reserva
  if (
    rawMessage.includes('No se puede eliminar') ||
    rawMessage.includes('no puede quedar sin pasajeros')
  ) {
    const lines = rawMessage.split('\n');
    const cleanMsg =
      lines.find(
        (l) =>
          l.includes('No se puede eliminar') ||
          l.includes('no puede quedar sin pasajeros'),
      ) || rawMessage;

    // Normalizamos el mensaje para el usuario final
    let userMsg = cleanMsg.trim();
    if (userMsg.includes('no puede quedar sin pasajeros')) {
      userMsg =
        'No se puede eliminar: el pasajero es el único en una reserva activa. Por favor, elimine primero la reserva.';
    }

    throw new BadRequestException(userMsg);
  }

  // Si no es un error conocido de Prisma después de chequear triggers, salimos
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;

  const code = error.code;
  const model = metaModel(error.meta);
  const target = metaTarget(error.meta);
  const cause = metaString(error.meta, 'cause');
  const constraint = metaString(error.meta, 'constraint');

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
