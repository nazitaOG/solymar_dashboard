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
  //  FORGOT PASSWORD (Solicitud de cambio)
  // ------------------------------------------------------------------
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    return handleRequest(async () => {
      // 1. Buscamos al usuario por email.
      // Solo traemos lo mínimo indispensable (id y si está activo).
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true, isActive: true },
      });

      // 2. Seguridad Anti-Enumeración (CRÍTICO):
      // Si el usuario no existe o está bloqueado, NO tiramos error.
      // Simplemente retornamos 'void' como si todo hubiera ido bien.
      // ¿Por qué? Para que un atacante no pueda probar 1000 emails y ver cuáles
      // devuelven "Email no encontrado" y cuáles devuelven "Email enviado".
      if (!user || !user.isActive) {
        return;
      }

      // 3. Limpieza preventiva:
      // Si el tipo ya pidió 5 veces el reset porque es ansioso, borramos los tokens viejos.
      // Así no llenamos la tabla de basura y evitamos conflictos.
      await this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // 4. Generación del Token Seguro:
      // Generamos 32 bytes de entropía pura y lo pasamos a hex.
      // Este 'rawToken' es el que viaja por email. ES EL SECRETO.
      const rawToken = crypto.randomBytes(32).toString('hex');

      // 5. Hashing para la DB:
      // Igual que con las passwords, no guardamos el secreto en plano.
      // Lo hasheamos con SHA-256 (rápido y eficiente para búsquedas).
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      // 6. Configurar expiración (ej. 1 hora desde ahora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // 7. Guardar en DB
      await this.prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      // 8. Enviar Email (TODO: Conectar tu MailService real acá)
      // OJO: Al usuario le mandamos el 'rawToken', NO el hash.
      // El link sería algo como: https://tu-frontend.com/reset-password?token=rawToken
      // Simulación por consola para que puedas probar ya:
      console.log('----------------------------------------------------');
      console.log(`[EMAIL DEV] Para: ${dto.email}`);
      console.log(`[EMAIL DEV] Token (RAW): ${rawToken}`); // Copia esto para probar el reset
      console.log('----------------------------------------------------');

      return;
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    return handleRequest(async () => {
      // 1. Replicamos el hash:
      // El token que llega del front es el "raw" (texto plano).
      // Lo pasamos por SHA-256 y pedimos salida en 'hex' (hexadecimal).
      // ¿Por qué 'hex'? Porque el hash genera bytes binarios (basura ilegible),
      // y 'hex' los traduce a un string seguro de caracteres 0-9 y a-f que podemos buscar en la DB.
      const tokenHash = crypto
        .createHash('sha256')
        .update(dto.token)
        .digest('hex');

      // 2. Buscamos el token en la base de datos usando ese hash.
      // Incluimos al usuario para sacar el username y llenar el 'updatedBy' después.
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { tokenHash: tokenHash },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // 3. Validaciones de seguridad:
      // - Si no encuentra el token (alguien mandó fruta o el token está mal copiado).
      // - Si la fecha actual es mayor a la de expiración.
      if (!resetToken || resetToken.expiresAt < new Date()) {
        throw new BadRequestException('El enlace es inválido o ha expirado.');
      }

      // 4. Preparamos la nueva contraseña.
      // Acá NO usamos SHA-256, usamos el algoritmo robusto (Bcrypt/Argon2) con el pepper de la app.
      const newHashedPassword = await hashPassword(
        dto.password,
        undefined,
        this.pepper,
      );

      // 5. Transacción Atómica (ACID):
      // Esto asegura integridad: O se actualiza la pass Y se borra el token, o falla todo y no pasa nada.
      // Borrar el token es clave para evitar "Replay Attacks" (que usen el mismo link dos veces).
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: resetToken.userId },
          data: {
            hashedPassword: newHashedPassword,
            updatedBy: resetToken.user.username, // Dejamos registro de quién hizo el cambio
          },
        }),
        this.prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        }),
      ]);

      return;
    });
  }
}
