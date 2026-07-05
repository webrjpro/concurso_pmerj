import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, LIMITS } from "@/lib/security";


function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "plan_generate", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as { dailyMinutes?: number; days?: number };
  const dailyMinutes = Math.max(30, Math.min(360, body.dailyMinutes ?? 120));
  const days = Math.max(3, Math.min(30, body.days ?? 7));

  const user = await prisma.user.findUnique({ where: { id: (await getCurrentUser())?.id || "" }, include: { profile: true } });
  if (!user) {
    return errorResponse("Aluno demonstracao nao encontrado.", 404);
  }

  await prisma.studentProfile.update({
    where: { userId: user.id },
    data: { dailyMinutes }
  });

  const weakSubjects = await prisma.studentSubjectProgress.findMany({
    where: { userId: user.id },
    orderBy: [{ accuracy: "asc" }, { progress: "asc" }],
    include: { subject: true },
    take: 3
  });

  const pendingReviews = await prisma.reviewSchedule.findMany({
    where: { userId: user.id, completedAt: null },
    include: { subject: true, topic: true },
    take: 3
  });

  const notStartedTopics = await prisma.studentTopicProgress.findMany({
    where: { userId: user.id, status: "NAO_INICIADO" },
    include: { topic: { include: { subject: true } } },
    take: 8
  });

  await prisma.studyPlan.updateMany({
    where: { userId: user.id, status: "ATIVO" },
    data: { status: "PAUSADO" }
  });

  const tasks = Array.from({ length: days }).flatMap((_, index) => {
    const date = addDays(index);
    const weak = weakSubjects[index % Math.max(1, weakSubjects.length)];
    const review = pendingReviews[index % Math.max(1, pendingReviews.length)];
    const topic = notStartedTopics[index % Math.max(1, notStartedTopics.length)];
    const block = Math.max(25, Math.floor(dailyMinutes / 3));

    return [
      review
        ? {
            type: "REVISAO" as const,
            title: `Revisar ${review.topic?.title ?? review.subject?.shortName ?? "conteudo pendente"}`,
            rationale: "Revisao pendente deve vir antes de conteudo novo.",
            scheduledFor: date,
            durationMinutes: block,
            subjectId: review.subjectId,
            topicId: review.topicId
          }
        : null,
      weak
        ? {
            type: "QUESTOES" as const,
            title: `Questoes de ${weak.subject.shortName}`,
            rationale: "Materia fraca precisa de treino ativo para subir a taxa de acerto.",
            scheduledFor: date,
            durationMinutes: block,
            subjectId: weak.subjectId,
            topicId: null
          }
        : null,
      topic
        ? {
            type: index % 6 === 5 ? ("SIMULADO" as const) : ("ESTUDO_NOVO" as const),
            title: index % 6 === 5 ? "Simulado curto e correcao" : `Estudar ${topic.topic.title}`,
            rationale: index % 6 === 5 ? "Simulado mede evolucao e revela travas." : "Topico ainda nao iniciado no edital.",
            scheduledFor: date,
            durationMinutes: dailyMinutes - block * 2,
            subjectId: topic.topic.subjectId,
            topicId: topic.topicId
          }
        : null
    ].filter(Boolean);
  });

  const plan = await prisma.studyPlan.create({
    data: {
      userId: user.id,
      title: `Plano automatico de ${days} dias`,
      startDate: new Date(),
      endDate: addDays(days),
      tasks: {
        create: tasks.map((task) => ({
          type: task!.type,
          title: task!.title,
          rationale: task!.rationale,
          scheduledFor: task!.scheduledFor,
          durationMinutes: task!.durationMinutes,
          subjectId: task!.subjectId ?? undefined,
          topicId: task!.topicId ?? undefined
        }))
      }
    },
    include: { tasks: true }
  });

  return NextResponse.json({
    id: plan.id,
    title: plan.title,
    tasks: plan.tasks.length,
    dailyMinutes,
    days
  });
}
