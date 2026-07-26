import { SetMetadata } from "@nestjs/common";
import type { WorkspaceRoleValue } from "../types/workspace-context";

export const WORKSPACE_ROLES_KEY = "workspaceRoles";
export const WorkspaceRoles = (...roles: WorkspaceRoleValue[]) => SetMetadata(WORKSPACE_ROLES_KEY, roles);
