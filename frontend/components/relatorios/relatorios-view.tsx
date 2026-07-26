"use client";

import { useMemo, useState } from "react";
import { AccountDistributionReport } from "@/components/relatorios/account-distribution-report";
import { BudgetPerformance } from "@/components/relatorios/budget-performance";
import { CashFlowReport } from "@/components/relatorios/cash-flow-report";
import { CategoryReport } from "@/components/relatorios/category-report";
import { FinancialHealthPanel } from "@/components/relatorios/financial-health-panel";
import { ProjectionChart } from "@/components/relatorios/projection-chart";
import { ProjectionCommitments } from "@/components/relatorios/projection-commitments";
import { ProjectionRisks } from "@/components/relatorios/projection-risks";
import { ProjectionSummary } from "@/components/relatorios/projection-summary";
import { ProjectionTable } from "@/components/relatorios/projection-table";
import { ReportsHeading } from "@/components/relatorios/reports-heading";
import { ReportsSummary } from "@/components/relatorios/reports-summary";
import { ReportsToolbar } from "@/components/relatorios/reports-toolbar";
import { CheckIcon } from "@/components/shared/icons";
import { reportsContent } from "@/content/relatorios";
import { initialSubscriptions } from "@/data/assinaturas";
import { initialInstallmentPlans } from "@/data/cartoes";
import { initialPayables } from "@/data/contas-a-pagar";
import { initialAccounts } from "@/data/contas";
import { initialDebts } from "@/data/dividas";
import { transactionsData } from "@/data/lancamentos";
import { emergencyCoverageTarget, essentialMonthlyCost, initialGoals } from "@/data/metas";
import { initialCategories, initialMonthlyBudgets } from "@/data/orcamentos";
import {
  monthlyFinancialHistory,
  projectionScenarioSettings,
  projectionVariableExpenseBaseline,
  reportsReferenceMonth,
} from "@/data/relatorios";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { buildProjection, selectSnapshots } from "@/lib/reports";
import type {
  AccountReportRow,
  BudgetReportRow,
  CategoryReportRow,
  FinancialHealthItem,
  ProjectionCommitmentSummary,
  ProjectionScenario,
  ReportPeriod,
  ReportView,
} from "@/types/relatorios";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function monthlySubscriptionAmount(amount: number, cycle: string): number {
  if (cycle === "weekly") return amount * (52 / 12);
  if (cycle === "quarterly") return amount / 3;
  if (cycle === "semiannual") return amount / 6;
  if (cycle === "annual") return amount / 12;
  return amount;
}

