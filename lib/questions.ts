// Todas as perguntas do briefing ficam aqui. Para incluir, remover ou
// reordenar perguntas, edite apenas este arquivo: o formulário e o e-mail
// são montados a partir dele.

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "radio"
  | "checkbox"
  | "files"
  | "references";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  /** Inclui a opção "Outro" com um campo para descrever. */
  other?: boolean;
  /** Opções que não combinam com as demais (ex.: "Não tenho"): marcar uma desmarca o resto. */
  exclusive?: string[];
  /** Ocupa meia largura no desktop (dois campos lado a lado). */
  half?: boolean;
  /** Só aparece quando outro campo tem um destes valores. */
  showIf?: { field: string; values: string[] };
};

export type Step = {
  id: string;
  title: string;
  highlight: string;
  description: string;
  fields: Field[];
};

export const steps: Step[] = [
  {
    id: "cliente",
    title: "Informações do",
    highlight: "cliente",
    description: "Dados básicos de contato e identificação.",
    fields: [
      { name: "nome", label: "Nome completo", type: "text", required: true, half: true },
      { name: "empresa", label: "Nome da empresa ou marca", type: "text", required: true, half: true },
      { name: "email", label: "E-mail", type: "email", required: true, half: true, placeholder: "voce@empresa.com.br" },
      { name: "whatsapp", label: "WhatsApp", type: "tel", required: true, half: true, placeholder: "(44) 99999-9999" },
      { name: "siteAtual", label: "Você já tem um site? Se sim, qual é o link?", type: "url", placeholder: "https://" },
    ],
  },
  {
    id: "produto",
    title: "Sobre o produto",
    highlight: "ou serviço",
    description: "Nos conte mais sobre o que você oferece.",
    fields: [
      {
        name: "oQueVende",
        label: "O que você vende?",
        type: "checkbox",
        required: true,
        other: true,
        options: ["Produto físico", "Produto digital / infoproduto", "Serviço", "SaaS / Software"],
      },
      { name: "descricao", label: "Descreva seu produto ou serviço em poucas linhas", type: "textarea", required: true },
      { name: "beneficio", label: "Qual é o principal benefício para o cliente?", type: "textarea", required: true },
      { name: "preco", label: "Qual é o preço ou faixa de preço?", type: "text" },
      {
        name: "provaSocial",
        label: "Você tem prova social? (depoimentos, casos de sucesso, números)",
        type: "checkbox",
        required: true,
        options: [
          "Sim, tenho depoimentos em texto",
          "Sim, tenho depoimentos em vídeo",
          "Sim, tenho casos de sucesso",
          "Sim, tenho números e resultados comprovados",
          "Não tenho ainda",
        ],
        exclusive: ["Não tenho ainda"],
      },
    ],
  },
  {
    id: "objetivo",
    title: "Objetivo da",
    highlight: "landing page",
    description: "Qual é a missão desta página?",
    fields: [
      {
        name: "objetivo",
        label: "Quais são os objetivos desta landing page?",
        type: "checkbox",
        required: true,
        other: true,
        options: [
          "Capturar leads (nome e e-mail)",
          "Vender diretamente",
          "Agendar uma consulta ou reunião",
          "Inscrição em evento ou webinar",
          "Lançamento de produto",
        ],
      },
      {
        name: "acao",
        label: "Qual ação você quer que o visitante tome?",
        type: "text",
        required: true,
        placeholder: "Ex.: \"Quero meu orçamento grátis\"",
      },
      {
        name: "lpAtual",
        label: "Você já tem uma landing page? Se sim, compartilhe o link e diga o que não funciona",
        type: "textarea",
      },
      {
        name: "resultadoEsperado",
        label: "Qual resultado você espera alcançar com essa LP?",
        type: "textarea",
        placeholder: "Ex.: 100 leads por mês, 10% de conversão",
      },
    ],
  },
  {
    id: "publico",
    title: "",
    highlight: "Público-alvo",
    description: "Quanto melhor entendermos o seu cliente, melhor será a página.",
    fields: [
      {
        name: "clienteIdeal",
        label: "Quem é o seu cliente ideal? Descreva em detalhes (profissão, situação de vida, contexto)",
        type: "textarea",
        required: true,
      },
      {
        name: "faixaEtaria",
        label: "Faixa etária do público",
        type: "checkbox",
        required: true,
        options: ["18–24 anos", "25–34 anos", "35–44 anos", "45–54 anos", "55+ anos", "Variado"],
        exclusive: ["Variado"],
      },
      { name: "dores", label: "Quais são as principais dores e problemas do seu cliente?", type: "textarea", required: true },
      {
        name: "desejos",
        label: "O que ele deseja conquistar ou resolver com o seu produto/serviço?",
        type: "textarea",
        required: true,
      },
      { name: "porQueNaoResolveu", label: "Por que ele ainda não resolveu esse problema?", type: "textarea" },
      {
        name: "objecoes",
        label: "Quais objeções ele costuma ter antes de comprar?",
        type: "textarea",
        placeholder: "Ex.: \"é muito caro\", \"não tenho tempo\"",
      },
    ],
  },
  {
    id: "identidade",
    title: "Identidade",
    highlight: "visual",
    description: "Vamos garantir que a LP tenha a cara da sua marca.",
    fields: [
      {
        name: "temIdentidade",
        label: "Você já tem uma identidade visual definida?",
        type: "checkbox",
        required: true,
        options: [
          "Sim, tenho logo e manual de marca completo",
          "Sim, tenho logo mas sem manual definido",
          "Tenho apenas algumas referências de estilo",
          "Não tenho identidade visual ainda",
        ],
        exclusive: ["Não tenho identidade visual ainda"],
      },
      {
        name: "arquivosMarca",
        label: "Envie seu logo, manual de marca e outros arquivos",
        type: "files",
        help: "PDF, PNG, JPG, SVG, AI, EPS ou ZIP — até 4 MB no total.",
        showIf: {
          field: "temIdentidade",
          values: [
            "Sim, tenho logo e manual de marca completo",
            "Sim, tenho logo mas sem manual definido",
            "Tenho apenas algumas referências de estilo",
          ],
        },
      },
      {
        name: "linkArquivos",
        label: "Arquivos grandes, fotos ou vídeos? Cole aqui o link (Google Drive, WeTransfer, Dropbox...)",
        type: "url",
        placeholder: "https://",
        help: "Deixe o link com acesso liberado para qualquer pessoa.",
      },
      { name: "cores", label: "Quais são as cores principais da marca?", type: "text", placeholder: "Ex.: azul escuro #003366, branco" },
      {
        name: "referencias",
        label: "Links de sites ou LPs que você gosta como referência visual",
        type: "references",
        help: "Adicione até 6 sites e conte o que chamou sua atenção em cada um.",
      },
      {
        name: "estilo",
        label: "Como você descreveria o estilo visual desejado?",
        type: "checkbox",
        options: [
          "Moderno e tecnológico",
          "Minimalista e clean",
          "Colorido e vibrante",
          "Sóbrio e corporativo",
          "Descontraído e criativo",
          "Elegante e premium",
        ],
      },
    ],
  },
  {
    id: "conteudo",
    title: "Conteúdo e",
    highlight: "tom de voz",
    description: "Como você se comunica com o seu público?",
    fields: [
      {
        name: "tom",
        label: "Qual o tom de comunicação da marca?",
        type: "checkbox",
        required: true,
        options: [
          "Formal e profissional",
          "Amigável e próximo",
          "Descontraído e divertido",
          "Técnico e especializado",
          "Inspirador e motivacional",
        ],
      },
      {
        name: "textos",
        label: "Você tem textos prontos ou prefere que criemos?",
        type: "checkbox",
        required: true,
        options: [
          "Tenho textos prontos para usar",
          "Tenho rascunhos que precisam de ajuste",
          "Prefiro que vocês criem do zero",
          "Misto: tenho parte e precisam criar o restante",
        ],
      },
      {
        name: "fotos",
        label: "Você tem fotos ou imagens do produto/serviço?",
        type: "checkbox",
        required: true,
        options: [
          "Sim, tenho fotos profissionais",
          "Sim, mas são fotos amadoras / de celular",
          "Não tenho, precisarei de banco de imagens",
          "Tenho imagens mas precisam de edição",
        ],
      },
      {
        name: "video",
        label: "Você tem vídeo para incluir na LP? (VSL, depoimento, etc.) Se sim, compartilhe o link",
        type: "url",
        placeholder: "https://",
      },
      { name: "palavrasChave", label: "Tem palavras-chave, frases ou slogans que devem aparecer na LP?", type: "textarea" },
    ],
  },
  {
    id: "concorrencia",
    title: "",
    highlight: "Concorrência",
    description: "Nos ajude a entender o mercado em que você está inserido.",
    fields: [
      { name: "concorrentes", label: "Quem são seus principais concorrentes? (links dos sites)", type: "textarea" },
      { name: "diferencial", label: "O que te diferencia dos seus concorrentes?", type: "textarea", required: true },
      {
        name: "concorrenteReferencia",
        label: "Tem algum concorrente que você admira como referência de comunicação ou design?",
        type: "text",
      },
    ],
  },
  {
    id: "tecnico",
    title: "Informações",
    highlight: "técnicas",
    description: "Informações para garantir que tudo funcione perfeitamente.",
    fields: [
      {
        name: "dominio",
        label: "Você tem domínio próprio?",
        type: "checkbox",
        options: ["Sim, já tenho domínio registrado", "Sim, mas preciso configurar", "Não, precisarei contratar", "Não sei"],
        exclusive: ["Não sei"],
      },
      {
        name: "pixels",
        label: "Precisa de pixel de rastreamento?",
        type: "checkbox",
        options: ["Meta Ads (Facebook/Instagram)", "Google Ads / Google Analytics", "TikTok Ads", "LinkedIn Ads", "Não preciso / não sei"],
        exclusive: ["Não preciso / não sei"],
      },
    ],
  },
];

