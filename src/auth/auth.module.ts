import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginThrottleGuard } from './guards/login-throttle.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      // aca definimos defaults para el throttler
      {
        ttl: 60000, // esto son 60 segundos
        limit: 5, // esto es el numero de requests permitidos en el ttl
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginThrottleGuard],
})
export class AuthModule {}
