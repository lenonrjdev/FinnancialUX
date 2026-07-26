import { dataToolsContent } from "@/content/dados-e-automacoes";
import { initialSubscriptions, initialSubscriptionCharges } from "@/data/assinaturas";
import { initialCreditCards, initialCardInvoices, initialCardPurchases } from "@/data/cartoes";
import { initialPayables } from "@/data/contas-a-pagar";
import { initialAccounts } from "@/data/contas";
import { initialDebts, initialDebtPayments } from "@/data/dividas";
import { transactionsData } from "@/data/lancamentos";
import { initialGoals, initialGoalContributions } from "@/data/metas";
import { initialCategories, initialMonthlyBudgets } from "@/data/orcamentos";
import { initialReceivables } from "@/data/recebimentos";
import type {
  AutomationRule,
  CsvField,
  CsvMapping,
  ExportDataset,
  ExportTable,
  ImportParseResult,
  ImportRowType,
  ImportTransactionRow,
  RawImportRecord,
  RuleTestResult,
} from "@/types/dados-e-automacoes";

function splitDelimitedLine(line: string, separator: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === separator && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current.trim());
  return values;
}

function detectSeparator(line: string): string {
  const options = [";", ",", "\t"];
  return options
    .map((separator) => ({ separator, count: splitDelimitedLine(line, separator).length }))
    .sort((a, b) => b.count - a.count)[0]?.separator ?? ";";
}

export function parseCsvFile(text: string, fileName: string): ImportParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { sourceType: "csv", fileName, headers: [], records: [] };
  const separator = detectSeparator(lines[0]);
  const headers = splitDelimitedLine(lines[0], separator).map((header, index) => header || `Coluna ${index + 1}`);
  const records = lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, separator);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
  return { sourceType: "csv", fileName, headers, records };
}

function getOfxTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"));
  return match?.[1]?.trim() ?? "";
}

export function parseOfxFile(text: string, fileName: string): ImportParseResult {
  const blocks = text.match(/<STMTTRN>[\s\S]*?(?:<\/STMTTRN>|(?=<STMTTRN>|<\/BANKTRANLIST>))/gi) ?? [];
  const headers = ["Data", "Descrição", "Valor", "Tipo", "Identificador"];
  const records = blocks.map((block) => ({
    Data: getOfxTag(block, "DTPOSTED").slice(0, 8),
    Descrição: getOfxTag(block, "NAME") || getOfxTag(block, "MEMO"),
    Valor: getOfxTag(block, "TRNAMT"),
    Tipo: getOfxTag(block, "TRNTYPE"),
    Identificador: getOfxTag(block, "FITID"),
  }));
  return { sourceType: "ofx", fileName, headers, records };
}

function normalizeHeader(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function inferCsvMapping(headers: string[]): CsvMapping {
  const mapping: CsvMapping = {};
  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    let field: CsvField = "ignore";
    if (/data|date|dtposted|vencimento/.test(normalized)) field = "date";
    else if (/descricao|historico|memo|name|estabelecimento|lancamento/.test(normalized)) field = "description";
    else if (/valor|amount|trnamt|total/.test(normalized)) field = "amount";
    else if (/tipo|type|trntype|natureza/.test(normalized)) field = "type";
    else if (/categoria|category/.test(normalized)) field = "category";
    else if (/conta|account|banco/.test(normalized)) field = "account";
    mapping[header] = field;
  });
  return mapping;
}

function valueByField(record: RawImportRecord, mapping: CsvMapping, field: CsvField): string {
  const header = Object.keys(mapping).find((key) => mapping[key] === field);
  return header ? record[header] ?? "" : "";
}

export function normalizeDate(value: string): string {
  const cleaned = value.trim();
  if (/^\d{8}/.test(cleaned)) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  const brazilian = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (brazilian) return `${brazilian[3]}-${brazilian[2].padStart(2, "0")}-${brazilian[1].padStart(2, "0")}`;
  const iso = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  return "";
}

