import Link from "next/link";
import AdminHeader from "@/components/Admin/AdminHeader";
import BriefingTable from "@/components/Admin/BriefingTable";
import ChoiceChart from "@/components/Admin/ChoiceChart";
import WeeklyChart from "@/components/Admin/WeeklyChart";
import styles from "@/components/Admin/Admin.module.css";
import { requireAdmin } from "@/lib/auth";
import { listBriefings, type Briefing } from "@/lib/briefings";
import { FORM_IDS, FORMS, toFormId } from "@/lib/forms";
import { buildStats } from "@/lib/stats";
import { explainSupabaseError, supabaseConfigProblem } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ form?: string }> }) {
  await requireAdmin();
  const formId = toFormId((await searchParams).form);
  const form = FORMS[formId];

  let all: Briefing[] = [];
  let problem = supabaseConfigProblem();
  if (!problem) {
    try {
      all = await listBriefings();
    } catch (error) {
      console.error("Erro ao carregar as respostas:", error);
      problem = explainSupabaseError(error);
    }
  }
  if (problem) {
    return (
      <>
        <AdminHeader />
        <main className={styles.main}>
          <div className={styles.card}>
            <h1 className={styles.cardTitle}>Não foi possível carregar as respostas</h1>
            <p className={styles.problem}>{problem}</p>
            <p className={styles.muted}>
              Depois de mudar uma variável na Vercel, faça o Redeploy em Deployments para ela valer.
            </p>
          </div>
        </main>
      </>
    );
  }

  const briefings = all.filter((b) => b.formulario === formId);
  const stats = buildStats(briefings, form.steps);
  const rows = briefings.map((b) => ({
    id: b.id,
    createdAt: b.created_at,
    title: form.title(b),
    subtitle: form.subtitle(b),
    email: b.email,
    whatsapp: b.whatsapp ?? "",
  }));

  return (
    <>
      <AdminHeader />
      <main className={styles.main}>
        <nav className={styles.tabs} aria-label="Formulários">
          {FORM_IDS.map((id) => (
            <Link
              key={id}
              href={`/admin?form=${id}`}
              className={`${styles.tab} ${id === formId ? styles.tabActive : ""}`}
              aria-current={id === formId ? "page" : undefined}
            >
              {id === "briefing" ? "Briefings" : "Processo seletivo"}
              <span className={styles.tabCount}>{all.filter((b) => b.formulario === id).length}</span>
            </Link>
          ))}
        </nav>

        <section className={styles.tiles} aria-label="Resumo">
          <div className={styles.tile}>
            <p className={styles.tileLabel}>
              {capitalize(form.nounPlural)} {formId === "briefing" ? "recebidos" : "recebidas"}
            </p>
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
          <h2 className={styles.cardTitle}>{capitalize(form.nounPlural)} por semana</h2>
          <p className={styles.muted}>Últimas 12 semanas</p>
          <WeeklyChart weeks={stats.weeks} noun={form.noun} nounPlural={form.nounPlural} />
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{capitalize(form.personPlural)}</h2>
          <p className={styles.muted}>Clique em um {form.person} para ver todas as respostas.</p>
          <BriefingTable
            rows={rows}
            searchLabel={`Buscar ${form.nounPlural}`}
            searchPlaceholder={
              formId === "briefing"
                ? "Buscar por empresa, nome, e-mail ou WhatsApp"
                : "Buscar por nome, cidade, e-mail ou WhatsApp"
            }
            emptyText={`Nenhum${formId === "briefing" ? "" : "a"} ${form.noun} recebid${formId === "briefing" ? "o" : "a"} ainda.`}
          />
        </section>

        {stats.total > 0 && stats.choices.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>
              Relatório das <span className={styles.purple}>respostas</span>
            </h2>
            <div className={styles.grid}>
              {stats.choices.map((stat) => (
                <ChoiceChart key={stat.name} stat={stat} person={form.person} personPlural={form.personPlural} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
