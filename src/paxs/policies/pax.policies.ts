// pax/policies/pax.policies.ts
import { BadRequestException } from '@nestjs/common';
import { CreatePaxDto } from '../dto/create-pax.dto';
import { UpdatePaxDto } from '../dto/update-pax.dto';
import { isProvided } from '../../common/utils/value-guards';

export class PaxPolicies {
  // Punto de entrada explícito para cada caso
  public static assertCreate(dto: CreatePaxDto) {
    this.assertDocs(dto, { requireAtLeastOne: true });
  }

  public static assertUpdate(dto: UpdatePaxDto) {
    this.assertDocs(dto, { requireAtLeastOne: false });
  }

  // Template compartido: misma validación con pequeña variación
  private static assertDocs(
    dto: Partial<CreatePaxDto | UpdatePaxDto>,
    opts: { requireAtLeastOne: boolean },
  ) {
    const wantsPassport =
      isProvided(dto.passportNum) || isProvided(dto.passportExpirationDate);

    const wantsDni =
      isProvided(dto.dniNum) || isProvided(dto.dniExpirationDate);

    // Diferencia clave entre create y update:
    if (opts.requireAtLeastOne && !wantsPassport && !wantsDni) {
      throw new BadRequestException(
        'El pasajero debe tener al menos un documento (DNI o Pasaporte).',
      );
    }

    this.ensurePairIfAny(
      'Pasaporte',
      dto.passportNum,
      dto.passportExpirationDate,
    );
    this.ensurePairIfAny('DNI', dto.dniNum, dto.dniExpirationDate);

    if (wantsDni) {
      const dniNum = dto.dniNum;
      if (!/^\d{8}$/.test(dniNum!)) {
        throw new BadRequestException('DNI: el número debe tener 8 dígitos.');
      }
    }
  }

  // Si viene uno, deben venir ambos; si no viene ninguno, OK.
  private static ensurePairIfAny(label: string, a?: unknown, b?: unknown) {
    const aProvided = this.isProvided(a);
    const bProvided = this.isProvided(b);
    if (aProvided !== bProvided) {
      throw new BadRequestException(
        `${label}: número y fecha de expiración son requeridos juntos.`,
      );
    }
  }

  private static isProvided<T>(v: T | null | undefined): v is T {
    return v !== null && v !== undefined && v !== ('' as unknown as T);
  }
}
