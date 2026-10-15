// Recebe o envio de um formulário: valida, salva no Supabase e manda por e-mail.
// Usado pelas rotas /formsbriefing/enviar, /formsseletivo/enviar e /api/briefing.
import nodemailer from "nodemailer";
import { FORMS, type FormId } from "@/lib/forms";
import {
  ACCEPTED_EXTENSIONS,
  MAX_REFERENCES,
  MAX_UPLOAD_BYTES,
  OTHER,
  otherKey,
  selectedOptions,
  validateField,
  type Answers,
  type Field,
} from "@/lib/questions";
import { saveBriefing } from "@/lib/briefings";
import { buildSections, buildText } from "@/lib/summary";
import { getSupabase } from "@/lib/supabase";

const MAX_TEXT = 5000;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string,
  );

const fail = (message: string, status = 400) => Response.json({ message }, { status });

/** Mantém só os campos conhecidos, no formato esperado. */
function sanitize(fields: Field[], raw: unknown): Answers {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const answers: Answers = {};

  for (const field of fields) {
    const value = input[field.name];
    if (field.type === "checkbox") {
      answers[field.name] = selectedOptions(value as Answers[string]).filter(
        (item) => field.options?.includes(item) || (field.other && item === OTHER),
      );
    } else if (field.type === "references" && Array.isArray(value)) {
      answers[field.name] = value.slice(0, MAX_REFERENCES).map((ref) => ({
        url: String(ref?.url ?? "").slice(0, 500),
        nota: String(ref?.nota ?? "").slice(0, 1000),
      }));
    } else if (field.type === "radio" && typeof value === "string") {
      if (field.options?.includes(value) || (field.other && value === OTHER)) answers[field.name] = value;
    } else if (typeof value === "string") {
      answers[field.name] = value.slice(0, MAX_TEXT);
    }
    const other = input[otherKey(field.name)];
    if (field.other && typeof other === "string") answers[otherKey(field.name)] = other.slice(0, MAX_TEXT);
  }
  return answers;
}

function buildHtml(formId: FormId, answers: Answers, fileNames: string[], heading: string) {
  const sections = buildSections(FORMS[formId].steps, answers)
    .map(
      (section) => `
        <h2 style="margin:32px 0 12px;font-size:18px;color:#9272f1;border-bottom:1px solid #e5e0f8;padding-bottom:8px">
          ${escapeHtml(section.title)}
        </h2>
        ${section.lines
          .map(
            (line) => `
              <p style="margin:0 0 4px;font-size:13px;color:#6b6b6b">${escapeHtml(line.label)}</p>
              <p style="margin:0 0 16px;font-size:15px;color:#161616">${escapeHtml(line.value).replace(/\n/g, "<br>")}</p>`,
          )
          .join("")}`,
    )
    .join("");

  const files = fileNames.length
    ? `<h2 style="margin:32px 0 12px;font-size:18px;color:#9272f1">Arquivos anexados</h2>
       <p style="font-size:15px;color:#161616">${fileNames.map(escapeHtml).join("<br>")}</p>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px">
      <div style="background:#000;border-radius:16px;padding:24px 28px;color:#fff">
        <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#9272f1">Linka Mídia</p>
        <h1 style="margin:8px 0 0;font-size:22px">${escapeHtml(heading)}</h1>
      </div>
      ${sections}
      ${files}
    </div>`;
}

export async function handleSubmission(request: Request, formId: FormId) {
  const form = FORMS[formId];
  const fields = form.steps.flatMap((step) => step.fields);
  const sent = () => Response.json({ message: form.successTitle.join(" ") });

  const data = await request.formData().catch(() => null);
  if (!data) return fail("Não foi possível ler o formulário.");

  // Campo invisível: só robôs preenchem.
  if (String(data.get("website") ?? "").trim()) return sent();

  let answers: Answers;
  try {
    answers = sanitize(fields, JSON.parse(String(data.get("answers") ?? "{}")));
  } catch {
    return fail("Não foi possível ler as respostas.");
  }

  // Sem campo de arquivos no formulário, nenhum arquivo é aceito.
  const filesField = fields.find((field) => field.type === "files");
  const files = filesField
    ? data.getAll("arquivos").filter((item): item is File => item instanceof File && item.size > 0)
    : [];

  for (const field of fields) {
    const error = validateField(field, answers, files.length);
    if (error) return fail(`${field.label}: ${error}`);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) return fail("Os arquivos passam de 4 MB. Envie um link no lugar.");
  const accepted = filesField?.accept ?? ACCEPTED_EXTENSIONS;
  const invalid = files.find((file) => !accepted.some((ext) => file.name.toLowerCase().endsWith(ext)));
  if (invalid) return fail(`O arquivo "${invalid.name}" não é de um formato aceito.`);

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, BRIEFING_TO, SEND_CLIENT_COPY } = process.env;
  const hasEmail = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
  const hasDatabase = Boolean(getSupabase());
  if (!hasEmail && !hasDatabase) {
    console.error("Nem SMTP nem Supabase estão configurados.");
    return fail(`O envio do ${form.noun} não está configurado.`, 500);
  }

  const failed = "Não conseguimos enviar as suas respostas agora.";

  // As respostas vão para o painel (Supabase) e para o e-mail. Basta um dos dois dar certo.
  let saved = false;
  if (hasDatabase) {
    try {
      await saveBriefing(formId, answers, files);
      saved = true;
    } catch (error) {
      console.error(`Erro ao salvar ${form.noun} no Supabase:`, error);
    }
  }

  if (!hasEmail) return saved ? sent() : fail(failed, 502);

  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const fileNames = files.map((file) => file.name);
  const nome = String(answers.nome);
  const email = String(answers.email).trim();
  const text = buildText(form.steps, answers, fileNames).replace(/\*/g, "");

  try {
    await transporter.sendMail({
      from: `"${form.email.from}" <${SMTP_USER}>`,
      to: BRIEFING_TO || "contato@linkamidia.com.br",
      replyTo: `"${nome.replace(/"/g, "")}" <${email}>`,
      subject: form.email.subject(answers),
      text,
      html: buildHtml(formId, answers, fileNames, form.email.heading(answers)),
      attachments: await Promise.all(
        files.map(async (file) => ({ filename: file.name, content: Buffer.from(await file.arrayBuffer()) })),
      ),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    if (!saved) return fail(failed, 502);
  }

  if (SEND_CLIENT_COPY === "true") {
    const intro = form.email.clientIntro(answers);
    await transporter
      .sendMail({
        from: `"Linka Mídia" <${SMTP_USER}>`,
        to: email,
        subject: form.email.clientSubject,
        text: `Olá, ${nome}!\n\n${intro}\n\nUma cópia das suas respostas está abaixo.\n\n${text}\n\nLinka Mídia`,
        html: `<p style="font-family:Arial,sans-serif;max-width:640px;margin:24px auto 0;padding:0 24px;font-size:15px">
                 Olá, ${escapeHtml(nome)}! ${escapeHtml(intro)} Uma cópia das suas respostas está abaixo.
               </p>${buildHtml(formId, answers, fileNames, "Suas respostas")}`,
      })
      .catch((error) => console.error("Erro ao enviar cópia:", error));
  }

  return sent();
}
