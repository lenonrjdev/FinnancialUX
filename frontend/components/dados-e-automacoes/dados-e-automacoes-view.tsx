"use client";

import { useMemo, useState } from "react";
import { DataToolsHeading } from "@/components/dados-e-automacoes/data-tools-heading";
import { DataToolsSummary } from "@/components/dados-e-automacoes/data-tools-summary";
import { DataToolsToolbar } from "@/components/dados-e-automacoes/data-tools-toolbar";
import { ExportPanel } from "@/components/dados-e-automacoes/export-panel";
import { ImportHistory } from "@/components/dados-e-automacoes/import-history";
import { ImportPanel } from "@/components/dados-e-automacoes/import-panel";
import { ImportPreview } from "@/components/dados-e-automacoes/import-preview";
import { RuleDialog } from "@/components/dados-e-automacoes/rule-dialog";
import { RulesPanel } from "@/components/dados-e-automacoes/rules-panel";
import { CheckIcon } from "@/components/shared/icons";
import { dataToolsContent } from "@/content/dados-e-automacoes";
import { initialAccounts } from "@/data/contas";
import { dataToolsReferenceDate, initialAutomationRules, initialImportHistory } from "@/data/dados-e-automacoes";
import { initialCategories } from "@/data/orcamentos";
import {
  buildExportTable,
  buildFullBackup,
  buildImportRows,
  downloadTextFile,
  inferCsvMapping,
  parseCsvFile,
  reviewImportRow,
  tableToCsv,
  testAutomationRules,
} from "@/lib/data-tools";
import type {
  AutomationRule,
  AutomationRuleInput,
  CsvField,
  CsvMapping,
  DataToolsView,
  ExportConfiguration,
  ImportHistoryItem,
  ImportParseResult,
  ImportTransactionRow,
  RuleTestResult,
} from "@/types/dados-e-automacoes";

