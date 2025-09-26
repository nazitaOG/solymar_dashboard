import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '@/auth/interfaces/valid-roles.interface';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';
import { RoleProtected } from './role-protected/role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    // el parametro 'jwt' es el nombre de la estrategia que se usa en el JwtStrategy
    UseGuards(AuthGuard('jwt'), UserRoleGuard),
  );
}
