// src/common/policies/common-origin-destination.policies.ts
import { BadRequestException } from '@nestjs/common';

type RequireMode = 'both' | 'any' | 'none';

type OriginDestinationOptions = {
  required?: RequireMode; // presencia requerida de los campos
  ignoreCase?: boolean; // compara case-insensitive
  trim?: boolean; // recorta espacios antes de comparar
  labels?: { a?: string; b?: string }; // nombres de campos para mensajes
};

function coerceString(v: unknown): string | undefined {
  if (typeof v === 'string') return v;
  return undefined;
}

function getValue<T, K extends keyof T>(obj: T, key: K): unknown {
  return obj[key] as unknown;
}

export class CommonOriginDestinationPolicies {
  private static assertPair(
    aRaw: unknown,
    bRaw: unknown,
    opts: Required<
      Pick<OriginDestinationOptions, 'required' | 'ignoreCase' | 'trim'>
    > & {
      aLbl: string;
      bLbl: string;
    },
  ): void {
    const { required, ignoreCase, trim, aLbl, bLbl } = opts;

    // 1) Presencia según modo
    if (required === 'both') {
      if (aRaw === undefined || bRaw === undefined) {
        throw new BadRequestException(`Campos requeridos: ${aLbl} y ${bLbl}.`);
      }
    } else if (required === 'any') {
      if (aRaw === undefined && bRaw === undefined) {
        throw new BadRequestException(
          `Debe especificar al menos uno: ${aLbl} o ${bLbl}.`,
        );
      }
    }
    // 'none' => no exige presencia

    // 2) Tipos: si vienen, deben ser string (la val de contenido la resuelven los DTOs)
    const a = aRaw === undefined ? undefined : coerceString(aRaw);
    const b = bRaw === undefined ? undefined : coerceString(bRaw);

    if (aRaw !== undefined && a === undefined) {
      throw new BadRequestException(`${aLbl} debe ser un string.`);
    }
    if (bRaw !== undefined && b === undefined) {
      throw new BadRequestException(`${bLbl} debe ser un string.`);
    }

    // 3) Igualdad (solo si ambos presentes)
    if (a !== undefined && b !== undefined) {
      const norm = (s: string) => {
        let out = s;
        if (trim) out = out.trim();
        if (ignoreCase) out = out.toLowerCase();
        return out;
      };
      if (norm(a) === norm(b)) {
        throw new BadRequestException(`${aLbl} debe ser distinto a ${bLbl}.`);
      }
    }
  }

  static assertDifferent<T, KA extends keyof T, KB extends keyof T>(
    dto: T,
    aKey: KA,
    bKey: KB,
    opts?: OriginDestinationOptions,
  ): void {
    const required: RequireMode = opts?.required ?? 'both';
    const ignoreCase = opts?.ignoreCase ?? true;
    const trim = opts?.trim ?? true;

    const aLbl = opts?.labels?.a ?? String(aKey);
    const bLbl = opts?.labels?.b ?? String(bKey);

    const aValue = getValue(dto, aKey);
    const bValue = getValue(dto, bKey);

    this.assertPair(aValue, bValue, { required, ignoreCase, trim, aLbl, bLbl });
  }

  static assertCreateDifferent<T, KA extends keyof T, KB extends keyof T>(
    dto: T,
    aKey: KA,
    bKey: KB,
    opts?: Omit<OriginDestinationOptions, 'required'> & {
      required?: RequireMode;
    },
  ): void {
    const required: RequireMode = opts?.required ?? 'any';
    const ignoreCase = opts?.ignoreCase ?? true;
    const trim = opts?.trim ?? true;

    const aLbl = opts?.labels?.a ?? String(aKey);
    const bLbl = opts?.labels?.b ?? String(bKey);

    const aValue = getValue(dto, aKey);
    const bValue = getValue(dto, bKey);

    this.assertPair(aValue, bValue, { required, ignoreCase, trim, aLbl, bLbl });
  }

  static assertUpdateDifferent<T, KA extends keyof T, KB extends keyof T>(
    dto: T,
    base: { a?: unknown; b?: unknown },
    aKey: KA,
    bKey: KB,
    opts?: Omit<OriginDestinationOptions, 'required'> & {
      required?: RequireMode;
    },
  ): void {
    const required: RequireMode = opts?.required ?? 'any';
    const ignoreCase = opts?.ignoreCase ?? true;
    const trim = opts?.trim ?? true;

    const aLbl = opts?.labels?.a ?? String(aKey);
    const bLbl = opts?.labels?.b ?? String(bKey);

    const aValue = getValue(dto, aKey);
    const bValue = getValue(dto, bKey);

    const aEff = aValue !== undefined ? aValue : base.a;
    const bEff = bValue !== undefined ? bValue : base.b;

    this.assertPair(aEff, bEff, { required, ignoreCase, trim, aLbl, bLbl });
  }
}
