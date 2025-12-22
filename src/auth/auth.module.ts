import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginThrottleGuard } from './guards/login-throttle/login-throttle.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GetJwtUtils } from './utils/get-jwt.utils';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      // aca definimos defaults para el throttler
      {
        ttl: 60000, // esto son 60 segundos
        limit: 5, // esto es el numero de requests permitidos en el ttl
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
        },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginThrottleGuard, JwtStrategy, GetJwtUtils],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
