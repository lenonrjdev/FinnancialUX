import {
  ArrowDownIcon,
  ArrowUpIcon,
  BillsIcon,
  CreditCardIcon,
  IncomeIcon,
  MoreIcon,
  ReportsIcon,
  ShoppingBagIcon,
  TargetIcon,
  TransactionsIcon,
  WalletIcon,
} from "./icons";

const summaryCards = [
  {
    label: "Saldo atual",
    value: "R$ 8.430,00",
    helper: "Em todas as contas",
    trend: "+ R$ 1.240,00 no mês",
    icon: WalletIcon,
    tone: "positive",
  },
  {
    label: "Receitas do mês",
    value: "R$ 6.800,00",
    helper: "4 recebimentos",
    trend: "+8,4% em relação a junho",
    icon: IncomeIcon,
    tone: "positive",
  },
  {
    label: "Despesas do mês",
    value: "R$ 4.250,00",
    helper: "28 lançamentos",
    trend: "62,5% das receitas",
    icon: TransactionsIcon,
    tone: "neutral",
  },
  {
    label: "Contas pendentes",
    value: "R$ 780,00",
    helper: "3 vencimentos próximos",
    trend: "Próxima conta em 2 dias",
    icon: BillsIcon,
    tone: "warning",
  },
];

const chartData = [
  { month: "Fev", income: 58, expense: 45 },
  { month: "Mar", income: 72, expense: 52 },
  { month: "Abr", income: 64, expense: 49 },
  { month: "Mai", income: 82, expense: 61 },
  { month: "Jun", income: 76, expense: 57 },
  { month: "Jul", income: 90, expense: 56 },
];

const bills = [
  { title: "Internet residencial", date: "27 jul", value: "R$ 119,90", status: "Em 2 dias" },
  { title: "Cartão principal", date: "30 jul", value: "R$ 420,10", status: "Em 5 dias" },
  { title: "Energia elétrica", date: "02 ago", value: "R$ 240,00", status: "Em 8 dias" },
];

const transactions = [
  {
    title: "Mercado Central",
    category: "Alimentação",
    date: "Hoje, 10:42",
    value: "- R$ 248,90",
    icon: ShoppingBagIcon,
    kind: "expense",
  },
  {
    title: "Recebimento de serviço",
    category: "Serviços",
    date: "Ontem, 16:15",
    value: "+ R$ 1.500,00",
    icon: IncomeIcon,
    kind: "income",
  },
  {
    title: "Fatura do cartão",
    category: "Cartão de crédito",
    date: "23 jul, 09:30",
    value: "- R$ 680,00",
    icon: CreditCardIcon,
    kind: "expense",
  },
];

