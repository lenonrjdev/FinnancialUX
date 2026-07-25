import { ArrowUpIcon, TargetIcon } from "@/components/shared/icons";
import { overviewContent } from "@/content/visao-geral";
import { overviewData } from "@/data/visao-geral";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

export function MonthlyPanel() {
  const data = overviewData.monthlyPanel;

  return (
    <article className="monthly-panel">
      <div className="monthly-panel-block">
        <div className="monthly-label-row">
          <span>{overviewContent.monthlyPanel.balanceLabel}</span>
          <span className="monthly-symbol positive"><ArrowUpIcon /></span>
        </div>
        <strong>{formatCurrency(data.balance)}</strong>
        <small>
          {formatPercentage(data.retainedPercentage)} {overviewContent.monthlyPanel.retainedSuffix}
        </small>
      </div>

      <div className="monthly-panel-block">
        <div className="monthly-label-row">
          <span>{overviewContent.monthlyPanel.budgetLabel}</span>
          <span>{formatPercentage(data.budgetUsedPercentage)}</span>
        </div>
        <strong>{formatCurrency(data.budgetUsed)}</strong>
        <div
          className="dark-progress"
          aria-label={`${formatPercentage(data.budgetUsedPercentage)} ${overviewContent.monthlyPanel.budgetAriaSuffix}`}
        >
          <span style={{ width: `${data.budgetUsedPercentage}%` }} />
        </div>
        <small>
          {formatCurrency(data.budgetAvailable)} {overviewContent.monthlyPanel.budgetAvailableSuffix}
        </small>
      </div>

      <div className="monthly-panel-block">
        <div className="monthly-label-row">
          <span>{overviewContent.monthlyPanel.goalLabel}</span>
          <TargetIcon />
        </div>
        <strong>{data.goal.name}</strong>
        <div className="goal-row">
          <span>
            {formatCurrency(data.goal.current)} de {formatCurrency(data.goal.target)}
          </span>
          <b>{formatPercentage(data.goal.percentage)}</b>
        </div>
      </div>
    </article>
  );
}
