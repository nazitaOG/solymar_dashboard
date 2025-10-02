import {
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
  // TRANSFORMACIONES PRIMERO
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
  nationality!: string;

  // PASAPORTE (requerido si NO viene DNI)
  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @ToUpperTrim()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]{6,9}$/, {
    message: 'Passport: debe ser alfanumérico de 6 a 9 caracteres',
  })
  @MaxLength(128)
  passportNum?: string;

  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  passportExpirationDate?: Date;

  // DNI (requerido si NO viene PASAPORTE)
  @ValidateIf((o: CreatePaxDto) => !o.passportNum)
  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'DNI: debe tener exactamente 8 dígitos' })
  @MaxLength(128)
  dniNum?: string;

  @ValidateIf((o: CreatePaxDto) => !o.passportNum)
  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  dniExpirationDate?: Date;
}
