export type WorkspaceRoleValue = "OWNER" | "EDITOR" | "VIEWER";

export type WorkspaceContext = {
  id: string;
  role: WorkspaceRoleValue;
  userId: string;
};
