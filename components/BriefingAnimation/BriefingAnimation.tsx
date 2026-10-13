"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

/* ============================================================
   Animação da jornada Linka: Briefing → Estrutura → Design → No ar
   - Cores em THEME, exemplo do cliente em DEMO.
   - Herda a fonte da página.
   - Pausa com o mouse em cima e quando sai da tela.
   ============================================================ */

const THEME = {
  accent: "#9272f1", // roxo Linka (botões, destaques, etapa ativa)
  accentSoft: "rgba(146,114,241,.16)",
  glow: "rgba(146,114,241,.45)",
  card: "#171717", // cards do site
  page: "#0B0B0D", // fundo da "página" dentro da janela
  field: "#232323", // inputs
  fieldBorder: "#313131",
  line: "#2A2A2A", // bordas e esqueletos
  ink: "#FFFFFF",
  muted: "#A1A1AA",
  faint: "#6E6E78",
  success: "#34D399",
  // gradiente do subtítulo "Chegou a hora de tirar a sua landing page do papel."
  gradient: "linear-gradient(90deg, #F6B85A 0%, #5FC9D8 50%, #9272f1 100%)",
};

const DEMO = {
  brand: "Café Aurora",
  domain: "cafeaurora.com.br",
  headline: ["O café que ", "acorda", " Maringá"],
  sub: "Grãos torrados toda semana, entregues na sua porta.",
  cta: "Pedir no WhatsApp",
  fields: [
    { label: "Nome completo", value: "Mariana Costa" },
    { label: "Nome da empresa ou marca", value: "Café Aurora" },
    { label: "E-mail", value: "mariana@cafeaurora.com.br" },
    { label: "WhatsApp", value: "(44) 99812-4470" },
  ],
  features: ["Torra semanal", "Entrega em 24 h", "Assinatura mensal"],
  leads: ["Mariana pediu 2 pacotes", "Lucas chamou no WhatsApp", "Novo assinante mensal"],
};

const STEPS = [
  { id: "briefing", label: "Briefing", dur: 5200, caption: "Você responde o briefing em 10 a 15 minutos." },
  { id: "estrutura", label: "Estrutura", dur: 3200, caption: "Suas respostas viram a estrutura estratégica da página." },
  { id: "design", label: "Design", dur: 3400, caption: "Sua marca, seu tom de voz e seu público em cada detalhe." },
  { id: "no-ar", label: "No ar", dur: 5000, caption: "Página no ar, trabalhando por resultados reais." },
];

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
const TYPE_SPEED = 34;

/* ---------- peças pequenas ---------- */

function Typed({ text, start = 0 }: { text: string; start?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    let t: ReturnType<typeof setTimeout> | undefined;
    const begin = setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < text.length) t = setTimeout(tick, TYPE_SPEED);
    }, start);
    return () => {
      clearTimeout(begin);
      clearTimeout(t);
    };
  }, [text, start]);
  const typing = n > 0 && n < text.length;
  return (
    <span>
      {text.slice(0, n)}
      {typing && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ display: "inline-block", width: "0.08em", height: "1em", background: THEME.accent, marginLeft: "0.08em", verticalAlign: "-0.15em" }}
        />
      )}
    </span>
  );
}

function Check({ delay }: { delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 20 20"
      width="1.05em"
      height="1.05em"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22, delay }}
      style={{ flex: "none" }}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill={THEME.accent} />
      <motion.path
        d="M5.5 10.5 L8.6 13.4 L14.5 7"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: delay + 0.1 }}
      />
    </motion.svg>
  );
}

function Percent({ duration, delay }: { duration: number; delay: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const controls = animate(0, 100, { duration, delay, ease: "easeInOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => controls.stop();
  }, [duration, delay]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}%</span>;
}

/* Esqueleto cinza no modo estrutura, conteúdo real no modo design. */
type SlotProps = { wire: boolean; delay?: number; w?: string; h?: string; children: ReactNode; style?: CSSProperties };

function Slot({ wire, delay = 0, w = "100%", h = "0.9em", children, style }: SlotProps) {
  return (
    <div style={{ position: "relative", ...style }}>
      <motion.div
        initial={false}
        animate={{ opacity: wire ? 0 : 1, y: wire ? 6 : 0 }}
        transition={{ duration: 0.5, delay: wire ? 0 : delay, ease: EASE }}
      >
        {children}
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: wire ? 1 : 0 }}
        transition={{ duration: 0.4, delay: wire ? 0 : delay }}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", width: w, pointerEvents: "none" }}
      >
        <div style={{ width: "100%", height: h, borderRadius: 4, background: THEME.line }} />
      </motion.div>
    </div>
  );
}

