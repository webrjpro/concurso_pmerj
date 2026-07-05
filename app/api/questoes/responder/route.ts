import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, validateCuid, LIMITS } from "@/lib/security";


export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "question_answer", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as {
    questionId?: string;
    selectedOptionId?: string;
    confidence?: number;
    timeSpentSeconds?: number;
  };

  if (!body.questionId || !body.selectedOptionId) {
    return errorResponse("Questao e alternativa sao obrigatorias.", 400);
  }

  if (!validateCuid(body.questionId) || !validateCuid(body.selectedOptionId)) {
     return errorResponse("IDs invalidos.", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: (await getCurrentUser())?.id || "" } });

  if (!user) {
    return errorResponse("Aluno demonstracao nao encontrado.", 404);
  }

  const question = await prisma.question.findUnique({
    where: { id: body.questionId },
    include: {
      subject: true,
      topic: true,
      answerKey: true,
      options: { orderBy: { label: "asc" } }
    }
  });

  if (!question || !question.answerKey) {
    return NextResponse.json({ error: "Questao nao encontrada." }, { status: 404 });
  }

  const selected = question.options.find((option) => option.id === body.selectedOptionId);

  if (!selected) {
    return NextResponse.json({ error: "Alternativa nao encontrada." }, { status: 404 });
  }

  const correctOption = question.options.find((option) => option.isCorrect);
  const isCorrect = selected.isCorrect;

  const attempt = await prisma.studentAttempt.create({
    data: {
      userId: user.id,
      questionId: question.id,
      selectedOptionId: selected.id,
      selectedLabel: selected.label,
      isCorrect,
      confidence: body.confidence ?? 3,
      timeSpentSeconds: body.timeSpentSeconds ?? 0
    }
  });

  await prisma.generalProgress.update({
    where: { userId: user.id },
    data: {
      questionsDone: { increment: 1 },
      pendingReviews: isCorrect ? undefined : { increment: 1 }
    }
  });

  await prisma.studentSubjectProgress.upsert({
    where: { userId_subjectId: { userId: user.id, subjectId: question.subjectId } },
    create: {
      userId: user.id,
      subjectId: question.subjectId,
      status: "ESTUDANDO",
      progress: 5,
      mastery: isCorrect ? 10 : 3,
      accuracy: isCorrect ? 100 : 0,
      questionsDone: 1
    },
    update: {
      questionsDone: { increment: 1 },
      status: "ESTUDANDO"
    }
  });

  let errorCreated = false;

  if (!isCorrect) {
    const nextReviewAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const errorEntry = await prisma.errorNotebookEntry.create({
      data: {
        userId: user.id,
        questionId: question.id,
        subjectId: question.subjectId,
        topicId: question.topicId,
        attemptId: attempt.id,
        reason: "DESCONHECIDO",
        contentGap: true,
        trapFall: Boolean(question.trap),
        simplifiedExplanation: question.explanation,
        nextReviewAt
      }
    });

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: user.id,
        subjectId: question.subjectId,
        topicId: question.topicId,
        questionId: question.id,
        errorEntryId: errorEntry.id,
        front: `Explique: ${question.reviewConcept}`,
        back: question.correctExplanation,
        difficulty: question.difficulty,
        nextReviewAt,
        source: "erro-automatico"
      }
    });

    await prisma.reviewSchedule.create({
      data: {
        userId: user.id,
        subjectId: question.subjectId,
        topicId: question.topicId,
        flashcardId: flashcard.id,
        type: "ERRO",
        scheduledFor: nextReviewAt
      }
    });

    errorCreated = true;
  }

  return NextResponse.json({
    isCorrect,
    selectedLabel: selected.label,
    correctLabel: question.answerKey.correctLabel,
    correctOption: correctOption ? { label: correctOption.label, text: correctOption.text } : null,
    selectedExplanation: selected.explanation,
    explanation: question.explanation,
    correctExplanation: question.correctExplanation,
    wrongExplanation: question.wrongExplanation,
    trap: question.trap,
    reviewConcept: question.reviewConcept,
    errorCreated
  });
}
