import { PrismaClient } from "@prisma/client";
import { essayPromptSeeds } from "../lib/essay-prompts";

const prisma = new PrismaClient();

const subjects = [
  {
    slug: "lingua-portuguesa",
    name: "Lingua Portuguesa",
    shortName: "Portugues",
    description: "Interpretacao, gramatica normativa, sintaxe, crase, regencia e vocabulario.",
    order: 1,
    progress: 38,
    accuracy: 72,
    status: "ESTUDANDO" as const,
    topics: [
      "Leitura e interpretacao de textos",
      "Ortografia, sinonimos e antonimos",
      "Classes de palavras",
      "Sintaxe e oracoes",
      "Concordancia, regencia, pronomes e crase"
    ]
  },
  {
    slug: "matematica-basica",
    name: "Matematica Basica",
    shortName: "Matematica",
    description: "Numeros, razao, proporcao, porcentagem, equacoes, geometria, probabilidade e logica.",
    order: 2,
    progress: 31,
    accuracy: 58,
    status: "ESTUDANDO" as const,
    topics: [
      "Numeros inteiros, racionais e reais",
      "Razao, proporcao, regra de tres e porcentagem",
      "Equacao e sistema do 1o grau",
      "Medidas, tabelas, graficos e geometria",
      "Probabilidade e raciocinio logico"
    ]
  },
  {
    slug: "direitos-humanos",
    name: "Nocoes de Direitos Humanos",
    shortName: "Direitos Humanos",
    description: "DUDH, direitos fundamentais, tratados internacionais, migracao, tortura e uso da forca.",
    order: 3,
    progress: 26,
    accuracy: 64,
    status: "REVISANDO" as const,
    topics: [
      "Declaracao Universal dos Direitos Humanos",
      "Constituicao Federal: direitos e deveres individuais",
      "Tratados internacionais e controle de convencionalidade",
      "Lei de Migracao e combate a tortura",
      "Uso de instrumentos de menor potencial ofensivo"
    ]
  },
  {
    slug: "direito-administrativo-pmerj",
    name: "Direito Administrativo e Legislacao Aplicada a PMERJ",
    shortName: "Administrativo",
    description: "Principios, organizacao, poderes, atos, processo, agentes e legislacao aplicada a PMERJ.",
    order: 4,
    progress: 22,
    accuracy: 52,
    status: "ESTUDANDO" as const,
    topics: [
      "Principios do Direito Administrativo",
      "Organizacao administrativa e orgaos publicos",
      "Poderes administrativos",
      "Atos e processo administrativo",
      "Legislacao aplicada a PMERJ"
    ]
  },
  {
    slug: "direito-penal-processual-penal",
    name: "Direito Penal e Processual Penal",
    shortName: "Penal e Processo",
    description: "Parte geral, crimes em especie, legislacao especial, inquerito, acao penal e provas.",
    order: 5,
    progress: 18,
    accuracy: 49,
    status: "NAO_INICIADO" as const,
    topics: [
      "Aplicacao da lei penal, crime e imputabilidade",
      "Penas, acao penal e parte especial",
      "Legislacao penal especial",
      "Inquerito policial e acao penal",
      "Provas, prisao e medidas cautelares"
    ]
  }
];

