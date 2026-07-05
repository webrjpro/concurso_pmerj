import {
  BookOpen,
  Brain,
  BarChart3,
  ClipboardList,
  FileText,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Presentation,
  RefreshCcw,
  Route,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";

export type TopicStatus = "nao-iniciado" | "estudando" | "revisando" | "dominado";

export type Subject = {
  name: string;
  shortName: string;
  questions: number;
  points: number;
  priority: "Alta" | "Media" | "Base";
  progress: number;
  accuracy: number;
  status: TopicStatus;
  focus: string;
  topics: string[];
};

export const navItems = [
  { href: "/", label: "Inicio", icon: ShieldCheck },
  { href: "/aluno", label: "Aluno", icon: LayoutDashboard },
  { href: "/desempenho", label: "Desempenho", icon: BarChart3 },
  { href: "/disciplinas", label: "Edital", icon: BookOpen },
  { href: "/questoes", label: "Questoes", icon: FileQuestion },
  { href: "/redacao", label: "Redacao", icon: FileText },
  { href: "/erros", label: "Erros", icon: NotebookPen },
  { href: "/revisoes", label: "Revisoes", icon: RefreshCcw },
  { href: "/professores", label: "Professores", icon: Presentation },
  { href: "/plano", label: "Plano", icon: Route },
  { href: "/simulados", label: "Simulados", icon: ClipboardList },
  { href: "/admin", label: "Admin", icon: Users }
];

export const subjects: Subject[] = [
  {
    name: "Lingua Portuguesa",
    shortName: "Portugues",
    questions: 10,
    points: 20,
    priority: "Alta",
    progress: 38,
    accuracy: 72,
    status: "estudando",
    focus: "Interpretacao, sintaxe, crase, concordancia e vocabulario.",
    topics: [
      "Leitura e interpretacao de textos",
      "Ortografia, sinonimos e antonimos",
      "Classes de palavras",
      "Sintaxe e oracoes",
      "Concordancia, regencia, pronomes e crase"
    ]
  },
  {
    name: "Matematica Basica",
    shortName: "Matematica",
    questions: 10,
    points: 20,
    priority: "Alta",
    progress: 31,
    accuracy: 58,
    status: "estudando",
    focus: "Situacoes-problema, porcentagem, equacoes, razao e geometria.",
    topics: [
      "Numeros inteiros, racionais e reais",
      "Razao, proporcao, regra de tres e porcentagem",
      "Equacao e sistema do 1o grau",
      "Medidas, tabelas, graficos e geometria",
      "Probabilidade e raciocinio logico"
    ]
  },
  {
    name: "Nocoes de Direitos Humanos",
    shortName: "Direitos Humanos",
    questions: 10,
    points: 20,
    priority: "Alta",
    progress: 26,
    accuracy: 64,
    status: "revisando",
    focus: "DUDH, art. 5o, tratados, migracao, tortura e uso da forca.",
    topics: [
      "Declaracao Universal dos Direitos Humanos",
      "Constituicao Federal: direitos e deveres individuais",
      "Tratados internacionais e controle de convencionalidade",
      "Lei de Migracao e combate a tortura",
      "Uso de instrumentos de menor potencial ofensivo"
    ]
  },
  {
    name: "Direito Administrativo e Legislacao Aplicada a PMERJ",
    shortName: "Administrativo",
    questions: 10,
    points: 20,
    priority: "Alta",
    progress: 22,
    accuracy: 52,
    status: "estudando",
    focus: "Principios, poderes, atos, agentes publicos e Estatuto PMERJ.",
    topics: [
      "Principios do Direito Administrativo",
      "Organizacao administrativa e orgaos publicos",
      "Poderes administrativos",
      "Atos e processo administrativo",
      "Legislacao aplicada a PMERJ"
    ]
  },
  {
    name: "Direito Penal e Processual Penal",
    shortName: "Penal e Processo",
    questions: 10,
    points: 20,
    priority: "Alta",
    progress: 18,
    accuracy: 49,
    status: "nao-iniciado",
    focus: "Parte geral, crimes em especie, inquerito, acao penal e provas.",
    topics: [
      "Aplicacao da lei penal, crime e imputabilidade",
      "Penas, acao penal e parte especial",
      "Legislacao penal especial",
      "Inquerito policial e acao penal",
      "Provas, prisao e medidas cautelares"
    ]
  }
];

export const dashboardMetrics = [
  { label: "Edital estudado", value: "27%", detail: "Base inicial em andamento", tone: "green" },
  { label: "Taxa de acerto", value: "61%", detail: "Meta: superar 75%", tone: "blue" },
  { label: "Tempo estudado", value: "18h", detail: "Semana atual", tone: "gold" },
  { label: "Revisoes pendentes", value: "7", detail: "Prioridade para hoje", tone: "red" }
];

export const studyMission = [
  "Revisar crase e objeto direto em Portugues",
  "Resolver 15 questoes de porcentagem e proporcao",
  "Fazer active recall de DUDH e art. 5o",
  "Registrar erros com motivo provavel"
];

export const foundationModules = [
  {
    title: "Mapa do edital",
    description: "Disciplinas, topicos, status, prioridade e dominio.",
    href: "/disciplinas",
    icon: GraduationCap
  },
  {
    title: "Banco de questoes",
    description: "Questoes por materia, assunto, dificuldade e explicacao.",
    href: "/questoes",
    icon: FileQuestion
  },
  {
    title: "Revisao inteligente",
    description: "Flashcards e ciclos de 24h, 7 dias, 15 dias e 30 dias.",
    href: "/revisoes",
    icon: Brain
  },
  {
    title: "Simulados FGV",
    description: "Treinos completos com diagnostico de pontos fracos.",
    href: "/simulados",
    icon: Trophy
  }
];

export const questionBlueprint = [
  { subject: "Lingua Portuguesa", count: 10, sample: "Interpretacao, vocabulario, sintaxe, crase." },
  { subject: "Matematica Basica", count: 10, sample: "Media, logica, porcentagem, geometria, probabilidade." },
  { subject: "Direitos Humanos", count: 10, sample: "DUDH, art. 5o, tratados, tortura, uso da forca." },
  { subject: "Administrativo e PMERJ", count: 10, sample: "Principios, poderes, atos, agentes e Estatuto PMERJ." },
  { subject: "Penal e Processo Penal", count: 10, sample: "Penas, excludentes, crimes, inquerito, flagrante e prova." }
];
