import { essayPromptSeeds } from "@/lib/essay-prompts";
import { prisma } from "@/lib/prisma";

export const essayRules = {
  type: "dissertativo-argumentativo",
  minLines: 25,
  maxLines: 30,
  formalPoints: 30,
  textualPoints: 30,
  technicalPoints: 40,
  maxScore: 100
};

async function ensureEssayPrompts() {
  const count = await prisma.essayPrompt.count();

  if (count === 0) {
    await prisma.essayPrompt.createMany({ data: essayPromptSeeds });
  }
}

export async function getEssayPracticeData() {
  await ensureEssayPrompts();

  const prompts = await prisma.essayPrompt.findMany({
    where: { active: true },
    orderBy: [{ source: "asc" }, { title: "asc" }]
  });

  const submissions = await prisma.essaySubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { prompt: true, user: true }
  });

  return {
    rules: essayRules,
    prompts: prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      theme: prompt.theme,
      category: prompt.category,
      source: prompt.source,
      statement: prompt.statement,
      supportText: prompt.supportText
    })),
    submissions: submissions.map((submission) => ({
      id: submission.id,
      theme: submission.prompt.theme,
      score: submission.score,
      lineCount: submission.lineCount,
      model: submission.aiModel,
      createdAt: submission.createdAt.toLocaleDateString("pt-BR")
    }))
  };
}
