import { prisma } from "@/lib/prisma";

const demoEmail = "aluno@pmerj.local";

function statusToUi(status?: string) {
  const map = {
    NAO_INICIADO: "nao-iniciado",
    ESTUDANDO: "estudando",
    REVISANDO: "revisando",
    DOMINADO: "dominado"
  } as const;

  return map[(status ?? "NAO_INICIADO") as keyof typeof map] ?? "nao-iniciado";
}

function priorityLabel(weight: number) {
  if (weight >= 85) return "Alta";
  if (weight >= 65) return "Media";
  return "Base";
}

export async function getEditalMap() {
  const user = await prisma.user.findUnique({
    where: { email: demoEmail },
    select: { id: true }
  });

  if (!user) {
    throw new Error("Aluno demonstracao nao encontrado. Rode npm run db:seed.");
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      subjectProgress: {
        where: { userId: user.id },
        take: 1
      },
      topics: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          topicProgress: {
            where: { userId: user.id },
            take: 1
          },
          children: {
            orderBy: { order: "asc" },
            include: {
              topicProgress: {
                where: { userId: user.id },
                take: 1
              },
              _count: {
                select: { questions: true }
              }
            }
          },
          _count: {
            select: { questions: true }
          }
        }
      }
    }
  });

  return subjects.map((subject) => {
    const subjectProgress = subject.subjectProgress[0];

    return {
      id: subject.id,
      name: subject.name,
      shortName: subject.shortName,
      description: subject.description,
      progress: subjectProgress?.progress ?? 0,
      mastery: subjectProgress?.mastery ?? 0,
      accuracy: subjectProgress?.accuracy ?? 0,
      status: statusToUi(subjectProgress?.status),
      topics: subject.topics.map((topic) => {
        const progress = topic.topicProgress[0];

        return {
          id: topic.id,
          code: topic.code,
          title: topic.title,
          priority: priorityLabel(topic.priorityWeight),
          priorityWeight: topic.priorityWeight,
          status: statusToUi(progress?.status),
          mastery: progress?.mastery ?? 0,
          accuracy: progress?.accuracy ?? 0,
          questionsLinked: topic._count.questions,
          reviewDue: progress?.nextReviewAt ? progress.nextReviewAt.toISOString() : null,
          children: topic.children.map((child) => {
            const childProgress = child.topicProgress[0];

            return {
              id: child.id,
              code: child.code,
              title: child.title,
              priority: priorityLabel(child.priorityWeight),
              priorityWeight: child.priorityWeight,
              status: statusToUi(childProgress?.status),
              mastery: childProgress?.mastery ?? 0,
              accuracy: childProgress?.accuracy ?? 0,
              questionsLinked: child._count.questions,
              reviewDue: childProgress?.nextReviewAt ? childProgress.nextReviewAt.toISOString() : null
            };
          })
        };
      })
    };
  });
}
