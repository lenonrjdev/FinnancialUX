import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { AuthenticatedUser } from "../types/authenticated-user";
import type { WorkspaceContext } from "../types/workspace-context";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class WorkspaceContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & {
      user: AuthenticatedUser;
      workspace?: WorkspaceContext;
    }>();
    const header = request.headers["x-workspace-id"];
    const workspaceId = Array.isArray(header) ? header[0] : header;
    if (!workspaceId) throw new BadRequestException("O cabeçalho X-Workspace-Id é obrigatório.");

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: request.user.id,
        },
      },
      include: { workspace: { select: { archivedAt: true } } },
    });
    if (!membership || membership.workspace.archivedAt) {
      throw new ForbiddenException("Você não possui acesso a este espaço financeiro.");
    }

    request.workspace = {
      id: workspaceId,
      role: membership.role,
      userId: request.user.id,
    };
    return true;
  }
}
