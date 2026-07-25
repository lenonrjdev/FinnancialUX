import { initialCardInvoices, initialCreditCards } from "@/data/cartoes";
import { initialPayables } from "@/data/contas-a-pagar";
import { initialReceivables } from "@/data/recebimentos";
import type { FinancialCalendarEvent } from "@/types/calendario";

export const calendarReferenceDate = "2026-07-25";

const payableEvents: FinancialCalendarEvent[] = initialPayables.map((item) => ({
  id: `calendar-${item.id}`,
  title: item.description,
  type: item.category === "Assinaturas" ? "subscription" : "expense",
  status:
    item.status === "paid"
      ? "completed"
      : item.status === "overdue"
        ? "overdue"
        : "scheduled",
  amount: Math.max(0, item.amount - (item.status === "paid" ? 0 : item.paidAmount)),
  date: item.dueDate,
  category: item.category,
  accountId: item.accountId,
  recurrence: item.recurrence,
  source: "payable",
  notes: item.notes,
}));

const receivableEvents: FinancialCalendarEvent[] = initialReceivables.map((item) => ({
  id: `calendar-${item.id}`,
  title: item.description,
  type: "income",
  status:
    item.status === "received"
      ? "completed"
      : item.status === "overdue"
        ? "overdue"
        : "scheduled",
  amount: Math.max(0, item.amount - (item.status === "received" ? 0 : item.receivedAmount)),
  date: item.expectedDate,
  category: item.category,
  accountId: item.accountId,
  recurrence: item.recurrence,
  source: "receivable",
  notes: item.notes,
}));

const invoiceEvents: FinancialCalendarEvent[] = initialCardInvoices.map((invoice) => {
  const card = initialCreditCards.find((item) => item.id === invoice.cardId);

  return {
    id: `calendar-${invoice.id}`,
    title: `Fatura ${card?.institution ?? "do cartão"}`,
    type: "invoice",
    status: invoice.status === "paid" ? "completed" : "scheduled",
    amount: invoice.amount,
    date: invoice.dueDate,
    category: "Cartão de crédito",
    accountId: card?.paymentAccountId,
    recurrence: "monthly",
    source: "invoice",
    notes: invoice.referenceLabel,
  };
});

const planningEvents: FinancialCalendarEvent[] = [
  {
    id: "calendar-transferencia-reserva-julho",
    title: "Transferência para reserva",
    type: "transfer",
    status: "completed",
    amount: 500,
    date: "2026-07-24",
    category: "Transferências",
    accountId: "nubank",
    recurrence: "monthly",
    source: "manual",
    notes: "Movimentação mensal para a reserva de emergência.",
  },
  {
    id: "calendar-meta-reserva-agosto",
    title: "Aporte na reserva de emergência",
    type: "goal",
    status: "scheduled",
    amount: 500,
    date: "2026-08-25",
    category: "Metas e reservas",
    accountId: "reserva-emergencia",
    recurrence: "monthly",
    source: "manual",
  },
  {
    id: "calendar-assinatura-streaming",
    title: "Streaming de filmes",
    type: "subscription",
    status: "completed",
    amount: 39.9,
    date: "2026-07-18",
    category: "Assinaturas",
    accountId: "nubank",
    recurrence: "monthly",
    source: "manual",
  },
  {
    id: "calendar-assinatura-nuvem-agosto",
    title: "Armazenamento em nuvem",
    type: "subscription",
    status: "scheduled",
    amount: 34.9,
    date: "2026-08-02",
    category: "Assinaturas",
    accountId: "nubank",
    recurrence: "monthly",
    source: "manual",
  },
];

export const initialCalendarEvents: FinancialCalendarEvent[] = [
  ...payableEvents,
  ...receivableEvents,
  ...invoiceEvents,
  ...planningEvents,
].sort((a, b) => a.date.localeCompare(b.date));
