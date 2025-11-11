import {
  IsDateString,
  IsDate,
  IsString,
  Matches,
  ValidateIf,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToDateDay } from '../../common/decorators/date.decorators';
import { ToTrim, ToUpperTrim } from '../../common/decorators/string.decorators';

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
  passportExpirationDate?: string;

  // ------------------------
  // DNI (requerido si no hay pasaporte)
  // ------------------------
  @ValidateIf((o: CreatePaxDto) => !o.passportNum) // solo se exige si no hay pasaporte
  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'DNI: debe tener exactamente 8 dígitos' })
  @MaxLength(128)
  dniNum?: string;

  // 🔸 Fecha opcional, pero SOLO si hay dniNum
  // Si no hay DNI, no se valida ni se acepta
  @ValidateIf((o: CreatePaxDto) => !!o.dniNum && !!o.dniExpirationDate)
  @IsDateString()
  dniExpirationDate?: string;
}
