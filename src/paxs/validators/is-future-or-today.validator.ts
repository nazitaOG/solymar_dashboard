import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Verifica que una fecha no sea anterior al día de hoy (00:00).
 * Se salta la validación si el valor es null o undefined.
 *
 * Admite valores tipo string o Date.
 */
export function IsFutureOrToday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isFutureOrToday',
      target: object.constructor,
      propertyName,
      options: {
        message: 'La fecha de vencimiento no puede ser anterior a hoy.',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          // ✅ Si no hay valor, se considera válido (campo opcional)
          if (value === null || value === undefined) return true;

          // ✅ Aceptamos string o Date, rechazamos otros tipos
          if (!(value instanceof Date) && typeof value !== 'string')
            return false;

          const date = new Date(value);
          if (isNaN(date.getTime())) return false;

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
      },
    });
  };
}
