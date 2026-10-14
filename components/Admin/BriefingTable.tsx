"use client";

import Link from "next/link";
import { useState } from "react";
import fieldStyles from "@/components/FormField/FormField.module.css";
import styles from "./Admin.module.css";

export type BriefingRow = { id: string; createdAt: string; empresa: string; nome: string; email: string; whatsapp: string };

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

export default function BriefingTable({ rows }: { rows: BriefingRow[] }) {
  const [query, setQuery] = useState("");
  const term = normalize(query.trim());
  const filtered = term
    ? rows.filter((row) => normalize(`${row.empresa} ${row.nome} ${row.email} ${row.whatsapp}`).includes(term))
    : rows;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por empresa, nome, e-mail ou WhatsApp"
        aria-label="Buscar briefings"
        className={`${fieldStyles.input} ${styles.search}`}
      />
      {filtered.length === 0 ? (
        <p className={styles.empty}>{rows.length === 0 ? "Nenhum briefing recebido ainda." : "Nada encontrado para essa busca."}</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((row) => (
            <li key={row.id}>
              <Link href={`/admin/briefings/${row.id}`} className={styles.listItem}>
                <span className={styles.listMain}>
                  <strong>{row.empresa}</strong>
                  <span className={styles.muted}>{row.nome}</span>
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
