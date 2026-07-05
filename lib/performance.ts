import { prisma } from "@/lib/prisma";

const demoEmail = "aluno@pmerj.local";

export async function getPerformanceDashboard() {
  const user = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: {
      generalProgress: true,
      subjectProgress: { include: { subject: true }, orderBy: { subject: { order: "asc" } } },
      simulationResults: { include: { simulation: true }, orderBy: { startedAt: "desc" } }
    }
  });

  if (!user || !user.generalProgress) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const attempts = await prisma.studentAttempt.findMany({
    where: { userId: user.id },
    include: { question: { include: { subject: true } } }
  });
  const reviewsLate = await prisma.reviewSchedule.count({
    where: { userId: user.id, completedAt: null, scheduledFor: { lt: new Date() } }
  });
  const sessions = await prisma.studySession.findMany({ where: { userId: user.id }, include: { subject: true } });

  const subjectRows = user.subjectProgress.map((progress) => {
    const subjectAttempts = attempts.filter((attempt) => attempt.question.subjectId === progress.subjectId);
    const correct = subjectAttempts.filter((attempt) => attempt.isCorrect).length;
    const wrong = Math.max(0, subjectAttempts.length - correct);
    const minutes = sessions.filter((session) => session.subjectId === progress.subjectId).reduce((sum, session) => sum + session.minutes, 0);

    return {
      name: progress.subject.shortName,
      fullName: progress.subject.name,
      accuracy: progress.accuracy,
      progress: progress.progress,
      correct,
      wrong,
      questionsDone: progress.questionsDone,
      minutes,
      weak: progress.accuracy < 60 || progress.progress < 25
    };
  });

  const weeklyEvolution = [
    { label: "Sem 1", value: Math.max(10, user.generalProgress.editalPercent - 12) },
    { label: "Sem 2", value: Math.max(15, user.generalProgress.editalPercent - 8) },
    { label: "Sem 3", value: Math.max(20, user.generalProgress.editalPercent - 4) },
    { label: "Atual", value: user.generalProgress.editalPercent }
  ];
  const monthlyEvolution = [
    { label: "Mes 1", value: Math.max(20, user.generalProgress.overallAccuracy - 10) },
    { label: "Mes 2", value: Math.max(35, user.generalProgress.overallAccuracy - 5) },
    { label: "Atual", value: user.generalProgress.overallAccuracy }
  ];
  const projection = Math.min(100, user.generalProgress.editalPercent + 18);

  return {
    totals: {
      editalPercent: user.generalProgress.editalPercent,
      accuracy: user.generalProgress.overallAccuracy,
      studyMinutes: user.generalProgress.studyMinutes,
      questionsDone: user.generalProgress.questionsDone,
      simulationsDone: user.generalProgress.simulationsDone,
      reviewsLate,
      projection
    },
    subjectRows,
    strong: subjectRows.filter((item) => !item.weak).sort((a, b) => b.accuracy - a.accuracy),
    weak: subjectRows.filter((item) => item.weak).sort((a, b) => a.accuracy - b.accuracy),
    weeklyEvolution,
    monthlyEvolution,
    alerts: [
      reviewsLate > 0 ? `${reviewsLate} revisao(oes) atrasada(s).` : "Nenhuma revisao atrasada.",
      subjectRows.some((item) => item.weak) ? "Ha materias abaixo da linha de seguranca." : "Materias dentro da meta inicial.",
      user.generalProgress.overallAccuracy < 75 ? "Taxa de acerto ainda abaixo da meta de 75%." : "Taxa de acerto em zona boa."
    ],
    simulations: user.simulationResults.map((result) => ({
      title: result.simulation.title,
      score: result.score,
      correct: result.correctCount,
      wrong: result.wrongCount
    }))
  };
}
