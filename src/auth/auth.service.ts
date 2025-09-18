import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  register(createAuthDto: CreateUserDto) {
    console.log(createAuthDto);
    return 'This action registers a new user';
  }
}
