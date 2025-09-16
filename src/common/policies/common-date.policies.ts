// src/common/policies/common-date-policies.ts
import { BadRequestException } from '@nestjs/common';

type RequireMode = 'both' | 'any' | 'none';

type DateRangeOptions = {
  required?: RequireMode;
  allowEqual?: boolean;
  minHoursBeforeStart?: number;
  now?: Date;
  labels?: { start?: string; end?: string };
};

function coerceDate(v: unknown): Date | undefined {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v;
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function getValue<T, K extends keyof T>(obj: T, key: K): unknown {
  return obj[key] as unknown;
}

export class CommonDatePolicies {
  private static assertPair(
    startRaw: unknown,
    endRaw: unknown,
    opts: DateRangeOptions & {
      required: RequireMode;
      startLbl: string;
      endLbl: string;
    },
  ): void {
    const {
      required,
      allowEqual = false,
      minHoursBeforeStart = 0,
      now = new Date(),
      startLbl,
      endLbl,
    } = opts;

    const start = startRaw === undefined ? undefined : coerceDate(startRaw);
    const end = endRaw === undefined ? undefined : coerceDate(endRaw);

    if (required === 'both') {
      if (startRaw === undefined || endRaw === undefined) {
        throw new BadRequestException(
          `Campos requeridos: ${startLbl} y ${endLbl}.`,
        );
      }
    } else if (required === 'any') {
      if (startRaw === undefined && endRaw === undefined) {
        throw new BadRequestException(
          `Debe especificar al menos uno: ${startLbl} o ${endLbl}.`,
        );
      }
    }

    if (startRaw !== undefined && !start) {
      throw new BadRequestException(
        `${startLbl} debe ser una fecha válida (ISO 8601 o Date).`,
      );
    }
    if (endRaw !== undefined && !end) {
      throw new BadRequestException(
        `${endLbl} debe ser una fecha válida (ISO 8601 o Date).`,
      );
    }

    if (start && end) {
      const ok = allowEqual
        ? start.getTime() <= end.getTime()
        : start.getTime() < end.getTime();
      if (!ok) {
        const cmp = allowEqual ? 'anterior o igual a' : 'anterior a';
        throw new BadRequestException(`${startLbl} debe ser ${cmp} ${endLbl}.`);
      }
    }

    if (start) {
      const minMs = minHoursBeforeStart * 60 * 60 * 1000;
      if (start.getTime() - now.getTime() < minMs) {
        if (minHoursBeforeStart > 0) {
          throw new BadRequestException(
            `${startLbl} debe tener al menos ${minHoursBeforeStart} horas de anticipación.`,
          );
        } else {
          throw new BadRequestException(
            `${startLbl} no puede estar en el pasado.`,
          );
        }
      }
    }
  }

  static assertDateRange<T, KStart extends keyof T, KEnd extends keyof T>(
    dto: T,
    startKey: KStart,
    endKey: KEnd,
    opts?: DateRangeOptions,
  ): void {
    const required: RequireMode = opts?.required ?? 'both';
    const startLbl = opts?.labels?.start ?? String(startKey);
    const endLbl = opts?.labels?.end ?? String(endKey);
    const startValue = getValue(dto, startKey);
    const endValue = getValue(dto, endKey);

    this.assertPair(startValue, endValue, {
      ...opts,
      required,
      startLbl,
      endLbl,
    });
  }

  static assertCreateRange<T, KStart extends keyof T, KEnd extends keyof T>(
    dto: T,
    startKey: KStart,
    endKey: KEnd,
    opts?: Omit<DateRangeOptions, 'required'>,
  ): void {
    const startLbl = opts?.labels?.start ?? String(startKey);
    const endLbl = opts?.labels?.end ?? String(endKey);
    const startValue = getValue(dto, startKey);
    const endValue = getValue(dto, endKey);

    this.assertPair(startValue, endValue, {
      ...opts,
      required: 'both',
      startLbl,
      endLbl,
    });
  }

  static assertUpdateRange<T, KStart extends keyof T, KEnd extends keyof T>(
    dto: T,
    base: { start?: unknown; end?: unknown },
    startKey: KStart,
    endKey: KEnd,
    opts?: Omit<DateRangeOptions, 'required'>,
  ): void {
    const startValue = getValue(dto, startKey);
    const endValue = getValue(dto, endKey);
    const startEff = startValue !== undefined ? startValue : base.start;
    const endEff = endValue !== undefined ? endValue : base.end;

    const startLbl = opts?.labels?.start ?? String(startKey);
    const endLbl = opts?.labels?.end ?? String(endKey);

    this.assertPair(startEff, endEff, {
      ...opts,
      required: 'both',
      startLbl,
      endLbl,
    });
  }
}
