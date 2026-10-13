import nodemailer from "nodemailer";
import {
  ACCEPTED_EXTENSIONS,
  MAX_REFERENCES,
  MAX_UPLOAD_BYTES,
  OTHER,
  otherKey,
  steps,
  validateField,
  type Answers,
} from "@/lib/questions";
import { buildSections, buildText } from "@/lib/summary";

const MAX_TEXT = 5000;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string,
  );

const fail = (message: string, status = 400) => Response.json({ message }, { status });

/** Mantém só os campos conhecidos, no formato esperado. */
function sanitize(raw: unknown): Answers {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const answers: Answers = {};

  for (const field of steps.flatMap((step) => step.fields)) {
    const value = input[field.name];
    if (field.type === "checkbox" && Array.isArray(value)) {
      answers[field.name] = value.filter(
        (item): item is string => typeof item === "string" && !!field.options?.includes(item),
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

function buildHtml(answers: Answers, fileNames: string[], heading: string) {
  const sections = buildSections(answers)
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

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return fail("Não foi possível ler o formulário.");

  // Campo invisível: só robôs preenchem.
  if (String(form.get("website") ?? "").trim()) return Response.json({ message: "Briefing enviado." });

  let answers: Answers;
  try {
    answers = sanitize(JSON.parse(String(form.get("answers") ?? "{}")));
  } catch {
    return fail("Não foi possível ler as respostas.");
  }

  for (const field of steps.flatMap((step) => step.fields)) {
    const error = validateField(field, answers);
    if (error) return fail(`${field.label}: ${error}`);
  }

  const files = form.getAll("arquivos").filter((item): item is File => item instanceof File && item.size > 0);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) return fail("Os arquivos passam de 4 MB. Envie um link do Drive no lugar.");
  const invalid = files.find((file) => !ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)));
  if (invalid) return fail(`O arquivo "${invalid.name}" não é de um formato aceito.`);

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, BRIEFING_TO, SEND_CLIENT_COPY } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Variáveis SMTP não configuradas.");
    return fail("O envio por e-mail não está configurado.", 500);
  }

  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const fileNames = files.map((file) => file.name);
  const empresa = String(answers.empresa);
  const nome = String(answers.nome);
  const email = String(answers.email).trim();

  try {
    await transporter.sendMail({
      from: `"Briefing Linka Mídia" <${SMTP_USER}>`,
      to: BRIEFING_TO || "contato@linkamidia.com.br",
      replyTo: `"${nome.replace(/"/g, "")}" <${email}>`,
      subject: `Novo briefing de landing page: ${empresa}`,
      text: buildText(answers, fileNames).replace(/\*/g, ""),
      html: buildHtml(answers, fileNames, `Novo briefing: ${empresa}`),
      attachments: await Promise.all(
        files.map(async (file) => ({ filename: file.name, content: Buffer.from(await file.arrayBuffer()) })),
      ),
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return fail("Não conseguimos enviar o briefing agora.", 502);
  }

  if (SEND_CLIENT_COPY === "true") {
    await transporter
      .sendMail({
        from: `"Linka Mídia" <${SMTP_USER}>`,
        to: email,
        subject: "Recebemos o seu briefing — Linka Mídia",
        text: `Olá, ${nome}!\n\nRecebemos o briefing da landing page da ${empresa}. Nossa equipe vai analisar as informações e entrar em contato em breve.\n\nUma cópia das suas respostas está abaixo.\n\n${buildText(answers, fileNames).replace(/\*/g, "")}\n\nLinka Mídia`,
        html: `<p style="font-family:Arial,sans-serif;max-width:640px;margin:24px auto 0;padding:0 24px;font-size:15px">
                 Olá, ${escapeHtml(nome)}! Recebemos o briefing da landing page da ${escapeHtml(empresa)}.
                 Nossa equipe vai analisar as informações e entrar em contato em breve. Uma cópia das suas respostas está abaixo.
               </p>${buildHtml(answers, fileNames, "Suas respostas")}`,
      })
      .catch((error) => console.error("Erro ao enviar cópia ao cliente:", error));
  }

  return Response.json({ message: "Briefing enviado." });
}
