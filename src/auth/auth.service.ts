import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { hashPassword } from '../common/security/hash_password';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  register(createAuthDto: CreateUserDto) {
    return handleRequest(async () => {
      const pepper = process.env.PEPPER;
      const hashed = await hashPassword(
        createAuthDto.password,
        undefined,
        pepper,
      );
      const user = await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          username: createAuthDto.username,
          hashedPassword: hashed,
        },
        select: {
          id: true,
          email: true,
          username: true,
          uploadDate: true,
        },
      });
      return user;
    });
  }
}
