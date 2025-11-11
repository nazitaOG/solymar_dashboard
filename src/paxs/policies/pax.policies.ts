import { BadRequestException } from '@nestjs/common';
import { CreatePaxDto } from '../dto/create-pax.dto';
import { UpdatePaxDto } from '../dto/update-pax.dto';
import { isProvided } from '../../common/utils/value-guards';

export class PaxPolicies {
  // ----------------------------------------------------
  // Puntos de entrada principales
  // ----------------------------------------------------
  public static assertCreate(dto: CreatePaxDto) {
    this.assertDocs(dto, { requireAtLeastOne: true });
  }

  public static assertUpdate(dto: UpdatePaxDto) {
    this.assertDocs(dto, { requireAtLeastOne: false });
  }

  // ----------------------------------------------------
  // Validación de documentos comunes a create / update
  // ----------------------------------------------------
  private static assertDocs(
    dto: Partial<CreatePaxDto | UpdatePaxDto>,
    opts: { requireAtLeastOne: boolean },
  ) {
    // Se considera "quiere documento" si hay número o fecha (aunque sea null)
    const wantsPassport =
      isProvided(dto.passportNum) || isProvided(dto.passportExpirationDate);

    const wantsDni =
      isProvided(dto.dniNum) || isProvided(dto.dniExpirationDate);

    // Debe tener al menos un documento (solo en create)
    if (opts.requireAtLeastOne && !wantsPassport && !wantsDni) {
      throw new BadRequestException(
        'El pasajero debe tener al menos un documento (DNI o Pasaporte).',
      );
    }

    // Coherencia interna de cada documento
    this.ensurePairIfAny(
      'Pasaporte',
      dto.passportNum,
      dto.passportExpirationDate,
    );
    this.ensurePairIfAny('DNI', dto.dniNum, dto.dniExpirationDate);

    // Validación extra: formato del DNI
    if (isProvided(dto.dniNum) && !/^\d{8}$/.test(dto.dniNum)) {
      throw new BadRequestException('DNI: el número debe tener 8 dígitos.');
    }
  }

  // ----------------------------------------------------
  // Reglas de coherencia número / fecha
  // ----------------------------------------------------
  /**
   * ✅ Casos válidos:
   *   - Ambos vacíos / null / undefined
   *   - Número presente y fecha null / undefined
   *   - Ambos presentes (número + fecha)
   *
   * ❌ Caso inválido:
   *   - Fecha presente sin número
   */
  private static ensurePairIfAny(label: string, num?: unknown, exp?: unknown) {
    const numProvided = this.isProvided(num);
    const expProvided = this.isProvided(exp);

    // Ninguno provisto → OK
    if (!numProvided && !expProvided) return;

    // Fecha sin número → error
    if (!numProvided && expProvided) {
      throw new BadRequestException(
        `${label}: no puede tener fecha sin número.`,
      );
    }

    // Número sin fecha o ambos → OK
  }

  // ----------------------------------------------------
  // Helper genérico
  // ----------------------------------------------------
  /** Determina si un valor fue realmente provisto (descarta null, undefined o string vacío). */
  private static isProvided<T>(v: T | null | undefined): v is T {
    return v !== null && v !== undefined && v !== ('' as unknown as T);
  }
}
