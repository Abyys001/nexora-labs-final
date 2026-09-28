import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { AdminRole } from "../db/schema.js";
import { ROLES_KEY } from "./roles.decorator.js";
import type { JwtPayload } from "./jwt-payload.type.js";

const RANK: Record<AdminRole, number> = { viewer: 0, manager: 1, owner: 2 };

/** Runs after JwtAuthGuard has populated `request.admin`. No @Roles() means any authenticated admin. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request & { admin: JwtPayload }>();
    if (RANK[request.admin.role] < RANK[required]) {
      throw new ForbiddenException(`Requires ${required} role or higher`);
    }
    return true;
  }
}
