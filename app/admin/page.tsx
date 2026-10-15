import AdminHeader from "@/components/Admin/AdminHeader";
import BriefingTable from "@/components/Admin/BriefingTable";
import ChoiceChart from "@/components/Admin/ChoiceChart";
import WeeklyChart from "@/components/Admin/WeeklyChart";
import styles from "@/components/Admin/Admin.module.css";
import { requireAdmin } from "@/lib/auth";
import { listBriefings, type Briefing } from "@/lib/briefings";
import { buildStats } from "@/lib/stats";
import { explainSupabaseError, supabaseConfigProblem } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  let briefings: Briefing[] = [];
  let problem = supabaseConfigProblem();
  if (!problem) {
    try {
      briefings = await listBriefings();
    } catch (error) {
      console.error("Erro ao carregar os briefings:", error);
      problem = explainSupabaseError(error);
    }
  }
  if (problem) {
    return (
      <>
        <AdminHeader />
        <main className={styles.main}>
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Não foi possível carregar os briefings</h1>
            <p className={styles.problem}>{problem}</p>
            <p className={styles.muted}>
              Depois de mudar uma variável na Vercel, faça o Redeploy em Deployments para ela valer.
            </p>
          </div>
        </main>
      </>
    );
  }

  const stats = buildStats(briefings);
  const rows = briefings.map((b) => ({
    id: b.id,
    createdAt: b.created_at,
    empresa: b.empresa,
    nome: b.nome,
    email: b.email,
    whatsapp: b.whatsapp ?? "",
  }));

  return (
    <>
      <AdminHeader />
      <main className={styles.main}>
        <section className={styles.tiles} aria-label="Resumo">
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Briefings recebidos</p>
            <p className={styles.heroValue}>{stats.total}</p>
          </div>
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Últimos 7 dias</p>
            <p className={styles.tileValue}>{stats.last7}</p>
          </div>
          <div className={styles.tile}>
            <p className={styles.tileLabel}>Últimos 30 dias</p>
            <p className={styles.tileValue}>{stats.last30}</p>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Briefings por semana</h2>
          <p className={styles.muted}>Últimas 12 semanas</p>
          <WeeklyChart weeks={stats.weeks} />
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Clientes</h2>
          <p className={styles.muted}>Clique em um cliente para ver todas as respostas.</p>
          <BriefingTable rows={rows} />
        </section>

        {stats.total > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>
              Relatório das <span className={styles.purple}>respostas</span>
            </h2>
            <div className={styles.grid}>
              {stats.choices.map((stat) => (
                <ChoiceChart key={stat.name} stat={stat} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
