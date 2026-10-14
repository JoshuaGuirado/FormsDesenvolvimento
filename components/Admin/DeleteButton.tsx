"use client";

import { removeBriefing } from "@/app/admin/actions";
import styles from "./Admin.module.css";

export default function DeleteButton({ id, empresa }: { id: string; empresa: string }) {
  return (
    <form
      action={removeBriefing}
      onSubmit={(event) => {
        if (!confirm(`Excluir o briefing de ${empresa}? As respostas e os arquivos serão apagados de vez.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.dangerButton}>
        Excluir briefing
      </button>
    </form>
  );
}
