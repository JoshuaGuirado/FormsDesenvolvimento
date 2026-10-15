"use client";

import Link from "next/link";
import { useState } from "react";
import fieldStyles from "@/components/FormField/FormField.module.css";
import styles from "./Admin.module.css";

export type BriefingRow = { id: string; createdAt: string; title: string; subtitle: string; email: string; whatsapp: string };

type BriefingTableProps = { rows: BriefingRow[]; searchLabel: string; searchPlaceholder: string; emptyText: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export default function BriefingTable({ rows, searchLabel, searchPlaceholder, emptyText }: BriefingTableProps) {
  const [query, setQuery] = useState("");
  const term = normalize(query.trim());
  const filtered = term
    ? rows.filter((row) => normalize(`${row.title} ${row.subtitle} ${row.email} ${row.whatsapp}`).includes(term))
    : rows;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchLabel}
        className={`${fieldStyles.input} ${styles.search}`}
      />
      {filtered.length === 0 ? (
        <p className={styles.empty}>{rows.length === 0 ? emptyText : "Nada encontrado para essa busca."}</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((row) => (
            <li key={row.id}>
              <Link href={`/admin/briefings/${row.id}`} className={styles.listItem}>
                <span className={styles.listMain}>
                  <strong>{row.title}</strong>
                  <span className={styles.muted}>{row.subtitle}</span>
                </span>
                <span className={styles.listContact}>
                  <span>{row.email}</span>
                  <span className={styles.muted}>{row.whatsapp}</span>
                </span>
                <span className={styles.listDate}>{formatDate(row.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
