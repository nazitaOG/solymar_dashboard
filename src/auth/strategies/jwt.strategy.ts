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
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload;
    if (!sub) {
      throw new UnauthorizedException('Invalid token');
    }
    // Prisma no permite usar select e include juntos, así que hay que usar solo include
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
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
      throw new UnauthorizedException('Invalid token');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is blocked, contact the admin');
    }

    const roles = user.roleUsers.map((ru) => ru.role.description);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      roles,
    } as const;
  }
}
