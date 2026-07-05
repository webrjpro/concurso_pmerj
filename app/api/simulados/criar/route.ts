import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, sanitizeText, validateCuid, LIMITS } from "@/lib/security";


const allowedTypes = [
  "COMPLETO",
  "MATERIA",
  "ASSUNTO",
  "ASSUNTOS_FRACOS",
  "QUESTOES_ERRADAS",
  "CRONOMETRADO"
] as const;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "simulation_create", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as { type?: string; subjectSlug?: string; topicId?: string };
  const type = allowedTypes.includes(body.type as (typeof allowedTypes)[number])
    ? (body.type as (typeof allowedTypes)[number])
    : "COMPLETO";

  if (body.topicId && !validateCuid(body.topicId)) {
      return errorResponse("ID de topico invalido.", 400);
  }

  const subjectSlug = sanitizeText(body.subjectSlug, LIMITS.MAX_SHORT_TEXT_LENGTH);

  const user = await prisma.user.findUnique({ where: { id: (await getCurrentUser())?.id || "" } });
  if (!user) {
    return errorResponse("Aluno demonstracao nao encontrado.", 404);
  }

  const weakSubjectIds = await prisma.studentSubjectProgress.findMany({
    where: { userId: user.id, accuracy: { lt: 60 } },
    select: { subjectId: true }
  });

  const errorQuestionIds = await prisma.errorNotebookEntry.findMany({
    where: { userId: user.id },
    select: { questionId: true }
  });

  const where =
    type === "MATERIA" && subjectSlug
      ? { subject: { slug: subjectSlug }, active: true }
      : type === "ASSUNTO" && body.topicId
        ? { topicId: body.topicId, active: true }
        : type === "ASSUNTOS_FRACOS"
          ? { subjectId: { in: weakSubjectIds.map((item) => item.subjectId) }, active: true }
          : type === "QUESTOES_ERRADAS"
            ? { id: { in: errorQuestionIds.map((item) => item.questionId) }, active: true }
            : { active: true };

  let questions = await prisma.question.findMany({
    where,
    orderBy: [{ subject: { order: "asc" } }, { examNumber: "asc" }],
    take: type === "COMPLETO" || type === "CRONOMETRADO" ? 50 : 15
  });

  if (questions.length === 0) {
    questions = await prisma.question.findMany({
      where: { active: true },
      orderBy: [{ subject: { order: "asc" } }, { examNumber: "asc" }],
      take: 15
    });
  }

  const simulation = await prisma.simulation.create({
    data: {
      title: `Simulado ${type.toLowerCase().replaceAll("_", " ")}`,
      type,
      timeLimitMinutes: type === "CRONOMETRADO" ? 240 : 90,
      totalQuestions: questions.length,
      questions: {
        create: questions.map((question, index) => ({
          questionId: question.id,
          order: index + 1
        }))
      }
    }
  });

  return NextResponse.json({
    id: simulation.id,
    title: simulation.title,
    type: simulation.type,
    totalQuestions: simulation.totalQuestions,
    timeLimitMinutes: simulation.timeLimitMinutes,
    message: "Simulado criado com questoes disponiveis no banco."
  });
}
