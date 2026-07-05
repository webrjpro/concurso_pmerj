import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, sanitizeText, validateCuid, LIMITS } from "@/lib/security";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "admin_topics", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as { subjectId?: string; title?: string; parentId?: string };
  if (!body.subjectId || !body.title) {
    return errorResponse("Materia e titulo sao obrigatorios.", 400);
  }

  if (!validateCuid(body.subjectId) || (body.parentId && !validateCuid(body.parentId))) {
     return errorResponse("IDs invalidos.", 400);
  }

  const title = sanitizeText(body.title, LIMITS.MAX_SHORT_TEXT_LENGTH);

  const order = (await prisma.edictalTopic.count({ where: { subjectId: body.subjectId, parentId: body.parentId ?? null } })) + 1;
  const topic = await prisma.edictalTopic.create({
    data: {
      subjectId: body.subjectId,
      parentId: body.parentId || null,
      title: title,
      order,
      priorityWeight: 60
    }
  });

  return NextResponse.json(topic);
}
