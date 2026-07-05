import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const [users, subjects, topics, questions, simulations, errors, flashcards, plans] = await Promise.all([
    prisma.user.count(),
    prisma.subject.count(),
    prisma.edictalTopic.count(),
    prisma.question.count(),
    prisma.simulation.count(),
    prisma.errorNotebookEntry.count(),
    prisma.flashcard.count(),
    prisma.studyPlan.count()
  ]);

  const subjectList = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      topics: { orderBy: { order: "asc" } },
      _count: { select: { questions: true } }
    }
  });

  const usersList = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { generalProgress: true }
  });

  return {
    stats: { users, subjects, topics, questions, simulations, errors, flashcards, plans },
    subjects: subjectList.map((subject) => ({
      id: subject.id,
      name: subject.name,
      shortName: subject.shortName,
      slug: subject.slug,
      questions: subject._count.questions,
      topics: subject.topics.map((topic) => ({ id: topic.id, title: topic.title, parentId: topic.parentId }))
    })),
    users: usersList.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      editalPercent: user.generalProgress?.editalPercent ?? 0,
      accuracy: user.generalProgress?.overallAccuracy ?? 0
    }))
  };
}
