import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ToLowerTrim } from '../../common/decorators/string.decorators';
import { ValidRoles } from '../interfaces/valid-roles.interface';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\s\S]{8,}$/;
// Reglas:
// - al menos 1 minúscula
// - al menos 1 mayúscula
// - al menos 1 número
// - al menos 1 símbolo
// - 8+ caracteres

export class CreateUserDto {
  @IsOptional()
  @IsEnum(ValidRoles, {
    message: `role debe ser uno de: ${Object.values(ValidRoles).join(', ')}`,
  })
  role?: ValidRoles;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(PASSWORD_REGEX, {
    message:
      'La contraseña debe contener al menos 1 minúscula, 1 mayúscula, 1 número y 1 símbolo, y tener al menos 8 caracteres',
  })
  password: string;

  @ToLowerTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  email: string;
}
