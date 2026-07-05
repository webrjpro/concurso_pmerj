import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export async function getReviewCenter() {
  const user = await prisma.user.findUnique({ where: { id: (await getCurrentUser())?.id || "" } });
  if (!user) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const cards = await prisma.flashcard.findMany({
    where: { userId: user.id },
    orderBy: { nextReviewAt: "asc" },
    include: { subject: true, topic: true }
  });

  const pendingReviews = await prisma.reviewSchedule.count({
    where: { userId: user.id, completedAt: null }
  });

  return {
    cycles: [
      { label: "24 horas", days: 1, description: "Primeira revisao depois do contato." },
      { label: "7 dias", days: 7, description: "Consolidacao inicial." },
      { label: "15 dias", days: 15, description: "Protecao contra esquecimento." },
      { label: "30 dias", days: 30, description: "Manutencao de longo prazo." }
    ],
    metrics: {
      flashcards: cards.length,
      pendingReviews,
      dueToday: cards.filter((card) => card.nextReviewAt <= new Date()).length,
      weakCards: cards.filter((card) => card.wrongCount > card.correctCount).length
    },
    cards: cards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      subject: card.subject.shortName,
      topic: card.topic.title,
      difficulty: card.difficulty,
      nextReviewAt: formatDate(card.nextReviewAt),
      intervalDays: card.intervalDays,
      correctCount: card.correctCount,
      wrongCount: card.wrongCount
    }))
  };
}
