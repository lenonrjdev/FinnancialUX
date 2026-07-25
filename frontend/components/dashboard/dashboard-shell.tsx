"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Brand } from "@/components/dashboard/brand";
import { NavigationIcon } from "@/components/dashboard/navigation-icon";
import {
  CheckIcon,
  MenuIcon,
  MoonIcon,
  PlusIcon,
  UserIcon,
} from "@/components/shared/icons";
import { dashboardContent, dashboardNavigation } from "@/content/dashboard";
import { dashboardData } from "@/data/dashboard";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const allNavigationItems = useMemo(
    () => dashboardNavigation.flatMap((group) => group.items),
    [],
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand />
        </div>

        <nav
          className="side-nav finance-side-nav"
          aria-label={dashboardContent.accessibility.desktopNavigation}
        >
          {dashboardNavigation.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              <div className="nav-group-links">
                {group.items.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`side-link ${active ? "active" : ""}`}
                    >
                      <NavigationIcon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <span className="account-avatar" aria-hidden="true">
            <UserIcon />
          </span>
          <span className="account-copy">
            <strong>{dashboardData.account.name}</strong>
            <small>{dashboardData.account.environment}</small>
          </span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar finance-topbar">
          <div className="topbar-context">
            <span className="context-dot" aria-hidden="true" />
            <div>
              <span>{dashboardContent.topbar.context}</span>
              <strong>{dashboardData.currentPeriod}</strong>
            </div>
          </div>

          <div className="top-actions">
            <button className="new-entry-button" type="button">
              <PlusIcon />
              {dashboardContent.topbar.newEntry}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label={dashboardContent.accessibility.theme}
            >
              <MoonIcon />
            </button>
          </div>
        </header>

        <header className="mobile-header">
          <Brand />
          <div className="mobile-header-actions">
            <button
              className="mobile-entry-button"
              type="button"
              aria-label={dashboardContent.topbar.newEntry}
            >
              <PlusIcon />
              <span>{dashboardContent.topbar.mobileNewEntry}</span>
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={
                mobileOpen
                  ? dashboardContent.accessibility.closeNavigation
                  : dashboardContent.accessibility.openNavigation
              }
              aria-expanded={mobileOpen}
            >
              <MenuIcon />
            </button>
          </div>
        </header>

        {mobileOpen && (
          <nav
            className="mobile-menu finance-mobile-menu"
            aria-label={dashboardContent.accessibility.mobileNavigation}
          >
            {allNavigationItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : ""}
                  onClick={() => setMobileOpen(false)}
                >
                  <NavigationIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <main className="page-content finance-page-content">{children}</main>

        <footer className="footer finance-footer">
          <span>{dashboardContent.footer.copyright}</span>
          <div className="footer-checks">
            <span>
              <CheckIcon /> {dashboardContent.footer.privacy}
            </span>
            <span>
              <CheckIcon /> {dashboardContent.footer.personalUse}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
