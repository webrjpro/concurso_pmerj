"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, undefined as any);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="brand-mark">
            <ShieldCheck size={28} />
          </span>
          <h1>Criar Conta</h1>
          <p>Cadastre-se para iniciar a sua jornada rumo à aprovação.</p>
        </div>

        <form action={formAction} className="auth-form">
          {state?.error && (
            <div className="auth-error">
              {state.error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              placeholder="Ex: João Silva"
              className="form-input"
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button type="submit" className="primary-action submit-btn" disabled={isPending}>
            {isPending ? "Criando conta..." : "Criar Conta e Iniciar"}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta? <Link href="/login">Fazer Login</Link>
        </div>
      </div>
    </div>
  );
}
