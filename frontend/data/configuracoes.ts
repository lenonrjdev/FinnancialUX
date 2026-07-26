import type {
  ActiveSession,
  ActivityLogEntry,
  BackupSettings,
  BackupSnapshot,
  FinancialPreferences,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
} from "@/types/configuracoes";

export const initialProfileSettings: ProfileSettings = {
  name: "Lenon Alexandre",
  email: "lenon@ateliux.com.br",
  phone: "(24) 99999-0000",
  timeZone: "America/Sao_Paulo",
};

export const initialFinancialPreferences: FinancialPreferences = {
  currency: "BRL",
  locale: "pt-BR",
  dateFormat: "dd/MM/yyyy",
  financialMonthStartDay: 1,
  defaultAccountId: "conta-principal",
  appearance: "light",
  hideBalancesOnOpen: false,
  compactNumbers: false,
};

export const initialNotificationSettings: NotificationSettings = {
  billsDue: true,
  billsDueDaysBefore: 3,
  receivablesDue: true,
  budgetAlerts: true,
  budgetAlertPercent: 80,
  lowBalanceAlerts: true,
  lowBalanceAmount: 500,
  weeklySummary: true,
  monthlySummary: true,
  securityAlerts: true,
  emailChannel: true,
  browserChannel: false,
};

export const initialSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  loginAlerts: true,
  sessionTimeoutMinutes: 60,
  requirePasswordForExports: true,
};

export const initialActiveSessions: ActiveSession[] = [
  {
    id: "session-current-desktop",
    deviceName: "Windows — computador principal",
    deviceType: "desktop",
    browser: "Chrome 150",
    location: "Volta Redonda, RJ",
    ipAddress: "192.168.0.24",
    lastActiveAt: "2026-07-25T20:18:00-03:00",
    current: true,
  },
  {
    id: "session-mobile",
    deviceName: "Android — celular",
    deviceType: "mobile",
    browser: "Chrome Mobile",
    location: "Volta Redonda, RJ",
    ipAddress: "177.42.18.93",
    lastActiveAt: "2026-07-25T18:42:00-03:00",
    current: false,
  },
  {
    id: "session-tablet",
    deviceName: "Tablet",
    deviceType: "tablet",
    browser: "Chrome",
    location: "Rio de Janeiro, RJ",
    ipAddress: "189.12.84.15",
    lastActiveAt: "2026-07-21T09:16:00-03:00",
    current: false,
  },
];

export const initialActivityLog: ActivityLogEntry[] = [
  {
    id: "activity-login-current",
    type: "login",
    title: "Acesso confirmado",
    description: "Entrada realizada com e-mail e senha no computador principal.",
    actor: "Lenon Alexandre",
    occurredAt: "2026-07-25T20:18:00-03:00",
    device: "Chrome 150 no Windows",
    status: "success",
  },
  {
    id: "activity-profile",
    type: "profile",
    title: "Identidade do perfil atualizada",
    description: "O nome de exibição foi definido como Lenon Alexandre.",
    actor: "Lenon Alexandre",
    occurredAt: "2026-07-25T19:52:00-03:00",
    device: "Chrome 150 no Windows",
    status: "success",
  },
  {
    id: "activity-backup",
    type: "backup",
    title: "Backup completo criado",
    description: "Uma cópia manual com 9 módulos financeiros foi gerada.",
    actor: "Lenon Alexandre",
    occurredAt: "2026-07-24T21:12:00-03:00",
    device: "Chrome 150 no Windows",
    status: "success",
  },
  {
    id: "activity-workspace",
    type: "workspace",
    title: "Permissão de participante alterada",
    description: "O acesso de Carlos Oliveira foi mantido como somente leitura.",
    actor: "Lenon Alexandre",
    occurredAt: "2026-07-24T18:35:00-03:00",
    device: "Chrome Mobile no Android",
    status: "success",
  },
  {
    id: "activity-import",
    type: "data",
    title: "Importação concluída com revisão",
    description: "24 movimentações foram importadas e 1 possível duplicidade foi ignorada.",
    actor: "Lenon Alexandre",
    occurredAt: "2026-07-18T19:42:00-03:00",
    device: "Chrome 150 no Windows",
    status: "attention",
  },
  {
    id: "activity-blocked",
    type: "security",
    title: "Tentativa de acesso bloqueada",
    description: "Uma senha incorreta foi informada três vezes em um navegador não reconhecido.",
    actor: "Sistema de segurança",
    occurredAt: "2026-07-16T03:14:00-03:00",
    device: "Navegador desconhecido",
    status: "blocked",
  },
  {
    id: "activity-session",
    type: "security",
    title: "Sessão antiga encerrada",
    description: "Um dispositivo sem atividade há mais de 30 dias foi desconectado.",
    actor: "Lenon Alexandre",
    occurredAt: "2026-07-12T10:08:00-03:00",
    device: "Chrome 150 no Windows",
    status: "success",
  },
];

export const initialBackupSettings: BackupSettings = {
  automaticEnabled: true,
  frequency: "weekly",
  retentionCount: 6,
  includeAttachments: false,
};

export const initialBackupSnapshots: BackupSnapshot[] = [
  {
    id: "backup-manual-2026-07-24",
    fileName: "backup-financeiro-2026-07-24.json",
    createdAt: "2026-07-24T21:12:00-03:00",
    sizeBytes: 284672,
    modulesCount: 9,
    status: "available",
    automatic: false,
  },
  {
    id: "backup-auto-2026-07-20",
    fileName: "backup-automatico-2026-07-20.json",
    createdAt: "2026-07-20T03:00:00-03:00",
    sizeBytes: 278431,
    modulesCount: 9,
    status: "available",
    automatic: true,
  },
  {
    id: "backup-auto-2026-07-13",
    fileName: "backup-automatico-2026-07-13.json",
    createdAt: "2026-07-13T03:00:00-03:00",
    sizeBytes: 271982,
    modulesCount: 9,
    status: "available",
    automatic: true,
  },
];
