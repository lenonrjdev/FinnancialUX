import type {
  OverviewIconName,
  SummaryCardId,
  SummaryTone,
  TransactionKind,
} from "@/types/overview";

export const overviewData = {
  currentMonth: "julho",
  availableAfterCommitments: 1770,
  summaryCards: {
    balance: {
      value: 8430,
      helper: "Em todas as contas",
      trend: "+ R$ 1.240,00 no mês",
      tone: "positive",
    },
    income: {
      value: 6800,
      helper: "4 recebimentos",
      trend: "+8,4% em relação a junho",
      tone: "positive",
    },
    expenses: {
      value: 4250,
      helper: "28 lançamentos",
      trend: "62,5% das receitas",
      tone: "neutral",
    },
    pending: {
      value: 780,
      helper: "3 vencimentos próximos",
      trend: "Próxima conta em 2 dias",
      tone: "warning",
    },
  } satisfies Record<
    SummaryCardId,
    {
      value: number;
      helper: string;
      trend: string;
      tone: SummaryTone;
    }
  >,
  cashFlowSummary: {
    income: 6800,
    expense: 4250,
    result: 2550,
  },
  cashFlowChart: [
    { month: "Fev", income: 58, expense: 45 },
    { month: "Mar", income: 72, expense: 52 },
    { month: "Abr", income: 64, expense: 49 },
    { month: "Mai", income: 82, expense: 61 },
    { month: "Jun", income: 76, expense: 57 },
    { month: "Jul", income: 90, expense: 56 },
  ],
  monthlyPanel: {
    balance: 2550,
    retainedPercentage: 37.5,
    budgetUsed: 4250,
    budgetUsedPercentage: 68,
    budgetAvailable: 2000,
    goal: {
      name: "Reserva de emergência",
      current: 7500,
      target: 20000,
      percentage: 37.5,
    },
  },
  bills: [
    {
      id: "internet-residencial",
      title: "Internet residencial",
      date: "27 jul",
      value: 119.9,
      status: "Em 2 dias",
    },
    {
      id: "cartao-principal",
      title: "Cartão principal",
      date: "30 jul",
      value: 420.1,
      status: "Em 5 dias",
    },
    {
      id: "energia-eletrica",
      title: "Energia elétrica",
      date: "02 ago",
      value: 240,
      status: "Em 8 dias",
    },
  ],
  transactions: [
    {
      id: "mercado-central",
      title: "Mercado Central",
      category: "Alimentação",
      date: "Hoje, 10:42",
      value: -248.9,
      icon: "shopping",
      kind: "expense",
    },
    {
      id: "recebimento-servico",
      title: "Recebimento de serviço",
      category: "Serviços",
      date: "Ontem, 16:15",
      value: 1500,
      icon: "income",
      kind: "income",
    },
    {
      id: "fatura-cartao",
      title: "Fatura do cartão",
      category: "Cartão de crédito",
      date: "23 jul, 09:30",
      value: -680,
      icon: "credit-card",
      kind: "expense",
    },
  ] satisfies Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    value: number;
    icon: OverviewIconName;
    kind: TransactionKind;
  }>,
} as const;
