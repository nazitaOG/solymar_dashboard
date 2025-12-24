import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginThrottleGuard } from './guards/login-throttle/login-throttle.guard';
import { PassportModule } from '@nestjs/passport';
// 👇 1. Asegúrate de importar JwtModuleOptions
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GetJwtUtils } from './utils/get-jwt.utils';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      // 👇 2. Tipado explícito del retorno (: JwtModuleOptions)
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            // 👇 3. Casteo "Type-Safe" (Sin usar ANY)
            // Le decimos a TS: "Convierte este string al tipo exacto que espera expiresIn"
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ??
              '1h') as NonNullable<
              JwtModuleOptions['signOptions']
            >['expiresIn'],
          },
        };
      },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginThrottleGuard, JwtStrategy, GetJwtUtils],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
