import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginThrottleGuard } from './guards/login-throttle.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60, limit: 5 } }) // register: 5/min
  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.register(createAuthDto);
  }

  @UseGuards(LoginThrottleGuard)
  @Throttle({
    burst: { ttl: 15, limit: 3 }, // anti-ráfaga: 3 cada 15s
    sustained: { ttl: 300, limit: 10 }, // sostenido: 10 cada 5 min
  })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
