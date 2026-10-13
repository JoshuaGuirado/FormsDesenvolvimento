import { isFilled, isVisible, steps, type Answers, type Reference } from "./questions";

type Line = { label: string; value: string };
type Section = { title: string; lines: Line[] };

function formatValue(value: Answers[string]): string {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().join("/");
    return value.trim();
  }
  if (value.length > 0 && typeof value[0] === "object") {
    return (value as Reference[])
      .filter((ref) => ref.url.trim())
      .map((ref, i) => `${i + 1}. ${ref.url.trim()}${ref.nota.trim() ? ` — ${ref.nota.trim()}` : ""}`)
      .join("\n");
  }
  return (value as string[]).join(", ");
}

/** Respostas agrupadas por etapa, só com o que foi preenchido. */
export function buildSections(answers: Answers): Section[] {
  return steps
    .map((step) => ({
      title: `${step.title} ${step.highlight}`,
      lines: step.fields
        .filter((field) => field.type !== "files" && isVisible(field, answers) && isFilled(answers[field.name]))
        .map((field) => ({ label: field.label, value: formatValue(answers[field.name]) })),
    }))
    .filter((section) => section.lines.length > 0);
}

export function buildText(answers: Answers, fileNames: string[] = []): string {
  const sections = buildSections(answers).map(
    (section) =>
      `*${section.title.toUpperCase()}*\n` +
      section.lines.map((line) => `${line.label}:\n${line.value}`).join("\n\n"),
  );
  if (fileNames.length) sections.push(`*ARQUIVOS ANEXADOS*\n${fileNames.join("\n")}`);
  return sections.join("\n\n");
}
