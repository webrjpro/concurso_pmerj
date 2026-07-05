"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, Menu, X, LogOut, User } from "lucide-react";
import { navItems } from "@/lib/edital-data";
import { logoutAction } from "@/app/actions/auth";

// Temporary function to simulate a hook or context for auth. 
// In a real app we'd pass it via props from layout or use a React Context
// We'll just read from cookies or let the server pass it down, but since AppShell is Client Component,
// we can either fetch it, or pass user as a prop. Let's assume AppShell is wrapped by layout 
// which could pass the user. Actually, this is a Client Component, we can fetch the session via an API route
// OR we just use a small server action.

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Check auth state on mount by reading cookie or making a tiny fetch
  // A simple way since it's client side: check if cookie 'session' exists (if not HttpOnly, wait, it is HttpOnly).
  // So we just rely on Next.js Server Components passing props. But to not break the current structure, 
  // I will make a quick fetch to a /api/auth/me route.
  useEffect(() => {
    fetch("/api/auth/me").then(res => res.json()).then(data => {
      if (data.user) {
        setIsAuthenticated(true);
        setUserEmail(data.user.email);
      }
    }).catch(() => {});
  }, []);

  if (pathname.startsWith("/admin")) {
    return <main>{children}</main>;
  }

  // Remove nav list if it's the login/register page for cleaner look
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav-left">
          {!isAuthPage && (
            <button 
              className="menu-button" 
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          )}
          
          <Link href="/" className="brand">
            <span className="brand-mark">
              <ShieldCheck size={22} />
            </span>
            <span className="brand-text">
              <strong>PMERJ</strong>
              <small>Aprovacao Inteligente</small>
            </span>
          </Link>
        </div>
        
        {!isAuthPage && (
          <div className="top-nav-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Link className="secondary-action" href="/aluno" style={{ minHeight: '38px', borderRadius: '6px' }}>
                  <User size={16} style={{ marginRight: '8px' }} />
                  Meu Painel
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="menu-button" title="Sair">
                    <LogOut size={20} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="secondary-action" href="/login" style={{ minHeight: '38px', borderRadius: '6px' }}>
                  Entrar
                </Link>
                <Link className="primary-action" href="/cadastro" style={{ minHeight: '38px', borderRadius: '6px' }}>
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Drawer Overlay */}
      {isMenuOpen && !isAuthPage && (
        <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="brand-mark" style={{ width: 32, height: 32 }}>
                <ShieldCheck size={18} />
              </span>
              <strong>Menu</strong>
              <button className="close-button" onClick={() => setIsMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="drawer-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link 
                    className={active ? "drawer-link active" : "drawer-link"} 
                    href={item.href} 
                    key={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="shell-main">
        <main>{children}</main>
      </div>
    </div>
  );
}
