import { NextResponse } from "next/server";
import { buildTeacherExplanation } from "@/lib/ai-professors";
import { errorResponse, getClientIp, rateLimiter, sanitizeText, LIMITS } from "@/lib/security";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimiter(ip, "professor_explain", LIMITS.MAX_REQUESTS_PER_MINUTE_DEFAULT)) {
    return errorResponse("Too many requests", 429);
  }

  const body = (await request.json()) as { subject?: string; topic?: string };
  const subject = sanitizeText(body.subject ?? "Disciplina", LIMITS.MAX_SHORT_TEXT_LENGTH);
  const topic = sanitizeText(body.topic ?? "topico do edital", LIMITS.MAX_SHORT_TEXT_LENGTH);

  return NextResponse.json(buildTeacherExplanation(subject, topic));
}
