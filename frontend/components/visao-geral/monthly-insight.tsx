import { ReportsIcon } from "@/components/shared/icons";
import { overviewContent } from "@/content/visao-geral";
import { overviewData } from "@/data/visao-geral";
import { formatCurrency } from "@/lib/formatters";

export function MonthlyInsight() {
  return (
    <section className="monthly-insight">
      <span className="insight-icon" aria-hidden="true"><ReportsIcon /></span>
      <div>
        <strong>{overviewContent.insight.title}</strong>
        <p>
          {overviewContent.insight.descriptionPrefix}{" "}
          {formatCurrency(overviewData.availableAfterCommitments)}{" "}
          {overviewContent.insight.descriptionSuffix}
        </p>
      </div>
      <button type="button">{overviewContent.insight.action}</button>
    </section>
  );
}
