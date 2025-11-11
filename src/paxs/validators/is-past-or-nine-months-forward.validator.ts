// src/common/validators/is-past-or-nine-months-forward.validator.ts
import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Verifica que la fecha no sea posterior a 9 meses desde hoy.
 * Acepta valores Date o ISO string; ignora null / undefined.
 */
export function IsPastOrWithinNineMonths(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isPastOrWithinNineMonths',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'La fecha de nacimiento no puede ser posterior a 9 meses desde hoy.',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          if (value === null || value === undefined) return true;

          // Solo aceptamos Date o string
          if (value instanceof Date) {
            return isValidDate(value);
          }

          if (typeof value === 'string') {
            const date = new Date(value);
            if (!isValidDate(date)) return false;
            return date <= getMaxAllowedDate();
          }

          // Otros tipos (número, booleano, etc.) → inválido
          return false;
        },
      },
    });
  };
}

/** Utilidad: verifica si el objeto Date es válido */
function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime()) && date <= getMaxAllowedDate();
}

/** Devuelve la fecha máxima permitida (hoy + 9 meses) */
function getMaxAllowedDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 9);
  return maxDate;
}
