import {
  IsDate,
  IsString,
  Matches,
  ValidateIf,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ToDateDay } from '../../common/decorators/date.transformers';
import { toTrim, toUpperTrim } from '../../common/transformers';

export class CreatePaxDto {
  // TRANSFORMACIONES PRIMERO
  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  birthDate!: Date;

  @Transform(toUpperTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  nationality!: string;

  // PASAPORTE (requerido si NO viene DNI)
  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @Transform(toUpperTrim, { toClassOnly: true })
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
  @Transform(toTrim, { toClassOnly: true })
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
