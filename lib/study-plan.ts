import { prisma } from "@/lib/prisma";

const demoEmail = "aluno@pmerj.local";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

export async function getStudyPlanDashboard() {
  const user = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: {
      profile: true,
      studyPlans: {
        where: { status: "ATIVO" },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          tasks: {
            orderBy: { scheduledFor: "asc" },
            include: { subject: true, topic: true }
          }
        }
      },
      subjectProgress: { include: { subject: true }, orderBy: { accuracy: "asc" } }
    }
  });

  if (!user || !user.profile) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const pendingReviews = await prisma.reviewSchedule.count({ where: { userId: user.id, completedAt: null } });
  const errors = await prisma.errorNotebookEntry.count({ where: { userId: user.id } });
  const weakSubjects = user.subjectProgress.filter((item) => item.accuracy < 60).slice(0, 3);
  const plan = user.studyPlans[0];

  return {
    dailyMinutes: user.profile.dailyMinutes,
    pendingReviews,
    errors,
    weakSubjects: weakSubjects.map((item) => ({
      name: item.subject.shortName,
      accuracy: item.accuracy
    })),
    plan: plan
      ? {
          title: plan.title,
          startDate: formatDate(plan.startDate),
          endDate: formatDate(plan.endDate),
          tasks: plan.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            type: task.type.replaceAll("_", " "),
            rationale: task.rationale,
            scheduledFor: formatDate(task.scheduledFor),
            durationMinutes: task.durationMinutes,
            subject: task.subject?.shortName ?? "Geral",
            topic: task.topic?.title ?? "Sem topico",
            completed: Boolean(task.completedAt)
          }))
        }
      : null
  };
}
