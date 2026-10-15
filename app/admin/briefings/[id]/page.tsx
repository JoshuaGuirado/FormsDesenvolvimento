import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import AdminHeader from "@/components/Admin/AdminHeader";
import DeleteButton from "@/components/Admin/DeleteButton";
import styles from "@/components/Admin/Admin.module.css";
import { requireAdmin } from "@/lib/auth";
import { fileLinks, getBriefing } from "@/lib/briefings";
import { FORMS } from "@/lib/forms";
import { buildSections } from "@/lib/summary";

export const dynamic = "force-dynamic";

/** Deixa os links digitados pelo cliente clicáveis. */
function linkify(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s,]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className={styles.link}>
        {part}
      </a>
    ) : (
      part
    ),
  );
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default async function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const briefing = await getBriefing(id);
  if (!briefing) notFound();

  const form = FORMS[briefing.formulario];
  const female = briefing.formulario === "seletivo";
  const title = form.title(briefing);
  const subtitle = form.subtitle(briefing);
  const sections = buildSections(form.steps, briefing.answers);
  const files = await fileLinks(briefing.arquivos).catch((error) => {
    console.error("Erro ao gerar links dos arquivos:", error);
    return briefing.arquivos.map((file) => ({ ...file, url: null }));
  });
  const phone = (briefing.whatsapp ?? "").replace(/\D/g, "");
  const whatsapp = phone ? `https://wa.me/${phone.length <= 11 ? `55${phone}` : phone}` : null;
  const date = new Date(briefing.created_at).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <>
      <AdminHeader />
      <main className={styles.main}>
        <Link href={`/admin?form=${form.id}`} className={styles.back}>
          ← Voltar para o painel
        </Link>

        <section className={styles.card}>
          <p className={styles.eyebrow}>
            {form.noun} {female ? "recebida" : "recebido"} em {date}
          </p>
          <h1 className={styles.detailTitle}>{title}</h1>
          {subtitle && <p className={styles.muted}>{subtitle}</p>}
          <div className={styles.actions}>
            <a href={`mailto:${briefing.email}`} className={styles.pill}>
              {briefing.email}
            </a>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={styles.pill}>
                WhatsApp {briefing.whatsapp}
              </a>
            )}
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.title} className={styles.card}>
            <h2 className={styles.cardTitle}>{section.title}</h2>
            <dl className={styles.answers}>
              {section.lines.map((line) => (
                <div key={line.label} className={styles.answer}>
                  <dt>{line.label}</dt>
                  <dd>{linkify(line.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Arquivos enviados</h2>
          {files.length === 0 ? (
            <p className={styles.muted}>O {form.person} não anexou arquivos.</p>
          ) : (
            <ul className={styles.files}>
              {files.map((file) => (
                <li key={file.path}>
                  {file.url ? (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      {file.name}
                    </a>
                  ) : (
                    <span>{file.name}</span>
                  )}
                  <span className={styles.muted}> · {formatSize(file.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className={styles.footerActions}>
          <DeleteButton
            id={briefing.id}
            form={form.id}
            label={`Excluir ${form.noun}`}
            confirmText={`Excluir ${female ? "a" : "o"} ${form.noun} de ${title}? As respostas e os arquivos serão apagados de vez.`}
          />
        </div>
      </main>
    </>
  );
}
