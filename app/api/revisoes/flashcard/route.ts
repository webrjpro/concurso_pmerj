import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { ReviewResult } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, validateCuid, LIMITS } from "@/lib/security";


function calculateInterval(current: number, result: string) {
  if (result === "ERREI") return 1;
  if (result === "DIFICIL") return Math.max(1, current);
  if (result === "MEDIO") return current < 7 ? 7 : Math.min(30, current + 8);
  return current < 7 ? 7 : current < 15 ? 15 : 30;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "flashcard_review", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as { flashcardId?: string; result?: string };
  const result: ReviewResult =
    body.result && ["ERREI", "DIFICIL", "MEDIO", "FACIL"].includes(body.result)
      ? (body.result as ReviewResult)
      : "MEDIO";

  if (!body.flashcardId) {
    return errorResponse("Flashcard obrigatorio.", 400);
  }

  if (!validateCuid(body.flashcardId)) {
    return errorResponse("ID invalido.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: (await getCurrentUser())?.id || "" } });
  if (!user) {
    return errorResponse("Aluno demonstracao nao encontrado.", 404);
  }

  const card = await prisma.flashcard.findFirst({
    where: { id: body.flashcardId, userId: user.id }
  });

  if (!card) {
    return errorResponse("Flashcard nao encontrado.", 404);
  }

  const intervalDays = calculateInterval(card.intervalDays, result);
  const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  const easeDelta = result === "FACIL" ? 0.15 : result === "MEDIO" ? 0.03 : result === "DIFICIL" ? -0.1 : -0.25;

  const updated = await prisma.flashcard.update({
    where: { id: card.id },
    data: {
      intervalDays,
      nextReviewAt,
      easeFactor: Math.max(1.3, card.easeFactor + easeDelta),
      correctCount: result === "ERREI" ? card.correctCount : card.correctCount + 1,
      wrongCount: result === "ERREI" ? card.wrongCount + 1 : card.wrongCount
    }
  });

  await prisma.reviewSchedule.create({
    data: {
      userId: user.id,
      subjectId: card.subjectId,
      topicId: card.topicId,
      flashcardId: card.id,
      type: "FLASHCARD",
      scheduledFor: new Date(),
      completedAt: new Date(),
      result
    }
  });

  return NextResponse.json({
    id: updated.id,
    result,
    intervalDays: updated.intervalDays,
    nextReviewAt: updated.nextReviewAt.toISOString(),
    correctCount: updated.correctCount,
    wrongCount: updated.wrongCount
  });
}
