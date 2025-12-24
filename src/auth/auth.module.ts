import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginThrottleGuard } from './guards/login-throttle/login-throttle.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'; // 👈 1. Importa la interfaz
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
      // 👇 2. (Opcional) Puedes tipar explícitamente el retorno para más seguridad
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '1h';

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            // Leemos el tipo exacto desde la interfaz: "Quiero el tipo de 'expiresIn' que está dentro de 'signOptions'"
            // Usamos NonNullable porque signOptions es opcional (?) en la interfaz padre.
            expiresIn: expiresIn as NonNullable<
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
