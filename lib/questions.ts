// Todas as perguntas do briefing ficam aqui. Para incluir, remover ou
// reordenar perguntas, edite apenas este arquivo: o formulário e o e-mail
// são montados a partir dele.

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "date"
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
    id: "contato",
    title: "Vamos nos",
    highlight: "conhecer",
    description: "Seus dados para conversarmos sobre o projeto.",
    fields: [
      { name: "nome", label: "Seu nome", type: "text", required: true, half: true, placeholder: "Nome e sobrenome" },
      { name: "empresa", label: "Nome da empresa", type: "text", required: true, half: true, placeholder: "Como a marca é conhecida" },
      { name: "email", label: "E-mail", type: "email", required: true, half: true, placeholder: "voce@empresa.com.br" },
      { name: "whatsapp", label: "WhatsApp", type: "tel", required: true, half: true, placeholder: "(44) 99999-9999" },
      { name: "cidade", label: "Cidade / estado", type: "text", half: true, placeholder: "Maringá - PR" },
      { name: "segmento", label: "Segmento de atuação", type: "text", half: true, placeholder: "Ex.: clínica odontológica" },
      { name: "siteAtual", label: "Site atual (se tiver)", type: "url", half: true, placeholder: "https://" },
      { name: "instagram", label: "Instagram", type: "text", half: true, placeholder: "@suaempresa" },
    ],
  },
  {
    id: "negocio",
    title: "Sobre o seu",
    highlight: "negócio",
    description: "Quanto mais entendermos a sua empresa, mais o site vai vender por você.",
    fields: [
      {
        name: "sobreEmpresa",
        label: "Conte um pouco sobre a empresa",
        type: "textarea",
        required: true,
        placeholder: "História, o que faz, há quanto tempo está no mercado...",
      },
      {
        name: "produtos",
        label: "Principais produtos ou serviços",
        type: "textarea",
        required: true,
        placeholder: "Liste os que devem aparecer no site, do mais importante para o menos",
      },
      {
        name: "publico",
        label: "Quem é o seu cliente ideal?",
        type: "textarea",
        required: true,
        placeholder: "Idade, região, profissão, o que ele procura, que problema você resolve para ele",
      },
      {
        name: "diferenciais",
        label: "Por que o cliente deve escolher você e não o concorrente?",
        type: "textarea",
        placeholder: "Diferenciais, prêmios, garantias, números (anos de mercado, clientes atendidos...)",
      },
      {
        name: "concorrentes",
        label: "Principais concorrentes",
        type: "textarea",
        placeholder: "Nomes ou sites dos concorrentes",
      },
    ],
  },
  {
    id: "projeto",
    title: "O seu",
    highlight: "projeto",
    description: "O que vamos construir e qual resultado ele precisa entregar.",
    fields: [
      {
        name: "tipoProjeto",
        label: "O que você precisa?",
        type: "radio",
        required: true,
        options: [
          "Landing page (página única focada em conversão)",
          "Site institucional (várias páginas)",
          "Site + landing pages de campanha",
          "Catálogo / loja virtual",
          "Ainda não sei, quero uma recomendação",
        ],
      },
      {
        name: "objetivos",
        label: "Qual o principal objetivo do site?",
        type: "checkbox",
        required: true,
        help: "Marque quantos quiser.",
        options: [
          "Gerar contatos no WhatsApp",
          "Captar leads por formulário",
          "Vender online",
          "Receber agendamentos",
          "Apresentar a empresa e passar credibilidade",
          "Divulgar um lançamento ou evento",
          "Apoiar campanhas de tráfego pago",
        ],
      },
      {
        name: "acaoPrincipal",
        label: "Qual ação o visitante deve fazer ao entrar no site?",
        type: "text",
        placeholder: "Ex.: clicar no botão do WhatsApp e pedir um orçamento",
      },
      {
        name: "secoes",
        label: "Quais páginas ou seções o site deve ter?",
        type: "checkbox",
        options: [
          "Início / apresentação",
          "Sobre nós",
          "Serviços",
          "Produtos",
          "Portfólio / cases",
          "Depoimentos",
          "Equipe",
          "Perguntas frequentes",
          "Blog",
          "Localização / mapa",
          "Contato",
        ],
      },
      {
        name: "funcionalidades",
        label: "Funcionalidades desejadas",
        type: "checkbox",
        options: [
          "Botão flutuante de WhatsApp",
          "Formulário de contato",
          "Agendamento online",
          "Integração com Instagram",
          "Pixel do Meta / Google Analytics",
          "Pagamento online",
          "Área de login / membros",
          "Versão em outro idioma",
        ],
      },
      {
        name: "outrasFuncionalidades",
        label: "Algo mais que o site precisa ter?",
        type: "textarea",
        placeholder: "Integrações, sistemas que você já usa, ideias...",
      },
    ],
  },
  {
    id: "identidade",
    title: "Identidade",
    highlight: "visual",
    description: "Envie o que você já tem da sua marca. Se o arquivo for grande, cole um link do Google Drive ou WeTransfer.",
    fields: [
      {
        name: "temIdentidade",
        label: "Sua marca já tem identidade visual?",
        type: "radio",
        required: true,
        options: [
          "Sim, tenho manual de marca completo",
          "Tenho apenas o logotipo",
          "Não tenho, preciso criar",
        ],
      },
      {
        name: "arquivosMarca",
        label: "Logotipo, manual de marca e outros arquivos",
        type: "files",
        help: "PDF, PNG, JPG, SVG, AI, EPS ou ZIP — até 4 MB no total.",
        showIf: {
          field: "temIdentidade",
          values: ["Sim, tenho manual de marca completo", "Tenho apenas o logotipo"],
        },
      },
      {
        name: "linkArquivos",
        label: "Link para os arquivos (Drive, WeTransfer, Dropbox...)",
        type: "url",
        placeholder: "https://",
        help: "Use para arquivos grandes, fotos e vídeos. Deixe o link com acesso liberado.",
      },
      { name: "cores", label: "Cores da marca", type: "text", half: true, placeholder: "Ex.: azul-marinho e dourado, #0A2342" },
      { name: "fontes", label: "Fontes (se souber)", type: "text", half: true, placeholder: "Ex.: Montserrat" },
      {
        name: "estilo",
        label: "Como você quer que o site seja percebido?",
        type: "checkbox",
        options: [
          "Moderno",
          "Minimalista",
          "Sofisticado / premium",
          "Corporativo",
          "Jovem e descontraído",
          "Tecnológico",
          "Acolhedor",
          "Ousado e chamativo",
        ],
      },
      {
        name: "materiais",
        label: "Fotos e vídeos para o site",
        type: "radio",
        options: [
          "Tenho fotos e vídeos profissionais",
          "Tenho alguns materiais, mas não profissionais",
          "Preciso de produção (fotos / vídeos)",
          "Pode usar banco de imagens",
        ],
      },
      {
        name: "textos",
        label: "Textos do site",
        type: "radio",
        options: ["Já tenho os textos prontos", "Tenho parte, preciso de ajuda", "Quero que a Linka escreva"],
      },
    ],
  },
  {
    id: "referencias",
    title: "Suas",
    highlight: "referências",
    description: "Sites que você admira, do seu segmento ou não. Conte o que chamou sua atenção em cada um.",
    fields: [
      {
        name: "referencias",
        label: "Sites de referência",
        type: "references",
        help: "Adicione até 6 sites.",
      },
      {
        name: "naoGosta",
        label: "Algo que você NÃO quer no seu site?",
        type: "textarea",
        placeholder: "Cores, estilos, sites que você não gosta...",
      },
    ],
  },
  {
    id: "detalhes",
    title: "Últimos",
    highlight: "detalhes",
    description: "Informações técnicas e prazos. Se não souber alguma, tudo bem — deixe em branco.",
    fields: [
      {
        name: "temDominio",
        label: "Você já tem domínio (endereço do site)?",
        type: "radio",
        options: ["Sim", "Não, preciso registrar", "Não sei"],
      },
      {
        name: "dominio",
        label: "Qual o domínio?",
        type: "text",
        placeholder: "suaempresa.com.br",
        showIf: { field: "temDominio", values: ["Sim"] },
      },
      {
        name: "emailCorporativo",
        label: "Precisa de e-mails corporativos (voce@suaempresa.com.br)?",
        type: "radio",
        options: ["Sim", "Já tenho", "Não"],
      },
      {
        name: "prazo",
        label: "Para quando você precisa do site?",
        type: "radio",
        options: ["O quanto antes", "Em até 30 dias", "Em até 60 dias", "Sem pressa"],
      },
      {
        name: "dataImportante",
        label: "Existe alguma data importante?",
        type: "date",
        half: true,
        help: "Lançamento, evento, campanha...",
      },
      {
        name: "aprovador",
        label: "Quem vai aprovar o projeto?",
        type: "text",
        half: true,
        placeholder: "Nome e cargo",
      },
      {
        name: "observacoes",
        label: "Mais alguma coisa que devemos saber?",
        type: "textarea",
        placeholder: "Fique à vontade para contar tudo",
      },
    ],
  },
];

export type Reference = { url: string; nota: string };
export type Answers = Record<string, string | string[] | Reference[]>;

export const MAX_REFERENCES = 6;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ai", ".eps", ".zip"];

export function isVisible(field: Field, answers: Answers) {
  if (!field.showIf) return true;
  const value = answers[field.showIf.field];
  return typeof value === "string" && field.showIf.values.includes(value);
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
  if (typeof value !== "string" || !value.trim()) return null;

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Informe um e-mail válido.";
  }
  if (field.type === "tel" && value.replace(/\D/g, "").length < 10) {
    return "Informe o número com DDD.";
  }
  return null;
}
