import { IsEmail, IsNotEmpty } from 'class-validator';
import { ToLowerTrim } from '../../common/decorators/string.decorators';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ToLowerTrim()
  email!: string;
}
