"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import Button from "@/components/Button/Button";
import fieldStyles from "@/components/FormField/FormField.module.css";
import styles from "./Admin.module.css";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className={styles.loginForm}>
      <label htmlFor="password" className={fieldStyles.label}>
        Senha
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className={fieldStyles.input}
        aria-invalid={Boolean(state?.error)}
      />
      {state?.error && (
        <p className={fieldStyles.error} role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" isLoading={pending} loadingText="Entrando...">
        Entrar
      </Button>
    </form>
  );
}
