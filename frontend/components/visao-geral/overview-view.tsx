import { CashFlowCard } from "@/components/visao-geral/cash-flow-card";
import { FinancialLists } from "@/components/visao-geral/financial-lists";
import { MonthlyInsight } from "@/components/visao-geral/monthly-insight";
import { MonthlyPanel } from "@/components/visao-geral/monthly-panel";
import { OverviewHeading } from "@/components/visao-geral/overview-heading";
import { SummaryCards } from "@/components/visao-geral/summary-cards";

export default function OverviewView() {
  return (
    <div className="overview-page">
      <OverviewHeading />
      <SummaryCards />

      <section className="overview-main-grid">
        <CashFlowCard />
        <MonthlyPanel />
      </section>

      <FinancialLists />
      <MonthlyInsight />
    </div>
  );
}
