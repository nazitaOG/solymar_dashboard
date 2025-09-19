import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { hashPassword, verifyPassword } from '../common/security/hash_password';
import { LoginUserDto } from './dto/login-user.dto';

const pepper = process.env.PEPPER;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  register(createAuthDto: CreateUserDto) {
    return handleRequest(async () => {
      const hashed = await hashPassword(
        createAuthDto.password,
        undefined,
        pepper,
      );
      const user = await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          username: createAuthDto.email.split('@')[0],
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

  login(loginUserDto: LoginUserDto) {
    return handleRequest(async () => {
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
        select: {
          email: true,
          hashedPassword: true,
        },
      });
      if (!user) throw new UnauthorizedException('Invalid credentials');
      const isPasswordValid = await verifyPassword(
        user.hashedPassword,
        loginUserDto.password,
        pepper,
      );
      if (!isPasswordValid)
        throw new UnauthorizedException('Invalid credentials');
      return user;
    });
  }
}
