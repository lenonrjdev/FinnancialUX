"use client";

import { usePathname } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";

const publicPaths = new Set([
  "/",
  "/login",
  "/registro",
  "/recuperar-senha",
  "/redefinir-senha",
]);

export function AppRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!pathname || publicPaths.has(pathname)) {
    return children;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
