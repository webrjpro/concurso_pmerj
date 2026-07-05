import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self';"
  );
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  return response;
}

export function middleware(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/admin")) {
    if (!adminToken) {
      return applySecurityHeaders(NextResponse.json({ error: "Nao autorizado." }, { status: 401 }));
    }
    const provided = request.headers.get("x-admin-token");
    if (provided !== adminToken) {
      return applySecurityHeaders(NextResponse.json({ error: "Nao autorizado." }, { status: 401 }));
    }
  }

  // Basic CSRF protection for POST requests
  if (request.method === "POST" || request.method === "PUT" || request.method === "DELETE") {
    const origin = request.headers.get("origin");
    // Em producao, garanta que a request vem do mesmo dominio.
    if (process.env.NODE_ENV === "production" && origin && !origin.includes(request.nextUrl.host)) {
       return applySecurityHeaders(NextResponse.json({ error: "CSRF token mismatch." }, { status: 403 }));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"]
};
