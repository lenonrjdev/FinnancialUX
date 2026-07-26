import { api } from "@/lib/api/client";

export type UserPreferencesResponse = {
  appearance: "system" | "light" | "dark";
  defaultWorkspaceId: string | null;
  defaultAccountId: string | null;
  hideBalancesOnOpen: boolean;
  compactLargeValues: boolean;
  notifyUpcomingBills: boolean;
  notifyExpectedIncome: boolean;
  notifyBudgetAlerts: boolean;
  notifyLowBalance: boolean;
  notifyWeeklySummary: boolean;
  notifyMonthlyClosing: boolean;
  notifySecurityAlerts: boolean;
  billReminderDays: number;
  lowBalanceThreshold: number;
};

export type UpdateUserPreferencesInput = Partial<
  Omit<UserPreferencesResponse, "defaultWorkspaceId" | "defaultAccountId">
>;

export const usersApi = {
  updateProfile: (input: {
    name: string;
    email: string;
    phone: string;
    locale: string;
    timezone: string;
  }) => api.patch<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    locale: string;
    timezone: string;
  }>("/users/me", input),
  getPreferences: () => api.get<UserPreferencesResponse>("/users/me/preferences"),
  updatePreferences: (input: UpdateUserPreferencesInput) =>
    api.patch<UserPreferencesResponse>("/users/me/preferences", input),
};
