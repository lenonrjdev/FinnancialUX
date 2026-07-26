import { downloadTextFile } from "@/lib/data-tools";
import type {
  ActivityLogEntry,
  AppearanceMode,
  BackupSettings,
  FinancialPreferences,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/types/configuracoes";

const APPEARANCE_STORAGE_KEY = "finance-dashboard-appearance";

export function persistFinancialPreferences(value: FinancialPreferences): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("finance-preferences-change", { detail: value }));
  }
  applyAppearance(value.appearance);
}

export function applyAppearance(mode: AppearanceMode): void {
  if (typeof document === "undefined") return;
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.appearancePreference = mode;

  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
  } catch {
    // A preferência continua persistida pelo backend; o cache local é apenas visual.
  }
}

export function cycleAppearance(current: AppearanceMode): AppearanceMode {
  if (current === "light") return "dark";
  if (current === "dark") return "system";
  return "light";
}

export function formatSettingsDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function createSettingsBackup(
  profile: ProfileSettings,
  preferences: FinancialPreferences,
  notifications: NotificationSettings,
  security: SecuritySettings,
  backupSettings: BackupSettings,
) {
  return {
    generatedAt: new Date().toISOString(),
    version: "fase-15.2-postgresql",
    account: {
      profile,
      preferences,
      notifications,
      security: {
        ...security,
        password: undefined,
      },
      backupSettings,
    },
  };
}

export function downloadFullSettingsBackup(payload: ReturnType<typeof createSettingsBackup>): string {
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `backup-financeiro-completo-${date}.json`;
  downloadTextFile(JSON.stringify(payload, null, 2), fileName, "application/json;charset=utf-8");
  return fileName;
}

export function isValidFinanceBackup(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.generatedAt === "string"
    && Array.isArray(candidate.transactions)
    && Array.isArray(candidate.accounts)
    && typeof candidate.cards === "object";
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportActivityHistory(entries: ActivityLogEntry[]): void {
  const rows = [
    ["Data", "Tipo", "Título", "Descrição", "Responsável", "Dispositivo", "Estado"],
    ...entries.map((entry) => [
      formatSettingsDateTime(entry.occurredAt),
      entry.type,
      entry.title,
      entry.description,
      entry.actor,
      entry.device,
      entry.status,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(";")).join("\r\n")}`;
  downloadTextFile(csv, `historico-de-atividades-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
}
