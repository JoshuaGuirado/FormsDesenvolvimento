import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { withBase } from "@/lib/base-path";
import styles from "./Admin.module.css";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <Link href="/admin" className={styles.brand}>
        <img src={withBase("/images/logo-linka.png")} alt="Linka Mídia" className={styles.headerLogo} />
        <span>Painel de formulários</span>
      </Link>
      <nav className={styles.nav}>
        <a href={withBase("/")} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
          Ver formulários
        </a>
        <form action={logout}>
          <button type="submit" className={styles.navButton}>
            Sair
          </button>
        </form>
      </nav>
    </header>
  );
}
