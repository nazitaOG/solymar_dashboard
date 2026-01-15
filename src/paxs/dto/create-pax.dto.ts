import {
  IsDateString,
  IsDate,
  IsString,
  Matches,
  ValidateIf,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { TransformFnParams, Type, Transform } from 'class-transformer';
import { ToDateDay } from '../../common/decorators/date.decorators';
import { ToTrim, ToUpperTrim } from '../../common/decorators/string.decorators';
import { IsFutureOrToday } from '../validators/is-future-or-today.validator';
import { IsPastOrWithinNineMonths } from '../validators/is-past-or-nine-months-forward.validator';
import { IsValidNationalId } from '../validators/is-valid-national-id.validator';

export class CreatePaxDto {
  // ------------------------
  // DATOS BÁSICOS
  // ------------------------
  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  @IsPastOrWithinNineMonths()
  birthDate!: Date;

  @ToUpperTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  nationality!: string;

  // ------------------------
  // PASAPORTE (requerido si no hay DNI)
  // ------------------------
  @ValidateIf((o: CreatePaxDto) => !o.dniNum) // solo se exige si no hay dni
  @ToUpperTrim()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]{6,9}$/, {
    message: 'Passport: debe ser alfanumérico de 6 a 9 caracteres',
  })
  @MaxLength(128)
  passportNum?: string;

  // 🔸 Fecha opcional, pero SOLO si hay passportNum
  // Si no hay pasaporte, no se valida ni se acepta
  @ValidateIf(
    (o: CreatePaxDto) => !!o.passportNum && !!o.passportExpirationDate,
  )
  @IsDateString()
  @IsFutureOrToday()
  passportExpirationDate?: string;

  // ------------------------
  // DNI (requerido si no hay pasaporte)
  // ------------------------
  @ValidateIf((o: CreatePaxDto) => !o.passportNum) // solo se exige si no hay pasaporte
  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @IsValidNationalId()
  dniNum?: string;

  // 🔸 Fecha opcional, pero SOLO si hay dniNum
  // Si no hay DNI, no se valida ni se acepta
  @ValidateIf((o: CreatePaxDto) => !!o.dniNum && !!o.dniExpirationDate)
  @IsDateString()
  @IsFutureOrToday()
  dniExpirationDate?: string;

  @IsOptional()
  @ToTrim()
  @IsString()
  @MaxLength(255)
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: TransformFnParams): string | null | undefined => {
    if (typeof value === 'string') {
      // Elimina todos los espacios en blanco y devuelve el string limpio
      return value.replace(/\s+/g, '');
    }
    // Si es null o undefined, lo devuelve tal cual
    return value;
  })
  @IsPhoneNumber(null, {
    message:
      'El número de teléfono no es válido, debe incluir el código de país',
  })
  phoneNumber?: string;
}
