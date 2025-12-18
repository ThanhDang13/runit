import { JwtAuthGuard } from "@api/app/modules/auth/strategy/jwt.guard";
import {
  applyDecorators,
  ForbiddenException,
  SetMetadata,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApiBearerAuth } from "@nestjs/swagger";

export const ROLES_KEY = "roles";
export const ROLES = {
  USER: "user",
  ADMIN: "admin"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const IsUser = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(ROLES.USER, ROLES.ADMIN),
    ApiBearerAuth("Bearer")
  );

export const IsAdmin = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(ROLES.ADMIN), ApiBearerAuth("Bearer"));

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("You do not have permission to access this resource");
    }

    return requiredRoles.includes(user.role);
  }
}
