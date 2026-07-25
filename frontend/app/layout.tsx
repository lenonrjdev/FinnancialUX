import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whale Loans Dashboard",
  description: "Replica responsiva da dashboard Whale Loans",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
