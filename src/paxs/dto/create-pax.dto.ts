import { IsDate, IsDateString, IsString, ValidateIf } from 'class-validator';

export class CreatePaxDto {
  @IsString()
  name: string;

  @IsDate()
  birthDate: Date;

  @IsString()
  nationality: string;

  // Pasaporte (requerido si NO viene DNI)
  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @IsString()
  passportNum?: string;

  @ValidateIf((o: CreatePaxDto) => !o.dniNum)
  @IsDateString()
  passportExpirationDate?: string;

  // DNI (requerido si NO viene Pasaporte)
  @ValidateIf((o: CreatePaxDto) => !o.passportNum)
  @IsString()
  dniNum?: string;

  @ValidateIf((o: CreatePaxDto) => !o.passportNum)
  @IsDateString()
  dniExpirationDate?: string;
}
