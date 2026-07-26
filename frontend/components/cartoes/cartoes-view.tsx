"use client";

import { useEffect, useMemo, useState } from "react";
import { CardsHeading } from "@/components/cartoes/cards-heading";
import { CardsSummary } from "@/components/cartoes/cards-summary";
import { CreditCardsSection } from "@/components/cartoes/credit-cards-section";
import { InstallmentsPanel } from "@/components/cartoes/installments-panel";
import { InvoicePanel } from "@/components/cartoes/invoice-panel";
import { NewCardDialog } from "@/components/cartoes/new-card-dialog";
import { NewPurchaseDialog } from "@/components/cartoes/new-purchase-dialog";
import { PayInvoiceDialog } from "@/components/cartoes/pay-invoice-dialog";
import { CheckIcon } from "@/components/shared/icons";
import { useFinanceDataState } from "@/components/providers/finance-data-provider";
import { cardsContent } from "@/content/cartoes";
import { initialAccounts } from "@/data/contas";
import {
  initialCardInvoices,
  initialCardPurchases,
  initialCreditCards,
  initialInstallmentPlans,
} from "@/data/cartoes";
import type {
  CardInvoice,
  CardPurchase,
  CreditCard,
  InstallmentPlan,
  InvoicePaymentInput,
  NewCardInput,
  NewCardPurchaseInput,
} from "@/types/cartoes";

