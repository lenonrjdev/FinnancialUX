import { buildFullBackup, downloadTextFile } from "@/lib/data-tools";
import type {
  ActivityLogEntry,
  AppearanceMode,
  BackupSettings,
  FinancialPreferences,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/types/configuracoes";

const storageKeys = {
  profile: "finance-profile-settings",
  preferences: "finance-financial-preferences",
  notifications: "finance-notification-settings",
  security: "finance-security-settings",
  backups: "finance-backup-settings",
} as const;

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T, eventName?: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  if (eventName) window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
}

export function getStoredProfile(fallback: ProfileSettings): ProfileSettings {
  return readStoredValue(storageKeys.profile, fallback);
}

export function persistProfile(value: ProfileSettings): void {
  writeStoredValue(storageKeys.profile, value, "finance-profile-change");
}

export function getStoredFinancialPreferences(fallback: FinancialPreferences): FinancialPreferences {
  return readStoredValue(storageKeys.preferences, fallback);
}

export function persistFinancialPreferences(value: FinancialPreferences): void {
  writeStoredValue(storageKeys.preferences, value, "finance-preferences-change");
  applyAppearance(value.appearance);
}

export function getStoredNotificationSettings(fallback: NotificationSettings): NotificationSettings {
  return readStoredValue(storageKeys.notifications, fallback);
}

export function persistNotificationSettings(value: NotificationSettings): void {
  writeStoredValue(storageKeys.notifications, value);
}

export function getStoredSecuritySettings(fallback: SecuritySettings): SecuritySettings {
  return readStoredValue(storageKeys.security, fallback);
}

export function persistSecuritySettings(value: SecuritySettings): void {
  writeStoredValue(storageKeys.security, value);
}

export function getStoredBackupSettings(fallback: BackupSettings): BackupSettings {
  return readStoredValue(storageKeys.backups, fallback);
}

export function persistBackupSettings(value: BackupSettings): void {
  writeStoredValue(storageKeys.backups, value);
}

export function applyAppearance(mode: AppearanceMode): void {
  if (typeof document === "undefined") return;
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.appearancePreference = mode;
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
    ...buildFullBackup(),
    generatedAt: new Date().toISOString(),
    version: "fase-14-demo",
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
