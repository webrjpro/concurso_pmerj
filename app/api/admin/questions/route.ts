import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, sanitizeText, validateCuid, LIMITS } from "@/lib/security";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "admin_questions", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as {
    subjectId?: string;
    topicId?: string;
    statement?: string;
    correctLabel?: string;
    explanation?: string;
    options?: Record<string, string>;
  };

  if (!body.subjectId || !body.topicId || !body.statement || !body.correctLabel || !body.options) {
    return errorResponse("Campos obrigatorios ausentes.", 400);
  }

  if (!validateCuid(body.subjectId) || !validateCuid(body.topicId)) {
     return errorResponse("IDs invalidos.", 400);
  }

  const statement = sanitizeText(body.statement, LIMITS.MAX_TEXT_LENGTH);
  const explanation = sanitizeText(body.explanation, LIMITS.MAX_TEXT_LENGTH);

  const labels = ["A", "B", "C", "D", "E"];
  const question = await prisma.question.create({
    data: {
      subjectId: body.subjectId,
      topicId: body.topicId,
      statement: statement,
      difficulty: "MEDIA",
      explanation: explanation || "Explicacao cadastrada pelo administrador.",
      correctExplanation: "Alternativa correta conforme gabarito informado.",
      wrongExplanation: "Alternativas erradas devem ser revisadas pelo administrador.",
      trap: "Pegadinha a revisar no cadastro detalhado.",
      reviewConcept: "Conceito vinculado ao topico do edital.",
      options: {
        create: labels.map((label) => ({
          label,
          text: sanitizeText(body.options?.[label] || `Alternativa ${label}`, LIMITS.MAX_TEXT_LENGTH),
          isCorrect: label === body.correctLabel,
          explanation: label === body.correctLabel ? "Correta." : "Errada."
        }))
      },
      answerKey: {
        create: {
          correctLabel: body.correctLabel,
          source: "Cadastro administrativo"
        }
      }
    }
  });

  return NextResponse.json(question);
}
