import { prisma } from "@/lib/prisma";

function strategyForSubject(shortName: string) {
  const strategies: Record<string, string> = {
    Portugues: "Comece por interpretacao e sintaxe. Depois avance para crase, concordancia e regencia com questoes curtas.",
    Matematica: "Resolva problemas pequenos todos os dias. Priorize porcentagem, regra de tres, equacoes e geometria basica.",
    "Direitos Humanos": "Memorize literalidade essencial e treine situacoes praticas envolvendo atuacao policial.",
    Administrativo: "Estude principios e poderes primeiro. Depois atos, agentes e legislacao PMERJ com quadros comparativos.",
    "Penal e Processo": "Separe Penal de Processo Penal. Fixe conceitos de crime, penas, flagrante, provas e acao penal."
  };

  return strategies[shortName] ?? "Estude em blocos curtos, revise e resolva questoes ligadas ao edital.";
}

function commonMistakes(shortName: string) {
  const mistakes: Record<string, string[]> = {
    Portugues: ["Ler rapido demais", "Confundir funcao sintatica", "Decorar crase sem olhar regencia"],
    Matematica: ["Usar base errada em porcentagem", "Pular etapas do calculo", "Nao conferir unidade de medida"],
    "Direitos Humanos": ["Aceitar excecoes proibidas", "Confundir tratado comum com tratado de direitos humanos"],
    Administrativo: ["Confundir impessoalidade com publicidade", "Trocar poder disciplinar por hierarquico"],
    "Penal e Processo": ["Confundir regime de pena", "Misturar flagrante proprio, improprio e presumido"]
  };

  return mistakes[shortName] ?? ["Estudar sem revisar", "Fazer questoes sem corrigir o motivo do erro"];
}

export async function getAiProfessors() {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      topics: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        take: 5
      },
      questions: {
        orderBy: { examNumber: "asc" },
        take: 2,
        include: { topic: true }
      }
    }
  });

  return subjects.map((subject) => ({
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    shortName: subject.shortName,
    objective: `Levar o aluno iniciante a dominar ${subject.shortName} no padrao da prova PMERJ/FGV.`,
    howItFalls: subject.description,
    mainTopics: subject.topics.map((topic) => topic.title),
    strategy: strategyForSubject(subject.shortName),
    commonMistakes: commonMistakes(subject.shortName),
    evolutionPlan: [
      "Nivel 1: entender o vocabulario basico",
      "Nivel 2: estudar exemplos simples",
      "Nivel 3: resolver questoes faceis",
      "Nivel 4: corrigir erros e criar flashcards",
      "Nivel 5: simular cobranca FGV"
    ],
    classes: subject.topics.map((topic, index) => ({
      title: `Aula ${index + 1}: ${topic.title}`,
      description: `Explicacao simples, exemplo, pegadinha e revisao rapida de ${topic.title}.`
    })),
    commentedQuestions: subject.questions.map((question) => ({
      title: question.examNumber ? `Questao ${question.examNumber}` : "Questao de treino",
      topic: question.topic.title,
      review: question.reviewConcept
    }))
  }));
}

export function buildTeacherExplanation(subject: string, topic: string) {
  return {
    simple: `Vamos estudar ${topic} em ${subject} como se fosse a primeira vez: primeiro o significado, depois um exemplo e so entao a questao.`,
    practicalExample: `Exemplo pratico: pegue uma questao curta sobre ${topic}, identifique o comando e elimine alternativas absurdas antes de decidir.`,
    analogy: "Pense como uma abordagem em etapas: observar, identificar, agir e conferir. No estudo, voce le, classifica, resolve e revisa.",
    commonErrors: ["Responder pela memoria sem ler o comando", "Nao anotar por que errou", "Estudar teoria demais sem questoes"],
    traps: ["Alternativa com palavra absoluta", "Conceito parecido com outro topico", "Excecao inventada pela banca"],
    howBankCharges: "A FGV costuma cobrar leitura cuidadosa, situacoes praticas e diferenca fina entre conceitos proximos.",
    memorySummary: `Memorize ${topic} por pergunta curta: o que e, quando aparece, qual excecao falsa a banca tenta vender.`,
    trainingQuestions: ["Explique o conceito em uma frase.", "Crie um exemplo do dia a dia.", "Resolva uma questao e justifique as erradas."],
    quickReview: "Leia seu resumo, responda sem olhar, confira, marque erro e programe revisao."
  };
}
