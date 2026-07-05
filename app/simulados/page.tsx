import { AlertTriangle, Clock, Target, Trophy } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SimulationLauncher } from "@/components/simulation-launcher";
import { getSimulationsDashboard } from "@/lib/simulations";

export const dynamic = "force-dynamic";

export default async function SimulationsPage() {
  const dashboard = await getSimulationsDashboard();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Simulados inteligentes</span>
          <h1>Treino no formato da prova objetiva</h1>
          <p>
            Base visual para simulados completos e por recorte. A Fase 6 conectara questoes, cronometro,
            resultado por materia e plano de reforco.
          </p>
        </div>
      </section>

      <section className="grid-4">
        <MetricCard label="Questoes no banco" value={String(dashboard.totals.questionCount)} detail="Disponiveis para montar simulados" icon={Target} />
        <MetricCard label="Simulados feitos" value={String(dashboard.totals.simulationsDone)} detail="Historico do aluno" icon={Trophy} tone="blue" />
        <MetricCard label="Questoes erradas" value={String(dashboard.totals.errorCount)} detail="Podem virar simulado" icon={AlertTriangle} tone="red" />
        <MetricCard label="Materias fracas" value={String(dashboard.totals.weakSubjects)} detail="Base para reforco" icon={Clock} tone="gold" />
      </section>

      <SimulationLauncher defaultSubjectSlug={dashboard.subjectPerformance[0]?.slug} />

      <section className="panel">
        <div className="split-panel">
          <div>
            <Clock className="panel-icon" size={30} />
            <h2>Resultado detalhado</h2>
            {dashboard.latestResult ? (
              <>
                <p>
                  Ultimo simulado: {dashboard.latestResult.title}. Nota {dashboard.latestResult.score}, com
                  {` ${dashboard.latestResult.correctCount}`} acerto(s), {dashboard.latestResult.wrongCount} erro(s)
                  e tempo de {dashboard.latestResult.timeSpent}.
                </p>
                <p>{dashboard.latestResult.diagnosis}</p>
              </>
            ) : (
              <p>Nenhum simulado concluido ainda.</p>
            )}
          </div>
          <div className="diagnosis-box">
            <span className="eyebrow">Plano de 7 dias</span>
            <p>{dashboard.latestResult?.nextSevenDaysPlan ?? "Conclua um simulado para gerar plano."}</p>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <article className="panel">
          <span className="eyebrow">Acertos por materia</span>
          <h2>Desempenho</h2>
          <div className="review-list">
            {dashboard.subjectPerformance.map((item) => (
              <div className="review-item" key={item.id}>
                <Trophy size={18} />
                <span>
                  <strong>{item.shortName}: {item.accuracy}%</strong>
                  <small>{item.correct} acerto(s), {item.wrong} erro(s), {item.availableQuestions} questoes disponiveis</small>
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <span className="eyebrow">Diagnostico automatico</span>
          <h2>Fortes, fracos e revisao</h2>
          <div className="insight-grid">
            <div>
              <strong>Assuntos fortes</strong>
              {dashboard.strongSubjects.map((item) => (
                <span className="tag" key={item.id}>{item.shortName}</span>
              ))}
            </div>
            <div>
              <strong>Assuntos fracos</strong>
              {dashboard.weakSubjects.map((item) => (
                <span className="tag tag-danger" key={item.id}>{item.shortName}</span>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