function csvMoney(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function RelatoriosView() {
  const [view, setView] = useState<ReportView>("reports");
  const [period, setPeriod] = useState<ReportPeriod>("last-6-months");
  const [scenario, setScenario] = useState<ProjectionScenario>("realistic");
  const [feedback, setFeedback] = useState("");

  const completedTransactions = useMemo(
    () => transactionsData.filter((transaction) => transaction.status === "completed"),
    [],
  );

  const currentIncome = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "income" && transaction.date.startsWith(reportsReferenceMonth))
      .reduce((total, transaction) => total + transaction.amount, 0),
    [completedTransactions],
  );

  const currentExpenses = useMemo(
    () => completedTransactions
      .filter((transaction) => transaction.type === "expense" && transaction.date.startsWith(reportsReferenceMonth))
      .reduce((total, transaction) => total + transaction.amount, 0),
    [completedTransactions],
  );

  const history = useMemo(
    () => monthlyFinancialHistory.map((snapshot) => snapshot.month === reportsReferenceMonth
      ? { ...snapshot, income: currentIncome, expenses: currentExpenses }
      : snapshot),
    [currentExpenses, currentIncome],
  );

  const selectedSnapshots = useMemo(() => selectSnapshots(history, period), [history, period]);

  const reportSummary = useMemo(() => {
    const income = selectedSnapshots.reduce((total, item) => total + item.income, 0);
    const expenses = selectedSnapshots.reduce((total, item) => total + item.expenses, 0);
    const result = income - expenses;
    const count = Math.max(selectedSnapshots.length, 1);
    return {
      income,
      expenses,
      result,
      savingsRate: income > 0 ? (result / income) * 100 : 0,
      averageIncome: income / count,
      averageExpenses: expenses / count,
    };
  }, [selectedSnapshots]);

  const categoryRows = useMemo<CategoryReportRow[]>(() => {
    const amounts = new Map<string, number>();
    completedTransactions
      .filter((transaction) => transaction.type === "expense" && transaction.date.startsWith(reportsReferenceMonth))
      .forEach((transaction) => amounts.set(transaction.category, (amounts.get(transaction.category) ?? 0) + transaction.amount));
    const total = Array.from(amounts.values()).reduce((sum, value) => sum + value, 0);
    return Array.from(amounts.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [completedTransactions]);

  const budgetRows = useMemo<BudgetReportRow[]>(() => {
    const expenseAmounts = new Map<string, number>();
    completedTransactions
      .filter((transaction) => transaction.type === "expense" && transaction.date.startsWith(reportsReferenceMonth))
      .forEach((transaction) => {
        const key = normalizeText(transaction.category);
        expenseAmounts.set(key, (expenseAmounts.get(key) ?? 0) + transaction.amount);
      });

    return initialMonthlyBudgets
      .filter((budget) => budget.month === reportsReferenceMonth)
      .map((budget) => {
        const category = initialCategories.find((item) => item.id === budget.categoryId);
        const categoryName = category?.name ?? budget.categoryId;
        const actual = expenseAmounts.get(normalizeText(categoryName)) ?? 0;
        const usage = budget.limit > 0 ? (actual / budget.limit) * 100 : 0;
        const status: BudgetReportRow["status"] = usage > 100
          ? "exceeded"
          : usage >= budget.alertThreshold
            ? "attention"
            : "healthy";
        return {
          category: categoryName,
          planned: budget.limit,
          actual,
          difference: budget.limit - actual,
          usage,
          status,
        };
      })
      .sort((a, b) => b.usage - a.usage);
  }, [completedTransactions]);

  const accountRows = useMemo<AccountReportRow[]>(() => {
    const included = initialAccounts.filter((account) => account.includeInTotal);
    const total = included.reduce((sum, account) => sum + account.balance, 0);
    return included
      .map((account) => ({
        id: account.id,
        name: account.name,
        institution: account.institution,
        balance: account.balance,
        percentage: total > 0 ? (account.balance / total) * 100 : 0,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, []);

  const startingBalance = useMemo(
    () => initialAccounts.filter((account) => account.includeInTotal).reduce((sum, account) => sum + account.balance, 0),
    [],
  );

  const essentialExpenses = useMemo(
    () => initialPayables
      .filter((payable) => payable.recurrence === "monthly")
      .reduce((sum, payable) => sum + payable.amount, 0),
    [],
  );

  const subscriptionExpenses = useMemo(
    () => initialSubscriptions
      .filter((subscription) => subscription.status === "active" || subscription.status === "trial")
      .reduce((sum, subscription) => sum + monthlySubscriptionAmount(subscription.amount, subscription.billingCycle), 0),
    [],
  );

  const goalsContribution = useMemo(
    () => initialGoals
      .filter((goal) => goal.status === "active")
      .reduce((sum, goal) => sum + goal.monthlyContribution, 0),
    [],
  );

  const averageProjectionIncome = useMemo(() => {
    const lastThree = history.slice(-3);
    return lastThree.reduce((sum, item) => sum + item.income, 0) / Math.max(lastThree.length, 1);
  }, [history]);

  const projection = useMemo(() => buildProjection({
    startMonth: reportsReferenceMonth,
    startingBalance,
    averageIncome: averageProjectionIncome,
    essentialExpenses,
    subscriptionExpenses,
    goals: goalsContribution,
    variableExpenses: projectionVariableExpenseBaseline,
    debts: initialDebts,
    installments: initialInstallmentPlans,
    scenario: projectionScenarioSettings[scenario],
  }), [averageProjectionIncome, essentialExpenses, goalsContribution, scenario, startingBalance, subscriptionExpenses]);

  const projectionSummary = useMemo(() => {
    const totalIncome = projection.reduce((sum, row) => sum + row.income, 0);
    const totalExpenses = projection.reduce((sum, row) => sum + row.totalExpenses, 0);
    const endingBalance = projection.at(-1)?.projectedBalance ?? startingBalance;
    const lowestBalance = Math.min(startingBalance, ...projection.map((row) => row.projectedBalance));
    return { totalIncome, totalExpenses, endingBalance, lowestBalance };
  }, [projection, startingBalance]);

  const commitments = useMemo<ProjectionCommitmentSummary>(() => {
    const first = projection[0];
    return {
      essentialExpenses: first?.essentialExpenses ?? 0,
      subscriptions: first?.subscriptions ?? 0,
      debts: first?.debts ?? 0,
      installments: first?.installments ?? 0,
      goals: first?.goals ?? 0,
      variableExpenses: first?.variableExpenses ?? 0,
    };
  }, [projection]);

  const healthItems = useMemo<FinancialHealthItem[]>(() => {
    const firstMonthFixed = commitments.essentialExpenses
      + commitments.subscriptions
      + commitments.debts
      + commitments.installments;
    const commitmentRate = averageProjectionIncome > 0 ? (firstMonthFixed / averageProjectionIncome) * 100 : 0;
    const reserve = initialGoals.find((goal) => goal.category === "emergency")?.currentAmount ?? 0;
    const coverage = essentialMonthlyCost > 0 ? reserve / essentialMonthlyCost : 0;
    const totalBudget = budgetRows.reduce((sum, row) => sum + row.planned, 0);
    const totalActual = budgetRows.reduce((sum, row) => sum + row.actual, 0);
    const budgetUsage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

    return [
      {
        id: "savings",
        label: reportsContent.health.savingsRate,
        value: formatPercentage(savingsRate),
        helper: savingsRate >= 20 ? reportsContent.health.positiveSavings : reportsContent.health.attentionSavings,
        status: savingsRate >= 20 ? "positive" : savingsRate >= 10 ? "attention" : "critical",
      },
      {
        id: "commitments",
        label: reportsContent.health.commitments,
        value: formatPercentage(commitmentRate),
        helper: commitmentRate <= 60 ? reportsContent.health.commitmentHealthy : reportsContent.health.commitmentAttention,
        status: commitmentRate <= 60 ? "positive" : commitmentRate <= 80 ? "attention" : "critical",
      },
      {
        id: "reserve",
        label: reportsContent.health.emergencyCoverage,
        value: `${coverage.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de ${emergencyCoverageTarget} meses`,
        helper: coverage >= 3 ? reportsContent.health.emergencyPositive : reportsContent.health.emergencyAttention,
        status: coverage >= 3 ? "positive" : coverage >= 1 ? "attention" : "critical",
      },
      {
        id: "budget",
        label: reportsContent.health.budgetUse,
        value: formatPercentage(budgetUsage),
        helper: budgetUsage <= 80 ? reportsContent.health.budgetHealthy : reportsContent.health.budgetAttention,
        status: budgetUsage <= 80 ? "positive" : budgetUsage <= 100 ? "attention" : "critical",
      },
    ];
  }, [averageProjectionIncome, budgetRows, commitments, currentExpenses, currentIncome]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2400);
  }

  function exportReport() {
    if (view === "projection") {
      downloadCsv("projecao-financeira-12-meses.csv", [
        ["Mês", "Entradas", "Contas essenciais", "Assinaturas", "Dívidas", "Parcelamentos", "Metas", "Gastos variáveis", "Saídas totais", "Resultado", "Saldo projetado"],
        ...projection.map((row) => [
          row.label,
          csvMoney(row.income),
          csvMoney(row.essentialExpenses),
          csvMoney(row.subscriptions),
          csvMoney(row.debts),
          csvMoney(row.installments),
          csvMoney(row.goals),
          csvMoney(row.variableExpenses),
          csvMoney(row.totalExpenses),
          csvMoney(row.monthlyResult),
          csvMoney(row.projectedBalance),
        ]),
      ]);
    } else {
      downloadCsv("relatorio-financeiro.csv", [
        ["Período", reportsContent.periods[period]],
        [],
        ["Mês", "Receitas", "Despesas", "Resultado"],
        ...selectedSnapshots.map((row) => [row.label, csvMoney(row.income), csvMoney(row.expenses), csvMoney(row.income - row.expenses)]),
        [],
        ["Categoria", "Valor", "Participação"],
        ...categoryRows.map((row) => [row.category, csvMoney(row.amount), formatPercentage(row.percentage)]),
      ]);
    }
    showFeedback(reportsContent.feedback.exported);
  }

  return (
    <div className="financial-management-page reports-page">
      <ReportsHeading onExport={exportReport} onPrint={() => window.print()} />
      <ReportsToolbar
        view={view}
        period={period}
        scenario={scenario}
        onViewChange={setView}
        onPeriodChange={setPeriod}
        onScenarioChange={setScenario}
      />

      {view === "reports" ? (
        <>
          <div className="reports-period-caption">
            <span>{reportsContent.toolbar.period}</span>
            <strong>{reportsContent.periods[period]}</strong>
          </div>
          <ReportsSummary {...reportSummary} />
          <div className="reports-primary-grid">
            <CashFlowReport snapshots={selectedSnapshots} />
            <FinancialHealthPanel items={healthItems} />
          </div>
          <div className="reports-secondary-grid">
            <CategoryReport rows={categoryRows} total={currentExpenses} />
            <BudgetPerformance rows={budgetRows} />
            <AccountDistributionReport rows={accountRows} total={startingBalance} />
          </div>
        </>
      ) : (
        <>
          <ProjectionSummary
            startingBalance={startingBalance}
            endingBalance={projectionSummary.endingBalance}
            totalIncome={projectionSummary.totalIncome}
            totalExpenses={projectionSummary.totalExpenses}
            lowestBalance={projectionSummary.lowestBalance}
          />
          <div className="projection-primary-grid">
            <ProjectionChart rows={projection} startingBalance={startingBalance} />
            <ProjectionRisks rows={projection} />
          </div>
          <div className="projection-secondary-grid">
            <ProjectionCommitments commitments={commitments} />
            <ProjectionTable rows={projection} />
          </div>
        </>
      )}

      {feedback ? (
        <div className="transaction-feedback reports-feedback" role="status">
          <CheckIcon />
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
