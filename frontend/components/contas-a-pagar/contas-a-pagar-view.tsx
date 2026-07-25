"use client";

import { useMemo, useState } from "react";
import { AccountsPayableFilters } from "@/components/contas-a-pagar/accounts-payable-filters";
import { AccountsPayableHeading } from "@/components/contas-a-pagar/accounts-payable-heading";
import { AccountsPayableList } from "@/components/contas-a-pagar/accounts-payable-list";
import { AccountsPayableSummary } from "@/components/contas-a-pagar/accounts-payable-summary";
import { NewPayableDialog } from "@/components/contas-a-pagar/new-payable-dialog";
import { PayPayableDialog } from "@/components/contas-a-pagar/pay-payable-dialog";
import { PayablesInsightPanel } from "@/components/contas-a-pagar/payables-insight-panel";
import { CheckIcon } from "@/components/shared/icons";
import { payablesContent } from "@/content/contas-a-pagar";
import { initialPayables, payablesReferenceDate } from "@/data/contas-a-pagar";
import { initialAccounts } from "@/data/contas";
import type {
  NewPayableInput,
  Payable,
  PayableFilters,
  PayablePaymentInput,
  PayableStatus,
} from "@/types/contas-a-pagar";

const initialFilters: PayableFilters = {
  search: "",
  status: "all",
  period: "all",
  category: "all",
  accountId: "all",
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function createId(value: string): string {
  return `${normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "conta"}-${Date.now()}`;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getAutomaticStatus(item: Payable): PayableStatus {
  if (item.paidAmount >= item.amount) return "paid";
  if (item.paidAmount > 0) return "partial";
  if (item.dueDate < payablesReferenceDate) return "overdue";
  return "pending";
}

export default function ContasAPagarView() {
  const [payables, setPayables] = useState<Payable[]>(initialPayables);
  const [filters, setFilters] = useState<PayableFilters>(initialFilters);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [paymentPayableId, setPaymentPayableId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const accounts = initialAccounts;
  const month = payablesReferenceDate.slice(0, 7);
  const sevenDaysLimit = addDays(payablesReferenceDate, 7);

  const summary = useMemo(() => {
    const pending = payables.reduce((total, item) => total + Math.max(0, item.amount - item.paidAmount), 0);
    const dueToday = payables.filter((item) => item.dueDate === payablesReferenceDate && item.status !== "paid").reduce((total, item) => total + Math.max(0, item.amount - item.paidAmount), 0);
    const nextSevenDays = payables.filter((item) => item.dueDate >= payablesReferenceDate && item.dueDate <= sevenDaysLimit && item.status !== "paid").reduce((total, item) => total + Math.max(0, item.amount - item.paidAmount), 0);
    const overdueItems = payables.filter((item) => getAutomaticStatus(item) === "overdue");
    const overdue = overdueItems.reduce((total, item) => total + Math.max(0, item.amount - item.paidAmount), 0);
    const paidThisMonth = payables.filter((item) => item.paidAt?.startsWith(month)).reduce((total, item) => total + item.paidAmount, 0);

    return { pending, dueToday, nextSevenDays, overdue, paidThisMonth, overdueCount: overdueItems.length };
  }, [payables, month, sevenDaysLimit]);

  const filteredPayables = useMemo(() => {
    const search = normalize(filters.search);

    return payables
      .map((item) => ({ ...item, status: getAutomaticStatus(item) }))
      .filter((item) => {
        const matchesSearch = !search || normalize(`${item.description} ${item.category} ${item.notes ?? ""}`).includes(search);
        const matchesStatus = filters.status === "all" || item.status === filters.status;
        const matchesCategory = filters.category === "all" || item.category === filters.category;
        const matchesAccount = filters.accountId === "all" || item.accountId === filters.accountId;
        const matchesPeriod = filters.period === "all"
          || (filters.period === "today" && item.dueDate === payablesReferenceDate)
          || (filters.period === "seven-days" && item.dueDate >= payablesReferenceDate && item.dueDate <= sevenDaysLimit)
          || (filters.period === "month" && item.dueDate.startsWith(month))
          || (filters.period === "overdue" && item.status === "overdue");

        return matchesSearch && matchesStatus && matchesCategory && matchesAccount && matchesPeriod;
      })
      .sort((a, b) => {
        const statusOrder = { overdue: 0, pending: 1, partial: 2, paid: 3 } as const;
        return statusOrder[a.status] - statusOrder[b.status] || a.dueDate.localeCompare(b.dueDate);
      });
  }, [filters, month, payables, sevenDaysLimit]);

  const categories = [...new Set(payables.map((item) => item.category))].sort();
  const selectedPayable = payables.find((item) => item.id === paymentPayableId);

  function showFeedback(message: string) {
    setFeedbackMessage(message);
    window.setTimeout(() => setFeedbackMessage(""), 2600);
  }

  function createPayable(input: NewPayableInput) {
    const payable: Payable = {
      id: createId(input.description),
      ...input,
      paidAmount: 0,
      status: input.dueDate < payablesReferenceDate ? "overdue" : "pending",
      createdAt: payablesReferenceDate,
    };
    setPayables((current) => [payable, ...current]);
    showFeedback(payablesContent.newDialog.success);
  }

  function registerPayment(input: PayablePaymentInput) {
    const payable = payables.find((item) => item.id === input.payableId);
    if (!payable) return;
    const nextPaidAmount = Math.min(payable.amount, payable.paidAmount + input.amount);
    const isPaid = nextPaidAmount >= payable.amount - 0.001;

    setPayables((current) => current.map((item) => item.id === input.payableId ? {
      ...item,
      accountId: input.accountId,
      paidAmount: nextPaidAmount,
      status: isPaid ? "paid" : "partial",
      paidAt: isPaid ? input.paymentDate : item.paidAt,
    } : item));
    showFeedback(isPaid ? payablesContent.paymentDialog.successFull : payablesContent.paymentDialog.successPartial);
  }

  return (
    <div className="financial-management-page">
      <AccountsPayableHeading onNew={() => setNewDialogOpen(true)} />
      <AccountsPayableSummary {...summary} />
      <AccountsPayableFilters filters={filters} categories={categories} accounts={accounts} onChange={setFilters} />

      <div className="commitment-workspace-grid">
        <AccountsPayableList payables={filteredPayables} accounts={accounts} onPay={setPaymentPayableId} />
        <PayablesInsightPanel payables={payables} referenceDate={payablesReferenceDate} />
      </div>

      {newDialogOpen ? <NewPayableDialog accounts={accounts} onClose={() => setNewDialogOpen(false)} onSubmit={createPayable} /> : null}
      {selectedPayable ? <PayPayableDialog payable={selectedPayable} accounts={accounts} onClose={() => setPaymentPayableId("")} onSubmit={registerPayment} /> : null}

      {feedbackMessage ? <div className="transaction-feedback"><CheckIcon /> {feedbackMessage}</div> : null}
    </div>
  );
}