export function parseMoney(value: string): number {
  const cleaned = value.replace(/R\$/gi, "").replace(/\s/g, "").trim();
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const parsed = Number(normalized.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferType(rawType: string, amount: number): ImportRowType {
  const normalized = normalizeHeader(rawType);
  if (/credit|receita|entrada|dep|pix recebido/.test(normalized)) return "income";
  if (/transfer/.test(normalized)) return "transfer";
  return amount >= 0 ? "income" : "expense";
}

function matchesRuleValue(source: string, operator: AutomationRule["operator"], expected: string): boolean {
  const left = normalizeHeader(source);
  const right = normalizeHeader(expected);
  if (!right) return false;
  if (operator === "equals") return left === right;
  if (operator === "starts-with") return left.startsWith(right);
  return left.includes(right);
}

export function applyAutomationRules(row: ImportTransactionRow, rules: AutomationRule[]): ImportTransactionRow {
  const ordered = [...rules].filter((rule) => rule.active).sort((a, b) => a.priority - b.priority);
  const rule = ordered.find((candidate) => matchesRuleValue(String(row[candidate.field]), candidate.operator, candidate.value));
  if (!rule) return row;
  return {
    ...row,
    category: rule.actions.category || row.category,
    account: rule.actions.account || row.account,
    type: rule.actions.type || row.type,
  };
}

function isKnownDuplicate(row: Pick<ImportTransactionRow, "date" | "description" | "amount">): boolean {
  const description = normalizeHeader(row.description);
  return transactionsData.some((transaction) =>
    transaction.date === row.date
    && normalizeHeader(transaction.description) === description
    && Math.abs(transaction.amount - Math.abs(row.amount)) < 0.01);
}

export function reviewImportRow(row: ImportTransactionRow): ImportTransactionRow {
  const issues: string[] = [];
  if (!row.date) issues.push(dataToolsContent.preview.issues.missingDate);
  if (!row.description.trim()) issues.push(dataToolsContent.preview.issues.missingDescription);
  if (!row.amount) issues.push(dataToolsContent.preview.issues.zeroAmount);
  const duplicate = isKnownDuplicate(row);
  if (duplicate) issues.push(dataToolsContent.preview.issues.duplicate);
  return {
    ...row,
    status: duplicate ? "duplicate" : issues.length ? "review" : "ready",
    selected: duplicate || issues.length ? false : row.selected,
    issues,
  };
}

export function buildImportRows(records: RawImportRecord[], mapping: CsvMapping, rules: AutomationRule[]): ImportTransactionRow[] {
  return records.map((record, index) => {
    const rawAmount = parseMoney(valueByField(record, mapping, "amount"));
    const date = normalizeDate(valueByField(record, mapping, "date"));
    const description = valueByField(record, mapping, "description").trim();
    const rawType = valueByField(record, mapping, "type");
    const initial: ImportTransactionRow = {
      id: `import-row-${index}-${description || "empty"}`,
      date,
      description,
      amount: Math.abs(rawAmount),
      type: inferType(rawType, rawAmount),
      category: valueByField(record, mapping, "category").trim() || "Sem categoria",
      account: valueByField(record, mapping, "account").trim() || "Conta principal",
      selected: true,
      status: "ready",
      issues: [],
      original: record,
    };
    const automated = applyAutomationRules(initial, rules);
    return reviewImportRow(automated);
  });
}

export function testAutomationRules(rules: AutomationRule[], importedRows: ImportTransactionRow[] = []): RuleTestResult[] {
  const examples = [
    ...transactionsData.map((transaction) => ({
      description: transaction.description,
      category: transaction.category,
      account: transaction.account,
    })),
    ...importedRows.map((row) => ({ description: row.description, category: row.category, account: row.account })),
  ];

  return rules.filter((rule) => rule.active).map((rule) => {
    const matched = examples.filter((item) => matchesRuleValue(String(item[rule.field]), rule.operator, rule.value));
    return { ruleId: rule.id, matches: matched.length, examples: matched.slice(0, 3).map((item) => item.description) };
  });
}

function inDateRange(value: string | undefined, startDate: string, endDate: string): boolean {
  if (!value) return true;
  if (startDate && value < startDate) return false;
  if (endDate && value > endDate) return false;
  return true;
}

export function buildExportTable(dataset: Exclude<ExportDataset, "full-backup">, startDate = "", endDate = ""): ExportTable {
  const headers = dataToolsContent.export.headers[dataset];
  if (dataset === "transactions") {
    return {
      headers,
      fileBase: "lancamentos-financeiros",
      rows: transactionsData.filter((item) => inDateRange(item.date, startDate, endDate)).map((item) => [item.id, item.date, item.description, item.category, item.account, item.destinationAccount ?? "", item.paymentMethod, item.type, item.status, item.amount, item.note ?? ""]),
    };
  }
  if (dataset === "accounts") {
    return { headers, fileBase: "contas-e-carteiras", rows: initialAccounts.map((item) => [item.id, item.name, item.institution, item.type, item.group, item.balance, item.projectedBalance, Boolean(item.isPrimary), item.includeInTotal, item.createdAt]) };
  }
  if (dataset === "cards") {
    const cardNames = Object.fromEntries(initialCreditCards.map((card) => [card.id, `${card.name} •••• ${card.lastFourDigits}`]));
    const cardRows = initialCreditCards.map((item) => ["Cartão", item.id, item.name, item.institution, "", item.createdAt, item.status, item.limit, `Limite utilizado: ${item.usedLimit}`]);
    const invoiceRows = initialCardInvoices.filter((item) => inDateRange(item.dueDate, startDate, endDate)).map((item) => ["Fatura", item.id, cardNames[item.cardId] ?? item.cardId, "", item.referenceLabel, item.dueDate, item.status, item.amount, `Fechamento: ${item.closingDate}`]);
    const purchaseRows = initialCardPurchases.filter((item) => inDateRange(item.date, startDate, endDate)).map((item) => ["Compra", item.id, cardNames[item.cardId] ?? item.cardId, "", `${item.currentInstallment}/${item.installments}`, item.date, "registrada", item.totalAmount, item.description]);
    return { headers, fileBase: "cartoes-faturas-compras", rows: [...cardRows, ...invoiceRows, ...purchaseRows] };
  }
  if (dataset === "payables") {
    return { headers, fileBase: "contas-a-pagar", rows: initialPayables.filter((item) => inDateRange(item.dueDate, startDate, endDate)).map((item) => [item.id, item.dueDate, item.description, item.category, item.accountId, item.status, item.recurrence, item.amount, item.paidAmount, item.notes ?? ""]) };
  }
  if (dataset === "receivables") {
    return { headers, fileBase: "recebimentos", rows: initialReceivables.filter((item) => inDateRange(item.expectedDate, startDate, endDate)).map((item) => [item.id, item.expectedDate, item.description, item.source, item.payer ?? "", item.category, item.accountId, item.status, item.recurrence, item.amount, item.receivedAmount, item.notes ?? ""]) };
  }
  if (dataset === "budgets") {
    const categoryRows = initialCategories.map((item) => ["Categoria", item.id, item.name, item.type, "", "", "", item.active, item.description]);
    const categoryNames = Object.fromEntries(initialCategories.map((item) => [item.id, item.name]));
    const budgetRows = initialMonthlyBudgets.map((item) => ["Orçamento", item.id, categoryNames[item.categoryId] ?? item.categoryId, "expense", item.month, item.limit, item.alertThreshold, true, ""]);
    return { headers, fileBase: "categorias-e-orcamentos", rows: [...categoryRows, ...budgetRows] };
  }
  if (dataset === "goals") {
    const goalNames = Object.fromEntries(initialGoals.map((goal) => [goal.id, goal.name]));
    const goalRows = initialGoals.filter((item) => inDateRange(item.targetDate, startDate, endDate)).map((item) => ["Meta", item.id, item.name, item.kind, item.category, item.accountId, item.targetDate, item.status, item.targetAmount, item.currentAmount, item.monthlyContribution, item.description]);
    const contributionRows = initialGoalContributions.filter((item) => inDateRange(item.date, startDate, endDate)).map((item) => ["Movimentação", item.id, goalNames[item.goalId] ?? item.goalId, item.type, "", item.accountId, item.date, "concluída", item.amount, "", "", item.note]);
    return { headers, fileBase: "metas-e-reservas", rows: [...goalRows, ...contributionRows] };
  }
  if (dataset === "debts") {
    const debtNames = Object.fromEntries(initialDebts.map((debt) => [debt.id, debt.name]));
    const debtRows = initialDebts.filter((item) => inDateRange(item.nextDueDate, startDate, endDate)).map((item) => ["Dívida", item.id, item.name, item.creditor, item.type, item.accountId, item.nextDueDate, item.status, item.originalAmount, item.currentBalance, item.annualInterestRate, item.installmentAmount, item.notes]);
    const paymentRows = initialDebtPayments.filter((item) => inDateRange(item.date, startDate, endDate)).map((item) => ["Pagamento", item.id, debtNames[item.debtId] ?? item.debtId, "", "", item.accountId, item.date, "pago", item.amount, item.principal, item.interest, "", item.note]);
    return { headers, fileBase: "dividas-e-pagamentos", rows: [...debtRows, ...paymentRows] };
  }
  const subscriptionNames = Object.fromEntries(initialSubscriptions.map((item) => [item.id, item.name]));
  const subscriptionRows = initialSubscriptions.filter((item) => inDateRange(item.nextChargeDate, startDate, endDate)).map((item) => ["Assinatura", item.id, item.name, item.provider, item.category, item.accountId, item.nextChargeDate, item.status, item.billingCycle, item.amount, item.notes]);
  const chargeRows = initialSubscriptionCharges.filter((item) => inDateRange(item.date, startDate, endDate)).map((item) => ["Cobrança", item.id, subscriptionNames[item.subscriptionId] ?? item.subscriptionId, "", "", item.accountId, item.date, item.status, "", item.amount, item.note]);
  return { headers, fileBase: "assinaturas-e-cobrancas", rows: [...subscriptionRows, ...chargeRows] };
}

export function buildFullBackup() {
  return {
    generatedAt: new Date().toISOString(),
    version: "fase-12-demo",
    transactions: transactionsData,
    accounts: initialAccounts,
    cards: { cards: initialCreditCards, invoices: initialCardInvoices, purchases: initialCardPurchases },
    payables: initialPayables,
    receivables: initialReceivables,
    budgets: { categories: initialCategories, monthlyBudgets: initialMonthlyBudgets },
    goals: { goals: initialGoals, contributions: initialGoalContributions },
    debts: { debts: initialDebts, payments: initialDebtPayments },
    subscriptions: { subscriptions: initialSubscriptions, charges: initialSubscriptionCharges },
  };
}

function escapeCsv(value: string | number | boolean, separator: string): string {
  const text = String(value ?? "");
  if (text.includes(separator) || text.includes('"') || text.includes("\n")) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function tableToCsv(table: ExportTable, separator: string, includeHeaders: boolean): string {
  const lines = includeHeaders ? [table.headers] : [];
  return `\uFEFF${[...lines, ...table.rows].map((row) => row.map((value) => escapeCsv(value, separator)).join(separator)).join("\r\n")}`;
}

export function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