type BlockProps = { wire: boolean; label: string; delay: number; children: ReactNode; style?: CSSProperties };

function Block({ wire, label, delay, children, style }: BlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, borderColor: wire ? "rgba(146,114,241,.55)" : "rgba(146,114,241,0)" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      style={{ position: "relative", border: "1px dashed", borderRadius: 12, ...style }}
    >
      <AnimatePresence>
        {wire && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: delay + 0.2 }}
            style={{ position: "absolute", top: "-0.75em", left: "0.7em", fontSize: "0.6em", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: THEME.accent, background: THEME.page, padding: "0 0.5em", zIndex: 1 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  );
}

/* ---------- cena 1: o formulário do site ---------- */

function BriefingScene() {
  // começo da digitação de cada campo (ms)
  const starts = [450, 1150, 1750, 2900];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{ position: "absolute", inset: 0, padding: "1.5em 1.9em", display: "flex", flexDirection: "column", gap: "0.85em" }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72em", fontWeight: 600 }}>
          <span style={{ color: THEME.ink }}>Etapa 1 de 8</span>
          <span style={{ color: THEME.accent }}>
            <Percent duration={3.8} delay={0.4} />
          </span>
        </div>
        <div style={{ height: "0.28em", borderRadius: 99, background: THEME.line, overflow: "hidden", marginTop: "0.5em" }}>
          <motion.div
            initial={{ width: "4%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.8, delay: 0.4, ease: "easeInOut" }}
            style={{ height: "100%", background: THEME.accent, borderRadius: 99 }}
          />
        </div>
      </div>

      <div>
        <div style={{ fontSize: "0.6em", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: THEME.accent }}>Seção 1</div>
        <div style={{ fontSize: "1.45em", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, color: THEME.ink, marginTop: "0.2em" }}>
          Informações do <span style={{ color: THEME.accent }}>cliente</span>
        </div>
        <div style={{ fontSize: "0.72em", color: THEME.muted, marginTop: "0.3em" }}>Dados básicos de contato e identificação.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8em 0.9em" }}>
        {DEMO.fields.map((f, i) => {
          const doneAt = (starts[i] + f.value.length * TYPE_SPEED) / 1000;
          return (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, ease: EASE }}
              style={{ minWidth: 0 }}
            >
              <div style={{ fontSize: "0.7em", fontWeight: 600, color: THEME.ink, marginBottom: "0.4em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {f.label} <span style={{ color: THEME.accent }}>*</span>
              </div>
              <motion.div
                animate={{ borderColor: [THEME.fieldBorder, THEME.accent, THEME.fieldBorder] }}
                transition={{ duration: (doneAt - starts[i] / 1000) + 0.4, delay: starts[i] / 1000 - 0.1, times: [0, 0.15, 1] }}
                style={{ display: "flex", alignItems: "center", gap: "0.5em", background: THEME.field, border: `1px solid ${THEME.fieldBorder}`, borderRadius: 8, padding: "0.6em 0.7em", fontSize: "0.78em", color: THEME.ink, minHeight: "1.2em" }}
              >
                <div style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <Typed text={f.value} start={starts[i]} />
                </div>
                <Check delay={doneAt + 0.05} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", borderTop: `1px solid ${THEME.line}`, paddingTop: "0.9em", display: "flex", justifyContent: "flex-end" }}>
        <motion.div
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 1, scale: [1, 1, 1.06, 1] }}
          transition={{ duration: 0.8, delay: 4.2, times: [0, 0.2, 0.6, 1] }}
          style={{ background: THEME.accent, color: "#fff", fontWeight: 800, fontSize: "0.7em", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.8em 1.8em", borderRadius: 10, boxShadow: `0 0.6em 1.8em -0.5em ${THEME.glow}` }}
        >
          Continuar
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------- cenas 2 a 4: a landing page sendo construída ---------- */

function CupArt() {
  return (
    <svg viewBox="0 0 120 100" style={{ width: "62%", height: "auto" }} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${46 + i * 12} 30 q-6 -8 0 -16 q6 -8 0 -16`}
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ opacity: [0, 0.9, 0], y: [4, -4, -10] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
      <path d="M30 40 h56 v26 a24 24 0 0 1 -24 24 h-8 a24 24 0 0 1 -24 -24 z" fill="#fff" />
      <path d="M86 46 h6 a10 10 0 0 1 0 20 h-7" fill="none" stroke="#fff" strokeWidth="5" />
      <ellipse cx="58" cy="40" rx="28" ry="5" fill="#5a3a24" />
    </svg>
  );
}

function PageScene({ mode }: { mode: string }) {
  const wire = mode === "estrutura";
  const live = mode === "no-ar";
  const [clicked, setClicked] = useState(false);
  const [leads, setLeads] = useState<number[]>([]);

  useEffect(() => {
    if (!live) {
      setClicked(false);
      setLeads([]);
      return;
    }
    const timers = [
      setTimeout(() => setClicked(true), 1350),
      ...DEMO.leads.map((_, i) => setTimeout(() => setLeads((l) => [...l, i]), 1650 + i * 750)),
    ];
    return () => timers.forEach(clearTimeout);
  }, [live]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", inset: 0, padding: "1.1em 1.4em", display: "flex", flexDirection: "column", gap: "0.95em" }}
    >
      {/* brilho roxo do topo, igual ao hero do site */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: wire ? 0 : 1 }}
        transition={{ duration: 0.8, delay: wire ? 0 : 0.2 }}
        style={{ position: "absolute", left: "10%", right: "10%", top: "-30%", height: "70%", background: "radial-gradient(closest-side, rgba(146,114,241,.28), rgba(146,114,241,0))", pointerEvents: "none" }}
      />

      {/* menu */}
      <Block wire={wire} label="Menu" delay={0} style={{ padding: "0.5em 0.7em", display: "flex", alignItems: "center", gap: "0.8em" }}>
        <motion.div initial={false} animate={{ background: wire ? THEME.line : THEME.accent }} style={{ width: "1.1em", height: "1.1em", borderRadius: 6, flex: "none" }} />
        <Slot wire={wire} w="5em" delay={0.05} style={{ flex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: "0.82em", letterSpacing: "-0.02em", color: THEME.ink }}>{DEMO.brand}</span>
        </Slot>
        <motion.div initial={false} animate={{ background: wire ? THEME.line : "rgba(255,255,255,.08)", color: wire ? "rgba(0,0,0,0)" : THEME.ink }} style={{ fontSize: "0.62em", fontWeight: 600, padding: "0.45em 1em", borderRadius: 99, border: `1px solid ${THEME.line}` }}>
          Contato
        </motion.div>
      </Block>

      {/* hero */}
      <Block wire={wire} label="Hero" delay={0.12} style={{ padding: "0.9em", display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "1em", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55em", minWidth: 0 }}>
          <Slot wire={wire} h="1.3em" delay={0.1}>
            <div style={{ fontSize: "1.4em", fontWeight: 800, lineHeight: 1.05, color: THEME.ink, letterSpacing: "-0.035em" }}>
              {DEMO.headline[0]}
              <span style={{ color: THEME.accent }}>{DEMO.headline[1]}</span>
              {DEMO.headline[2]}
            </div>
          </Slot>
          <Slot wire={wire} w="85%" delay={0.2}>
            <div style={{ fontSize: "0.7em", color: THEME.muted, lineHeight: 1.45 }}>{DEMO.sub}</div>
          </Slot>
          <div style={{ position: "relative", alignSelf: "flex-start", marginTop: "0.35em" }}>
            <motion.div
              initial={false}
              animate={{
                background: wire ? THEME.line : THEME.accent,
                color: wire ? "rgba(0,0,0,0)" : "#fff",
                boxShadow: wire ? "0 0 0 0 rgba(0,0,0,0)" : `0 0.6em 1.6em -0.5em ${THEME.glow}`,
                scale: clicked ? [1, 0.92, 1.04, 1] : 1,
              }}
              transition={{ duration: 0.45, delay: wire ? 0 : 0.3 }}
              style={{ fontSize: "0.6em", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.85em 1.4em", borderRadius: 10, whiteSpace: "nowrap" }}
            >
              {DEMO.cta}
            </motion.div>
            <AnimatePresence>
              {clicked && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0.7 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  style={{ position: "absolute", inset: 0, borderRadius: 10, border: `2px solid ${THEME.accent}`, pointerEvents: "none" }}
                />
              )}
            </AnimatePresence>
            {live && (
              <motion.svg
                viewBox="0 0 24 24"
                width="1.6em"
                height="1.6em"
                initial={{ x: "9em", y: "4em", opacity: 0 }}
                animate={{ x: "5em", y: "0.9em", opacity: 1, scale: clicked ? [1, 0.8, 1] : 1 }}
                transition={{ duration: 1, delay: 0.2, ease: EASE, scale: { duration: 0.3 } }}
                style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.6))" }}
                aria-hidden="true"
              >
                <path d="M4 2 L4 19 L8.5 14.8 L11.6 21.5 L14.4 20.2 L11.4 13.6 L17.5 13.6 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
              </motion.svg>
            )}
          </div>
        </div>
        <div style={{ position: "relative", aspectRatio: "1 / 0.9", borderRadius: 12, background: THEME.card, overflow: "hidden", display: "grid", placeItems: "center" }}>
          <motion.div
            initial={false}
            animate={{ opacity: wire ? 0 : 1, clipPath: wire ? "inset(0 100% 0 0)" : "inset(0 0% 0 0)" }}
            transition={{ duration: 0.8, delay: wire ? 0 : 0.25, ease: EASE }}
            style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, #9272f1 0%, #C27BD8 45%, #F6B85A 100%)", display: "grid", placeItems: "center" }}
          >
            <CupArt />
          </motion.div>
          {wire && (
            <svg viewBox="0 0 10 10" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
              <path d="M0 0 L10 10 M10 0 L0 10" stroke={THEME.line} strokeWidth="0.08" />
            </svg>
          )}
        </div>
      </Block>

      {/* benefícios */}
      <Block wire={wire} label="Benefícios" delay={0.24} style={{ padding: "0.7em", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6em" }}>
        {DEMO.features.map((f, i) => (
          <div key={f} style={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 10, padding: "0.65em", display: "flex", flexDirection: "column", gap: "0.45em", minWidth: 0 }}>
            <motion.div
              initial={false}
              animate={{ background: wire ? THEME.line : THEME.accentSoft, color: wire ? "rgba(0,0,0,0)" : THEME.accent }}
              transition={{ delay: wire ? 0 : 0.35 + i * 0.1 }}
              style={{ width: "1.5em", height: "1.5em", borderRadius: 6, display: "grid", placeItems: "center", fontSize: "0.7em", fontWeight: 800 }}
            >
              {i + 1}
            </motion.div>
            <Slot wire={wire} w="80%" h="0.7em" delay={0.4 + i * 0.1}>
              <div style={{ fontSize: "0.64em", fontWeight: 700, color: THEME.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f}</div>
            </Slot>
          </div>
        ))}
      </Block>

      {/* leads chegando */}
      <div style={{ position: "absolute", top: "0.8em", right: "0.8em", display: "flex", flexDirection: "column", gap: "0.4em", width: "46%", pointerEvents: "none" }}>
        <AnimatePresence>
          {leads.map((i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{ display: "flex", alignItems: "center", gap: "0.55em", background: "#1C1C1F", border: `1px solid ${THEME.line}`, borderRadius: 10, padding: "0.5em 0.7em", boxShadow: "0 0.8em 2em -0.8em rgba(0,0,0,.9)" }}
            >
              <span style={{ width: "0.55em", height: "0.55em", borderRadius: "50%", background: THEME.success, boxShadow: `0 0 0.6em ${THEME.success}`, flex: "none" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.56em", fontWeight: 800, color: THEME.success, letterSpacing: "0.12em", textTransform: "uppercase" }}>Novo lead</div>
                <div style={{ fontSize: "0.66em", color: THEME.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{DEMO.leads[i]}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ---------- etapas (mesmo estilo do stepper do site) ---------- */

function Stepper({ step, fill, onSelect }: { step: number; fill: MotionValue<string>; onSelect: (i: number) => void }) {
  return (
    <div role="tablist" aria-label="Etapas" style={{ display: "grid", gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 8 }}>
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(i)}
            style={{ appearance: "none", background: "none", border: 0, padding: "4px 0", font: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0, color: "inherit" }}
          >
            <motion.span
              animate={{
                background: active ? THEME.accent : done ? THEME.accentSoft : "rgba(255,255,255,0)",
                borderColor: active || done ? THEME.accent : "#3A3A3A",
                color: active ? "#fff" : done ? THEME.accent : THEME.faint,
                boxShadow: active ? `0 0 0 6px ${THEME.accentSoft}` : "0 0 0 0px rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.3 }}
              style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}
            >
              {i + 1}
            </motion.span>
            <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? THEME.ink : THEME.faint, transition: "color .2s", whiteSpace: "nowrap" }}>{s.label}</span>
            <span style={{ width: "70%", height: 2, borderRadius: 99, background: THEME.line, overflow: "hidden" }}>
              <motion.span style={{ display: "block", height: "100%", background: THEME.accent, width: active ? fill : done ? "100%" : "0%" }} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- componente principal ---------- */

export default function BriefingAnimation() {
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const progress = useMotionValue(0);
  const stepRef = useRef(step);
  const pausedRef = useRef(false);
  stepRef.current = step;
  pausedRef.current = hover || !inView;

  // relógio: avança as etapas e alimenta as barrinhas
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current) {
        const p = progress.get() + dt / STEPS[stepRef.current].dur;
        if (p >= 1) {
          progress.set(0);
          setStep((s) => (s + 1) % STEPS.length);
        } else progress.set(p);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const goTo = (i: number) => {
    progress.set(0);
    setStep(i);
  };

  // inclinação 3D seguindo o mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });
  const glare = useTransform(mx, (x) => `radial-gradient(circle at ${50 + x * 70}% 0%, rgba(146,114,241,.22), rgba(146,114,241,0) 60%)`);
  const fill = useTransform(progress, (v) => `${v * 100}%`);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setHover(false);
  };

  const current = STEPS[step];
  const isForm = current.id === "briefing";
  const url = isForm ? "linkamidia.com.br/briefing" : DEMO.domain;

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} style={{ position: "relative", width: "100%", maxWidth: 680, marginInline: "auto", fontFamily: "inherit", color: THEME.ink }}>
        {/* brilho roxo atrás da janela */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: "8%", right: "8%", top: "6%", height: "70%", background: "radial-gradient(closest-side, rgba(146,114,241,.38), rgba(146,114,241,0))", filter: "blur(30px)", pointerEvents: "none" }}
        />

        <div onMouseMove={onMove} onMouseEnter={() => setHover(true)} onMouseLeave={onLeave} style={{ perspective: 1200, position: "relative" }}>
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              position: "relative",
              borderRadius: 24,
              background: THEME.card,
              border: `1px solid ${THEME.line}`,
              boxShadow: "0 3rem 5rem -2.5rem rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.02) inset",
              overflow: "hidden",
              containerType: "inline-size",
            }}
          >
            {/* barra do navegador */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#333" }} />
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, background: "#0F0F10", border: `1px solid ${THEME.line}`, borderRadius: 99, padding: "5px 14px", fontSize: 12, color: THEME.muted }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={url}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {url}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence>
                  {current.id === "no-ar" && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.success, fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        style={{ width: 7, height: 7, borderRadius: "50%", background: THEME.success }}
                      />
                      Publicado
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* área da página */}
            <div style={{ position: "relative", aspectRatio: "16 / 11", fontSize: "clamp(8px, 2.5cqw, 16px)", overflow: "hidden", background: isForm ? THEME.card : THEME.page, transition: "background .5s" }}>
              <AnimatePresence mode="wait">
                {isForm ? <BriefingScene key="briefing" /> : <PageScene key="page" mode={current.id} />}
              </AnimatePresence>
            </div>

            {/* reflexo roxo seguindo o mouse */}
            <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: glare, opacity: hover ? 1 : 0, pointerEvents: "none", transition: "opacity .3s" }} />
          </motion.div>
        </div>

        <div style={{ position: "relative", marginTop: 26 }}>
          <Stepper step={step} fill={fill} onSelect={goTo} />
        </div>

        <div style={{ position: "relative", minHeight: 28, marginTop: 16, textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
              style={{ margin: 0, fontSize: 18, fontWeight: 300, letterSpacing: "-0.01em", background: THEME.gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              {current.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
