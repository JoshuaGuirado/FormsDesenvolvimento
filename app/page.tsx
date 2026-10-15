import type { Metadata } from "next";
import Footer from "@/components/Footer/Footer";
import styles from "@/components/FormPage/FormPage.module.css";
import { FORM_IDS, FORMS } from "@/lib/forms";
import logo from "@/public/images/logo-linka.png";

export const metadata: Metadata = {
  title: "Formulários - Linka Mídia",
  description: "Escolha o formulário que você vai preencher.",
};

/** Tela inicial: a pessoa escolhe qual formulário vai preencher. */
export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.glow} aria-hidden />
        <header className={styles.header}>
          <img src={logo.src} alt="Linka Mídia" className={styles.logo} />
          <h1 className={styles.title}>
            Qual formulário você vai <span className={styles.purple}>preencher?</span>
          </h1>
          <p className={styles.subtitle}>Escolha uma das opções abaixo para começar.</p>
        </header>
        <nav className={styles.choices} aria-label="Formulários">
          {FORM_IDS.map((id, index) => {
            const form = FORMS[id];
            return (
              <a key={id} href={form.path} className={styles.choice}>
                <span className={styles.choiceNumber}>{index + 1}</span>
                <span className={styles.choiceBody}>
                  <span className={styles.choiceLabel}>{form.card.label}</span>
                  <span className={styles.choiceTitle}>
                    {form.card.title} <span className={styles.purple}>{form.card.highlight}</span>
                  </span>
                  <span className={styles.choiceText}>{form.card.description}</span>
                  <span className={styles.choiceTime}>{form.page.time.replace("Tempo estimado: ", "")}</span>
                </span>
                <span className={styles.choiceArrow} aria-hidden>
                  →
                </span>
              </a>
            );
          })}
        </nav>
      </main>
      <Footer />
    </>
  );
}
