import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { foundationModules } from "@/lib/edital-data";

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">PMERJ Aprovacao Inteligente</span>
          <h1>Estudo guiado do zero ate o dominio do edital.</h1>
          <p>
            Uma base profissional para organizar materias, questoes, revisoes, simulados e diagnostico de
            desempenho no estilo FGV, com foco em quem precisa voltar a estudar com clareza.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/aluno">
              Abrir painel <ArrowRight size={18} />
            </Link>
            <Link className="secondary-action" href="/disciplinas">
              Ver mapa do edital
            </Link>
          </div>
        </div>
        <div className="hero-stats" aria-label="Resumo da prova">
          <div className="hero-stat">
            <strong>50</strong>
            <span>questoes objetivas</span>
          </div>
          <div className="hero-stat">
            <strong>5</strong>
            <span>disciplinas principais</span>
          </div>
          <div className="hero-stat">
            <strong>60%</strong>
            <span>minimo geral de aprovacao</span>
          </div>
        </div>
      </section>

      <section className="section-header">
        <div>
          <span className="eyebrow">Base da plataforma</span>
          <h2>Modulos preparados para crescer por fases</h2>
          <p>
            A Fase 1 cria as rotas e estruturas visuais. Nas proximas fases, esses blocos receberao banco
            de dados, registros reais, correcao automatica e inteligencia pedagogica.
          </p>
        </div>
      </section>

      <section className="grid-4">
        {foundationModules.map((module) => {
          const Icon = module.icon;

          return (
            <Link className="module-card" href={module.href} key={module.title}>
              <Icon size={28} />
              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <span className="tag">Abrir modulo</span>
            </Link>
          );
        })}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Metodo</span>
            <h2>Fluxo de aprendizagem planejado</h2>
          </div>
        </div>
        <div className="timeline" style={{ marginTop: 18 }}>
          {["Diagnosticar", "Estudar", "Treinar", "Revisar", "Simular"].map((step, index) => (
            <article className="timeline-item" key={step}>
              <span className="timeline-index">{index + 1}</span>
              <div>
                <h3>{step}</h3>
                <p>
                  <CheckCircle2 size={16} /> Cada etapa fica conectada ao edital, aos erros e ao plano de
                  estudo semanal.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
