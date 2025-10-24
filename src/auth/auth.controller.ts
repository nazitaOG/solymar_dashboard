import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginThrottleGuard } from './guards/login-throttle/login-throttle.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 600000, limit: 10 } }) // 10 cada 10 min
  @Auth(ValidRoles.super_admin)
  @Post('register')
  create(@GetUser() actor: User, @Body() dto: CreateUserDto) {
    return this.authService.register(actor.id, dto);
  }

  @UseGuards(LoginThrottleGuard)
  @Throttle({
    burst: { ttl: 15000, limit: 3 },
    sustained: { ttl: 600000, limit: 10 },
  })
  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@GetUser() user: User) {
    return this.authService.refresh(user.id);
  }

  @Auth()
  @Get('profile')
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
