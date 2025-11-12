import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Expresiones regulares válidas por país.
 */
const DNI_REGEX: Record<string, RegExp> = {
  argentina: /^\d{7,8}$/, // 7-8 dígitos → 12345678
  uruguay: /^\d{1,8}-?\d$/, // hasta 8 dígitos + guion opcional → 1234567-8
  chile: /^\d{7,8}-[0-9Kk]$/, // 7–8 dígitos + guion + dígito o K → 12345678-K
  brasil: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, // 11 dígitos, con o sin separadores → 123.456.789-09
  paraguay: /^\d{6,8}$/, // 6–8 dígitos → 6543210
  perú: /^\d{8}$/, // exactamente 8 dígitos → 76543210
  bolivia: /^[A-Z0-9]{5,9}$/i, // 5–9 alfanuméricos → 123456LP
  otro: /^[A-Za-z0-9]{4,15}$/, // 4–15 alfanuméricos → X1234Y
};

interface HasNationality {
  nationality?: string;
}

/**
 * ✅ Valida el formato del DNI según el país del campo `nationality`.
 */
export function IsValidNationalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidNationalId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (!value) return true; // si no hay valor, no valida
          const obj = args.object as HasNationality;

          // normalizar a minúsculas por seguridad
          const nationality = obj.nationality?.toLowerCase() ?? 'otro';
          const pattern = DNI_REGEX[nationality] || DNI_REGEX.otro;

          return typeof value === 'string' && pattern.test(value.trim());
        },
        defaultMessage(args: ValidationArguments): string {
          const obj = args.object as HasNationality;
          const nationality = obj.nationality ?? 'el país seleccionado';
          return `El formato del documento no es válido para el país seleccionado: ${nationality}.`;
        },
      },
    });
  };
}
