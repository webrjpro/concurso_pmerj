import { prisma } from "@/lib/prisma";

const demoEmail = "aluno@pmerj.local";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export async function getErrorNotebook() {
  const user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const entries = await prisma.errorNotebookEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      topic: true,
      question: {
        include: {
          answerKey: true,
          options: { orderBy: { label: "asc" } }
        }
      },
      attempt: true,
      flashcard: true
    }
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    select: { shortName: true, name: true }
  });

  return {
    subjects,
    entries: entries.map((entry) => ({
      id: entry.id,
      subject: entry.subject.shortName,
      subjectFull: entry.subject.name,
      topic: entry.topic.title,
      difficulty: entry.question.difficulty,
      reason: entry.reason,
      createdAt: formatDate(entry.createdAt),
      nextReviewAt: formatDate(entry.nextReviewAt),
      selectedLabel: entry.attempt?.selectedLabel ?? "-",
      correctLabel: entry.question.answerKey?.correctLabel ?? "-",
      statement: entry.question.statement,
      simplifiedExplanation: entry.simplifiedExplanation,
      contentGap: entry.contentGap,
      attentionGap: entry.attentionGap,
      trapFall: entry.trapFall,
      mandatoryReview: entry.mandatoryReview,
      flashcardFront: entry.flashcard?.front ?? null,
      reviewConcept: entry.question.reviewConcept
    }))
  };
}
