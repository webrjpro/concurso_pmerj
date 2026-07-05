import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/aluno",
  "/desempenho",
  "/edital",
  "/questoes",
  "/redacao",
  "/erros",
  "/revisoes",
  "/professores",
  "/plano",
  "/simulados"
];

const publicRoutes = ["/login", "/cadastro", "/"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Ignora rotas de API, _next e arquivos estáticos
  if (
    path.startsWith("/api") || 
    path.startsWith("/_next") || 
    path.match(/\.(png|jpg|jpeg|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Lê o cookie (A validação real do JWT é feita no servidor após o redirecionamento,
  // ou no próprio componente de servidor usando lib/auth.ts)
  const session = request.cookies.get("session")?.value;

  // Redireciona para login se tentar acessar rota protegida sem sessão
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Redireciona para o painel se já estiver logado e tentar acessar login/cadastro
  if (isPublicRoute && session && path !== "/") {
    return NextResponse.redirect(new URL("/aluno", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
