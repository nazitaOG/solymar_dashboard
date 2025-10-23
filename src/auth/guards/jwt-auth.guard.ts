import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticación que usa la estrategia 'jwt'
 * definida en JwtStrategy.
 *
 * Su función es interceptar requests, extraer el token Bearer
 * del header Authorization y validar su firma + expiración.
 *
 * Si es válido, el usuario decodificado se adjunta en req.user.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
