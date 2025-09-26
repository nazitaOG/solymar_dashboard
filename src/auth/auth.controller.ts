import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginThrottleGuard } from './guards/login-throttle/login-throttle.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 600000, limit: 10 } }) // register: 5/min
  @Auth(ValidRoles.super_admin)
  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);
  }

  @UseGuards(LoginThrottleGuard)
  @Throttle({
    burst: { ttl: 15000, limit: 3 }, // anti-ráfaga: 3 cada 15s
    sustained: { ttl: 600000, limit: 10 }, // sostenido: 10 cada 5 minutos
    // ojo si entramos en 429 y seguimos mandando empieza a contar para el limite de 10
    // cada request aumentan el contador en paralelo para los dos casos
  })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard())
  @Get('try')
  try() {
    return this.authService.try();
  }
}