export default function DadosEAutomacoesView() {
  const [view, setView] = useState<DataToolsView>("import");
  const [parsed, setParsed] = useState<ImportParseResult | null>(null);
  const [mapping, setMapping] = useState<CsvMapping>({});
  const [rows, setRows] = useState<ImportTransactionRow[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>(initialAutomationRules);
  const [history, setHistory] = useState<ImportHistoryItem[]>(initialImportHistory);
  const [testResults, setTestResults] = useState<RuleTestResult[]>(() => testAutomationRules(initialAutomationRules));
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [exportConfiguration, setExportConfiguration] = useState<ExportConfiguration>({
    dataset: "transactions",
    format: "csv",
    separator: ";",
    startDate: "2026-01-01",
    endDate: dataToolsReferenceDate,
    includeHeaders: true,
  });

  const categories = useMemo(() => initialCategories.filter((item) => item.active).map((item) => item.name), []);
  const accounts = useMemo(() => initialAccounts.map((item) => item.name), []);
  const activeRules = rules.filter((rule) => rule.active).length;
  const exportPreview = useMemo(() => exportConfiguration.dataset === "full-backup"
    ? null
    : buildExportTable(exportConfiguration.dataset, exportConfiguration.startDate, exportConfiguration.endDate), [exportConfiguration]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  function updateRows(nextParsed: ImportParseResult, nextMapping: CsvMapping, nextRules = rules) {
    setRows(buildImportRows(nextParsed.records, nextMapping, nextRules));
  }

  function handleParsed(result: ImportParseResult) {
    const inferred = inferCsvMapping(result.headers);
    setParsed(result);
    setMapping(inferred);
    updateRows(result, inferred);
    setView("import");
  }

  function loadSample() {
    handleParsed(parseCsvFile(dataToolsContent.import.sampleCsv, dataToolsContent.import.sampleFileName));
  }

  function clearImport() {
    setParsed(null);
    setMapping({});
    setRows([]);
  }

  function updateMapping(header: string, field: CsvField) {
    const next = { ...mapping, [header]: field };
    setMapping(next);
    if (parsed) updateRows(parsed, next);
  }

  function updateRow(id: string, patch: Partial<ImportTransactionRow>) {
    setRows((current) => current.map((row) => row.id === id
      ? reviewImportRow({ ...row, ...patch, selected: true })
      : row));
  }

  function importSelected() {
    if (!parsed) return;
    const selectedRows = rows.filter((row) => row.selected && row.status !== "duplicate");
    if (!selectedRows.length) {
      showFeedback(dataToolsContent.feedback.noSelection);
      return;
    }
    const duplicateRows = rows.filter((row) => row.status === "duplicate").length;
    const ignoredRows = rows.length - selectedRows.length - duplicateRows;
    const nextHistory: ImportHistoryItem = {
      id: `import-${Date.now()}`,
      fileName: parsed.fileName,
      sourceType: parsed.sourceType,
      importedAt: new Date().toISOString(),
      importedRows: selectedRows.length,
      ignoredRows: Math.max(ignoredRows, 0),
      duplicateRows,
      status: ignoredRows || duplicateRows ? "partial" : "completed",
    };
    setHistory((current) => [nextHistory, ...current]);
    clearImport();
    showFeedback(dataToolsContent.feedback.imported);
  }

  function exportData(forceBackup = false) {
    const configuration = forceBackup ? { ...exportConfiguration, dataset: "full-backup" as const, format: "json" as const } : exportConfiguration;
    if (configuration.dataset === "full-backup") {
      downloadTextFile(JSON.stringify(buildFullBackup(), null, 2), `backup-financeiro-${dataToolsReferenceDate}.json`, "application/json;charset=utf-8");
    } else {
      const table = buildExportTable(configuration.dataset, configuration.startDate, configuration.endDate);
      if (configuration.format === "csv") {
        downloadTextFile(tableToCsv(table, configuration.separator, configuration.includeHeaders), `${table.fileBase}-${dataToolsReferenceDate}.csv`, "text/csv;charset=utf-8");
      } else {
        const records = table.rows.map((row) => Object.fromEntries(table.headers.map((header, index) => [header, row[index] ?? ""])));
        downloadTextFile(JSON.stringify(records, null, 2), `${table.fileBase}-${dataToolsReferenceDate}.json`, "application/json;charset=utf-8");
      }
    }
    showFeedback(dataToolsContent.feedback.exported);
  }

  function openNewRule() {
    setEditingRule(null);
    setRuleDialogOpen(true);
  }

  function submitRule(input: AutomationRuleInput) {
    let nextRules: AutomationRule[];
    if (editingRule) {
      nextRules = rules.map((rule) => rule.id === editingRule.id ? { ...rule, ...input } : rule);
      showFeedback(dataToolsContent.feedback.ruleUpdated);
    } else {
      nextRules = [...rules, {
        ...input,
        id: `rule-${Date.now()}`,
        priority: rules.length + 1,
        createdAt: dataToolsReferenceDate,
      }];
      showFeedback(dataToolsContent.feedback.ruleCreated);
    }
    setRules(nextRules);
    setTestResults(testAutomationRules(nextRules, rows));
    if (parsed) updateRows(parsed, mapping, nextRules);
    setRuleDialogOpen(false);
    setEditingRule(null);
  }

  function toggleRule(rule: AutomationRule) {
    const nextRules = rules.map((item) => item.id === rule.id ? { ...item, active: !item.active } : item);
    setRules(nextRules);
    setTestResults(testAutomationRules(nextRules, rows));
    if (parsed) updateRows(parsed, mapping, nextRules);
  }

  function deleteRule(rule: AutomationRule) {
    const nextRules = rules.filter((item) => item.id !== rule.id).map((item, index) => ({ ...item, priority: index + 1 }));
    setRules(nextRules);
    setTestResults(testAutomationRules(nextRules, rows));
    if (parsed) updateRows(parsed, mapping, nextRules);
    showFeedback(dataToolsContent.feedback.ruleRemoved);
  }

  function moveRule(rule: AutomationRule, direction: -1 | 1) {
    const ordered = [...rules].sort((a, b) => a.priority - b.priority);
    const currentIndex = ordered.findIndex((item) => item.id === rule.id);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    [ordered[currentIndex], ordered[targetIndex]] = [ordered[targetIndex], ordered[currentIndex]];
    const nextRules = ordered.map((item, index) => ({ ...item, priority: index + 1 }));
    setRules(nextRules);
    if (parsed) updateRows(parsed, mapping, nextRules);
  }

  function runRuleTest() {
    setTestResults(testAutomationRules(rules, rows));
    showFeedback(dataToolsContent.feedback.rulesTested);
  }

  return (
    <div className="financial-management-page data-tools-page">
      <DataToolsHeading onSample={loadSample} onBackup={() => exportData(true)} />
      <DataToolsSummary previewRows={rows.length} activeRules={activeRules} history={history} />
      <DataToolsToolbar view={view} onChange={setView} />

      {view === "import" ? (
        <div className="import-workspace">
          <ImportPanel parsed={parsed} mapping={mapping} onParsed={handleParsed} onMappingChange={updateMapping} onClear={clearImport} />
          <ImportPreview
            rows={rows}
            onChange={updateRow}
            onToggle={(id) => setRows((current) => current.map((row) => row.id === id ? { ...row, selected: !row.selected } : row))}
            onSelectAll={() => setRows((current) => current.map((row) => ({ ...row, selected: row.status !== "duplicate" })))}
            onClearSelection={() => setRows((current) => current.map((row) => ({ ...row, selected: false })))}
            onImport={importSelected}
          />
        </div>
      ) : null}

      {view === "export" ? <ExportPanel configuration={exportConfiguration} preview={exportPreview} onChange={(patch) => setExportConfiguration((current) => ({ ...current, ...patch }))} onExport={() => exportData()} /> : null}

      {view === "rules" ? (
        <RulesPanel
          rules={rules}
          testResults={testResults}
          onCreate={openNewRule}
          onEdit={(rule) => { setEditingRule(rule); setRuleDialogOpen(true); }}
          onToggle={toggleRule}
          onDelete={deleteRule}
          onMove={moveRule}
          onTest={runRuleTest}
        />
      ) : null}

      {view === "history" ? <ImportHistory history={history} /> : null}

      {ruleDialogOpen ? <RuleDialog editing={editingRule} categories={categories} accounts={accounts} onClose={() => { setRuleDialogOpen(false); setEditingRule(null); }} onSubmit={submitRule} /> : null}

      {feedback ? <div className="transaction-feedback data-tools-feedback"><CheckIcon />{feedback}</div> : null}
    </div>
  );
}
