import BriefingForm from "@/components/BriefingForm/BriefingForm";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.glow} aria-hidden />
        <header className={styles.header}>
          <img src="/images/logo-linka.png" alt="Linka Mídia" className={styles.logo} />
          <h1 className={styles.title}>
            Briefing de <span className={styles.purple}>Landing Page</span>
          </h1>
          <p className={styles.subtitle}>Chegou a hora de tirar a sua landing page do papel.</p>
          <p className={styles.intro}>
            Preencha as informações abaixo com atenção e carinho para que a nossa equipe consiga desenvolver uma página
            estratégica, alinhada aos objetivos da sua empresa e preparada para gerar mais resultados reais. Quanto mais
            detalhes você compartilhar, mais assertiva será a estrutura da página, tanto no design quanto na comunicação
            e na conversão.
          </p>
          <p className={styles.meta}>
            <span>Tempo estimado: 10 a 15 minutos</span>
            <span>Seu progresso fica salvo neste navegador</span>
          </p>
        </header>
        <BriefingForm />
      </main>
      <Footer />
    </>
  );
}
