import { IsNotEmpty, IsString, Matches } from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\s\S]{8,}$/;

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message:
      'La contraseña debe contener al menos 1 minúscula, 1 mayúscula, 1 número y 1 símbolo, y tener al menos 8 caracteres',
  })
  password!: string;
}