export default function OverviewView() {
  return (
    <div className="overview-page">
      <section className="overview-heading">
        <div>
          <span className="page-eyebrow">Resumo financeiro</span>
          <h1>Visão geral</h1>
          <p>Acompanhe sua vida financeira e os compromissos do mês em um só lugar.</p>
        </div>

        <article className="available-balance-card">
          <span className="available-icon" aria-hidden="true">
            <WalletIcon />
          </span>
          <div>
            <span>Disponível após compromissos</span>
            <strong>R$ 1.770,00</strong>
          </div>
          <small>Até o fim de julho</small>
        </article>
      </section>

      <section className="summary-grid" aria-label="Resumo do mês">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="summary-card" key={card.label}>
              <div className="summary-card-top">
                <span className="summary-card-icon" aria-hidden="true">
                  <Icon />
                </span>
                <button type="button" className="more-button" aria-label={`Mais opções de ${card.label}`}>
                  <MoreIcon />
                </button>
              </div>
              <span className="summary-label">{card.label}</span>
              <strong>{card.value}</strong>
              <div className="summary-footer">
                <span>{card.helper}</span>
                <small className={`summary-trend ${card.tone}`}>{card.trend}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="overview-main-grid">
        <article className="finance-card cashflow-card">
          <header className="card-header">
            <div>
              <span className="card-kicker">Últimos 6 meses</span>
              <h2>Fluxo financeiro</h2>
            </div>
            <button type="button" className="period-button">
              Mensal
              <ArrowDownIcon />
            </button>
          </header>

          <div className="chart-summary">
            <div>
              <span>Entradas</span>
              <strong>R$ 6.800,00</strong>
            </div>
            <div>
              <span>Saídas</span>
              <strong>R$ 4.250,00</strong>
            </div>
            <div>
              <span>Resultado</span>
              <strong>R$ 2.550,00</strong>
            </div>
          </div>

          <div className="bar-chart" aria-label="Comparação de entradas e saídas dos últimos seis meses">
            <div className="chart-grid-lines" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            {chartData.map((item) => (
              <div className="chart-column" key={item.month}>
                <div className="chart-bars">
                  <span
                    className="chart-bar income"
                    style={{ height: `${item.income}%` }}
                    title={`Entradas em ${item.month}`}
                  />
                  <span
                    className="chart-bar expense"
                    style={{ height: `${item.expense}%` }}
                    title={`Saídas em ${item.month}`}
                  />
                </div>
                <span className="chart-month">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="chart-legend">
            <span><i className="income" /> Entradas</span>
            <span><i className="expense" /> Saídas</span>
          </div>
        </article>

        <article className="monthly-panel">
          <div className="monthly-panel-block">
            <div className="monthly-label-row">
              <span>Saldo do mês</span>
              <span className="monthly-symbol positive"><ArrowUpIcon /></span>
            </div>
            <strong>R$ 2.550,00</strong>
            <small>37,5% das receitas permaneceu disponível</small>
          </div>

          <div className="monthly-panel-block">
            <div className="monthly-label-row">
              <span>Orçamento utilizado</span>
              <span>68%</span>
            </div>
            <strong>R$ 4.250,00</strong>
            <div className="dark-progress" aria-label="68% do orçamento utilizado">
              <span style={{ width: "68%" }} />
            </div>
            <small>R$ 2.000,00 ainda disponíveis no orçamento</small>
          </div>

          <div className="monthly-panel-block">
            <div className="monthly-label-row">
              <span>Meta principal</span>
              <TargetIcon />
            </div>
            <strong>Reserva de emergência</strong>
            <div className="goal-row">
              <span>R$ 7.500,00 de R$ 20.000,00</span>
              <b>37,5%</b>
            </div>
          </div>
        </article>
      </section>

      <section className="overview-lists-grid">
        <article className="finance-card list-card">
          <header className="card-header list-card-header">
            <div>
              <span className="card-kicker">Próximos dias</span>
              <h2>Contas a pagar</h2>
            </div>
            <button type="button" className="text-button">Ver todas</button>
          </header>

          <div className="item-list">
            {bills.map((bill) => (
              <div className="list-item bill-item" key={bill.title}>
                <span className="list-icon" aria-hidden="true"><BillsIcon /></span>
                <div className="list-copy">
                  <strong>{bill.title}</strong>
                  <span>Vencimento em {bill.date}</span>
                </div>
                <div className="list-value">
                  <strong>{bill.value}</strong>
                  <span>{bill.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="finance-card list-card">
          <header className="card-header list-card-header">
            <div>
              <span className="card-kicker">Movimentações recentes</span>
              <h2>Últimos lançamentos</h2>
            </div>
            <button type="button" className="text-button">Ver todos</button>
          </header>

          <div className="item-list">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;

              return (
                <div className="list-item transaction-item" key={transaction.title}>
                  <span className="list-icon" aria-hidden="true"><Icon /></span>
                  <div className="list-copy">
                    <strong>{transaction.title}</strong>
                    <span>{transaction.category} · {transaction.date}</span>
                  </div>
                  <div className={`transaction-value ${transaction.kind}`}>
                    <strong>{transaction.value}</strong>
                    <span>Concluído</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="monthly-insight">
        <span className="insight-icon" aria-hidden="true"><ReportsIcon /></span>
        <div>
          <strong>Seu mês continua positivo.</strong>
          <p>Depois das contas pendentes, você ainda terá R$ 1.770,00 disponíveis para organizar entre gastos, reservas e metas.</p>
        </div>
        <button type="button">Ver planejamento</button>
      </section>
    </div>
  );
}
