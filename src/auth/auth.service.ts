import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { hashPassword, verifyPassword } from '../common/security/hash_password';
import { LoginUserDto } from './dto/login-user.dto';
import { GetJwtUtils } from './utils/get-jwt.utils';
import { ValidRoles } from './interfaces/valid-roles.interface';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  async refresh(userId: string) {
    return handleRequest(async () => {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      });

      if (!user) throw new UnauthorizedException('User not found');
      if (!user.isActive)
        throw new UnauthorizedException('User is blocked, contact admin');

      // Generamos nuevo token
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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleUsers: {
          include: {
            role: { select: { description: true } },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      roles: user.roleUsers.map((ru) => ru.role.description),
    };
  }

  // ------------------------------------------------------------------
  //  FORGOT PASSWORD
  // ------------------------------------------------------------------
  async forgotPassword(dto: ForgotPasswordDto) {
    return handleRequest(async () => {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true, isActive: true },
      });

      // Mensaje de seguridad (siempre devolvemos lo mismo)
      const responseMessage = {
        message:
          'Si el correo está registrado, recibirás un enlace de recuperación.',
      };

      if (!user || !user.isActive) return responseMessage;

      // Limpieza de tokens viejos
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Generación del token
      const rawToken = crypto.randomBytes(32).toString('hex');
      // DRY: Usamos el helper privado para hashear
      const tokenHash = this.hashToken(rawToken);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      // TODO: MailService
      console.log('----------------------------------------------------');
      console.log(`[EMAIL DEV] Para: ${dto.email}`);
      console.log(`[EMAIL DEV] Token (RAW): ${rawToken}`);
      console.log('----------------------------------------------------');

      return responseMessage;
    });
  }

  // ------------------------------------------------------------------
  //  VERIFY TOKEN
  // ------------------------------------------------------------------
  async verifyToken(token: string) {
    return handleRequest(async () => {
      // DRY: Reutilizamos la validación centralizada.
      // Si pasa esto, significa que el token es válido. Si no, lanza error.
      await this.getValidTokenRecord(token);
      return { valid: true };
    });
  }

  // ------------------------------------------------------------------
  //  RESET PASSWORD
  // ------------------------------------------------------------------
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    return handleRequest(async () => {
      // 1. Obtener token validado (DRY)
      // Aquí sí usamos el resultado porque necesitamos el userId
      const resetToken = await this.getValidTokenRecord(dto.token);

      // 2. Hash de la nueva contraseña
      const newHashedPassword = await hashPassword(
        dto.password,
        undefined,
        this.pepper,
      );

      // 3. Transacción
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: resetToken.userId },
          data: {
            hashedPassword: newHashedPassword,
            updatedBy: resetToken.user.username,
          },
        }),
        this.prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        }),
      ]);

      return;
    });
  }

  // ==================================================================
  //  PRIVATE HELPERS (DRY & CLEAN CODE)
  // ==================================================================

  /**
   * Genera el hash SHA-256 para el token de reseteo.
   * Centraliza el algoritmo para cambiarlo fácilmente en el futuro.
   */
  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Busca, valida expiración y devuelve el token con el usuario asociado.
   * Lanza BadRequestException si algo falla.
   */
  private async getValidTokenRecord(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('El enlace es inválido o ha expirado.');
    }

    return resetToken;
  }
}
