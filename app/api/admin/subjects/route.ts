import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, getClientIp, rateLimiter, sanitizeText, LIMITS } from "@/lib/security";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "admin_subjects", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as { name?: string; shortName?: string; description?: string };
  if (!body.name || !body.shortName) {
    return errorResponse("Nome e abreviacao sao obrigatorios.", 400);
  }

  const name = sanitizeText(body.name, LIMITS.MAX_SHORT_TEXT_LENGTH);
  const shortName = sanitizeText(body.shortName, LIMITS.MAX_SHORT_TEXT_LENGTH);
  const description = sanitizeText(body.description, LIMITS.MAX_TEXT_LENGTH);

  const order = (await prisma.subject.count()) + 1;
  const subject = await prisma.subject.create({
    data: {
      name: name,
      shortName: shortName,
      slug: slugify(name),
      description: description || "Disciplina cadastrada pelo administrador.",
      order,
      questionCount: 10,
      pointValue: 20,
      priorityWeight: 70
    }
  });

  return NextResponse.json(subject);
}
