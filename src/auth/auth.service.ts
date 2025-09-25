import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { hashPassword, verifyPassword } from '../common/security/hash_password';
import { LoginUserDto } from './dto/login-user.dto';
import { GetJwtUtils } from './utils/get-jwt.utils';

@Injectable()
export class AuthService {
  private readonly pepper: string;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly getJwtUtils: GetJwtUtils,
  ) {
    this.pepper = this.configService.getOrThrow<string>('PEPPER');
  }

  register(createAuthDto: CreateUserDto) {
    return handleRequest(async () => {
      const hashed = await hashPassword(
        createAuthDto.password,
        undefined,
        this.pepper,
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
          id: true,
          email: true,
          hashedPassword: true,
          isActive: true,
          username: true,
        },
      });
      if (!user) throw new UnauthorizedException('Invalid credentials');
      const isPasswordValid = await verifyPassword(
        user.hashedPassword,
        loginUserDto.password,
        this.pepper,
      );
      if (!user.isActive) throw new UnauthorizedException('User is blocked');
      if (!isPasswordValid)
        throw new UnauthorizedException('Invalid credentials');
      return {
        ...user,
        token: this.getJwtUtils.generateAccessToken({
          sub: user.id,
        }),
      };
    });
  }

  try() {
    return {
      message: 'Hello World',
    };
  }
}