const subtopicsByTitle: Record<string, string[]> = {
  "Leitura e interpretacao de textos": [
    "Textos informativos, literarios e jornalisticos",
    "Sentido proprio e figurado das palavras",
    "Figuras de linguagem"
  ],
  "Ortografia, sinonimos e antonimos": ["Emprego das letras", "Sinonimos", "Antonimos"],
  "Classes de palavras": [
    "Substantivo, adjetivo, numeral e pronome",
    "Verbo e adverbio",
    "Preposicao e conjuncao: emprego e sentido"
  ],
  "Sintaxe e oracoes": ["Reconhecimento dos termos da oracao", "Reconhecimento das oracoes no periodo"],
  "Concordancia, regencia, pronomes e crase": [
    "Concordancia verbal e nominal",
    "Regencia verbal e nominal",
    "Colocacao de pronomes e ocorrencia de crase"
  ],
  "Numeros inteiros, racionais e reais": [
    "Operacoes e propriedades com inteiros",
    "Representacao fracionaria e decimal",
    "Numeros reais e suas operacoes"
  ],
  "Razao, proporcao, regra de tres e porcentagem": [
    "Minimo multiplo comum",
    "Razao e proporcao",
    "Porcentagem, juros e regra de tres simples"
  ],
  "Equacao e sistema do 1o grau": [
    "Equacao do primeiro grau",
    "Sistema de equacoes do primeiro grau",
    "Resolucao de situacoes-problema"
  ],
  "Medidas, tabelas, graficos e geometria": [
    "Medidas de tempo, comprimento, superficie e capacidade",
    "Relacao entre grandezas: tabelas e graficos",
    "Forma, perimetro, area, volume e teorema de Pitagoras"
  ],
  "Probabilidade e raciocinio logico": ["Probabilidade", "Conjuntos, operacoes e diagramas", "Raciocinio logico"],
  "Declaracao Universal dos Direitos Humanos": [
    "Direitos e liberdades basicas",
    "Vedacao a escravidao e tortura",
    "Presuncao de inocencia e remedio efetivo"
  ],
  "Constituicao Federal: direitos e deveres individuais": [
    "Artigo 5o da Constituicao Federal",
    "Inviolabilidade de domicilio",
    "Prisao ilegal e relaxamento pela autoridade judiciaria"
  ],
  "Tratados internacionais e controle de convencionalidade": [
    "Tratados de direitos humanos no direito brasileiro",
    "Controle de convencionalidade",
    "Pacto Internacional de Direitos Civis e Politicos e Convencao Americana"
  ],
  "Lei de Migracao e combate a tortura": [
    "Lei Federal 13.445/2017",
    "Sistema Nacional de Prevencao e Combate a Tortura",
    "Lei Federal 9.455/1997"
  ],
  "Uso de instrumentos de menor potencial ofensivo": [
    "Lei Federal 13.060/2014",
    "Uso proporcional da forca",
    "Uso de arma de fogo e risco de morte ou lesao"
  ],
  "Principios do Direito Administrativo": [
    "Legalidade, impessoalidade, moralidade, publicidade e eficiencia",
    "Razoabilidade e proporcionalidade",
    "Supremacia do interesse publico, continuidade e autotutela"
  ],
  "Organizacao administrativa e orgaos publicos": [
    "Desconcentracao e descentralizacao",
    "Administracao direta e indireta",
    "Orgaos publicos: conceito, criacao, extincao e classificacoes"
  ],
  "Poderes administrativos": [
    "Poder normativo ou regulamentar",
    "Poder de policia",
    "Poder hierarquico e poder disciplinar"
  ],
  "Atos e processo administrativo": [
    "Elementos do ato administrativo",
    "Discricionariedade, vinculacao e atributos",
    "Processo administrativo e PAD"
  ],
  "Legislacao aplicada a PMERJ": [
    "Constituicao Federal: arts. 42, 144 e 125",
    "Constituicao Estadual: arts. 91 a 93",
    "Decreto-Lei 667/1969 e Lei Estadual 443/1981"
  ],
  "Aplicacao da lei penal, crime e imputabilidade": [
    "Aplicacao da lei penal",
    "Crime e excludentes",
    "Imputabilidade penal"
  ],
  "Penas, acao penal e parte especial": [
    "Penas privativas de liberdade, restritivas de direitos e multa",
    "Suspensao condicional da pena e livramento condicional",
    "Crimes contra pessoa, patrimonio, dignidade sexual, paz publica, fe publica e administracao publica"
  ],
  "Legislacao penal especial": [
    "Abuso de autoridade, crimes hediondos e tortura",
    "Drogas, Maria da Penha, ECA e Estatuto do Idoso",
    "Juizados Especiais, desarmamento, consumidor e pessoa com deficiencia"
  ],
  "Inquerito policial e acao penal": [
    "Disposicoes preliminares do CPP",
    "Inquerito policial",
    "Acao penal e sujeitos do processo"
  ],
  "Provas, prisao e medidas cautelares": [
    "Disposicoes gerais da prova",
    "Corpo de delito, cadeia de custodia, pericias, busca e apreensao",
    "Prisao, medidas cautelares e liberdade provisoria"
  ]
};

