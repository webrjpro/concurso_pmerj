import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


function minutesToHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h${String(rest).padStart(2, "0")}` : `${hours}h`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

function statusToUi(status: string) {
  const map = {
    NAO_INICIADO: "nao-iniciado",
    ESTUDANDO: "estudando",
    REVISANDO: "revisando",
    DOMINADO: "dominado"
  } as const;

  return map[status as keyof typeof map] ?? "nao-iniciado";
}

export async function getStudentDashboard() {
  const user = await prisma.user.findUnique({
    where: { id: (await getCurrentUser())?.id || "" },
    include: {
      profile: true,
      generalProgress: true,
      subjectProgress: {
        include: { subject: true },
        orderBy: { subject: { order: "asc" } }
      },
      studyPlans: {
        where: { status: "ATIVO" },
        include: {
          tasks: {
            include: { subject: true, topic: true },
            orderBy: { scheduledFor: "asc" }
          }
        },
        take: 1,
        orderBy: { createdAt: "desc" }
      },
      reviews: {
        include: { subject: true, topic: true, flashcard: true },
        orderBy: { scheduledFor: "asc" },
        take: 6
      },
      flashcards: {
        orderBy: { nextReviewAt: "asc" },
        take: 4,
        include: { subject: true, topic: true }
      }
    }
  });

  if (!user || !user.profile || !user.generalProgress) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const attemptsCount = await prisma.studentAttempt.count({ where: { userId: user.id } });
  const errorsCount = await prisma.errorNotebookEntry.count({ where: { userId: user.id } });
  const simulationsDone = user.generalProgress.simulationsDone;

  const subjectCards = user.subjectProgress.map((item) => ({
    id: item.id,
    name: item.subject.name,
    shortName: item.subject.shortName,
    description: item.subject.description,
    progress: item.progress,
    mastery: item.mastery,
    accuracy: item.accuracy,
    questionsDone: item.questionsDone,
    status: statusToUi(item.status),
    delayed: item.progress < 25 || item.accuracy < 55
  }));

  const inProgress = subjectCards.filter((subject) => subject.status === "estudando" || subject.status === "revisando");
  const delayed = subjectCards.filter((subject) => subject.delayed);
  const strong = subjectCards.filter((subject) => subject.accuracy >= 60).sort((a, b) => b.accuracy - a.accuracy);
  const weak = subjectCards.filter((subject) => subject.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  const plan = user.studyPlans[0];
  const missions = plan?.tasks.slice(0, 5).map((task) => ({
    id: task.id,
    title: task.title,
    rationale: task.rationale,
    duration: task.durationMinutes,
    type: task.type.replaceAll("_", " "),
    subject: task.subject?.shortName ?? "Geral",
    topic: task.topic?.title ?? "Sem topico"
  })) ?? [];

  const nextReviews = [
    ...user.reviews.map((review) => ({
      id: review.id,
      title: review.topic?.title ?? review.flashcard?.front ?? "Revisao programada",
      subject: review.subject?.shortName ?? "Geral",
      date: formatDate(review.scheduledFor),
      kind: review.type
    })),
    ...user.flashcards.map((card) => ({
      id: card.id,
      title: card.front,
      subject: card.subject.shortName,
      date: formatDate(card.nextReviewAt),
      kind: "FLASHCARD"
    }))
  ].slice(0, 6);

  return {
    student: {
      name: user.name,
      dailyMinutes: user.profile.dailyMinutes,
      beginnerMode: user.profile.beginnerMode,
      currentLevel: user.profile.currentLevel,
      streakDays: user.profile.streakDays
    },
    metrics: [
      {
        label: "Edital estudado",
        value: `${user.generalProgress.editalPercent}%`,
        detail: "Progresso geral",
        tone: "green"
      },
      {
        label: "Taxa de acerto",
        value: `${user.generalProgress.overallAccuracy}%`,
        detail: `${attemptsCount} tentativa(s) registradas`,
        tone: "blue"
      },
      {
        label: "Tempo estudado",
        value: minutesToHours(user.generalProgress.studyMinutes),
        detail: "Acumulado do aluno",
        tone: "gold"
      },
      {
        label: "Revisoes pendentes",
        value: String(user.generalProgress.pendingReviews),
        detail: "Entram primeiro no plano",
        tone: "red"
      }
    ],
    counts: {
      questionsDone: user.generalProgress.questionsDone,
      simulationsDone,
      errorsCount,
      inProgress: inProgress.length,
      delayed: delayed.length
    },
    strong,
    weak,
    delayed,
    subjects: subjectCards,
    missions,
    nextReviews,
    persistentWeakness: user.generalProgress.persistentWeakness ?? "Sem ponto fraco persistente registrado.",
    strongPoints: user.generalProgress.strongPoints ?? "Sem ponto forte registrado."
  };
}
