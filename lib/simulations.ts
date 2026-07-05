import { prisma } from "@/lib/prisma";

const demoEmail = "aluno@pmerj.local";

function formatSeconds(seconds: number) {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h${String(rest).padStart(2, "0")}` : `${minutes}min`;
}

export async function getSimulationsDashboard() {
  const user = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: {
      subjectProgress: { include: { subject: true }, orderBy: { subject: { order: "asc" } } },
      simulationResults: {
        include: { simulation: true },
        orderBy: { startedAt: "desc" },
        take: 5
      }
    }
  });

  if (!user) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const questionCount = await prisma.question.count({ where: { active: true } });
  const errorCount = await prisma.errorNotebookEntry.count({ where: { userId: user.id } });
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } }
  });

  const attempts = await prisma.studentAttempt.findMany({
    where: { userId: user.id },
    include: { question: { include: { subject: true } } }
  });

  const subjectPerformance = subjects.map((subject) => {
    const subjectAttempts = attempts.filter((attempt) => attempt.question.subjectId === subject.id);
    const correct = subjectAttempts.filter((attempt) => attempt.isCorrect).length;
    const wrong = Math.max(0, subjectAttempts.length - correct);
    const accuracy = subjectAttempts.length ? Math.round((correct / subjectAttempts.length) * 100) : 0;
    const progress = user.subjectProgress.find((item) => item.subjectId === subject.id);

    return {
      id: subject.id,
      slug: subject.slug,
      name: subject.name,
      shortName: subject.shortName,
      availableQuestions: subject._count.questions,
      correct,
      wrong,
      accuracy: accuracy || progress?.accuracy || 0,
      weak: (accuracy || progress?.accuracy || 0) < 60
    };
  });

  const latest = user.simulationResults[0];
  const weakSubjects = subjectPerformance.filter((item) => item.weak).slice(0, 3);
  const strongSubjects = subjectPerformance.filter((item) => !item.weak).slice(0, 3);

  return {
    totals: {
      questionCount,
      errorCount,
      simulationsDone: user.simulationResults.length,
      weakSubjects: weakSubjects.length
    },
    subjectPerformance,
    weakSubjects,
    strongSubjects,
    latestResult: latest
      ? {
          title: latest.simulation.title,
          score: latest.score,
          correctCount: latest.correctCount,
          wrongCount: latest.wrongCount,
          timeSpent: formatSeconds(latest.timeSpentSeconds),
          diagnosis: latest.diagnosis ?? "Sem diagnostico registrado.",
          nextSevenDaysPlan: latest.nextSevenDaysPlan ?? "Sem plano registrado."
        }
      : null,
    history: user.simulationResults.map((result) => ({
      id: result.id,
      title: result.simulation.title,
      score: result.score,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      timeSpent: formatSeconds(result.timeSpentSeconds)
    }))
  };
}
