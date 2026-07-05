import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { essayRules } from "@/lib/essay";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, sanitizeText, validateCuid, LIMITS } from "@/lib/security";

export const runtime = "nodejs";

const demoEmail = "aluno@pmerj.local";

type Correction = {
  score: number;
  formalScore: number;
  textualScore: number;
  technicalScore: number;
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  lineFeedback: string;
  finalMessage: string;
};

function countLines(content: string) {
  return content.replace(/\r/g, "").split("\n").filter((line) => line.trim().length > 0).length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function fallbackCorrection(content: string, lineCount: number): Correction {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const hasThesis = /defendo|entendo|portanto|assim|desse modo|nesse sentido/i.test(content);
  const hasConnectors = /al[eé]m disso|por outro lado|contudo|portanto|assim|dessa forma|em primeiro lugar/i.test(content);
  const linePenalty = lineCount < essayRules.minLines || lineCount > essayRules.maxLines ? 12 : 0;
  const sizePenalty = words.length < 180 ? 10 : 0;
  const formalScore = clamp(24 - sizePenalty / 2 - linePenalty / 3, 0, essayRules.formalPoints);
  const textualScore = clamp((hasConnectors ? 24 : 17) - linePenalty / 3, 0, essayRules.textualPoints);
  const technicalScore = clamp((hasThesis ? 31 : 22) - sizePenalty / 2 - linePenalty / 3, 0, essayRules.technicalPoints);

  return {
    score: clamp(formalScore + textualScore + technicalScore, 0, 100),
    formalScore,
    textualScore,
    technicalScore,
    strengths: [
      hasThesis ? "Ha tentativa de posicionamento argumentativo." : "O texto apresenta base para desenvolver uma tese.",
      "A estrutura pode ser evoluida com treino orientado."
    ],
    weaknesses: [
      linePenalty ? "A quantidade de linhas esta fora do intervalo oficial de 25 a 30." : "A linha oficial foi respeitada.",
      hasConnectors ? "Conectivos aparecem, mas podem ser usados com mais estrategia." : "Faltam conectivos claros para guiar a argumentacao.",
      words.length < 180 ? "O desenvolvimento ainda esta curto para sustentar nota alta." : "O desenvolvimento precisa de argumentos mais densos."
    ],
    actionPlan: [
      "Escreva uma tese direta no primeiro paragrafo.",
      "Use dois argumentos fortes, um por paragrafo.",
      "Feche com conclusao coerente e retomada da tese.",
      "Revise concordancia, pontuacao e repeticoes antes de enviar."
    ],
    lineFeedback: `Texto com ${lineCount} linha(s). O oficial PMERJ exige de ${essayRules.minLines} a ${essayRules.maxLines}.`,
    finalMessage: "Nota rigorosa gerada por corretor local porque a IA externa nao estava configurada. Ajuste os pontos fracos e reescreva buscando nota maxima."
  };
}

function parseCorrection(raw: string, content: string, lineCount: number): Correction {
  try {
    const json = raw.replace(/```json|```/g, "").trim();
    const start = json.indexOf("{");
    const end = json.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 && end >= start ? json.slice(start, end + 1) : json) as Partial<Correction>;
    const formalScore = clamp(Number(parsed.formalScore ?? 0), 0, essayRules.formalPoints);
    const textualScore = clamp(Number(parsed.textualScore ?? 0), 0, essayRules.textualPoints);
    const technicalScore = clamp(Number(parsed.technicalScore ?? 0), 0, essayRules.technicalPoints);
    return {
      score: clamp(Number(parsed.score ?? formalScore + textualScore + technicalScore), 0, 100),
      formalScore,
      textualScore,
      technicalScore,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
      actionPlan: Array.isArray(parsed.actionPlan) ? parsed.actionPlan.map(String) : [],
      lineFeedback: String(parsed.lineFeedback ?? `Texto com ${lineCount} linha(s).`),
      finalMessage: String(parsed.finalMessage ?? "Continue revisando com foco na nota maxima.")
    };
  } catch {
    return fallbackCorrection(content, lineCount);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  // Limite estrito para a API da Groq
  if (!rateLimiter(ip, "essay_correction", LIMITS.MAX_REQUESTS_PER_MINUTE_AI)) {
    return errorResponse("Limite de correcoes atingido. Tente novamente mais tarde.", 429);
  }

  let body: { promptId?: string; content?: string };

  try {
    body = (await request.json()) as { promptId?: string; content?: string };
  } catch {
    return errorResponse("JSON invalido.", 400);
  }

  if (!body.promptId || !body.content?.trim()) {
    return errorResponse("Tema e redacao sao obrigatorios.", 400);
  }

  if (!validateCuid(body.promptId)) {
    return errorResponse("ID de tema invalido.", 400);
  }

  const content = sanitizeText(body.content, LIMITS.MAX_TEXT_LENGTH);
  if(content.length < 50) {
      return errorResponse("Texto muito curto para correcao.", 400);
  }

  const [user, prompt] = await Promise.all([
    prisma.user.findUnique({ where: { email: demoEmail } }),
    prisma.essayPrompt.findUnique({ where: { id: body.promptId } })
  ]);

  if (!user || !prompt) {
    return errorResponse("Usuario ou tema nao encontrado.", 404);
  }

  const lineCount = countLines(content);
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  let correction: Correction;
  let provider = "local";

  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.2,
        top_p: 1,
        max_completion_tokens: 4096,
        messages: [
          {
            role: "system",
            content:
              "Voce e uma banca rigorosa de redacao para concurso publico militar. Corrija sem pena, com nota realista, mas com orientacao construtiva. Responda apenas JSON valido."
          },
          {
            role: "user",
            content: JSON.stringify({
              edital: {
                tipo: essayRules.type,
                linhas: `${essayRules.minLines} a ${essayRules.maxLines}`,
                criterios: {
                  formal: essayRules.formalPoints,
                  textual: essayRules.textualPoints,
                  tecnicoArgumentativo: essayRules.technicalPoints
                }
              },
              tema: prompt.theme,
              proposta: prompt.statement,
              texto: content,
              linhasInformadas: lineCount,
              formatoObrigatorio:
                "JSON com score, formalScore, textualScore, technicalScore, strengths[], weaknesses[], actionPlan[], lineFeedback, finalMessage."
            })
          }
        ]
      });
      correction = parseCorrection(completion.choices[0]?.message?.content ?? "", content, lineCount);
      provider = "groq";
    } catch {
      correction = fallbackCorrection(content, lineCount);
    }
  } else {
    correction = fallbackCorrection(content, lineCount);
  }

  const saved = await prisma.essaySubmission.create({
    data: {
      userId: user.id,
      promptId: prompt.id,
      content,
      lineCount,
      score: correction.score,
      formalScore: correction.formalScore,
      textualScore: correction.textualScore,
      technicalScore: correction.technicalScore,
      strengths: JSON.stringify(correction.strengths),
      weaknesses: JSON.stringify(correction.weaknesses),
      actionPlan: JSON.stringify(correction.actionPlan),
      correctionJson: JSON.stringify(correction),
      aiProvider: provider,
      aiModel: provider === "groq" ? model : "local-fallback"
    }
  });

  return NextResponse.json({
    id: saved.id,
    provider,
    model: saved.aiModel,
    lineCount,
    officialLineRange: `${essayRules.minLines}-${essayRules.maxLines}`,
    ...correction
  });
}
