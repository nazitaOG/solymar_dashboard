import { BadRequestException } from '@nestjs/common';

type RequireMode = 'both' | 'any' | 'none';

export type OriginDestinationOptions = {
  required?: RequireMode;
  ignoreCase?: boolean;
  trim?: boolean;
  allowEqual?: boolean;
  labels?: { a?: string; b?: string };
};

function coerceString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

/**
 * Acceso seguro a propiedades sin usar 'any'
 */
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export class CommonOriginDestinationPolicies {
  private static assertPair(
    aRaw: unknown,
    bRaw: unknown,
    opts: Required<
      Pick<
        OriginDestinationOptions,
        'required' | 'ignoreCase' | 'trim' | 'allowEqual'
      >
    > & {
      aLbl: string;
      bLbl: string;
    },
  ): void {
    const { required, ignoreCase, trim, allowEqual, aLbl, bLbl } = opts;

    // 1) Presencia según modo (check de null/undefined para seguridad de DB)
    const isAPresent = aRaw !== undefined && aRaw !== null;
    const isBPresent = bRaw !== undefined && bRaw !== null;

    if (required === 'both' && (!isAPresent || !isBPresent)) {
      throw new BadRequestException(`Campos requeridos: ${aLbl} y ${bLbl}.`);
    } else if (required === 'any' && !isAPresent && !isBPresent) {
      throw new BadRequestException(
        `Debe especificar al menos uno: ${aLbl} o ${bLbl}.`,
      );
    }

    // 2) Coerción a string
    const a = isAPresent ? coerceString(aRaw) : undefined;
    const b = isBPresent ? coerceString(bRaw) : undefined;

    if (isAPresent && a === undefined)
      throw new BadRequestException(`${aLbl} debe ser un string.`);
    if (isBPresent && b === undefined)
      throw new BadRequestException(`${bLbl} debe ser un string.`);

    // 3) Comparación de igualdad
    if (a !== undefined && b !== undefined) {
      const norm = (s: string) => {
        let out = s;
        if (trim) out = out.trim();
        if (ignoreCase) out = out.toLowerCase();
        return out;
      };

      if (!allowEqual && norm(a) === norm(b)) {
        throw new BadRequestException(`${aLbl} debe ser distinto a ${bLbl}.`);
      }
    }
  }

  static assertCreateDifferent<T, KA extends keyof T, KB extends keyof T>(
    dto: T,
    aKey: KA,
    bKey: KB,
    opts?: Omit<OriginDestinationOptions, 'required'> & {
      required?: RequireMode;
    },
  ): void {
    const required = opts?.required ?? 'any';
    const ignoreCase = opts?.ignoreCase ?? true;
    const trim = opts?.trim ?? true;
    const allowEqual = opts?.allowEqual ?? false;

    const aLbl = opts?.labels?.a ?? String(aKey);
    const bLbl = opts?.labels?.b ?? String(bKey);

    this.assertPair(getValue(dto, aKey), getValue(dto, bKey), {
      required,
      ignoreCase,
      trim,
      allowEqual,
      aLbl,
      bLbl,
    });
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
    const required = opts?.required ?? 'any';
    const ignoreCase = opts?.ignoreCase ?? true;
    const trim = opts?.trim ?? true;
    const allowEqual = opts?.allowEqual ?? false;

    const aLbl = opts?.labels?.a ?? String(aKey);
    const bLbl = opts?.labels?.b ?? String(bKey);

    const aValue = getValue(dto, aKey);
    const bValue = getValue(dto, bKey);

    // Si el DTO no trae el valor, usamos el de la base (soporta null de Prisma)
    const aEff = aValue !== undefined ? aValue : base.a;
    const bEff = bValue !== undefined ? bValue : base.b;

    this.assertPair(aEff, bEff, {
      required,
      ignoreCase,
      trim,
      allowEqual,
      aLbl,
      bLbl,
    });
  }
}
