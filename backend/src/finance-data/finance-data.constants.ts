export const FINANCE_DATA_MODULES = [
  "transactions",
  "accounts",
  "account-movements",
  "credit-cards",
  "card-invoices",
  "card-purchases",
  "installment-plans",
  "payables",
  "receivables",
  "calendar-events",
  "categories",
  "monthly-budgets",
  "goals",
  "goal-contributions",
  "debts",
  "debt-payments",
  "subscriptions",
  "subscription-charges",
  "automation-rules",
  "import-history",
  "workspace-settings",
  "backup-snapshots",
] as const;

export type FinanceDataModule = (typeof FINANCE_DATA_MODULES)[number];

export function isFinanceDataModule(value: string): value is FinanceDataModule {
  return FINANCE_DATA_MODULES.includes(value as FinanceDataModule);
}
