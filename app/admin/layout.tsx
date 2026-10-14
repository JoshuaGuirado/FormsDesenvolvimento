import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "@/components/Admin/Admin.module.css";

export const metadata: Metadata = {
  title: "Painel - Linka Mídia",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
