import { api } from "@/lib/api/client";
import type { AuthenticatedProfile, ApiMessage, PasswordRecoveryResponse } from "@/types/api";

export const authApi = {
  me: () => api.get<AuthenticatedProfile>("/auth/me"),
  login: (email: string, password: string, remember: boolean) =>
    api.post<{ user: AuthenticatedProfile }>("/auth/login", { email, password, remember }),
  register: (name: string, email: string, password: string) =>
    api.post<{ user: AuthenticatedProfile }>("/auth/register", { name, email, password }),
  logout: () => api.post<ApiMessage>("/auth/logout"),
  forgotPassword: (email: string) =>
    api.post<PasswordRecoveryResponse>("/auth/forgot-password", { email }),
  acceptInvitation: (token: string) =>
    api.post<ApiMessage & { workspaceId: string }>(`/workspaces/invitations/${token}/accept`),
};
