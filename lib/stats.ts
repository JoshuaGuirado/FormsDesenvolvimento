// Números do relatório do painel, calculados a partir dos briefings salvos.
import type { Briefing } from "./briefings";
import { isVisible, OTHER, selectedOptions, type Step } from "./questions";

const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 12;

export type WeekCount = { start: string; label: string; count: number };
export type OptionCount = { option: string; count: number };
export type ChoiceStat = { name: string; label: string; section: string; answered: number; options: OptionCount[] };

const shortDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

/** Segunda-feira 00:00 (UTC) da semana da data. */
function weekStart(date: Date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day;
}

export function buildStats(briefings: Briefing[], steps: Step[]) {
  const now = Date.now();
  const since = (days: number) => briefings.filter((b) => now - new Date(b.created_at).getTime() <= days * DAY).length;

  const firstWeek = weekStart(new Date(now - (WEEKS - 1) * 7 * DAY));
  const weeks: WeekCount[] = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(firstWeek.getTime() + i * 7 * DAY);
    return { start: start.toISOString(), label: shortDate(start), count: 0 };
  });
  for (const briefing of briefings) {
    const index = Math.floor((new Date(briefing.created_at).getTime() - firstWeek.getTime()) / (7 * DAY));
    if (index >= 0 && index < WEEKS) weeks[index].count += 1;
  }

  const choices: ChoiceStat[] = steps.flatMap((step) =>
    step.fields
      .filter((field) => field.type === "checkbox" || field.type === "radio")
      .map((field) => {
        const options = [...(field.options ?? []), ...(field.other ? [OTHER] : [])];
        const counts = new Map(options.map((option) => [option, 0]));
        let answered = 0;
        for (const briefing of briefings) {
          if (!isVisible(field, briefing.answers)) continue;
          const selected = selectedOptions(briefing.answers[field.name]);
          if (selected.length === 0) continue;
          answered += 1;
          for (const option of selected) counts.set(option, (counts.get(option) ?? 0) + 1);
        }
        return {
          name: field.name,
          label: field.label,
          section: `${step.title} ${step.highlight}`.trim(),
          answered,
          options: [...counts].map(([option, count]) => ({ option, count })).sort((a, b) => b.count - a.count),
        };
      }),
  );

  return { total: briefings.length, last7: since(7), last30: since(30), weeks, choices };
}
