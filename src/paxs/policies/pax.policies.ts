import { BadRequestException } from '@nestjs/common';
import { CreatePaxDto } from '../dto/create-pax.dto';
import { UpdatePaxDto } from '../dto/update-pax.dto';

/**
 * Reglas de negocio (políticas) para pasajeros.
 *
 * 📌 Responsabilidad:
 *  - Validar coherencia entre pares de campos (número ↔ fecha).
 *  - Verificar presencia mínima de documentos.
 *  - NO valida formato: eso lo hace el DTO mediante class-validator.
 */
export class PaxPolicies {
  // ----------------------------------------------------
  // Puntos de entrada principales
  // ----------------------------------------------------
  /** Valida reglas al crear un pasajero. */
  public static assertCreate(dto: CreatePaxDto) {
    this.assertDocs(dto, { requireAtLeastOne: true });
  }

  /** Valida reglas al actualizar un pasajero. */
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
    // Se considera “quiere documento” si hay número o fecha (aunque sea null)
    const wantsPassport =
      this.isProvided(dto.passportNum) ||
      this.isProvided(dto.passportExpirationDate);

    const wantsDni =
      this.isProvided(dto.dniNum) || this.isProvided(dto.dniExpirationDate);

    // ------------------------------------------------
    // Reglas de negocio globales
    // ------------------------------------------------

    // 🔹 Debe tener al menos un documento (solo en create)
    if (opts.requireAtLeastOne && !wantsPassport && !wantsDni) {
      throw new BadRequestException(
        'El pasajero debe tener al menos un documento (DNI o Pasaporte).',
      );
    }

    // 🔹 Coherencia interna de cada documento
    this.ensurePairIfAny(
      'Pasaporte',
      dto.passportNum,
      dto.passportExpirationDate,
    );
    this.ensurePairIfAny('DNI', dto.dniNum, dto.dniExpirationDate);

    // ❌ NO se valida formato de DNI acá — eso ya lo hace el DTO
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
  /**
   * Determina si un valor fue realmente provisto
   * (descarta null, undefined o string vacío).
   */
  private static isProvided<T>(v: T | null | undefined): v is T {
    return v !== null && v !== undefined && v !== ('' as unknown as T);
  }
}
