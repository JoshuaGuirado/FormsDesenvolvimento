"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./HeroSelect.module.css";

type HeroSelectProps = {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

/**
 * Dropdown grande do topo da página (escolha da vaga). Não usa o <select> nativo
 * porque no Mac a lista abre com o tamanho da fonte do campo e cobre a tela toda.
 */
export default function HeroSelect({ label, placeholder, options, value, invalid, onChange }: HeroSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  // Ao abrir, o foco vai para a opção marcada (ou a primeira).
  useEffect(() => {
    if (open) optionRefs.current[Math.max(0, options.indexOf(value))]?.focus();
  }, [open, options, value]);

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const index = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    const move = (to: number) => {
      event.preventDefault();
      optionRefs.current[(to + options.length) % options.length]?.focus();
    };
    if (event.key === "ArrowDown") move(index + 1);
    else if (event.key === "ArrowUp") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(options.length - 1);
    else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "Tab") setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${value ? "" : styles.empty} ${invalid ? styles.invalid : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={value ? `${label}: ${value}` : label}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={styles.value}>{value || placeholder}</span>
        <svg className={styles.chevron} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div id={listId} role="listbox" aria-label={label} className={styles.list} onKeyDown={onListKeyDown}>
          {options.map((option, index) => (
            <button
              key={option}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="option"
              aria-selected={option === value}
              className={`${styles.option} ${option === value ? styles.selected : ""}`}
              onClick={() => choose(option)}
            >
              {option}
              {option === value && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
