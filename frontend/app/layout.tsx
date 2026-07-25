import type { Metadata } from "next";
import { metadataContent } from "@/content/metadata";
import "./globals.css";

export const metadata: Metadata = metadataContent;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
