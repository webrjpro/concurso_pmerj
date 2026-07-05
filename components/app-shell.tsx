"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { navItems } from "@/lib/edital-data";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegacao principal">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <ShieldCheck size={22} />
          </span>
          <span>
            <strong>PMERJ</strong>
            <small>Aprovacao Inteligente</small>
          </span>
        </Link>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link className={active ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Curso de Formacao de Soldados</span>
            <strong>Plataforma de estudo por edital, questoes e revisao</strong>
          </div>
          <Link className="topbar-action" href="/aluno">
            Abrir painel
          </Link>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
