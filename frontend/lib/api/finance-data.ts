import { api } from "@/lib/api/client";

export type FinanceDataDocument = {
  data: unknown;
  updatedAt: string;
};

export type FinanceDataDocuments = Record<string, FinanceDataDocument>;

export const financeDataApi = {
  list: () => api.get<FinanceDataDocuments>("/finance-data"),
  get: <T>(module: string) =>
    api.get<{ module: string; data: T | null; updatedAt: string | null }>(`/finance-data/${module}`),
  save: <T>(module: string, data: T) =>
    api.put<{ module: string; data: T; updatedAt: string }>(`/finance-data/${module}`, { data }),
  remove: (module: string) => api.delete<{ message: string }>(`/finance-data/${module}`),
};
