import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { WORKSPACE_ROLES_KEY } from "../decorators/workspace-roles.decorator";
import type { WorkspaceContext, WorkspaceRoleValue } from "../types/workspace-context";

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<WorkspaceRoleValue[]>(WORKSPACE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const request = context.switchToHttp().getRequest<FastifyRequest & { workspace?: WorkspaceContext }>();
    if (!request.workspace || !roles.includes(request.workspace.role)) {
      throw new ForbiddenException("Seu nível de acesso não permite esta operação.");
    }
    return true;
  }
}
