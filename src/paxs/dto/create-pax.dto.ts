import { IsDate, IsString, Matches, ValidateIf } from 'class-validator';
import { ToDateDay } from '../../common/decorators/date.transformers';

export class CreatePaxDto {
  @IsString()
  name: string;

  @ToDateDay()
  @IsDate()
  birthDate: Date;

  @IsString()
  nationality: string;

  // Pasaporte (requerido si NO viene DNI)
  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @IsString()
  @Matches(/^[A-Za-z0-9]{6,9}$/, {
    message: 'Passport: debe ser alfanumérico de 6 a 9 caracteres',
  })
  passportNum?: string;

  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @ToDateDay()
  @IsDate()
  passportExpirationDate?: string;

  // DNI (requerido si NO viene Pasaporte)
  @ValidateIf((o: CreatePaxDto) => !o.passportNum)
  @IsString()
  @Matches(/^\d{8}$/, { message: 'DNI: debe tener exactamente 8 dígitos' })
  dniNum?: string;

  @ValidateIf((o: CreatePaxDto) => !o.passportNum)
  @ToDateDay()
  @IsDate()
  dniExpirationDate?: string;
}
