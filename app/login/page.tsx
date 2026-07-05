"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined as any);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="brand-mark">
            <ShieldCheck size={28} />
          </span>
          <h1>Acessar Plataforma</h1>
          <p>Entre com seu e-mail e senha para continuar estudando.</p>
        </div>

        <form action={formAction} className="auth-form">
          {state?.error && (
            <div className="auth-error">
              {state.error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="seu@email.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" className="primary-action submit-btn" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="auth-footer">
          Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
