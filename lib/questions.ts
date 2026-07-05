import { prisma } from "@/lib/prisma";

export async function getQuestionBank(subjectSlug?: string) {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, shortName: true, name: true }
  });

  const questions = await prisma.question.findMany({
    where: {
      active: true,
      subject: subjectSlug ? { slug: subjectSlug } : undefined
    },
    orderBy: [{ subject: { order: "asc" } }, { examNumber: "asc" }],
    include: {
      subject: true,
      topic: true,
      options: {
        orderBy: { label: "asc" },
        select: { id: true, label: true, text: true }
      }
    }
  });

  return {
    subjects,
    questions: questions.map((question) => ({
      id: question.id,
      examNumber: question.examNumber,
      statement: question.statement,
      difficulty: question.difficulty,
      explanation: question.explanation,
      correctExplanation: question.correctExplanation,
      wrongExplanation: question.wrongExplanation,
      trap: question.trap,
      reviewConcept: question.reviewConcept,
      subject: {
        name: question.subject.name,
        shortName: question.subject.shortName,
        slug: question.subject.slug
      },
      topic: {
        title: question.topic.title
      },
      options: question.options
    }))
  };
}
