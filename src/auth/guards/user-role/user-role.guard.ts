import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { META_ROLES } from '@/auth/decorators/role-protected/role-protected.decorator';
import { ValidRoles } from '@/auth/interfaces/valid-roles.interface';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: ValidRoles[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || validRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = req.user;
    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    for (const role of validRoles) {
      if (user.roles.includes(role)) return true;
    }
    throw new ForbiddenException(`User does not have a valid role [
      ${validRoles.join(', ')}]`);
  }
}
