import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToLowerTrim } from '../../common/decorators/string.decorators';

export class LoginUserDto {
  @ToLowerTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  password: string;
}