const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function createId(value: string): string {
  const slug = normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "cartao"}-${Date.now()}`;
}

function getReferenceLabel(reference: string): string {
  const label = monthLabelFormatter.format(new Date(`${reference}-01T12:00:00Z`));
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

function addMonths(reference: string, months: number): string {
  const [year, month] = reference.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1, 12));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildDate(reference: string, day: number): string {
  return `${reference}-${String(day).padStart(2, "0")}`;
}

function findFirstOpenInvoice(invoices: CardInvoice[], cardId: string): CardInvoice | undefined {
  return invoices
    .filter((invoice) => invoice.cardId === cardId && invoice.status !== "paid")
    .sort((a, b) => a.reference.localeCompare(b.reference))[0];
}

export default function CartoesView() {
  const [accounts] = useFinanceDataState("accounts", initialAccounts);
  const [cards, setCards] = useFinanceDataState<CreditCard[]>("credit-cards", initialCreditCards);
  const [invoices, setInvoices] = useFinanceDataState<CardInvoice[]>("card-invoices", initialCardInvoices);
  const [purchases, setPurchases] = useFinanceDataState<CardPurchase[]>("card-purchases", initialCardPurchases);
  const [installmentPlans, setInstallmentPlans] = useFinanceDataState<InstallmentPlan[]>(
    "installment-plans",
    initialInstallmentPlans,
  );
  const [selectedCardId, setSelectedCardId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [newPurchaseOpen, setNewPurchaseOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const nextCardId = cards.some((card) => card.id === selectedCardId)
      ? selectedCardId
      : cards[0]?.id ?? "";
    if (nextCardId !== selectedCardId) setSelectedCardId(nextCardId);

    const cardInvoices = invoices.filter((invoice) => invoice.cardId === nextCardId);
    if (!cardInvoices.some((invoice) => invoice.id === selectedInvoiceId)) {
      setSelectedInvoiceId(findFirstOpenInvoice(invoices, nextCardId)?.id ?? cardInvoices[0]?.id ?? "");
    }
  }, [cards, invoices, selectedCardId, selectedInvoiceId]);

  const selectedCard = cards.find((card) => card.id === selectedCardId);
  const selectedInvoice = invoices.find((invoice) => invoice.id === paymentInvoiceId);
  const selectedCardInvoices = invoices
    .filter((invoice) => invoice.cardId === selectedCardId)
    .sort((a, b) => {
      const statusOrder = { open: 0, closed: 1, paid: 2 } as const;
      const statusDifference = statusOrder[a.status] - statusOrder[b.status];
      return statusDifference || a.reference.localeCompare(b.reference);
    });

  const summary = useMemo(() => {
    const activeCards = cards.filter((card) => card.status === "active");
    const totalLimit = activeCards.reduce((total, card) => total + card.limit, 0);
    const usedLimit = activeCards.reduce((total, card) => total + card.usedLimit, 0);
    const currentOpenInvoices = activeCards.map((card) =>
      findFirstOpenInvoice(invoices, card.id),
    );
    const openInvoices = currentOpenInvoices.reduce(
      (total, invoice) => total + (invoice?.amount ?? 0),
      0,
    );
    const futureInstallments = installmentPlans.reduce((total, plan) => {
      const installmentsAfterCurrent = Math.max(
        0,
        plan.totalInstallments - plan.paidInstallments - 1,
      );
      return total + installmentsAfterCurrent * plan.installmentAmount;
    }, 0);

    return {
      totalLimit,
      usedLimit,
      availableLimit: Math.max(0, totalLimit - usedLimit),
      openInvoices,
      futureInstallments,
    };
  }, [cards, installmentPlans, invoices]);

  function showFeedback(message: string) {
    setFeedbackMessage(message);
    window.setTimeout(() => setFeedbackMessage(""), 2600);
  }

  function selectCard(cardId: string) {
    setSelectedCardId(cardId);
    const invoice = findFirstOpenInvoice(invoices, cardId) ?? invoices.find((item) => item.cardId === cardId);
    setSelectedInvoiceId(invoice?.id ?? "");
  }

  function createCard(input: NewCardInput) {
    const cardId = createId(`${input.institution}-${input.lastFourDigits}`);
    const card: CreditCard = {
      id: cardId,
      ...input,
      usedLimit: 0,
      status: "active",
      createdAt: "2026-07-25",
    };
    const currentReference = "2026-08";
    const invoice: CardInvoice = {
      id: `${cardId}-${currentReference}`,
      cardId,
      reference: currentReference,
      referenceLabel: getReferenceLabel(currentReference),
      closingDate: buildDate(currentReference, input.closingDay),
      dueDate: buildDate(currentReference, input.dueDay),
      amount: 0,
      status: "open",
    };

    setCards((current) => [...current, card]);
    setInvoices((current) => [...current, invoice]);
    setSelectedCardId(cardId);
    setSelectedInvoiceId(invoice.id);
    showFeedback(cardsContent.newCardDialog.success);
  }

  function createPurchase(input: NewCardPurchaseInput) {
    const card = cards.find((item) => item.id === input.cardId);
    if (!card) return;

    const cardOpenInvoices = invoices
      .filter(
        (invoice) =>
          invoice.cardId === card.id &&
          invoice.status !== "paid" &&
          invoice.closingDate >= input.date,
      )
      .sort((a, b) => a.closingDate.localeCompare(b.closingDate));
    const firstInvoice = cardOpenInvoices[0] ?? findFirstOpenInvoice(invoices, card.id);
    const firstReference = firstInvoice?.reference ?? "2026-08";
    const installmentAmount = input.amount / input.installments;
    const newInvoices: CardInvoice[] = [];
    const newPurchases: CardPurchase[] = [];

    for (let index = 0; index < input.installments; index += 1) {
      const reference = addMonths(firstReference, index);
      let invoice = [...invoices, ...newInvoices].find(
        (item) => item.cardId === card.id && item.reference === reference,
      );

      if (!invoice) {
        invoice = {
          id: `${card.id}-${reference}`,
          cardId: card.id,
          reference,
          referenceLabel: getReferenceLabel(reference),
          closingDate: buildDate(reference, card.closingDay),
          dueDate: buildDate(reference, card.dueDay),
          amount: 0,
          status: "open",
        };
        newInvoices.push(invoice);
      }

      newPurchases.push({
        id: `${createId(input.description)}-${index + 1}`,
        cardId: card.id,
        invoiceId: invoice.id,
        description: input.description,
        category: input.category,
        date: index === 0 ? input.date : invoice.closingDate,
        totalAmount: input.amount,
        installmentAmount,
        currentInstallment: index + 1,
        installments: input.installments,
      });
    }

    setCards((current) =>
      current.map((item) =>
        item.id === card.id
          ? { ...item, usedLimit: item.usedLimit + input.amount }
          : item,
      ),
    );
    setInvoices((current) => {
      const allInvoices = [...current, ...newInvoices];
      return allInvoices.map((invoice) => {
        const amountToAdd = newPurchases
          .filter((purchase) => purchase.invoiceId === invoice.id)
          .reduce((total, purchase) => total + purchase.installmentAmount, 0);
        return amountToAdd ? { ...invoice, amount: invoice.amount + amountToAdd } : invoice;
      });
    });
    setPurchases((current) => [...newPurchases, ...current]);

    if (input.installments > 1) {
      setInstallmentPlans((current) => [
        {
          id: createId(`${input.description}-parcelamento`),
          cardId: card.id,
          description: input.description,
          category: input.category,
          totalAmount: input.amount,
          installmentAmount,
          paidInstallments: 0,
          totalInstallments: input.installments,
          nextChargeDate: newPurchases[0]?.date ?? input.date,
        },
        ...current,
      ]);
    }

    setSelectedCardId(card.id);
    setSelectedInvoiceId(newPurchases[0]?.invoiceId ?? firstInvoice?.id ?? "");
    showFeedback(cardsContent.newPurchaseDialog.success);
  }

  function payInvoice(input: InvoicePaymentInput) {
    const invoice = invoices.find((item) => item.id === input.invoiceId);
    if (!invoice) return;

    setInvoices((current) =>
      current.map((item) =>
        item.id === input.invoiceId
          ? { ...item, status: "paid", paymentDate: input.paymentDate }
          : item,
      ),
    );
    setCards((current) =>
      current.map((card) =>
        card.id === invoice.cardId
          ? { ...card, usedLimit: Math.max(0, card.usedLimit - invoice.amount) }
          : card,
      ),
    );
    setInstallmentPlans((current) =>
      current.map((plan) => {
        if (plan.cardId !== invoice.cardId || plan.paidInstallments >= plan.totalInstallments) {
          return plan;
        }
        return { ...plan, paidInstallments: plan.paidInstallments + 1 };
      }),
    );
    setPaymentInvoiceId("");
    showFeedback(cardsContent.paymentDialog.success);
  }

  return (
    <div className="cards-page">
      <CardsHeading
        onNewPurchase={() => setNewPurchaseOpen(true)}
        onNewCard={() => setNewCardOpen(true)}
      />
      <CardsSummary values={summary} />
      <CreditCardsSection
        cards={cards}
        selectedCardId={selectedCardId}
        onSelect={selectCard}
      />

      <div className="cards-detail-grid">
        <InvoicePanel
          card={selectedCard}
          invoices={selectedCardInvoices}
          selectedInvoiceId={selectedInvoiceId}
          purchases={purchases}
          onInvoiceSelect={setSelectedInvoiceId}
          onPay={setPaymentInvoiceId}
        />
        <InstallmentsPanel plans={installmentPlans} cards={cards} />
      </div>

      <NewCardDialog
        open={newCardOpen}
        accounts={accounts}
        existingCards={cards}
        onClose={() => setNewCardOpen(false)}
        onCreate={createCard}
      />
      <NewPurchaseDialog
        open={newPurchaseOpen}
        cards={cards}
        preferredCardId={selectedCardId}
        onClose={() => setNewPurchaseOpen(false)}
        onCreate={createPurchase}
      />
      <PayInvoiceDialog
        open={Boolean(paymentInvoiceId)}
        invoice={selectedInvoice}
        defaultAccountId={selectedCard?.paymentAccountId ?? ""}
        accounts={accounts}
        onClose={() => setPaymentInvoiceId("")}
        onPay={payInvoice}
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
