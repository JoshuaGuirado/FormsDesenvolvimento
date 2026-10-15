// Os formulários da plataforma. Cada um tem suas perguntas e seus textos;
// o banco, o e-mail e o painel são os mesmos para todos.
import { briefingSteps, type Answers, type Step } from "./questions";
import { seletivoSteps, vagaOf } from "./questions-seletivo";

export type FormId = "briefing" | "seletivo";

export type FormDef = {
  id: FormId;
  /** Endereço público do formulário. */
  path: string;
  steps: Step[];
  /** Rascunho salvo no navegador (o do briefing mantém a chave antiga para ninguém perder o progresso). */
  draftKey: string;
  /** "briefing" / "candidatura", usado nos textos do formulário e do painel. */
  noun: string;
  nounPlural: string;
  /** Quem responde: "cliente" / "candidato". */
  person: string;
  personPlural: string;
  page: {
    title: string;
    highlight: string;
    subtitle: string;
    intro: string;
    time: string;
    metaTitle: string;
  };
  /** Cartão da tela inicial. */
  card: { label: string; title: string; highlight: string; description: string };
  submitLabel: string;
  successTitle: [string, string];
  successText: (firstName: string) => string;
  whatsappDone: (answers: Answers) => string;
  whatsappFallback: (answers: Answers) => string;
  email: {
    from: string;
    subject: (answers: Answers) => string;
    heading: (answers: Answers) => string;
    clientSubject: string;
    clientIntro: (answers: Answers) => string;
  };
  /** Nome que aparece na lista e no topo das respostas no painel. */
  title: (row: { empresa: string | null; nome: string }) => string;
  subtitle: (row: { empresa: string | null; nome: string; answers: Answers }) => string;
};

const text = (answers: Answers, name: string) => String(answers[name] ?? "").trim();

export const FORMS: Record<FormId, FormDef> = {
  briefing: {
    id: "briefing",
    path: "/formsbriefing",
    steps: briefingSteps,
    draftKey: "linka-briefing-rascunho",
    noun: "briefing",
    nounPlural: "briefings",
    person: "cliente",
    personPlural: "clientes",
    page: {
      title: "Briefing de",
      highlight: "Landing Page",
      subtitle: "Chegou a hora de tirar a sua landing page do papel.",
      intro:
        "Preencha as informações abaixo com atenção e carinho para que a nossa equipe consiga desenvolver uma página estratégica, alinhada aos objetivos da sua empresa e preparada para gerar mais resultados reais. Quanto mais detalhes você compartilhar, mais assertiva será a estrutura da página, tanto no design quanto na comunicação e na conversão.",
      time: "Tempo estimado: 10 a 15 minutos",
      metaTitle: "Briefing de Landing Page - Linka Mídia",
    },
    card: {
      label: "Sou cliente",
      title: "Briefing de",
      highlight: "Landing Page",
      description: "Conte sobre o seu negócio para criarmos a sua landing page.",
    },
    submitLabel: "Enviar briefing",
    successTitle: ["Briefing", "enviado!"],
    successText: (firstName) =>
      `Obrigado, ${firstName}! Recebemos todas as informações e a nossa equipe já vai começar a pensar na sua landing page. Em breve entraremos em contato.`,
    whatsappDone: (answers) => {
      const empresa = text(answers, "empresa");
      return `Olá, Linka! Acabei de enviar o briefing da landing page${empresa ? ` da ${empresa}` : ""}.`;
    },
    whatsappFallback: () => "Olá, Linka! Segue o briefing da minha landing page:",
    email: {
      from: "Briefing Linka Mídia",
      subject: (answers) => `Novo briefing de landing page: ${text(answers, "empresa")}`,
      heading: (answers) => `Novo briefing: ${text(answers, "empresa")}`,
      clientSubject: "Recebemos o seu briefing — Linka Mídia",
      clientIntro: (answers) =>
        `Recebemos o briefing da landing page da ${text(answers, "empresa")}. Nossa equipe vai analisar as informações e entrar em contato em breve.`,
    },
    title: (row) => row.empresa || row.nome,
    subtitle: (row) => row.nome,
  },
  seletivo: {
    id: "seletivo",
    path: "/formsseletivo",
    steps: seletivoSteps,
    draftKey: "linka-seletivo-rascunho",
    noun: "candidatura",
    nounPlural: "candidaturas",
    person: "candidato",
    personPlural: "candidatos",
    page: {
      // O destaque do título é a escolha da vaga (campo "vaga" com header: true).
      title: "Processo seletivo:",
      highlight: "",
      subtitle: "Escolha acima a vaga que você quer se candidatar e responda ao formulário abaixo.",
      intro:
        "Pedimos que você responda todas as perguntas com muita honestidade, pois esta será uma boa ferramenta para podermos te conhecer. Além disso, é o que vai te possibilitar avançar para a próxima fase do processo seletivo.",
      time: "Tempo estimado: 20 a 30 minutos",
      metaTitle: "Processo seletivo - Linka Mídia",
    },
    card: {
      label: "Quero trabalhar na Linka",
      title: "Processo",
      highlight: "seletivo",
      description: "Candidate-se a uma das vagas abertas: tráfego, vídeo, conteúdo, marketing e design.",
    },
    submitLabel: "Enviar candidatura",
    successTitle: ["Candidatura", "enviada!"],
    successText: (firstName) =>
      `Obrigado, ${firstName}! Recebemos as suas respostas e o seu currículo. Nossa equipe vai analisar tudo com atenção e entrará em contato sobre a próxima fase do processo seletivo.`,
    whatsappDone: (answers) =>
      `Olá, Linka! Acabei de enviar minha candidatura para a vaga de ${vagaOf(answers).name}.`,
    whatsappFallback: (answers) => `Olá, Linka! Segue minha candidatura para a vaga de ${vagaOf(answers).name}:`,
    email: {
      from: "Processo seletivo Linka Mídia",
      subject: (answers) => `Nova candidatura (${vagaOf(answers).name}): ${text(answers, "nome")}`,
      heading: (answers) => `${vagaOf(answers).name}: ${text(answers, "nome")}`,
      clientSubject: "Recebemos a sua candidatura — Linka Mídia",
      clientIntro: (answers) =>
        `Recebemos a sua candidatura para a vaga de ${vagaOf(answers).name}. Nossa equipe vai analisar as suas respostas e entrar em contato em breve.`,
    },
    title: (row) => row.nome,
    subtitle: (row) =>
      [
        vagaOf(row.answers).name,
        text(row.answers, "idade") && `${text(row.answers, "idade")} anos`,
        text(row.answers, "ondeMora"),
      ]
        .filter(Boolean)
        .join(" · "),
  },
};

export const FORM_IDS = Object.keys(FORMS) as FormId[];

/** Aceita só ids conhecidos; o que vier diferente (ou nada) vira briefing. */
export const toFormId = (value: unknown): FormId =>
  FORM_IDS.includes(value as FormId) ? (value as FormId) : "briefing";
