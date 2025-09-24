import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está definido en las variables de entorno',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { email } = payload;
    // Prisma no permite usar select e include juntos, así que hay que usar solo include
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roleUsers: {
          select: {
            role: {
              select: {
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo, contacta al admin');
    }
    // Retornamos solo los campos necesarios, para mantener compatibilidad
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      roleUsers: user.roleUsers,
    };
  }
}
