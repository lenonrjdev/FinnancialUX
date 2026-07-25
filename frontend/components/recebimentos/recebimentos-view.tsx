"use client";

import { useMemo, useState } from "react";
import { NewReceivableDialog } from "@/components/recebimentos/new-receivable-dialog";
import { ReceiveReceivableDialog } from "@/components/recebimentos/receive-receivable-dialog";
import { ReceivablesFilters } from "@/components/recebimentos/receivables-filters";
import { ReceivablesHeading } from "@/components/recebimentos/receivables-heading";
import { ReceivablesInsightPanel } from "@/components/recebimentos/receivables-insight-panel";
import { ReceivablesList } from "@/components/recebimentos/receivables-list";
import { ReceivablesSummary } from "@/components/recebimentos/receivables-summary";
import { CheckIcon } from "@/components/shared/icons";
import { receivablesContent } from "@/content/recebimentos";
import { initialAccounts } from "@/data/contas";
import {
  initialReceivables,
  receivablesReferenceDate,
} from "@/data/recebimentos";
import type {
  NewReceivableInput,
  Receivable,
  ReceivableFilters,
  ReceivableReceiptInput,
  ReceivableStatus,
} from "@/types/recebimentos";

const initialFilters: ReceivableFilters = {
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
  return `${normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "recebimento"}-${Date.now()}`;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getAutomaticStatus(item: Receivable): ReceivableStatus {
  if (item.receivedAmount >= item.amount) return "received";
  if (item.receivedAmount > 0) return "partial";
  if (item.expectedDate < receivablesReferenceDate) return "overdue";
  return "pending";
}

export default function RecebimentosView() {
  const [receivables, setReceivables] = useState<Receivable[]>(initialReceivables);
  const [filters, setFilters] = useState<ReceivableFilters>(initialFilters);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [receiptReceivableId, setReceiptReceivableId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const accounts = initialAccounts;
  const month = receivablesReferenceDate.slice(0, 7);
  const sevenDaysLimit = addDays(receivablesReferenceDate, 7);

  const summary = useMemo(() => {
    const received = receivables.filter((item) => item.receivedAt?.startsWith(month) || (item.status === "partial" && item.receivedAmount > 0)).reduce((total, item) => total + item.receivedAmount, 0);
    const expected = receivables.reduce((total, item) => total + Math.max(0, item.amount - item.receivedAmount), 0);
    const nextSevenDays = receivables.filter((item) => item.expectedDate >= receivablesReferenceDate && item.expectedDate <= sevenDaysLimit && item.status !== "received").reduce((total, item) => total + Math.max(0, item.amount - item.receivedAmount), 0);
    const overdueItems = receivables.filter((item) => getAutomaticStatus(item) === "overdue");
    const overdue = overdueItems.reduce((total, item) => total + Math.max(0, item.amount - item.receivedAmount), 0);
    const recurring = receivables.filter((item) => item.recurrence !== "none").reduce((total, item) => total + item.amount, 0);

    return { received, expected, nextSevenDays, overdue, recurring, overdueCount: overdueItems.length };
  }, [month, receivables, sevenDaysLimit]);

  const filteredReceivables = useMemo(() => {
    const search = normalize(filters.search);

    return receivables
      .map((item) => ({ ...item, status: getAutomaticStatus(item) }))
      .filter((item) => {
        const matchesSearch = !search || normalize(`${item.description} ${item.source} ${item.payer ?? ""} ${item.category}`).includes(search);
        const matchesStatus = filters.status === "all" || item.status === filters.status;
        const matchesCategory = filters.category === "all" || item.category === filters.category;
        const matchesAccount = filters.accountId === "all" || item.accountId === filters.accountId;
        const matchesPeriod = filters.period === "all"
          || (filters.period === "today" && item.expectedDate === receivablesReferenceDate)
          || (filters.period === "seven-days" && item.expectedDate >= receivablesReferenceDate && item.expectedDate <= sevenDaysLimit)
          || (filters.period === "month" && item.expectedDate.startsWith(month))
          || (filters.period === "overdue" && item.status === "overdue");

        return matchesSearch && matchesStatus && matchesCategory && matchesAccount && matchesPeriod;
      })
      .sort((a, b) => {
        const statusOrder = { overdue: 0, pending: 1, partial: 2, received: 3 } as const;
        return statusOrder[a.status] - statusOrder[b.status] || a.expectedDate.localeCompare(b.expectedDate);
      });
  }, [filters, month, receivables, sevenDaysLimit]);

  const categories = [...new Set(receivables.map((item) => item.category))].sort();
  const selectedReceivable = receivables.find((item) => item.id === receiptReceivableId);

  function showFeedback(message: string) {
    setFeedbackMessage(message);
    window.setTimeout(() => setFeedbackMessage(""), 2600);
  }

  function createReceivable(input: NewReceivableInput) {
    const receivable: Receivable = {
      id: createId(input.description),
      ...input,
      receivedAmount: 0,
      status: input.expectedDate < receivablesReferenceDate ? "overdue" : "pending",
      createdAt: receivablesReferenceDate,
    };
    setReceivables((current) => [receivable, ...current]);
    showFeedback(receivablesContent.newDialog.success);
  }

  function registerReceipt(input: ReceivableReceiptInput) {
    const receivable = receivables.find((item) => item.id === input.receivableId);
    if (!receivable) return;
    const nextReceivedAmount = Math.min(receivable.amount, receivable.receivedAmount + input.amount);
    const isReceived = nextReceivedAmount >= receivable.amount - 0.001;

    setReceivables((current) => current.map((item) => item.id === input.receivableId ? {
      ...item,
      accountId: input.accountId,
      receivedAmount: nextReceivedAmount,
      status: isReceived ? "received" : "partial",
      receivedAt: isReceived ? input.receivedDate : item.receivedAt,
    } : item));
    showFeedback(isReceived ? receivablesContent.receiptDialog.successFull : receivablesContent.receiptDialog.successPartial);
  }

  return (
    <div className="financial-management-page">
      <ReceivablesHeading onNew={() => setNewDialogOpen(true)} />
      <ReceivablesSummary {...summary} />
      <ReceivablesFilters filters={filters} categories={categories} accounts={accounts} onChange={setFilters} />

      <div className="commitment-workspace-grid">
        <ReceivablesList receivables={filteredReceivables} accounts={accounts} onReceive={setReceiptReceivableId} />
        <ReceivablesInsightPanel receivables={receivables} referenceDate={receivablesReferenceDate} />
      </div>

      {newDialogOpen ? <NewReceivableDialog accounts={accounts} onClose={() => setNewDialogOpen(false)} onSubmit={createReceivable} /> : null}
      {selectedReceivable ? <ReceiveReceivableDialog receivable={selectedReceivable} accounts={accounts} onClose={() => setReceiptReceivableId("")} onSubmit={registerReceipt} /> : null}

      {feedbackMessage ? <div className="transaction-feedback"><CheckIcon /> {feedbackMessage}</div> : null}
    </div>
  );
}
