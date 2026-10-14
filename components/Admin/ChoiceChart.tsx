import type { ChoiceStat } from "@/lib/stats";
import styles from "./Admin.module.css";

/** Quantos clientes marcaram cada opção de uma pergunta (barras horizontais). */
export default function ChoiceChart({ stat }: { stat: ChoiceStat }) {
  const max = Math.max(1, ...stat.options.map((item) => item.count));

  return (
    <article className={styles.card}>
      <p className={styles.eyebrow}>{stat.section}</p>
      <h3 className={styles.cardTitle}>{stat.label}</h3>
      <p className={styles.muted}>
        {stat.answered} {stat.answered === 1 ? "cliente respondeu" : "clientes responderam"}
      </p>
      <ul className={styles.barList}>
        {stat.options.map((item) => {
          const percent = stat.answered ? Math.round((item.count / stat.answered) * 100) : 0;
          return (
            <li
              key={item.option}
              className={styles.barRow}
              tabIndex={0}
              title={`${item.option}: ${item.count} de ${stat.answered} (${percent}%)`}
            >
              <div className={styles.barRowHead}>
                <span className={styles.barLabel}>{item.option}</span>
                <span className={styles.barValue}>
                  {item.count} <span className={styles.muted}>· {percent}%</span>
                </span>
              </div>
              <div className={styles.barTrack}>
                {item.count > 0 && <div className={styles.barFill} style={{ width: `${(item.count / max) * 100}%` }} />}
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
