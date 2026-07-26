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
import { initialFinancialPreferences, initialProfileSettings } from "@/data/configuracoes";
import { dashboardData } from "@/data/dashboard";
import { createInitials, getStoredWorkspaceId, persistWorkspaceId } from "@/lib/access-control";
import {
  applyAppearance,
  cycleAppearance,
  getStoredFinancialPreferences,
  getStoredProfile,
  persistFinancialPreferences,
} from "@/lib/settings";
import type { FinancialPreferences, ProfileSettings } from "@/types/configuracoes";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaces[0].id);
  const [profile, setProfile] = useState<ProfileSettings>(initialProfileSettings);
  const [preferences, setPreferences] = useState<FinancialPreferences>(initialFinancialPreferences);
  const allNavigationItems = useMemo(
    () => dashboardNavigation.flatMap((group) => group.items),
    [],
  );

  useEffect(() => {
    const storedId = getStoredWorkspaceId(initialWorkspaces[0].id);
    const storedProfile = getStoredProfile(initialProfileSettings);
    const storedPreferences = getStoredFinancialPreferences(initialFinancialPreferences);
    setProfile(storedProfile);
    setPreferences(storedPreferences);
    applyAppearance(storedPreferences.appearance);
    if (initialWorkspaces.some((workspace) => workspace.id === storedId)) {
      setSelectedWorkspaceId(storedId);
    }

    function handleWorkspaceChange(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) setSelectedWorkspaceId(customEvent.detail);
    }

    function handleProfileChange(event: Event) {
      const customEvent = event as CustomEvent<ProfileSettings>;
      if (customEvent.detail) setProfile(customEvent.detail);
    }

    function handlePreferencesChange(event: Event) {
      const customEvent = event as CustomEvent<FinancialPreferences>;
      if (customEvent.detail) {
        setPreferences(customEvent.detail);
        applyAppearance(customEvent.detail.appearance);
      }
    }

    function handleWorkspacesChange(event: Event) {
      const customEvent = event as CustomEvent<typeof initialWorkspaces>;
      if (Array.isArray(customEvent.detail) && customEvent.detail.length) {
        setWorkspaces(customEvent.detail);
      }
    }

    window.addEventListener("finance-workspace-change", handleWorkspaceChange);
    window.addEventListener("finance-workspaces-change", handleWorkspacesChange);
    window.addEventListener("finance-profile-change", handleProfileChange);
    window.addEventListener("finance-preferences-change", handlePreferencesChange);
    return () => {
      window.removeEventListener("finance-workspace-change", handleWorkspaceChange);
      window.removeEventListener("finance-workspaces-change", handleWorkspacesChange);
      window.removeEventListener("finance-profile-change", handleProfileChange);
      window.removeEventListener("finance-preferences-change", handlePreferencesChange);
    };
  }, []);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
  const isReadOnly = selectedWorkspace.role === "viewer";
  const sessionUser = useMemo(() => ({
    ...demoSessionUser,
    name: profile.name,
    email: profile.email,
    initials: createInitials(profile.name) || demoSessionUser.initials,
  }), [profile]);

  function toggleAppearance() {
    const nextAppearance = cycleAppearance(preferences.appearance);
    const nextPreferences = { ...preferences, appearance: nextAppearance };
    setPreferences(nextPreferences);
    persistFinancialPreferences(nextPreferences);
  }

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
            {sessionUser.initials}
          </span>
          <span className="account-copy">
            <strong>{sessionUser.name}</strong>
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
              onClick={toggleAppearance}
              data-appearance={preferences.appearance}
            >
              <MoonIcon />
            </button>
            <UserMenu user={sessionUser} />
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
            <UserMenu user={sessionUser} />
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
