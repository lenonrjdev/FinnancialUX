import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { WorkspaceContext } from "../types/workspace-context";

export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): WorkspaceContext => {
    const request = context.switchToHttp().getRequest<FastifyRequest & { workspace: WorkspaceContext }>();
    return request.workspace;
  },
);
