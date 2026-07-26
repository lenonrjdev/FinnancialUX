import type { AutomationRule, ImportHistoryItem } from "@/types/dados-e-automacoes";

export const dataToolsReferenceDate = "2026-07-25";

export const initialAutomationRules: AutomationRule[] = [
  {
    id: "rule-uber-transport",
    name: "Transporte por aplicativo",
    active: true,
    priority: 1,
    field: "description",
    operator: "contains",
    value: "UBER",
    actions: { category: "Transporte", account: "Nubank", type: "expense" },
    createdAt: "2026-07-20",
  },
  {
    id: "rule-netflix-subscription",
    name: "Assinatura Netflix",
    active: true,
    priority: 2,
    field: "description",
    operator: "contains",
    value: "NETFLIX",
    actions: { category: "Assinaturas", account: "Conta principal", type: "expense" },
    createdAt: "2026-07-19",
  },
  {
    id: "rule-pix-services",
    name: "Pix recebido por serviços",
    active: true,
    priority: 3,
    field: "description",
    operator: "starts-with",
    value: "PIX RECEBIDO",
    actions: { category: "Serviços", account: "Banco Inter", type: "income" },
    createdAt: "2026-07-18",
  },
  {
    id: "rule-pharmacy-health",
    name: "Compras em farmácia",
    active: false,
    priority: 4,
    field: "description",
    operator: "contains",
    value: "FARMÁCIA",
    actions: { category: "Saúde", type: "expense" },
    createdAt: "2026-07-17",
  },
];

export const initialImportHistory: ImportHistoryItem[] = [
  {
    id: "import-2026-07-18",
    fileName: "extrato-nubank-julho.csv",
    sourceType: "csv",
    importedAt: "2026-07-18T19:42:00",
    importedRows: 24,
    ignoredRows: 2,
    duplicateRows: 1,
    status: "partial",
  },
  {
    id: "import-2026-07-03",
    fileName: "conta-principal-junho.ofx",
    sourceType: "ofx",
    importedAt: "2026-07-03T10:15:00",
    importedRows: 38,
    ignoredRows: 0,
    duplicateRows: 0,
    status: "completed",
  },
  {
    id: "import-2026-06-05",
    fileName: "controle-pessoal-maio.csv",
    sourceType: "csv",
    importedAt: "2026-06-05T21:08:00",
    importedRows: 31,
    ignoredRows: 1,
    duplicateRows: 0,
    status: "partial",
  },
];
