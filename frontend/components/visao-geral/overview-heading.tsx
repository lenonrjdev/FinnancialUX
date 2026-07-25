import { WalletIcon } from "@/components/shared/icons";
import { overviewContent } from "@/content/visao-geral";
import { overviewData } from "@/data/visao-geral";
import { formatCurrency } from "@/lib/formatters";

export function OverviewHeading() {
  return (
    <section className="overview-heading">
      <div>
        <span className="page-eyebrow">{overviewContent.heading.eyebrow}</span>
        <h1>{overviewContent.heading.title}</h1>
        <p>{overviewContent.heading.description}</p>
      </div>

      <article className="available-balance-card">
        <span className="available-icon" aria-hidden="true">
          <WalletIcon />
        </span>
        <div>
          <span>{overviewContent.availableBalance.label}</span>
          <strong>{formatCurrency(overviewData.availableAfterCommitments)}</strong>
        </div>
        <small>
          {overviewContent.availableBalance.periodPrefix} {overviewData.currentMonth}
        </small>
      </article>
    </section>
  );
}
