"use client";

import { useEffect, useRef, useState } from "react";
import type { WeekCount } from "@/lib/stats";
import styles from "./Admin.module.css";

const WIDTH = 640;
const HEIGHT = 200;
const PAD = { top: 20, right: 8, bottom: 28, left: 28 };
const BAR = 24;

type WeeklyChartProps = { weeks: WeekCount[]; noun: string; nounPlural: string };

/** Respostas recebidas por semana (colunas). */
export default function WeeklyChart({ weeks, noun, nounPlural }: WeeklyChartProps) {
  const plural = (n: number) => `${n} ${n === 1 ? noun : nounPlural}`;
  const [active, setActive] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // No celular o gráfico rola na horizontal: começa mostrando as semanas mais recentes.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);
  const max = Math.max(1, ...weeks.map((week) => week.count));
  // Eixo só com números inteiros: 0, metade e topo.
  const top = Math.max(2, Math.ceil(max / 2) * 2);
  const ticks = [0, top / 2, top];

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotW / weeks.length;
  const y = (value: number) => PAD.top + plotH - (value / top) * plotH;
  const peak = weeks.reduce((best, week, i) => (week.count > weeks[best].count ? i : best), 0);
  const last = weeks.length - 1;

  const barPath = (x: number, h: number) => {
    const r = Math.min(4, h);
    const base = PAD.top + plotH;
    return `M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + BAR - r} Q${x + BAR},${base - h} ${x + BAR},${base - h + r} V${base} Z`;
  };

  return (
    <div>
      <div className={styles.chartScroll} ref={scroller}>
        <div className={styles.chartWrap}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.chart} role="img" aria-label={`${nounPlural} por semana`}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className={styles.gridLine} />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className={styles.axisText}>
                  {tick}
                </text>
              </g>
            ))}
            {weeks.map((week, i) => {
              const x = PAD.left + i * slot + (slot - BAR) / 2;
              const h = (week.count / top) * plotH;
              const showValue = week.count > 0 && (i === peak || i === last);
              return (
                <g
                  key={week.start}
                  tabIndex={0}
                  role="img"
                  aria-label={`Semana de ${week.label}: ${plural(week.count)}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className={styles.barGroup}
                >
                  <rect x={PAD.left + i * slot} y={PAD.top} width={slot} height={plotH} fill="transparent" />
                  {h > 0 && <path d={barPath(x, h)} className={active === i ? styles.barActive : styles.bar} />}
                  {showValue && (
                    <text x={x + BAR / 2} y={y(week.count) - 6} textAnchor="middle" className={styles.valueText}>
                      {week.count}
                    </text>
                  )}
                  {i % 2 === last % 2 && (
                    <text x={x + BAR / 2} y={HEIGHT - 8} textAnchor="middle" className={styles.axisText}>
                      {week.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {active !== null && (
            <div
              className={styles.tooltip}
              style={{
                left: `${((PAD.left + active * slot + slot / 2) / WIDTH) * 100}%`,
                // Nas pontas o balão abre para dentro, para não ser cortado.
                transform: `translate(${active < 2 ? -15 : active > weeks.length - 3 ? -85 : -50}%, -100%)`,
              }}
              role="status"
            >
              <strong>{plural(weeks[active].count)}</strong>
              <span>semana de {weeks[active].label}</span>
            </div>
          )}
        </div>
      </div>
      <details className={styles.tableToggle}>
        <summary>Ver como tabela</summary>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Semana de</th>
              <th>{nounPlural.charAt(0).toUpperCase() + nounPlural.slice(1)}</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.start}>
                <td>{week.label}</td>
                <td>{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
