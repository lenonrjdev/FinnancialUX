"use client";

import { useMemo, useState } from "react";
import { CheckIcon } from "@/components/shared/icons";
import { AccountMovements } from "@/components/contas/account-movements";
import { AccountsDistribution } from "@/components/contas/accounts-distribution";
import { AccountsFilters } from "@/components/contas/accounts-filters";
import { AccountsGrid } from "@/components/contas/accounts-grid";
import { AccountsHeading } from "@/components/contas/accounts-heading";
import {
  AccountsSummary,
  type AccountsSummaryValues,
} from "@/components/contas/accounts-summary";
import { NewAccountDialog } from "@/components/contas/new-account-dialog";
import { TransferDialog } from "@/components/contas/transfer-dialog";
import { accountsContent } from "@/content/contas";
import { initialAccountMovements, initialAccounts } from "@/data/contas";
import type {
  AccountFilter,
  AccountMovement,
  AccountTransferInput,
  FinancialAccount,
  NewAccountInput,
} from "@/types/contas";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function createAccountId(name: string): string {
  const slug = normalize(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "conta"}-${Date.now()}`;
}

export default function ContasView() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>(initialAccounts);
  const [movements, setMovements] = useState<AccountMovement[]>(
    initialAccountMovements,
  );
  const [filter, setFilter] = useState<AccountFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialAccounts[0]?.id ?? "",
  );
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const summary = useMemo<AccountsSummaryValues>(() => {
    const includedAccounts = accounts.filter((account) => account.includeInTotal);
    const totalBalance = includedAccounts.reduce(
      (sum, account) => sum + account.balance,
      0,
    );
    const projectedBalance = includedAccounts.reduce(
      (sum, account) => sum + account.projectedBalance,
      0,
    );
    const reservedBalance = includedAccounts
      .filter((account) => account.group === "reserve")
      .reduce((sum, account) => sum + account.balance, 0);

    return {
      totalBalance,
      projectedBalance,
      reservedBalance,
      availableBalance: totalBalance - reservedBalance,
      activeAccounts: accounts.length,
    };
  }, [accounts]);

  const counts = useMemo<Record<AccountFilter, number>>(
    () => ({
      all: accounts.length,
      bank: accounts.filter((account) => account.group === "bank").length,
      wallet: accounts.filter((account) => account.group === "wallet").length,
      reserve: accounts.filter((account) => account.group === "reserve").length,
    }),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = normalize(search.trim());

    return accounts.filter((account) => {
      const matchesFilter = filter === "all" || account.group === filter;
      const matchesSearch =
        !normalizedSearch ||
        normalize(account.name).includes(normalizedSearch) ||
        normalize(account.institution).includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [accounts, filter, search]);

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  function showFeedback(message: string) {
    setFeedbackMessage(message);
    window.setTimeout(() => setFeedbackMessage(""), 2600);
  }

  function createAccount(input: NewAccountInput) {
    const account: FinancialAccount = {
      id: createAccountId(input.name),
      name: input.name,
      institution: input.institution,
      type: input.type,
      group: input.group,
      icon: input.icon,
      balance: input.initialBalance,
      projectedBalance: input.initialBalance,
      includeInTotal: input.includeInTotal,
      createdAt: "2026-07-25",
    };

    setAccounts((current) => [...current, account]);
    setSelectedAccountId(account.id);
    setFilter("all");
    setSearch("");
    showFeedback(accountsContent.newAccountDialog.success);
  }

  function transferBetweenAccounts(input: AccountTransferInput) {
    setAccounts((current) =>
      current.map((account) => {
        if (account.id === input.sourceAccountId) {
          return {
            ...account,
            balance: account.balance - input.amount,
            projectedBalance: account.projectedBalance - input.amount,
          };
        }

        if (account.id === input.destinationAccountId) {
          return {
            ...account,
            balance: account.balance + input.amount,
            projectedBalance: account.projectedBalance + input.amount,
          };
        }

        return account;
      }),
    );

    setMovements((current) => [
      {
        id: `transfer-${Date.now()}`,
        accountId: input.sourceAccountId,
        destinationAccountId: input.destinationAccountId,
        description: input.description,
        category: "Transferência entre contas",
        date: input.date,
        amount: input.amount,
        type: "transfer",
      },
      ...current,
    ]);
    setSelectedAccountId(input.sourceAccountId);
    showFeedback(accountsContent.transferDialog.success);
  }

  return (
    <div className="accounts-page">
      <AccountsHeading
        onTransfer={() => setTransferOpen(true)}
        onCreate={() => setNewAccountOpen(true)}
      />
      <AccountsSummary values={summary} />
      <AccountsFilters
        filter={filter}
        search={search}
        counts={counts}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />
      <AccountsGrid
        accounts={filteredAccounts}
        selectedAccountId={selectedAccountId}
        onSelect={setSelectedAccountId}
      />

      <div className="accounts-bottom-grid">
        <AccountMovements
          account={selectedAccount}
          accounts={accounts}
          movements={movements}
        />
        <AccountsDistribution accounts={accounts} />
      </div>

      <NewAccountDialog
        open={newAccountOpen}
        existingNames={accounts.map((account) => account.name)}
        onClose={() => setNewAccountOpen(false)}
        onCreate={createAccount}
      />
      <TransferDialog
        open={transferOpen}
        accounts={accounts}
        onClose={() => setTransferOpen(false)}
        onTransfer={transferBetweenAccounts}
      />

      {feedbackMessage && (
        <div className="transaction-feedback" role="status">
          <CheckIcon />
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
