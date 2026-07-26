import { api } from "@/lib/api/client";
import type {
  AccessInvitation,
  CreateWorkspaceInput,
  FinancialWorkspace,
  InviteMemberInput,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/acessos";

export type InvitationDetails = {
  id: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
  invitedBy: string;
  expiresAt: string;
  workspace: { id: string; name: string; description: string };
};

export const workspacesApi = {
  list: () => api.get<FinancialWorkspace[]>("/workspaces"),
  create: (input: CreateWorkspaceInput) => api.post<FinancialWorkspace>("/workspaces", input),
  members: (workspaceId: string) => api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),
  invitations: (workspaceId: string) => api.get<AccessInvitation[]>(`/workspaces/${workspaceId}/invitations`),
  invite: (workspaceId: string, input: InviteMemberInput) =>
    api.post<AccessInvitation & { token: string; invitationUrl: string }>(`/workspaces/${workspaceId}/invitations`, input),
  updateMemberRole: (workspaceId: string, memberId: string, role: Exclude<WorkspaceRole, "owner">) =>
    api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, { role }),
  removeMember: (workspaceId: string, memberId: string) =>
    api.delete<{ message: string }>(`/workspaces/${workspaceId}/members/${memberId}`),
  resendInvitation: (workspaceId: string, invitationId: string) =>
    api.post<AccessInvitation & { token: string; invitationUrl: string }>(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`),
  cancelInvitation: (workspaceId: string, invitationId: string) =>
    api.delete<{ message: string }>(`/workspaces/${workspaceId}/invitations/${invitationId}`),
  invitationDetails: (token: string) =>
    api.get<InvitationDetails>(`/workspaces/invitations/${token}/details`),
};
