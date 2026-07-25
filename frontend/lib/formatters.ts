const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatSignedCurrency(value: number): string {
  const absoluteValue = currencyFormatter.format(Math.abs(value));

  if (value > 0) {
    return `+ ${absoluteValue}`;
  }

  if (value < 0) {
    return `- ${absoluteValue}`;
  }

  return absoluteValue;
}

export function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`;
}
