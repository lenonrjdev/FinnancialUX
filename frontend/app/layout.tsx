import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { metadataContent } from "@/content/metadata";
import "./globals.css";

export const metadata: Metadata = metadataContent;

const appearanceBootstrap = `
(() => {
  try {
    const saved = window.localStorage.getItem("finance-dashboard-appearance");
    const preference = saved === "light" || saved === "dark" || saved === "system"
      ? saved
      : "system";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.appearancePreference = preference;
  } catch {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = systemDark ? "dark" : "light";
    document.documentElement.dataset.appearancePreference = "system";
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceBootstrap }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
