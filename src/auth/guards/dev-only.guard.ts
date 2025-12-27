import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Buscamos el header "x-admin-secret"
    // (Los headers en node suelen venir en minusculas)
    const adminKey = request.headers['x-admin-secret'] as string;
    // 2. Buscamos la clave maestra en el .env
    const validKey = this.configService.get<string>('ADMIN_SECRET_KEY');

    // 3. Validación estricta
    if (!validKey || adminKey !== validKey) {
      // 🕵️‍♂️ TRUCO PRO:
      // Lanzamos NotFoundException (404) en vez de Forbidden (403)
      // para que si un hacker prueba la URL, piense que NO EXISTE.
      // Si prefieres ser claro, usa UnauthorizedException.
      throw new NotFoundException('Cannot POST ' + request.url);
    }

    return true;
  }
}
