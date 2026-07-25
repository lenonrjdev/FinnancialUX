import type { FinancialCategory, MonthlyBudget } from "@/types/orcamentos";

export const budgetReferenceDate = "2026-07-25";

export const initialCategories: FinancialCategory[] = [
  { id: "alimentacao", name: "Alimentação", type: "expense", description: "Mercado, restaurantes, delivery e padaria.", tone: "sand", active: true, isDefault: true },
  { id: "moradia", name: "Moradia", type: "expense", description: "Aluguel, condomínio, manutenção e casa.", tone: "graphite", active: true, isDefault: true },
  { id: "transporte", name: "Transporte", type: "expense", description: "Combustível, aplicativo, ônibus e manutenção.", tone: "blue", active: true, isDefault: true },
  { id: "saude", name: "Saúde", type: "expense", description: "Consultas, exames, medicamentos e cuidados.", tone: "sage", active: true, isDefault: true },
  { id: "lazer", name: "Lazer", type: "expense", description: "Passeios, cinema, eventos e entretenimento.", tone: "violet", active: true, isDefault: true },
  { id: "compras", name: "Compras", type: "expense", description: "Roupas, itens pessoais e compras diversas.", tone: "rose", active: true, isDefault: true },
  { id: "assinaturas", name: "Assinaturas", type: "expense", description: "Streaming, aplicativos e serviços recorrentes.", tone: "violet", active: true, isDefault: true },
  { id: "educacao", name: "Educação", type: "expense", description: "Cursos, livros, mensalidades e aprendizado.", tone: "blue", active: true, isDefault: true },
  { id: "contas-residenciais", name: "Contas residenciais", type: "expense", description: "Energia, água, internet e telefone.", tone: "sand", active: true, isDefault: true },
  { id: "cartao-de-credito", name: "Cartão de crédito", type: "expense", description: "Faturas e compromissos consolidados do cartão.", tone: "graphite", active: true, isDefault: true },
  { id: "pets", name: "Pets", type: "expense", description: "Alimentação, saúde e cuidados com animais.", tone: "rose", active: true, isDefault: true },
  { id: "familia", name: "Família", type: "expense", description: "Apoio familiar, presentes e despesas compartilhadas.", tone: "sage", active: true, isDefault: true },
  { id: "servicos", name: "Serviços", type: "income", description: "Recebimentos por projetos e serviços prestados.", tone: "sage", active: true, isDefault: true },
  { id: "vendas", name: "Vendas", type: "income", description: "Venda de produtos, equipamentos ou itens pessoais.", tone: "blue", active: true, isDefault: true },
  { id: "rendimentos", name: "Rendimentos", type: "income", description: "Juros, aplicações e outros rendimentos.", tone: "violet", active: true, isDefault: true },
  { id: "reembolso", name: "Reembolso", type: "income", description: "Devoluções e valores ressarcidos.", tone: "sand", active: true, isDefault: true },
  { id: "presentes", name: "Presentes", type: "income", description: "Valores recebidos de forma eventual.", tone: "rose", active: false, isDefault: true },
];

export const initialMonthlyBudgets: MonthlyBudget[] = [
  { id: "budget-alimentacao-2026-06", categoryId: "alimentacao", month: "2026-06", limit: 1100, alertThreshold: 80 },
  { id: "budget-moradia-2026-06", categoryId: "moradia", month: "2026-06", limit: 1500, alertThreshold: 85 },
  { id: "budget-transporte-2026-06", categoryId: "transporte", month: "2026-06", limit: 450, alertThreshold: 80 },
  { id: "budget-saude-2026-06", categoryId: "saude", month: "2026-06", limit: 400, alertThreshold: 80 },
  { id: "budget-lazer-2026-06", categoryId: "lazer", month: "2026-06", limit: 350, alertThreshold: 80 },
  { id: "budget-compras-2026-06", categoryId: "compras", month: "2026-06", limit: 300, alertThreshold: 80 },
  { id: "budget-assinaturas-2026-06", categoryId: "assinaturas", month: "2026-06", limit: 200, alertThreshold: 80 },
  { id: "budget-educacao-2026-06", categoryId: "educacao", month: "2026-06", limit: 250, alertThreshold: 80 },
  { id: "budget-contas-residenciais-2026-06", categoryId: "contas-residenciais", month: "2026-06", limit: 500, alertThreshold: 80 },
  { id: "budget-cartao-de-credito-2026-06", categoryId: "cartao-de-credito", month: "2026-06", limit: 750, alertThreshold: 80 },
  { id: "budget-alimentacao-2026-07", categoryId: "alimentacao", month: "2026-07", limit: 1200, alertThreshold: 80 },
  { id: "budget-moradia-2026-07", categoryId: "moradia", month: "2026-07", limit: 1500, alertThreshold: 85 },
  { id: "budget-transporte-2026-07", categoryId: "transporte", month: "2026-07", limit: 500, alertThreshold: 80 },
  { id: "budget-saude-2026-07", categoryId: "saude", month: "2026-07", limit: 450, alertThreshold: 80 },
  { id: "budget-lazer-2026-07", categoryId: "lazer", month: "2026-07", limit: 350, alertThreshold: 80 },
  { id: "budget-compras-2026-07", categoryId: "compras", month: "2026-07", limit: 300, alertThreshold: 80 },
  { id: "budget-assinaturas-2026-07", categoryId: "assinaturas", month: "2026-07", limit: 200, alertThreshold: 80 },
  { id: "budget-educacao-2026-07", categoryId: "educacao", month: "2026-07", limit: 300, alertThreshold: 80 },
  { id: "budget-contas-residenciais-2026-07", categoryId: "contas-residenciais", month: "2026-07", limit: 500, alertThreshold: 80 },
  { id: "budget-cartao-de-credito-2026-07", categoryId: "cartao-de-credito", month: "2026-07", limit: 800, alertThreshold: 80 },
];
