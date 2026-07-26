"use client";

import { useEffect, useMemo, useState } from "react";
import { DebtDetailsPanel } from "@/components/dividas/debt-details-panel";
import { DebtDialog } from "@/components/dividas/debt-dialog";
import { DebtPaymentDialog } from "@/components/dividas/debt-payment-dialog";
import { DebtPaymentsList } from "@/components/dividas/debt-payments-list";
import { DebtStrategyPanel } from "@/components/dividas/debt-strategy-panel";
import { DebtsHeading } from "@/components/dividas/debts-heading";
import { DebtsList } from "@/components/dividas/debts-list";
import { DebtsSummary } from "@/components/dividas/debts-summary";
import { DebtsToolbar } from "@/components/dividas/debts-toolbar";
import { PayoffSimulator } from "@/components/dividas/payoff-simulator";
import { CheckIcon } from "@/components/shared/icons";
import { useFinanceDataState } from "@/components/providers/finance-data-provider";
import { debtsContent } from "@/content/dividas";
import { initialAccounts } from "@/data/contas";
import { debtsReferenceDate, initialDebtPayments, initialDebts, monthlyIncomeReference } from "@/data/dividas";
import type {
  DebtFormInput,
  DebtPayment,
  DebtPaymentInput,
  DebtPriorityFilter,
  DebtRow,
  DebtStatusFilter,
  DebtTypeFilter,
  DebtView,
  FinancialDebt,
} from "@/types/dividas";

function addMonths(value: string, count: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + count);
  return date.toISOString().slice(0, 10);
}

function computeDebt(debt: FinancialDebt): DebtRow {
  const currentBalance = Math.max(debt.currentBalance, 0);
  const remainingInstallments = Math.max(debt.totalInstallments - debt.paidInstallments, 0);
  const progress = debt.originalAmount > 0 ? ((debt.originalAmount - currentBalance) / debt.originalAmount) * 100 : 0;
  const paidPrincipal = Math.max(debt.originalAmount - currentBalance, 0);
  const estimatedRemainingInterest = Math.max(debt.installmentAmount * remainingInstallments - currentBalance, 0);
  let computedStatus = debt.status;

  if (currentBalance <= 0 || debt.paidInstallments >= debt.totalInstallments) computedStatus = "paid";
  else if (debt.nextDueDate < debtsReferenceDate && debt.status !== "renegotiated") computedStatus = "overdue";

  return { ...debt, currentBalance, remainingInstallments, progress, paidPrincipal, estimatedRemainingInterest, computedStatus };
}

