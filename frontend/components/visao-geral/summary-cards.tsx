import { MoreIcon } from "@/components/shared/icons";
import { OverviewIcon } from "@/components/visao-geral/overview-icon";
import { overviewContent } from "@/content/visao-geral";
import { overviewData } from "@/data/visao-geral";
import { formatCurrency } from "@/lib/formatters";

export function SummaryCards() {
  return (
    <section
      className="summary-grid"
      aria-label={overviewContent.summary.sectionAriaLabel}
    >
      {overviewContent.summary.cards.map((card) => {
        const data = overviewData.summaryCards[card.id];

        return (
          <article className="summary-card" key={card.id}>
            <div className="summary-card-top">
              <span className="summary-card-icon" aria-hidden="true">
                <OverviewIcon name={card.icon} />
              </span>
              <button
                type="button"
                className="more-button"
                aria-label={`${overviewContent.summary.moreOptionsPrefix} ${card.label}`}
              >
                <MoreIcon />
              </button>
            </div>
            <span className="summary-label">{card.label}</span>
            <strong>{formatCurrency(data.value)}</strong>
            <div className="summary-footer">
              <span>{data.helper}</span>
              <small className={`summary-trend ${data.tone}`}>{data.trend}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}
