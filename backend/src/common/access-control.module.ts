import { Module } from "@nestjs/common";
import { WorkspaceContextGuard } from "./guards/workspace-context.guard";
import { WorkspaceRolesGuard } from "./guards/workspace-roles.guard";

@Module({
  providers: [WorkspaceContextGuard, WorkspaceRolesGuard],
  exports: [WorkspaceContextGuard, WorkspaceRolesGuard],
})
export class AccessControlModule {}
