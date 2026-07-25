"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BondIcon,
  CalculatorIcon,
  CheckIcon,
  DashboardIcon,
  DiscordIcon,
  DocsIcon,
  FlashIcon,
  LeverageIcon,
  MediumIcon,
  MenuIcon,
  MoonIcon,
  StakeIcon,
  TelegramIcon,
  TwitterIcon,
  VaultIcon,
} from "./icons";

const navItems = [
  { label: "Dashboard", href: "/stake", icon: DashboardIcon },
  { label: "Stake", href: "/stake", icon: StakeIcon },
  { label: "Bond", href: "/bond", icon: BondIcon },
  { label: "Calculator", href: "#calculator", icon: CalculatorIcon },
  { label: "Vaults", href: "#vaults", icon: VaultIcon },
  { label: "Leverage", href: "#leverage", icon: LeverageIcon },
  { label: "Flash Mint", href: "#flash", icon: FlashIcon },
  { label: "Docs", href: "#docs", icon: DocsIcon },
];

function Brand() {
  return (
    <Link href="/stake" className="brand" aria-label="Whale Loans">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14.5" stroke="currentColor" />
          <path d="M7.5 16.5c2.8-4.9 6.4-7.2 10.8-7 1.8.1 3.5.7 5.2 1.7-1.2 4.8-4.1 8-8.4 9.4-2.9.9-5.4.2-7.6-2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M12.2 13.9c1.8 1.6 4 2.1 6.5 1.4M21.3 9.9l2.7-2.1-.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </span>
      <span>Whale Loans</span>
    </Link>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top"><Brand /></div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = (item.label === "Stake" && pathname === "/stake") || (item.label === "Bond" && pathname === "/bond");
            return (
              <Link key={item.label} href={item.href} className={`side-link ${active ? "active" : ""}`}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="social-row" aria-label="Social links">
          <DiscordIcon /><TelegramIcon /><TwitterIcon /><MediumIcon />
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="desktop-rate"><span className="rate-dot">i</span> 1 HUMP = $8.43</div>
          <div className="top-actions">
            <button className="wallet-button">Connect Wallet</button>
            <button className="icon-button" aria-label="Toggle theme"><MoonIcon /></button>
          </div>
        </header>

        <header className="mobile-header">
          <Brand />
          <div className="mobile-header-actions">
            <button className="mobile-wallet">Connect Wallet</button>
            <button className="icon-button" onClick={() => setMobileOpen((open) => !open)} aria-label="Open navigation"><MenuIcon /></button>
          </div>
        </header>

        {mobileOpen && (
          <div className="mobile-menu">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}><Icon />{item.label}</Link>;
            })}
          </div>
        )}

        <main className="page-content">{children}</main>

        <footer className="footer">
          <span>©2022 Whale Loans | All rights reserved</span>
          <div className="footer-checks"><span><CheckIcon /> KYC Verified</span><span><CheckIcon /> MCN Ventures</span></div>
        </footer>
      </div>
    </div>
  );
}
