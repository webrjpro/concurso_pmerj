import { CalendarDays, ClipboardCheck, Timer, TriangleAlert } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { StudyPlanGenerator } from "@/components/study-plan-generator";
import { getStudyPlanDashboard } from "@/lib/study-plan";

export const dynamic = "force-dynamic";

export default async function StudyPlanPage() {
  const dashboard = await getStudyPlanDashboard();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Plano de estudo automatico</span>
          <h1>O que estudar hoje, por que e por quanto tempo</h1>
          <p>
            O plano mistura estudo novo, questoes, revisao, simulado, correcao e reforco de erros conforme
            desempenho e pendencias.
          </p>
        </div>
      </section>

      <section className="grid-4">
        <MetricCard label="Tempo diario" value={`${dashboard.dailyMinutes}m`} detail="Configurado no perfil" icon={Timer} />
        <MetricCard label="Revisoes" value={String(dashboard.pendingReviews)} detail="Pendentes" icon={ClipboardCheck} tone="red" />
        <MetricCard label="Erros" value={String(dashboard.errors)} detail="Base para reforco" icon={TriangleAlert} tone="gold" />
        <MetricCard label="Ciclo" value={dashboard.plan ? "Ativo" : "Novo"} detail="Plano semanal" icon={CalendarDays} tone="blue" />
      </section>

      <section className="split-panel">
        <StudyPlanGenerator defaultMinutes={dashboard.dailyMinutes} />
        <article className="panel">
          <span className="eyebrow">Materias fracas</span>
          <h2>Prioridade automatica</h2>
          <div className="review-list">
            {dashboard.weakSubjects.map((subject) => (
              <div className="review-item" key={subject.name}>
                <TriangleAlert size={18} />
                <span>
                  <strong>{subject.name}</strong>
                  <small>{subject.accuracy}% de acerto</small>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <span className="eyebrow">Ciclo atual</span>
        <h2>{dashboard.plan?.title ?? "Nenhum plano ativo"}</h2>
        <p>{dashboard.plan ? `${dashboard.plan.startDate} ate ${dashboard.plan.endDate}` : "Gere um plano para iniciar."}</p>
        <div className="timeline" style={{ marginTop: 18 }}>
          {dashboard.plan?.tasks.map((task, index) => (
            <article className="timeline-item" key={task.id}>
              <span className="timeline-index">{index + 1}</span>
              <div>
                <h3>{task.title}</h3>
                <p>{task.scheduledFor} - {task.durationMinutes} min - {task.type} - {task.rationale}</p>
                <div className="tag-row">
                  <span className="tag">{task.subject}</span>
                  <span className="tag">{task.topic}</span>
                  {task.completed ? <span className="tag">Concluida</span> : <span className="tag tag-danger">Pendente</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
