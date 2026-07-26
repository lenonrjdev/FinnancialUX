"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/dashboard/brand";
import { NavigationIcon } from "@/components/dashboard/navigation-icon";
import { UserMenu } from "@/components/dashboard/user-menu";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import {
  CheckIcon,
  MenuIcon,
  MoonIcon,
  PlusIcon,
} from "@/components/shared/icons";
import { accessContent } from "@/content/acessos";
import { dashboardContent, dashboardNavigation } from "@/content/dashboard";
import { demoSessionUser, initialWorkspaces } from "@/data/acessos";
import { dashboardData } from "@/data/dashboard";
import { getStoredWorkspaceId, persistWorkspaceId } from "@/lib/access-control";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaces[0].id);
  const allNavigationItems = useMemo(
    () => dashboardNavigation.flatMap((group) => group.items),
    [],
  );

  useEffect(() => {
    const storedId = getStoredWorkspaceId(initialWorkspaces[0].id);
    if (initialWorkspaces.some((workspace) => workspace.id === storedId)) {
      setSelectedWorkspaceId(storedId);
    }

    function handleWorkspaceChange(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) setSelectedWorkspaceId(customEvent.detail);
    }

    function handleWorkspacesChange(event: Event) {
      const customEvent = event as CustomEvent<typeof initialWorkspaces>;
      if (Array.isArray(customEvent.detail) && customEvent.detail.length) {
        setWorkspaces(customEvent.detail);
      }
    }

    window.addEventListener("finance-workspace-change", handleWorkspaceChange);
    window.addEventListener("finance-workspaces-change", handleWorkspacesChange);
    return () => {
      window.removeEventListener("finance-workspace-change", handleWorkspaceChange);
      window.removeEventListener("finance-workspaces-change", handleWorkspacesChange);
    };
  }, []);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
  const isReadOnly = selectedWorkspace.role === "viewer";

  function selectWorkspace(workspaceId: string) {
    setSelectedWorkspaceId(workspaceId);
    persistWorkspaceId(workspaceId);
  }

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
          <span className="account-avatar account-initials" aria-hidden="true">
            {demoSessionUser.initials}
          </span>
          <span className="account-copy">
            <strong>{demoSessionUser.name}</strong>
            <small>{accessContent.roles[selectedWorkspace.role]}</small>
          </span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar finance-topbar phase-thirteen-topbar">
          <div className="topbar-workspace-group">
            <WorkspaceSwitcher
              workspaces={workspaces}
              selectedWorkspaceId={selectedWorkspaceId}
              onChange={selectWorkspace}
            />
            <div className="topbar-context period-context">
              <span className="context-dot" aria-hidden="true" />
              <div>
                <span>{dashboardContent.topbar.context}</span>
                <strong>{dashboardData.currentPeriod}</strong>
              </div>
            </div>
          </div>

          <div className="top-actions">
            {isReadOnly ? (
              <span className="new-entry-button read-only-button">
                {dashboardContent.topbar.readOnly}
              </span>
            ) : (
              <Link className="new-entry-button" href="/lancamentos#novo-lancamento">
                <PlusIcon />
                {dashboardContent.topbar.newEntry}
              </Link>
            )}
            <button
              className="icon-button"
              type="button"
              aria-label={dashboardContent.accessibility.theme}
            >
              <MoonIcon />
            </button>
            <UserMenu user={demoSessionUser} />
          </div>
        </header>

        <header className="mobile-header phase-thirteen-mobile-header">
          <Brand />
          <div className="mobile-header-actions">
            {!isReadOnly ? (
              <Link
                className="mobile-entry-button"
                href="/lancamentos#novo-lancamento"
                aria-label={dashboardContent.topbar.newEntry}
              >
                <PlusIcon />
                <span>{dashboardContent.topbar.mobileNewEntry}</span>
              </Link>
            ) : null}
            <UserMenu user={demoSessionUser} />
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
            className="mobile-menu finance-mobile-menu phase-thirteen-mobile-menu"
            aria-label={dashboardContent.accessibility.mobileNavigation}
          >
            <WorkspaceSwitcher
              workspaces={workspaces}
              selectedWorkspaceId={selectedWorkspaceId}
              onChange={selectWorkspace}
            />
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
