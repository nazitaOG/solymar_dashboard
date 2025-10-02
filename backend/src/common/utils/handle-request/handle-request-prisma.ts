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
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;

  const code = error.code;
  const model = metaModel(error.meta);
  const target = metaTarget(error.meta);
  const cause = metaString(error.meta, 'cause');
  const constraint = metaString(error.meta, 'constraint');

  if (code === 'P2002') {
    const msg = `Duplicate value for unique constraint${
      target ? ` (${target})` : ''
    }${model ? ` in ${model}` : ''}`;
    throw new ConflictException(msg);
  }

  if (code === 'P2025') {
    const related = relatedModelFromCause(cause);
    const base = model
      ? `Record not found in model ${model}`
      : 'Record not found';
    const msg = related
      ? `Related ${related} record not found${
          model ? ` (used in model ${model})` : ''
        }`
      : base;
    throw new NotFoundException(msg);
  }

  if (code === 'P2003') {
    let msg = `Foreign key reference failed${model ? ` in ${model}` : ''}`;
    if (constraint?.includes('user_id')) msg = 'User not found';
    else if (constraint?.includes('position_id')) msg = 'Position not found';
    throw new NotFoundException(msg);
  }

  if (code === 'P2001') {
    const msg = model
      ? `Record not found in model ${model}`
      : 'Record not found';
    throw new NotFoundException(msg);
  }

  if (
    [
      'P2004',
      'P2005',
      'P2006',
      'P2007',
      'P2008',
      'P2009',
      'P2010',
      'P2011',
      'P2012',
      'P2013',
      'P2016',
      'P2017',
      'P2019',
      'P2020',
      'P2026',
    ].includes(code)
  ) {
    const msg = `Invalid data or query (${code})${model ? ` in ${model}` : ''}`;
    throw new BadRequestException(msg);
  }

  throw error;
}
