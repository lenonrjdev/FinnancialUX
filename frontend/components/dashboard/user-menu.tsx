"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, ShieldIcon, UsersIcon } from "@/components/shared/icons";
import { dashboardContent } from "@/content/dashboard";
import { clearDemoSession } from "@/lib/access-control";
import type { SessionUser } from "@/types/acessos";

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);

  function logout() {
    clearDemoSession();
    window.location.assign("/login");
  }

  return (
    <div className="dashboard-user-menu">
      <button
        className="dashboard-user-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={dashboardContent.accessibility.accountMenu}
        aria-expanded={open}
      >
        <span>{user.initials}</span>
      </button>
      {open ? (
        <div className="dashboard-user-dropdown">
          <header>
            <span>{user.initials}</span>
            <div><strong>{user.name}</strong><small>{user.email}</small></div>
          </header>
          <div className="dashboard-user-demo"><ShieldIcon /> {dashboardContent.accountMenu.demo}</div>
          <nav>
            <Link href="/acessos" onClick={() => setOpen(false)}><UsersIcon /> {dashboardContent.accountMenu.manageAccess}</Link>
            <Link href="/configuracoes" onClick={() => setOpen(false)}><SettingsIcon /> {dashboardContent.accountMenu.settings}</Link>
            <button type="button" onClick={logout}><LogOutIcon /> {dashboardContent.accountMenu.logout}</button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
