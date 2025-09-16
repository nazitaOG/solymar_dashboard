import { BadRequestException } from '@nestjs/common';

type RequireMode = 'both' | 'any' | 'none';

type PriceOptions = {
  required?: RequireMode;
  labels?: { total?: string; paid?: string };
};

function coerceNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const s = v.replace(',', '.').trim();
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function getValue<T, K extends keyof T>(obj: T, key: K): unknown {
  return obj[key] as unknown;
}

export class CommonPricePolicies {
  private static assertPair(
    totalRaw: unknown,
    paidRaw: unknown,
    opts: PriceOptions & {
      required: RequireMode;
      totalLbl: string;
      paidLbl: string;
    },
  ): void {
    const { required, totalLbl, paidLbl } = opts;

    // Presencia según modo
    if (required === 'both') {
      if (totalRaw === undefined || paidRaw === undefined) {
        throw new BadRequestException(
          `Campos requeridos: ${totalLbl} y ${paidLbl}.`,
        );
      }
    } else if (required === 'any') {
      if (totalRaw === undefined && paidRaw === undefined) {
        throw new BadRequestException(
          `Debe especificar al menos uno: ${totalLbl} o ${paidLbl}.`,
        );
      }
    }

    // Tipos (si vienen)
    const total = totalRaw === undefined ? undefined : coerceNumber(totalRaw);
    const paid = paidRaw === undefined ? undefined : coerceNumber(paidRaw);

    if (totalRaw !== undefined && total === undefined) {
      throw new BadRequestException(`${totalLbl} debe ser un número válido.`);
    }
    if (paidRaw !== undefined && paid === undefined) {
      throw new BadRequestException(`${paidLbl} debe ser un número válido.`);
    }

    // Regla: paid <= total (cuando ambos presentes)
    if (total !== undefined && paid !== undefined) {
      if (paid > total) {
        throw new BadRequestException(
          `${paidLbl} no puede ser mayor que ${totalLbl}.`,
        );
      }
    }
  }

  static assertPrice<T, KTotal extends keyof T, KPaid extends keyof T>(
    dto: T,
    totalKey: KTotal,
    paidKey: KPaid,
    opts?: PriceOptions,
  ): void {
    const required: RequireMode = opts?.required ?? 'both';
    const totalLbl = opts?.labels?.total ?? String(totalKey);
    const paidLbl = opts?.labels?.paid ?? String(paidKey);
    const totalValue = getValue(dto, totalKey);
    const paidValue = getValue(dto, paidKey);

    this.assertPair(totalValue, paidValue, {
      ...opts,
      required,
      totalLbl,
      paidLbl,
    });
  }

  static assertCreatePrice<T, KTotal extends keyof T, KPaid extends keyof T>(
    dto: T,
    totalKey: KTotal,
    paidKey: KPaid,
    opts?: Omit<PriceOptions, 'required'>,
  ): void {
    const totalLbl = opts?.labels?.total ?? String(totalKey);
    const paidLbl = opts?.labels?.paid ?? String(paidKey);
    const totalValue = getValue(dto, totalKey);
    const paidValue = getValue(dto, paidKey);

    this.assertPair(totalValue, paidValue, {
      ...opts,
      required: 'both',
      totalLbl,
      paidLbl,
    });
  }

  static assertUpdatePrice<T, KTotal extends keyof T, KPaid extends keyof T>(
    dto: T,
    base: { total?: unknown; paid?: unknown },
    totalKey: KTotal,
    paidKey: KPaid,
    opts?: Omit<PriceOptions, 'required'>,
  ): void {
    const totalValue = getValue(dto, totalKey);
    const paidValue = getValue(dto, paidKey);
    const totalEff = totalValue !== undefined ? totalValue : base.total;
    const paidEff = paidValue !== undefined ? paidValue : base.paid;

    const totalLbl = opts?.labels?.total ?? String(totalKey);
    const paidLbl = opts?.labels?.paid ?? String(paidKey);

    this.assertPair(totalEff, paidEff, {
      ...opts,
      required: 'both',
      totalLbl,
      paidLbl,
    });
  }
}
