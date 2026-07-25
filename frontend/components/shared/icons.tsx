import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DashboardIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 13h6V4H4v9Z"/><path d="M14 20h6v-9h-6v9Z"/><path d="M4 20h6v-3H4v3Z"/><path d="M14 7h6V4h-6v3Z"/></svg>;
}

export function TransactionsIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 7h14M5 12h14M5 17h9"/><path d="m16 15 3 2-3 2"/></svg>;
}

export function AccountsIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 8h16v11H4V8Z"/><path d="M7 8V5h10v3M8 12h8M8 15h5"/></svg>;
}

export function CreditCardIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>;
}

export function BillsIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>;
}

export function IncomeIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 18h16"/><path d="M12 4v10"/><path d="m8 10 4 4 4-4"/></svg>;
}

export function CalendarIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>;
}

export function BudgetIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.7-1-1.7-1.5-3-1.5-1.7 0-3 1-3 2.3 0 3.4 6 1.4 6 4.2 0 1.4-1.3 2.5-3 2.5-1.4 0-2.6-.6-3.3-1.7"/></svg>;
}

export function TargetIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m15 9 5-5M17 4h3v3"/></svg>;
}

export function DebtIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16v10H4V7Z"/><path d="M8 12h8M12 9v6"/><path d="M7 4h10M7 20h10"/></svg>;
}

export function SubscriptionIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M6 4h12v16H6V4Z"/><path d="M9 8h6M9 12h6M9 16h4"/><path d="M3 8V3h5M21 16v5h-5"/></svg>;
}

export function ReportsIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
}

export function SettingsIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 5v14M5 12h14"/></svg>;
}

export function UserIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
}

export function WalletIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 7h13a2 2 0 0 1 2 2v8H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10"/><path d="M16 11h4v4h-4a2 2 0 1 1 0-4Z"/></svg>;
}

export function MoonIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 15.2A8 8 0 1 1 8.8 4 6.5 6.5 0 0 0 20 15.2Z"/></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 4 4L19 6"/></svg>;
}

export function ArrowDownIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m7 9 5 5 5-5"/></svg>;
}

export function ArrowUpIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 17 17 7M9 7h8v8"/></svg>;
}

export function MoreIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r=".8" fill="currentColor" stroke="none"/></svg>;
}

export function ShoppingBagIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

export function DownloadIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>;
}

export function ArrowRightLeftIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 7h13"/><path d="m16 3 4 4-4 4"/><path d="M17 17H4"/><path d="m8 21-4-4 4-4"/></svg>;
}

export function CopyIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
}

export function TrashIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>;
}

export function BankIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3 9 9-5 9 5"/><path d="M5 10h14M6 10v7M10 10v7M14 10v7M18 10v7M4 17h16M3 20h18"/></svg>;
}

export function SavingsIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 11a7 7 0 0 1 13.6-2.2L21 10v5l-2.3.8A7 7 0 0 1 12 20H8a3 3 0 0 1-3-3v-1H3v-4h2v-1Z"/><path d="M15 7.5h.01M8 20v2M17 19v3M8 10h4"/></svg>;
}

export function InvestmentIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 20V10M10 20V14M16 20V6M22 20H2"/><path d="m5 7 5-3 5 2 5-4"/></svg>;
}

export function ChevronRightIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m9 18 6-6-6-6"/></svg>;
}
