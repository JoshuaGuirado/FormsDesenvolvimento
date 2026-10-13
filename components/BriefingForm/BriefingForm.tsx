"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/Button/Button";
import FormField from "@/components/FormField/FormField";
import { isVisible, steps, validateField, type Answers } from "@/lib/questions";
import { buildSections, buildText } from "@/lib/summary";
import styles from "./BriefingForm.module.css";

const DRAFT_KEY = "linka-briefing-rascunho";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5544998019947";
const REVIEW = steps.length;

type Status = "idle" | "sending" | "success" | "error";
type Draft = { answers: Answers; step: number; visited: number };

const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

export default function BriefingForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Rascunho salvo só neste navegador (arquivos não são salvos).
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as Draft | null;
      if (draft?.answers) {
        setAnswers(draft.answers);
        setStep(Math.min(draft.step, REVIEW));
        setVisited(Math.min(draft.visited, REVIEW));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || status === "success") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, step, visited } satisfies Draft));
    } catch {}
  }, [answers, step, visited, loaded, status]);

  const goTo = (target: number) => {
    setStep(target);
    setVisited((v) => Math.max(v, target));
    setErrors({});
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const update = (name: string, value: Answers[string]) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
    // O texto de "Outro" fica em `${campo}Outro`; o erro é exibido no campo principal.
    const fieldName = name.replace(/Outro$/, "");
    setErrors(({ [fieldName]: _, ...rest }) => rest);
  };

  const validateStep = (index: number) => {
    const found: Record<string, string> = {};
    for (const field of steps[index].fields) {
      const error = validateField(field, answers);
      if (error) found[field.name] = error;
    }
    return found;
  };

  const next = () => {
    const found = validateStep(step);
    if (Object.keys(found).length) {
      setErrors(found);
      const first = Object.keys(found)[0];
      document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    goTo(step + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < REVIEW) return next();

    const invalidStep = steps.findIndex((_, index) => Object.keys(validateStep(index)).length > 0);
    if (invalidStep >= 0) {
      goTo(invalidStep);
      setErrors(validateStep(invalidStep));
      return;
    }

    setStatus("sending");
    const body = new FormData();
    body.append("answers", JSON.stringify(answers));
    body.append("website", String(new FormData(event.currentTarget as HTMLFormElement).get("website") ?? ""));
    files.forEach((file) => body.append("arquivos", file));

    try {
      const response = await fetch("/api/briefing", { method: "POST", body });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Não conseguimos enviar o briefing agora.");
      setStatus("success");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setStatus("error");
      setMessage((error as Error).message || "Não conseguimos enviar o briefing agora.");
    }
  };

  if (status === "success") {
    const empresa = String(answers.empresa ?? "").trim();
    return (
      <div ref={topRef} className={`${styles.card} ${styles.done}`}>
        <div className={styles.doneIcon} aria-hidden>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className={styles.stepTitle}>
          Briefing <span className={styles.purple}>enviado!</span>
        </h2>
        <p className={styles.doneText}>
          Obrigado, {String(answers.nome ?? "").split(" ")[0]}! Recebemos todas as informações e a nossa equipe já vai
          começar a pensar na sua landing page. Em breve entraremos em contato.
        </p>
        <Button href={whatsappLink(`Olá, Linka! Acabei de enviar o briefing da landing page${empresa ? ` da ${empresa}` : ""}.`)}>
          Avisar no WhatsApp
        </Button>
      </div>
    );
  }

  const progress = Math.round((Math.min(step, REVIEW) / REVIEW) * 100);
  const current = steps[step];

  return (
    <div ref={topRef} className={styles.wrapper}>
      <nav className={styles.stepper} aria-label="Etapas do briefing">
        <div className={styles.progressInfo}>
          <span>{step < REVIEW ? `Etapa ${step + 1} de ${steps.length}` : "Revisão final"}</span>
          <span className={styles.purple}>{progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${Math.max(progress, 4)}%` }} />
        </div>
        <ol className={styles.stepList}>
          {[...steps.map((s) => `${s.title} ${s.highlight}`.trim()), "Revisão"].map((name, index) => (
            <li key={name}>
              <button
                type="button"
                className={`${styles.stepDot} ${index === step ? styles.active : ""} ${index < step ? styles.complete : ""}`}
                disabled={index > visited || status === "sending"}
                onClick={() => goTo(index)}
                aria-current={index === step ? "step" : undefined}
              >
                <span className={styles.dotNumber}>{index + 1}</span>
                <span className={styles.dotLabel}>{name}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <form className={styles.card} onSubmit={submit} noValidate>
        <div className={styles.honeypot} aria-hidden>
          <label>
            Não preencha este campo
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {current ? (
          <>
            <header className={styles.stepHeader}>
              <p className={styles.eyebrow}>Seção {step + 1}</p>
              <h2 className={styles.stepTitle}>
                {current.title} <span className={styles.purple}>{current.highlight}</span>
              </h2>
              <p className={styles.stepDescription}>{current.description}</p>
            </header>
            <div className={styles.fields}>
              {current.fields
                .filter((field) => isVisible(field, answers))
                .map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    answers={answers}
                    error={errors[field.name]}
                    files={files}
                    onChange={update}
                    onFilesChange={setFiles}
                  />
                ))}
            </div>
          </>
        ) : (
          <Review answers={answers} files={files} onEdit={goTo} />
        )}

        {status === "error" && (
          <div className={styles.alert} role="alert">
            <p>
              <strong>{message}</strong> Verifique sua conexão e tente novamente. Se preferir, envie as respostas pelo
              WhatsApp (os arquivos precisarão ser enviados à parte).
            </p>
            <a
              className={styles.alertLink}
              href={whatsappLink(`Olá, Linka! Segue o briefing da minha landing page:\n\n${buildText(answers, files.map((f) => f.name))}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enviar pelo WhatsApp
            </a>
          </div>
        )}

        <div className={styles.actions}>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => goTo(step - 1)}>
              Voltar
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" isLoading={status === "sending"}>
            {step < REVIEW - 1 ? "Continuar" : step === REVIEW - 1 ? "Revisar respostas" : "Enviar briefing"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Review({ answers, files, onEdit }: { answers: Answers; files: File[]; onEdit: (step: number) => void }) {
  const sections = buildSections(answers);

  return (
    <>
      <header className={styles.stepHeader}>
        <p className={styles.eyebrow}>Quase lá</p>
        <h2 className={styles.stepTitle}>
          Revise suas <span className={styles.purple}>respostas</span>
        </h2>
        <p className={styles.stepDescription}>Confira se está tudo certo antes de enviar para a nossa equipe.</p>
      </header>
      <div className={styles.review}>
        {steps.map((step, index) => {
          const title = `${step.title} ${step.highlight}`.trim();
          const section = sections.find((s) => s.title === title);
          const stepFiles = step.fields.some((f) => f.type === "files") ? files : [];
          return (
            <section key={step.id} className={styles.reviewSection}>
              <div className={styles.reviewHeader}>
                <h3>{title}</h3>
                <button type="button" className={styles.editButton} onClick={() => onEdit(index)}>
                  Editar
                </button>
              </div>
              {section || stepFiles.length ? (
                <dl>
                  {section?.lines.map((line) => (
                    <div key={line.label} className={styles.reviewLine}>
                      <dt>{line.label}</dt>
                      <dd>{line.value}</dd>
                    </div>
                  ))}
                  {stepFiles.length > 0 && (
                    <div className={styles.reviewLine}>
                      <dt>Arquivos anexados</dt>
                      <dd>{stepFiles.map((f) => f.name).join("\n")}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className={styles.reviewEmpty}>Nenhuma resposta nesta seção.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
