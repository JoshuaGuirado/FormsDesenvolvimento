import BriefingAnimation from "@/components/BriefingAnimation/BriefingAnimation";
import BriefingForm from "@/components/BriefingForm/BriefingForm";
import Footer from "@/components/Footer/Footer";
import type { FormId } from "@/lib/forms";
import styles from "./FormPage.module.css";

/** Página pública de um formulário (/forms/briefing ou /forms/seletivo). */
export default function FormPage({ formId }: { formId: FormId }) {
  // O topo (logo, título e textos) é desenhado pelo BriefingForm, porque no
  // processo seletivo ele traz a escolha da vaga.
  return (
    <>
      <main className={styles.main}>
        <div className={styles.glow} aria-hidden />
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
