// Perguntas do processo seletivo (vaga de Gestor(a) de tráfego). Funciona como
// questions.ts: o formulário, a revisão, o e-mail e o painel saem daqui.
import type { Step } from "./questions";

export const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".ppt", ".pptx", ".zip"];

export const seletivoSteps: Step[] = [
  {
    id: "dados",
    title: "Seus",
    highlight: "dados",
    description: "Informações básicas para entrarmos em contato com você.",
    fields: [
      { name: "nome", label: "Qual seu nome completo?", type: "text", required: true },
      { name: "idade", label: "Qual sua idade?", type: "number", required: true, half: true, placeholder: "Ex.: 24" },
      { name: "cpf", label: "Qual seu CPF?", type: "cpf", required: true, half: true, placeholder: "000.000.000-00" },
      { name: "whatsapp", label: "Qual seu WhatsApp?", type: "tel", required: true, half: true, placeholder: "(44) 99999-9999" },
      { name: "email", label: "Qual seu e-mail?", type: "email", required: true, half: true, placeholder: "voce@email.com" },
      {
        name: "instagram",
        label: "Qual seu Instagram?",
        type: "url",
        required: true,
        help: "Copie e cole o link, por favor.",
        placeholder: "https://instagram.com/seuperfil",
      },
      { name: "ondeMora", label: "Onde você mora?", type: "text", required: true, half: true, placeholder: "Bairro e cidade" },
      { name: "comQuemMora", label: "Com quem você mora?", type: "text", required: true, half: true },
    ],
  },
  {
    id: "curriculo",
    title: "Currículo e",
    highlight: "portfólio",
    description: "Queremos conhecer mais sobre você!",
    fields: [
      {
        name: "curriculo",
        label: "Por favor, anexe seu currículo e o seu portfólio",
        type: "files",
        required: true,
        accept: RESUME_EXTENSIONS,
        help: "PDF, Word, PowerPoint, imagem ou ZIP — até 4 MB no total.",
      },
      {
        name: "portfolioLink",
        label: "Se o seu portfólio for em link, coloque-o abaixo",
        type: "url",
        placeholder: "https://",
        help: "Arquivos grandes também podem ir por aqui (Google Drive, Behance, Canva...). Deixe o acesso liberado.",
      },
    ],
  },
  {
    id: "voce",
    title: "Quem é",
    highlight: "você?",
    description: "Pense que somos desconhecidos. Responda com sinceridade, do seu jeito.",
    fields: [
      {
        name: "quemEVoce",
        label: "Quem é você?",
        type: "textarea",
        required: true,
        help: "Como você se apresentaria? Descreva rapidamente quem você é, com o que trabalha, o que gosta de fazer e conte um pouco sobre a sua personalidade.",
      },
      {
        name: "referenciasPessoais",
        label: "Cite três pessoas que são referências pessoais para você e diga porque elas te inspiram",
        type: "textarea",
        required: true,
        help: "Ps.: familiares e amigos não valem! :)",
      },
      {
        name: "referenciasTrafego",
        label: "Cite três perfis no Instagram que são referências para você em gestão de tráfego e nos diga porquê",
        type: "textarea",
        required: true,
      },
      { name: "hobby", label: "Qual o seu hobby? Aquilo que você paga para fazer.", type: "textarea", required: true },
      {
        name: "experienciaMarcante",
        label: "Qual a experiência na sua vida pessoal que mais te marcou?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "trabalho",
    title: "Você e o",
    highlight: "trabalho",
    description: "Queremos entender como você enxerga a vida profissional.",
    fields: [
      { name: "piorNoTrabalho", label: "Qual a pior coisa que já te aconteceu no trabalho?", type: "textarea", required: true },
      { name: "clt", label: "O que você acha do regime CLT?", type: "textarea", required: true },
      { name: "pj", label: "O que você acha da contratação PJ/MEI?", type: "textarea", required: true },
      {
        name: "caracteristicasEmpresa",
        label: "Quais são as 3 características que você julga serem muito importantes em uma empresa?",
        type: "textarea",
        required: true,
      },
      {
        name: "futuroIdeal",
        label: "Se você tivesse que descrever um futuro profissional ideal, como ele seria?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "experiencia",
    title: "Experiência e",
    highlight: "planos",
    description: "Sua trajetória até aqui e o que você imagina para os próximos anos.",
    fields: [
      {
        name: "rendaExtra",
        label: "Hoje você tem algum tipo de renda extra?",
        type: "radio",
        required: true,
        options: ["Não", "Sim"],
      },
      {
        name: "fonteRenda",
        label: "Qual é esta fonte de renda?",
        type: "text",
        required: true,
        showIf: { field: "rendaExtra", values: ["Sim"] },
      },
      {
        name: "cincoAnos",
        label: "Nos próximos cinco anos você imagina que vai:",
        type: "radio",
        required: true,
        options: [
          "Estar trabalhando de forma integral em uma empresa, me dedicando totalmente para crescer junto com a empresa",
          "Estar iniciando o seu próprio negócio",
          "Estar trabalhando de forma integral em uma empresa, mas complementando a renda com alguns freelancers na área do marketing",
        ],
      },
      { name: "visaoTrabalho", label: "Qual a sua visão sobre trabalho?", type: "textarea", required: true },
      { name: "experienciaAgencia", label: "Qual a sua experiência em agência?", type: "textarea", required: true },
      {
        name: "experienciaConteudo",
        label: "Qual a sua experiência com criação de conteúdo?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "perfil",
    title: "Perfil",
    highlight: "comportamental",
    description: "Antes de finalizar, faça o teste abaixo e conte pra gente o resultado.",
    fields: [
      {
        name: "disc",
        label: "Qual foi o seu maior resultado no teste DISC?",
        type: "radio",
        required: true,
        options: ["Dominância", "Influência", "Estabilidade", "Conformidade"],
        help: "Faça o teste em https://www.mrcoach.com.br/teste-perfil-comportamental-disc.php e marque abaixo o seu maior resultado. Não esqueça de enviar o resultado final para contato@linkamidia.com.br",
      },
      {
        name: "algoMais",
        label: "Tem algo que você gostaria de dizer e nós não perguntamos?",
        type: "textarea",
        required: true,
      },
    ],
  },
];