async function resetDatabase() {
  await prisma.aiGeneration.deleteMany();
  await prisma.essaySubmission.deleteMany();
  await prisma.essayPrompt.deleteMany();
  await prisma.sourceDocument.deleteMany();
  await prisma.studentTopicProgress.deleteMany();
  await prisma.studentSubjectProgress.deleteMany();
  await prisma.generalProgress.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.studyTask.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.simulationQuestion.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.errorNotebookEntry.deleteMany();
  await prisma.studentAttempt.deleteMany();
  await prisma.answerKey.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.summary.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.edictalTopic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const student = await prisma.user.create({
    data: {
      name: "Aluno Demonstracao",
      email: "aluno@pmerj.local",
      role: "STUDENT",
      profile: {
        create: {
          dailyMinutes: 120,
          beginnerMode: true,
          currentLevel: 1,
          streakDays: 4,
          totalStudyMinutes: 1080,
          targetScore: 80
        }
      },
      generalProgress: {
        create: {
          editalPercent: 27,
          overallAccuracy: 61,
          questionsDone: 84,
          simulationsDone: 2,
          studyMinutes: 1080,
          pendingReviews: 7,
          persistentWeakness: "Matematica e Direito Penal",
          strongPoints: "Portugues e Direitos Humanos"
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@pmerj.local",
      role: "ADMIN"
    }
  });

  const editalDoc = await prisma.sourceDocument.create({
    data: {
      title: "Edital CFSd PMERJ 2023 com retificacoes",
      kind: "edital",
      fileName: "edital_cfsd_completo_1_2_retificacoes.pdf",
      description: "Fonte oficial dos topicos programaticos usados para a base inicial."
    }
  });

  const provaDoc = await prisma.sourceDocument.create({
    data: {
      title: "Prova objetiva Soldado Policial Militar Classe C",
      kind: "prova",
      fileName: "soldado_policial_militar_classe_c.pdf"
    }
  });

  await prisma.sourceDocument.create({
    data: {
      title: "Gabarito definitivo da prova aplicada em 09/04/2024",
      kind: "gabarito",
      fileName: "gabarito_definitivo.pdf"
    }
  });

  await prisma.essayPrompt.createMany({ data: essayPromptSeeds });

  for (const subjectSeed of subjects) {
    const subject = await prisma.subject.create({
      data: {
        slug: subjectSeed.slug,
        name: subjectSeed.name,
        shortName: subjectSeed.shortName,
        description: subjectSeed.description,
        order: subjectSeed.order,
        questionCount: 10,
        pointValue: 20,
        priorityWeight: 100
      }
    });

    await prisma.studentSubjectProgress.create({
      data: {
        userId: student.id,
        subjectId: subject.id,
        status: subjectSeed.status,
        progress: subjectSeed.progress,
        mastery: Math.max(10, subjectSeed.progress - 4),
        accuracy: subjectSeed.accuracy,
        questionsDone: 12 + subjectSeed.order * 4
      }
    });

    for (const [index, title] of subjectSeed.topics.entries()) {
      const topic = await prisma.edictalTopic.create({
        data: {
          subjectId: subject.id,
          title,
          code: `${subjectSeed.order}.${index + 1}`,
          priorityWeight: index < 2 ? 90 : 70,
          order: index + 1
        }
      });

      await prisma.studentTopicProgress.create({
        data: {
          userId: student.id,
          topicId: topic.id,
          status: index === 0 ? "ESTUDANDO" : index === 1 ? "REVISANDO" : "NAO_INICIADO",
          mastery: Math.max(0, subjectSeed.progress - index * 5),
          accuracy: Math.max(35, subjectSeed.accuracy - index * 4),
          questionsDone: index < 2 ? 8 : 0,
          nextReviewAt: index === 1 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
        }
      });

      const lesson = await prisma.lesson.create({
        data: {
          subjectId: subject.id,
          topicId: topic.id,
          title: `Aula inicial: ${title}`,
          level: 1,
          durationMinutes: 30,
          content: `Explicacao introdutoria de ${title}, em linguagem simples para aluno iniciante.`,
          order: 1
        }
      });

      await prisma.summary.create({
        data: {
          subjectId: subject.id,
          topicId: topic.id,
          lessonId: lesson.id,
          title: `Resumo de uma pagina: ${title}`,
          content: `Resumo-base para revisar ${title} com foco em prova objetiva FGV.`,
          onePage: true
        }
      });

      for (const [childIndex, childTitle] of (subtopicsByTitle[title] ?? []).entries()) {
        const childTopic = await prisma.edictalTopic.create({
          data: {
            subjectId: subject.id,
            parentId: topic.id,
            title: childTitle,
            code: `${subjectSeed.order}.${index + 1}.${childIndex + 1}`,
            priorityWeight: childIndex === 0 ? 75 : 60,
            order: childIndex + 1
          }
        });

        await prisma.studentTopicProgress.create({
          data: {
            userId: student.id,
            topicId: childTopic.id,
            status: childIndex === 0 && index < 2 ? "ESTUDANDO" : "NAO_INICIADO",
            mastery: Math.max(0, subjectSeed.progress - childIndex * 7 - index * 3),
            accuracy: Math.max(35, subjectSeed.accuracy - childIndex * 5 - index * 3),
            questionsDone: childIndex === 0 && index < 2 ? 4 : 0,
            nextReviewAt:
              childIndex === 0 && index === 1 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
          }
        });
      }
    }
  }

  const dh = await prisma.subject.findUniqueOrThrow({ where: { slug: "direitos-humanos" } });
  const dhTopic = await prisma.edictalTopic.findFirstOrThrow({
    where: { subjectId: dh.id, title: "Declaracao Universal dos Direitos Humanos" }
  });

  const question = await prisma.question.create({
    data: {
      subjectId: dh.id,
      topicId: dhTopic.id,
      sourceDocumentId: provaDoc.id,
      examNumber: 21,
      statement:
        "A DUDH proibe tortura e tratamento cruel, desumano ou degradante. Qual ideia deve ser revisada quando o aluno aceita excecoes indevidas?",
      difficulty: "MEDIA",
      explanation: "A DUDH trabalha direitos basicos sem permitir tortura como meio de investigacao.",
      correctExplanation: "A alternativa correta deve negar qualquer excecao que autorize tortura.",
      wrongExplanation:
        "As erradas normalmente inserem excecoes absolutas ou confundem protecao com permissao estatal.",
      trap: "Aceitar uma excecao emocionalmente convincente quando a norma nao permite tortura.",
      reviewConcept: "Vedacao absoluta da tortura na DUDH.",
      options: {
        create: [
          { label: "A", text: "A tortura pode ser usada em situacoes excepcionais.", explanation: "Errada: cria excecao indevida." },
          { label: "B", text: "A tortura e vedada, inclusive como metodo de investigacao.", isCorrect: true, explanation: "Certa: preserva a vedacao absoluta." },
          { label: "C", text: "A tortura depende de autorizacao judicial.", explanation: "Errada: autorizacao judicial nao legitima tortura." },
          { label: "D", text: "A tortura e decisao administrativa.", explanation: "Errada: nao ha margem administrativa para tortura." },
          { label: "E", text: "A tortura e permitida contra crime hediondo.", explanation: "Errada: a gravidade do crime nao autoriza tortura." }
        ]
      },
      answerKey: {
        create: {
          correctLabel: "B",
          source: "Seed pedagogico baseado no edital"
        }
      }
    }
  });

  const correctOption = await prisma.questionOption.findFirstOrThrow({
    where: { questionId: question.id, label: "B" }
  });

  await prisma.studentAttempt.create({
    data: {
      userId: student.id,
      questionId: question.id,
      selectedOptionId: correctOption.id,
      selectedLabel: "B",
      isCorrect: true,
      confidence: 4,
      timeSpentSeconds: 75
    }
  });

  const practiceSeeds = [
    {
      subjectSlug: "lingua-portuguesa",
      topicTitle: "Sintaxe e oracoes",
      examNumber: 4,
      statement: "Na frase 'Alugamos ontem o apartamento', qual termo funciona como objeto direto?",
      difficulty: "MEDIA" as const,
      correctLabel: "C",
      explanation: "O verbo alugar e transitivo direto nesse contexto; quem aluga, aluga algo.",
      correctExplanation: "'O apartamento' completa o sentido do verbo sem preposicao.",
      wrongExplanation: "As demais opcoes confundem sujeito, adjunto adverbial ou complemento preposicionado.",
      trap: "A banca usa frases curtas para testar funcao sintatica sem avisar a transitividade do verbo.",
      reviewConcept: "Objeto direto e complemento verbal sem preposicao obrigatoria.",
      options: [
        ["A", "Na frase, o objeto direto e 'ontem'.", false, "Errada: 'ontem' indica tempo."],
        ["B", "Na frase, o objeto direto e o sujeito oculto 'nos'.", false, "Errada: sujeito nao e objeto."],
        ["C", "Na frase, o objeto direto e 'o apartamento'.", true, "Certa: completa diretamente o verbo."],
        ["D", "Na frase, o objeto direto e uma expressao inexistente.", false, "Errada: ha complemento expresso."],
        ["E", "Na frase, nao ha objeto direto.", false, "Errada: o verbo pede complemento."]
      ]
    },
    {
      subjectSlug: "matematica-basica",
      topicTitle: "Razao, proporcao, regra de tres e porcentagem",
      examNumber: 17,
      statement: "Um produto foi comprado com 15% de desconto e o valor pago foi R$ 221,00. Qual foi o desconto?",
      difficulty: "MEDIA" as const,
      correctLabel: "A",
      explanation: "Se R$ 221,00 corresponde a 85% do preco original, o preco original e 260; o desconto e 39.",
      correctExplanation: "15% de 260 e R$ 39,00.",
      wrongExplanation: "As erradas costumam calcular 15% sobre o valor ja descontado, nao sobre o preco original.",
      trap: "Usar 221 como base do desconto, quando ele e o valor final.",
      reviewConcept: "Porcentagem com valor final apos desconto.",
      options: [
        ["A", "R$ 39,00", true, "Certa: 221 / 0,85 = 260; 15% de 260 = 39."],
        ["B", "R$ 38,50", false, "Errada: arredondamento sem base correta."],
        ["C", "R$ 35,60", false, "Errada: nao corresponde a 15% do preco original."],
        ["D", "R$ 33,15", false, "Errada: calcula 15% sobre 221."],
        ["E", "R$ 32,10", false, "Errada: valor sem relacao correta com a taxa."]
      ]
    },
    {
      subjectSlug: "direito-administrativo-pmerj",
      topicTitle: "Principios do Direito Administrativo",
      examNumber: 31,
      statement: "Publicidade institucional com carater educativo e sem promocao pessoal realiza qual principio administrativo?",
      difficulty: "FACIL" as const,
      correctLabel: "B",
      explanation: "A impessoalidade impede que agentes usem atos ou obras publicas para autopromocao.",
      correctExplanation: "O foco deve ser a finalidade publica, nao o agente politico.",
      wrongExplanation: "As erradas citam principios relevantes, mas que nao atacam diretamente promocao pessoal.",
      trap: "Confundir publicidade administrativa com o principio da publicidade.",
      reviewConcept: "Principio da impessoalidade em publicidade institucional.",
      options: [
        ["A", "Proporcionalidade", false, "Errada: nao e o centro da situacao."],
        ["B", "Impessoalidade", true, "Certa: veda promocao pessoal."],
        ["C", "Continuidade", false, "Errada: trata da permanencia do servico publico."],
        ["D", "Juridicidade", false, "Errada: e mais ampla, mas nao especifica."],
        ["E", "Legalidade", false, "Errada: nao e a melhor resposta para o caso."]
      ]
    },
    {
      subjectSlug: "direito-penal-processual-penal",
      topicTitle: "Penas, acao penal e parte especial",
      examNumber: 41,
      statement: "Cumprimento de pena em colonia agricola indica, em regra, qual regime?",
      difficulty: "FACIL" as const,
      correctLabel: "A",
      explanation: "A colonia agricola, industrial ou estabelecimento similar e associada ao regime semiaberto.",
      correctExplanation: "No regime semiaberto, o trabalho externo e admissivel conforme regras legais.",
      wrongExplanation: "As erradas confundem colonia agricola com regime fechado ou aberto.",
      trap: "Associar qualquer estabelecimento prisional ao regime fechado.",
      reviewConcept: "Regimes de cumprimento de pena.",
      options: [
        ["A", "Semiaberto, com trabalho externo admissivel.", true, "Certa: corresponde ao regime semiaberto."],
        ["B", "Semiaberto, com trabalho externo proibido.", false, "Errada: o trabalho externo pode ser admitido."],
        ["C", "Fechado, com trabalho externo admissivel.", false, "Errada: colonia agricola nao e regime fechado."],
        ["D", "Aberto, com trabalho externo admissivel.", false, "Errada: regime aberto tem outra logica."],
        ["E", "Aberto, com trabalho externo proibido.", false, "Errada: mistura conceitos."]
      ]
    },
    {
      subjectSlug: "direito-penal-processual-penal",
      topicTitle: "Provas, prisao e medidas cautelares",
      examNumber: 48,
      statement: "Policiais presenciam o agente praticando o crime e o prendem no momento da execucao. Qual flagrante ocorreu?",
      difficulty: "MEDIA" as const,
      correctLabel: "E",
      explanation: "Quando o agente e surpreendido cometendo a infracao, trata-se de flagrante proprio.",
      correctExplanation: "O flagrante proprio ocorre durante a pratica ou logo apos a pratica do crime.",
      wrongExplanation: "As erradas confundem flagrante esperado, preparado, presumido e improprio.",
      trap: "Confundir flagrante esperado com flagrante proprio quando a prisao ocorre durante o crime.",
      reviewConcept: "Especies de flagrante no CPP.",
      options: [
        ["A", "Presumido", false, "Errada: envolve ser encontrado depois com objetos ou sinais."],
        ["B", "Preparado", false, "Errada: envolve inducao e pode gerar crime impossivel."],
        ["C", "Improprio", false, "Errada: envolve perseguicao logo apos."],
        ["D", "Esperado", false, "Errada: pode haver vigilancia, mas a classificacao do caso e proprio."],
        ["E", "Proprio", true, "Certa: o agente foi visto praticando o crime."]
      ]
    }
  ];

  for (const seed of practiceSeeds) {
    const subject = await prisma.subject.findUniqueOrThrow({ where: { slug: seed.subjectSlug } });
    const topic = await prisma.edictalTopic.findFirstOrThrow({
      where: { subjectId: subject.id, title: seed.topicTitle }
    });

    await prisma.question.create({
      data: {
        subjectId: subject.id,
        topicId: topic.id,
        sourceDocumentId: provaDoc.id,
        examNumber: seed.examNumber,
        statement: seed.statement,
        difficulty: seed.difficulty,
        explanation: seed.explanation,
        correctExplanation: seed.correctExplanation,
        wrongExplanation: seed.wrongExplanation,
        trap: seed.trap,
        reviewConcept: seed.reviewConcept,
        options: {
          create: seed.options.map(([label, text, isCorrect, explanation]) => ({
            label: String(label),
            text: String(text),
            isCorrect: Boolean(isCorrect),
            explanation: String(explanation)
          }))
        },
        answerKey: {
          create: {
            correctLabel: seed.correctLabel,
            source: "Gabarito definitivo tipo 1"
          }
        }
      }
    });
  }

  const mathErrorQuestion = await prisma.question.findFirstOrThrow({
    where: { examNumber: 17 },
    include: { options: true, subject: true, topic: true }
  });
  const wrongMathOption = mathErrorQuestion.options.find((option) => !option.isCorrect) ?? mathErrorQuestion.options[0];
  const mathAttempt = await prisma.studentAttempt.create({
    data: {
      userId: student.id,
      questionId: mathErrorQuestion.id,
      selectedOptionId: wrongMathOption.id,
      selectedLabel: wrongMathOption.label,
      isCorrect: false,
      confidence: 2,
      timeSpentSeconds: 120
    }
  });
  const mathError = await prisma.errorNotebookEntry.create({
    data: {
      userId: student.id,
      questionId: mathErrorQuestion.id,
      subjectId: mathErrorQuestion.subjectId,
      topicId: mathErrorQuestion.topicId,
      attemptId: mathAttempt.id,
      reason: "CALCULO",
      contentGap: true,
      attentionGap: false,
      trapFall: true,
      simplifiedExplanation: "O erro foi usar o valor ja com desconto como base. Em desconto, a base correta e o preco original.",
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
  const mathFlashcard = await prisma.flashcard.create({
    data: {
      userId: student.id,
      subjectId: mathErrorQuestion.subjectId,
      topicId: mathErrorQuestion.topicId,
      questionId: mathErrorQuestion.id,
      errorEntryId: mathError.id,
      front: "Em uma questao de desconto, qual valor deve ser usado como base?",
      back: "A base e o preco original. Se o valor pago e 85%, divida o valor pago por 0,85 para achar o original.",
      difficulty: "MEDIA",
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      source: "erro-seed"
    }
  });
  await prisma.reviewSchedule.create({
    data: {
      userId: student.id,
      subjectId: mathErrorQuestion.subjectId,
      topicId: mathErrorQuestion.topicId,
      flashcardId: mathFlashcard.id,
      type: "ERRO",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  const allQuestions = await prisma.question.findMany({
    orderBy: [{ subject: { order: "asc" } }, { examNumber: "asc" }]
  });

  const simulation = await prisma.simulation.create({
    data: {
      title: "Simulado diagnostico FGV - base inicial",
      type: "COMPLETO",
      timeLimitMinutes: 240,
      totalQuestions: allQuestions.length,
      questions: {
        create: allQuestions.map((item, index) => ({
          questionId: item.id,
          order: index + 1
        }))
      }
    }
  });

  await prisma.simulationResult.create({
    data: {
      userId: student.id,
      simulationId: simulation.id,
      completedAt: new Date(),
      score: 62,
      correctCount: 3,
      wrongCount: Math.max(0, allQuestions.length - 3),
      timeSpentSeconds: 58 * 60,
      diagnosis: "Base inicial aprovada, mas Matematica e Penal ainda precisam de reforco.",
      nextSevenDaysPlan:
        "Dia 1: revisar erros. Dia 2: porcentagem. Dia 3: DUDH. Dia 4: atos administrativos. Dia 5: regimes de pena. Dia 6: questoes mistas. Dia 7: novo simulado curto."
    }
  });

  const firstSubject = await prisma.subject.findUniqueOrThrow({ where: { slug: "lingua-portuguesa" } });
  const firstTopic = await prisma.edictalTopic.findFirstOrThrow({ where: { subjectId: firstSubject.id } });

  await prisma.flashcard.create({
    data: {
      userId: student.id,
      subjectId: firstSubject.id,
      topicId: firstTopic.id,
      front: "Quando ocorre crase?",
      back: "Quando ha encontro da preposicao 'a' com artigo 'a' ou pronome iniciado por 'a', respeitando regencia e termo feminino.",
      difficulty: "MEDIA",
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      source: "seed"
    }
  });

  await prisma.studyPlan.create({
    data: {
      userId: student.id,
      title: "Ciclo inicial de 7 dias",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tasks: {
        create: [
          {
            subjectId: firstSubject.id,
            topicId: firstTopic.id,
            type: "REVISAO",
            title: "Revisar crase e interpretacao",
            rationale: "Portugues e criterio de desempate e precisa ficar forte.",
            scheduledFor: new Date(),
            durationMinutes: 40
          },
          {
            subjectId: dh.id,
            topicId: dhTopic.id,
            type: "QUESTOES",
            title: "Resolver questoes de DUDH",
            rationale: "Direitos Humanos apareceu com literalidade e situacoes praticas.",
            scheduledFor: new Date(),
            durationMinutes: 35
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
