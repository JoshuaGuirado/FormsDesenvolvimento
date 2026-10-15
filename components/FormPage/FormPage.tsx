import BriefingAnimation from "@/components/BriefingAnimation/BriefingAnimation";
import BriefingForm from "@/components/BriefingForm/BriefingForm";
import Footer from "@/components/Footer/Footer";
import { FORMS, type FormId } from "@/lib/forms";
import logo from "@/public/images/logo-linka.png";
import styles from "./FormPage.module.css";

/** Página pública de um formulário (/formsbriefing ou /formsseletivo). */
export default function FormPage({ formId }: { formId: FormId }) {
  const { page } = FORMS[formId];

  return (
    <>
      <main className={styles.main}>
        <div className={styles.glow} aria-hidden />
        <header className={styles.header}>
          <img src={logo.src} alt="Linka Mídia" className={styles.logo} />
          <h1 className={styles.title}>
            {page.title} <span className={styles.purple}>{page.highlight}</span>
          </h1>
          <p className={styles.subtitle}>{page.subtitle}</p>
          <p className={styles.intro}>{page.intro}</p>
          <p className={styles.meta}>
            <span>{page.time}</span>
            <span>Seu progresso fica salvo neste navegador</span>
          </p>
        </header>
        <BriefingForm formId={formId} />
        {formId === "briefing" && (
          <section className={styles.journey} aria-label="Como funciona">
            <p className={styles.eyebrow}>Como funciona</p>
            <h2 className={styles.journeyTitle}>
              Do briefing à página <span className={styles.purple}>no ar</span>
            </h2>
            <BriefingAnimation />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