function formatDebtFreeDate(months: number): string {
  const date = new Date(`${debtsReferenceDate}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function DividasView() {
  const [storedAccounts] = useFinanceDataState("accounts", initialAccounts);
  const accounts = useMemo(() => storedAccounts.map((account) => ({ id: account.id, name: account.name })), [storedAccounts]);
  const accountNames = useMemo(() => Object.fromEntries(accounts.map((account) => [account.id, account.name])), [accounts]);
  const [debts, setDebts] = useFinanceDataState<FinancialDebt[]>("debts", initialDebts);
  const [payments, setPayments] = useFinanceDataState<DebtPayment[]>("debt-payments", initialDebtPayments);
  const [view, setView] = useState<DebtView>("debts");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<DebtTypeFilter>("all");
  const [status, setStatus] = useState<DebtStatusFilter>("all");
  const [priority, setPriority] = useState<DebtPriorityFilter>("all");
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [editingDebt, setEditingDebt] = useState<FinancialDebt | null>(null);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDebtId, setPaymentDebtId] = useState<string | undefined>();
  const [settleMode, setSettleMode] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!selectedDebtId && debts[0]) setSelectedDebtId(debts[0].id);
    if (selectedDebtId && !debts.some((debt) => debt.id === selectedDebtId)) {
      setSelectedDebtId(debts[0]?.id ?? "");
    }
  }, [debts, selectedDebtId]);

  const debtRows = useMemo(() => debts.map(computeDebt), [debts]);
  const filteredDebts = useMemo(() => debtRows.filter((debt) => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch = !query
      || debt.name.toLocaleLowerCase("pt-BR").includes(query)
      || debt.creditor.toLocaleLowerCase("pt-BR").includes(query)
      || debt.notes.toLocaleLowerCase("pt-BR").includes(query);
    const matchesType = type === "all" || debt.type === type;
    const matchesStatus = status === "all" || debt.computedStatus === status;
    const matchesPriority = priority === "all" || debt.priority === priority;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  }), [debtRows, priority, search, status, type]);

  const filteredIds = useMemo(() => new Set(filteredDebts.map((debt) => debt.id)), [filteredDebts]);
  const filteredPayments = useMemo(() => payments
    .filter((payment) => filteredIds.has(payment.debtId))
    .sort((a, b) => b.date.localeCompare(a.date)), [filteredIds, payments]);

  const selectedDebt = debtRows.find((debt) => debt.id === selectedDebtId) ?? debtRows[0];
  const activeDebts = debtRows.filter((debt) => debt.computedStatus !== "paid");
  const summary = useMemo(() => {
    const outstanding = activeDebts.reduce((total, debt) => total + debt.currentBalance, 0);
    const monthly = activeDebts.reduce((total, debt) => total + debt.installmentAmount, 0);
    const overdue = activeDebts.filter((debt) => debt.computedStatus === "overdue").reduce((total, debt) => total + Math.min(debt.installmentAmount, debt.currentBalance), 0);
    const interest = activeDebts.reduce((total, debt) => total + debt.estimatedRemainingInterest, 0);
    const maxMonths = activeDebts.reduce((maximum, debt) => Math.max(maximum, debt.remainingInstallments), 0);
    return {
      outstanding,
      monthly,
      overdue,
      interest,
      activeCount: activeDebts.length,
      debtToIncome: monthlyIncomeReference > 0 ? (monthly / monthlyIncomeReference) * 100 : 0,
      debtFreeLabel: formatDebtFreeDate(maxMonths),
    };
  }, [activeDebts]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  }

  function openNewDebt() {
    setEditingDebt(null);
    setDebtDialogOpen(true);
  }

  function openEditDebt(debt: DebtRow) {
    setEditingDebt(debts.find((item) => item.id === debt.id) ?? null);
    setDebtDialogOpen(true);
  }

  function openPayment(debtId?: string, settle = false) {
    setPaymentDebtId(debtId ?? selectedDebt?.id);
    setSettleMode(settle);
    setPaymentDialogOpen(true);
  }

  function submitDebt(input: DebtFormInput) {
    if (editingDebt) {
      setDebts((current) => current.map((debt) => debt.id === editingDebt.id ? { ...debt, ...input } : debt));
      showFeedback(debtsContent.debtDialog.successEdit);
    } else {
      const nextDebt: FinancialDebt = {
        id: `debt-${Date.now()}`,
        ...input,
        createdAt: debtsReferenceDate,
      };
      setDebts((current) => [...current, nextDebt]);
      setSelectedDebtId(nextDebt.id);
      showFeedback(debtsContent.debtDialog.successCreate);
    }
    setDebtDialogOpen(false);
    setEditingDebt(null);
  }

  function submitPayment(input: DebtPaymentInput) {
    const debt = debtRows.find((item) => item.id === input.debtId);
    if (!debt) return;

    const interest = Math.min(debt.currentBalance * (debt.annualInterestRate / 1200), input.amount);
    const principal = Math.min(Math.max(input.amount - interest, 0), debt.currentBalance);
    const nextBalance = Math.max(debt.currentBalance - principal, 0);
    const installmentCompleted = input.amount + 0.01 >= debt.installmentAmount;
    const nextPaidInstallments = nextBalance <= 0
      ? debt.totalInstallments
      : Math.min(debt.paidInstallments + (installmentCompleted ? 1 : 0), debt.totalInstallments);

    const nextPayment: DebtPayment = {
      id: `debt-payment-${Date.now()}`,
      ...input,
      principal,
      interest,
    };

    setPayments((current) => [nextPayment, ...current]);
    setDebts((current) => current.map((item) => item.id === debt.id ? {
      ...item,
      currentBalance: nextBalance,
      paidInstallments: nextPaidInstallments,
      nextDueDate: installmentCompleted && nextBalance > 0 ? addMonths(item.nextDueDate, 1) : item.nextDueDate,
      status: nextBalance <= 0 ? "paid" : "active",
    } : item));
    setSelectedDebtId(debt.id);
    setPaymentDialogOpen(false);
    setSettleMode(false);
    showFeedback(nextBalance <= 0 ? debtsContent.paymentDialog.settled : debtsContent.paymentDialog.success);
  }

  function selectById(id: string) {
    setSelectedDebtId(id);
    setView("debts");
  }

  return (
    <div className="financial-management-page debts-page">
      <DebtsHeading onNewDebt={openNewDebt} onNewPayment={() => openPayment()} />
      <DebtsSummary {...summary} />
      <DebtsToolbar
        view={view}
        search={search}
        type={type}
        status={status}
        priority={priority}
        onViewChange={setView}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onClear={() => { setSearch(""); setType("all"); setStatus("all"); setPriority("all"); }}
      />

      {view === "debts" ? (
        <div className="debts-workspace-grid">
          <DebtsList
            debts={filteredDebts}
            accountNames={accountNames}
            selectedId={selectedDebtId}
            onSelect={(debt) => setSelectedDebtId(debt.id)}
            onPay={(debt) => openPayment(debt.id)}
            onEdit={openEditDebt}
            onSettle={(debt) => openPayment(debt.id, true)}
          />
          <div className="debts-insight-column">
            <DebtDetailsPanel debt={selectedDebt} accountName={selectedDebt ? accountNames[selectedDebt.accountId] : undefined} />
            <PayoffSimulator debts={activeDebts} selectedId={selectedDebtId} onSelect={selectById} />
            <DebtStrategyPanel debts={debtRows} onSelect={selectById} />
          </div>
        </div>
      ) : (
        <DebtPaymentsList payments={filteredPayments} debts={debtRows} accountNames={accountNames} />
      )}

      {debtDialogOpen ? <DebtDialog editing={editingDebt} accounts={accounts} onClose={() => { setDebtDialogOpen(false); setEditingDebt(null); }} onSubmit={submitDebt} /> : null}
      {paymentDialogOpen ? <DebtPaymentDialog debts={debtRows} accounts={accounts} initialDebtId={paymentDebtId} settle={settleMode} referenceDate={debtsReferenceDate} onClose={() => { setPaymentDialogOpen(false); setSettleMode(false); }} onSubmit={submitPayment} /> : null}
      {feedback ? <div className="transaction-feedback"><CheckIcon /> {feedback}</div> : null}
    </div>
  );
}
