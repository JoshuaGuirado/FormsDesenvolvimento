"use client";

import { removeBriefing } from "@/app/admin/actions";
import styles from "./Admin.module.css";

type DeleteButtonProps = { id: string; form: string; label: string; confirmText: string };

export default function DeleteButton({ id, form, label, confirmText }: DeleteButtonProps) {
  return (
    <form
      action={removeBriefing}
      onSubmit={(event) => {
        if (!confirm(confirmText)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="form" value={form} />
      <button type="submit" className={styles.dangerButton}>
        {label}
      </button>
    </form>
  );
}
