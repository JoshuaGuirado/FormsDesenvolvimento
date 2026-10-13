import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/aileron/latin-300.css";
import "@fontsource/aileron/latin-400.css";
import "@fontsource/aileron/latin-600.css";
import "@fontsource/aileron/latin-700.css";
import "@fontsource/aileron/latin-800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Briefing de Landing Page - Linka Mídia",
  description: "Chegou a hora de tirar a sua landing page do papel.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
