import { redirect } from "next/navigation";
import LoginForm from "@/components/Admin/LoginForm";
import styles from "@/components/Admin/Admin.module.css";
import { isAuthenticated } from "@/lib/auth";
import { withBase } from "@/lib/base-path";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginCard}>
        <img src={withBase("/images/logo-linka.png")} alt="Linka Mídia" className={styles.loginLogo} />
        <h1 className={styles.loginTitle}>Painel de formulários</h1>
        <p className={styles.muted}>Acesso restrito à equipe da Linka.</p>
        <LoginForm />
      </div>
    </main>
  );
}
