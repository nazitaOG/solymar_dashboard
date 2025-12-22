import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

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

  @UseGuards(ThrottlerGuard)
  // Límite estricto: 3 intentos por minuto.
  // Evita que spameen emails a usuarios o enumeren correos masivamente.
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(ThrottlerGuard)
  // Límite estricto: 5 intentos por minuto.
  // Evita fuerza bruta sobre el token.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Get('verify-token')
  verifyToken(@Query('token') token: string) {
    return this.authService.verifyToken(token);
  }
}
