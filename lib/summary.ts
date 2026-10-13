import { isFilled, isVisible, OTHER, otherKey, steps, type Answers, type Field, type Reference } from "./questions";

type Line = { label: string; value: string };
type Section = { title: string; lines: Line[] };

function formatValue(field: Field, answers: Answers): string {
  const value = answers[field.name];
  if (typeof value === "string") {
    if (field.other && value === OTHER) return `${OTHER}: ${String(answers[otherKey(field.name)] ?? "").trim()}`;
    return value.trim();
  }
  if (value.length > 0 && typeof value[0] === "object") {
    return (value as Reference[])
      .filter((ref) => ref.url.trim())
      .map((ref, i) => `${i + 1}. ${ref.url.trim()}${ref.nota.trim() ? ` — ${ref.nota.trim()}` : ""}`)
      .join("\n");
  }
  return (value as string[])
    .map((item) => (field.other && item === OTHER ? `${OTHER}: ${String(answers[otherKey(field.name)] ?? "").trim()}` : item))
    .join(", ");
}

/** Respostas agrupadas por etapa, só com o que foi preenchido. */
export function buildSections(answers: Answers): Section[] {
  return steps
    .map((step) => ({
      title: `${step.title} ${step.highlight}`.trim(),
      lines: step.fields
        .filter((field) => field.type !== "files" && isVisible(field, answers) && isFilled(answers[field.name]))
        .map((field) => ({ label: field.label, value: formatValue(field, answers) })),
    }))
    .filter((section) => section.lines.length > 0);
}

export function buildText(answers: Answers, fileNames: string[] = []): string {
  const sections = buildSections(answers).map(
    (section) =>
      `*${section.title.toUpperCase()}*\n` +
      section.lines.map((line) => `${line.label}${line.label.endsWith("?") ? "" : ":"}\n${line.value}`).join("\n\n"),
  );
  if (fileNames.length) sections.push(`*ARQUIVOS ANEXADOS*\n${fileNames.join("\n")}`);
  return sections.join("\n\n");
}
