import { NextResponse } from "next/server";

// ==========================================
// CONFIGURAÇÕES DE LIMITES
// ==========================================
export const LIMITS = {
  MAX_TEXT_LENGTH: 10000,
  MAX_SHORT_TEXT_LENGTH: 255,
  MAX_REQUESTS_PER_MINUTE_DEFAULT: 30,
  MAX_REQUESTS_PER_MINUTE_AI: 5,
};

// ==========================================
// VALIDAÇÃO DE INPUT
// ==========================================

export function validateCuid(id?: string): boolean {
  if (!id) return false;
  // Basic CUID validation (alphanumeric, length check)
  return /^[a-z0-9]{20,30}$/.test(id);
}

export function sanitizeText(text?: string, maxLength: number = LIMITS.MAX_SHORT_TEXT_LENGTH): string {
  if (!text) return "";
  // Truncate length
  let sanitized = text.substring(0, maxLength);
  // Basic XSS protection: remove <script> tags or html elements if not needed
  sanitized = sanitized.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return sanitized.trim();
}

export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    return null;
  }
}

// ==========================================
// RATE LIMITING (In-Memory para Single Instance / Railway)
// ==========================================
type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimiter(ip: string, action: string, maxRequests: number, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `${action}:${ip}`;
  
  // Cleanup old entries periodically
  if(rateLimitStore.size > 10000) {
      rateLimitStore.clear();
  }

  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(key, entry);
  }

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  entry.count++;

  return entry.count <= maxRequests;
}

// Helper para pegar IP (ideal usar headers x-forwarded-for do Railway)
export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

// ==========================================
// RESPOSTAS PADRONIZADAS E SEGURAS
// ==========================================

export function errorResponse(message: string, status: number = 400) {
  // Evitar vazamento de stack traces
  return NextResponse.json({ error: message }, { status });
}

// Funcao para validar formato de chave Groq (ex: gsk_XXXXX)
export function validateGroqKeyFormat(key?: string): boolean {
    if(!key) return false;
    return /^gsk_[A-Za-z0-9]{40,}$/.test(key);
}
