import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { hashPassword, verifyPassword } from '../common/security/hash_password';
import { LoginUserDto } from './dto/login-user.dto';
import { GetJwtUtils } from './utils/get-jwt.utils';
import { ValidRoles } from './interfaces/valid-roles.interface';

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

  // actorId = id del super_admin que crea
  register(actorId: string, dto: CreateUserDto) {
    return handleRequest(async () => {
      const hashed = await hashPassword(dto.password, undefined, this.pepper);

      const roleDescription = dto.role ?? ValidRoles.user;

      const role = await this.prisma.role.findUnique({
        where: { description: roleDescription },
        select: { id: true },
      });
      if (!role) {
        throw new BadRequestException(`Rol inválido: ${roleDescription}`);
      }

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.email.split('@')[0],
          hashedPassword: hashed,
          createdBy: actorId,
          updatedBy: actorId,
          roleUsers: {
            create: {
              roleId: role.id,
              createdBy: actorId,
              updatedBy: actorId,
            },
          },
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true, // reemplaza uploadDate
          isActive: true,
        },
      });

      return user;
    });
  }

  login(dto: LoginUserDto) {
    return handleRequest(async () => {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          email: true,
          hashedPassword: true,
          isActive: true,
          username: true,
        },
      });

      if (!user) throw new UnauthorizedException('Invalid credentials');
      if (!user.isActive) throw new UnauthorizedException('User is blocked');

      const ok = await verifyPassword(
        user.hashedPassword,
        dto.password,
        this.pepper,
      );
      if (!ok) throw new UnauthorizedException('Invalid credentials');

      const token = await this.getJwtUtils.generateAccessToken({
        sub: user.id,
      });

      return {
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        token,
      };
    });
  }
}