export type Reference = { url: string; nota: string };
export type Answers = Record<string, string | string[] | Reference[]>;

export const OTHER = "Outro";
/** Onde fica o texto digitado quando o cliente escolhe "Outro". */
export const otherKey = (name: string) => `${name}Outro`;

export const MAX_REFERENCES = 6;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ai", ".eps", ".zip"];

/** Opções marcadas de uma pergunta de múltipla escolha (aceita o formato antigo, de uma opção só). */
export function selectedOptions(value: Answers[string] | undefined): string[] {
  if (typeof value === "string") return value ? [value] : [];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function isVisible(field: Field, answers: Answers) {
  if (!field.showIf) return true;
  const { values } = field.showIf;
  return selectedOptions(answers[field.showIf.field]).some((option) => values.includes(option));
}

export function isFilled(value: Answers[string] | undefined) {
  if (!value) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (value.length === 0) return false;
  return typeof value[0] === "string" || (value as Reference[]).some((ref) => ref.url.trim() !== "");
}

/** Mensagem de erro do campo, ou null se estiver válido. Usado no navegador e no servidor. */
export function validateField(field: Field, answers: Answers): string | null {
  if (!isVisible(field, answers) || field.type === "files") return null;
  const value = answers[field.name];

  if (field.required && !isFilled(value)) {
    return field.type === "checkbox" || field.type === "radio" ? "Escolha pelo menos uma opção." : "Campo obrigatório.";
  }
  if (field.other && selectedOptions(value).includes(OTHER) && !String(answers[otherKey(field.name)] ?? "").trim()) {
    return "Descreva a opção \"Outro\".";
  }
  if (typeof value !== "string" || !value.trim()) return null;

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Informe um e-mail válido.";
  }
  if (field.type === "tel" && value.replace(/\D/g, "").length < 10) {
    return "Informe o número com DDD.";
  }
  return null;
}
