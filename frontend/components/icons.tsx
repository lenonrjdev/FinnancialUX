import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

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
export function StakeIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 9.5 12 6l7 3.5-7 3.5-7-3.5Z"/><path d="M5 14.5 12 18l7-3.5"/><path d="M5 12 12 15.5 19 12"/></svg>;
}
export function BondIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16"/><path d="M9 5v14"/></svg>;
}
export function CalculatorIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"/></svg>;
}
export function VaultIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v6M9 12h6"/></svg>;
}
export function LeverageIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 18V6"/><path d="M4 18h16"/><path d="m7 14 4-4 3 2 5-6"/></svg>;
}
export function FlashIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg>;
}
export function DocsIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M6 3h9l3 3v15H6V3Z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/></svg>;
}
export function MoonIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 15.2A8 8 0 1 1 8.8 4 6.5 6.5 0 0 0 20 15.2Z"/></svg>;
}
export function MenuIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}
export function WalletIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 7h13a2 2 0 0 1 2 2v8H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10"/><path d="M16 11h4v4h-4a2 2 0 1 1 0-4Z"/></svg>;
}
export function CoinBagIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M9 3h6l-1 4H10L9 3Z"/><path d="M8 8h8c2.5 2 4 4.4 4 7.1A5.9 5.9 0 0 1 14 21h-4a5.9 5.9 0 0 1-6-5.9C4 12.4 5.5 10 8 8Z"/><path d="M9.5 14h5M12 11.5v5"/></svg>;
}
export function ArrowUpIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 17 17 7M9 7h8v8"/></svg>;
}
export function CheckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 4 4L19 6"/></svg>;
}
export function TwitterIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 7.2c-.6.3-1.2.5-1.9.6a3.3 3.3 0 0 0 1.5-1.8c-.7.4-1.4.7-2.1.8A3.3 3.3 0 0 0 12 9.8c0 .3 0 .5.1.8A9.3 9.3 0 0 1 5.3 7c-.3.5-.5 1.1-.5 1.7 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.2 3 2.2A6.7 6.7 0 0 1 4.8 18c-.3 0-.5 0-.8-.1a9.4 9.4 0 0 0 5.1 1.5c6.1 0 9.4-5 9.4-9.4v-.4c.6-.5 1.1-1 1.5-1.7Z"/></svg>;
}
export function DiscordIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M8 8.5A8 8 0 0 1 16 8.5l1.5 1.2c1 2.5 1.4 4.6 1.5 6.8-1 .8-2 1.4-3.2 1.8l-.8-1.1c.7-.3 1.3-.7 1.9-1.2-2.8 1.3-6.9 1.3-9.7 0 .6.5 1.2.9 1.9 1.2l-.8 1.1A11 11 0 0 1 5 16.5c.1-2.2.5-4.3 1.5-6.8L8 8.5Z"/><path d="M9.2 14h.01M14.8 14h.01"/></svg>;
}
export function MediumIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h3l5 10 5-10h3"/><path d="M6 7v10M18 7v10"/></svg>;
}
export function TelegramIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3 11 17-7-4 16-5-5-3 3v-5l8-6-10 5-3-1Z"/></svg>;
}
export function InfoIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>;
}
export function TrendIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 16 9 11l4 3 7-8"/><path d="M15 6h5v5"/></svg>;
}
