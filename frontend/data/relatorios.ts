import type {
  MonthlyFinancialSnapshot,
  ProjectionScenario,
  ProjectionScenarioSettings,
} from "@/types/relatorios";

export const reportsReferenceDate = "2026-07-25";
export const reportsReferenceMonth = "2026-07";

export const monthlyFinancialHistory: MonthlyFinancialSnapshot[] = [
  { month: "2025-08", label: "Agosto de 2025", shortLabel: "Ago", income: 5200, expenses: 4380 },
  { month: "2025-09", label: "Setembro de 2025", shortLabel: "Set", income: 5750, expenses: 4620 },
  { month: "2025-10", label: "Outubro de 2025", shortLabel: "Out", income: 6100, expenses: 4780 },
  { month: "2025-11", label: "Novembro de 2025", shortLabel: "Nov", income: 5900, expenses: 5010 },
  { month: "2025-12", label: "Dezembro de 2025", shortLabel: "Dez", income: 7200, expenses: 6120 },
  { month: "2026-01", label: "Janeiro de 2026", shortLabel: "Jan", income: 5600, expenses: 4100 },
  { month: "2026-02", label: "Fevereiro de 2026", shortLabel: "Fev", income: 6200, expenses: 4550 },
  { month: "2026-03", label: "Março de 2026", shortLabel: "Mar", income: 5900, expenses: 4800 },
  { month: "2026-04", label: "Abril de 2026", shortLabel: "Abr", income: 6800, expenses: 4950 },
  { month: "2026-05", label: "Maio de 2026", shortLabel: "Mai", income: 7100, expenses: 5200 },
  { month: "2026-06", label: "Junho de 2026", shortLabel: "Jun", income: 6400, expenses: 5100 },
  { month: "2026-07", label: "Julho de 2026", shortLabel: "Jul", income: 6800, expenses: 4250 },
];

export const projectionScenarioSettings: Record<ProjectionScenario, ProjectionScenarioSettings> = {
  conservative: { incomeFactor: 0.9, expenseFactor: 1.05 },
  realistic: { incomeFactor: 1, expenseFactor: 1 },
  optimistic: { incomeFactor: 1.08, expenseFactor: 0.96 },
};

export const projectionVariableExpenseBaseline = 1450;
