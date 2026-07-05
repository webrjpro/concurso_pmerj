import { AlertTriangle, CheckCircle2, Clock, FileQuestion, Target, TimerReset, TrendingUp, Trophy } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { getStudentDashboard } from "@/lib/student-dashboard";

export const dynamic = "force-dynamic";

const icons = [Target, TrendingUp, Clock, AlertTriangle];

export default async function StudentDashboardPage() {
  const dashboard = await getStudentDashboard();

  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Painel do aluno</span>
          <h1>Missao de estudo de hoje</h1>
          <p>
            {dashboard.student.name}, seu foco agora e cumprir o plano do dia, revisar antes do
            esquecimento e atacar as materias que mais travam sua nota.
          </p>
        </div>
        <div className="student-badge">
          <strong>Nivel {dashboard.student.currentLevel}</strong>
          <span>{dashboard.student.streakDays} dias de sequencia</span>
          <span>{dashboard.student.dailyMinutes} min/dia planejados</span>
        </div>
      </section>

      <section className="grid-4">
        {dashboard.metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} icon={icons[index]} />
        ))}
      </section>

      <section className="grid-4 compact-kpis">
        <article className="kpi-card">
          <FileQuestion size={20} />
          <strong>{dashboard.counts.questionsDone}</strong>
          <span>questoes feitas</span>
        </article>
        <article className="kpi-card">
          <Trophy size={20} />
          <strong>{dashboard.counts.simulationsDone}</strong>
          <span>simulados feitos</span>
        </article>
        <article className="kpi-card">
          <TimerReset size={20} />
          <strong>{dashboard.counts.inProgress}</strong>
          <span>materias em andamento</span>
        </article>
        <article className="kpi-card">
          <AlertTriangle size={20} />
          <strong>{dashboard.counts.delayed}</strong>
          <span>materias atrasadas</span>
        </article>
      </section>

      <section className="split-panel">
        <article className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Execucao</span>
              <h2>Plano do dia</h2>
            </div>
          </div>
          <ul className="mission-list" style={{ marginTop: 18 }}>
            {dashboard.missions.map((mission) => (
              <li key={mission.id}>
                <span>
                  <strong>{mission.title}</strong>
                  <small>{mission.subject} - {mission.duration} min - {mission.rationale}</small>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Alertas</span>
              <h2>Pontos de atencao</h2>
            </div>
          </div>
          <ul className="clean-list" style={{ marginTop: 18 }}>
            <li>{dashboard.persistentWeakness}</li>
            <li>{dashboard.strongPoints}</li>
            <li>{dashboard.counts.errorsCount} erro(s) registrados para reforco.</li>
          </ul>
        </article>
      </section>

      <section className="grid-2">
        <article className="panel">
          <span className="eyebrow">Proximas revisoes</span>
          <h2>Fila prioritaria</h2>
          <div className="review-list">
            {dashboard.nextReviews.map((review) => (
              <div className="review-item" key={`${review.kind}-${review.id}`}>
                <CheckCircle2 size={18} />
                <span>
                  <strong>{review.title}</strong>
                  <small>{review.subject} - {review.date} - {review.kind}</small>
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <span className="eyebrow">Diagnostico rapido</span>
          <h2>Fortes e fracos</h2>
          <div className="insight-grid">
            <div>
              <strong>Pontos fortes</strong>
              {dashboard.strong.slice(0, 3).map((item) => (
                <span className="tag" key={item.name}>{item.shortName}: {item.accuracy}%</span>
              ))}
            </div>
            <div>
              <strong>Pontos fracos</strong>
              {dashboard.weak.slice(0, 3).map((item) => (
                <span className="tag tag-danger" key={item.name}>{item.shortName}: {item.accuracy}%</span>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid-2">
        {dashboard.subjects.map((subject) => (
          <article className="subject-card" key={subject.name}>
            <header>
              <div>
                <h3>{subject.shortName}</h3>
                <p>{subject.description}</p>
              </div>
              <StatusPill status={subject.status} />
            </header>
            <ProgressBar value={subject.progress} label={`Progresso em ${subject.name}`} />
            <div className="tag-row">
              <span className="tag">{subject.questionsDone} questoes feitas</span>
              <span className="tag">Dominio {subject.mastery}%</span>
              <span className="tag">{subject.accuracy}% de acerto</span>
              {subject.delayed ? <span className="tag tag-danger">Atrasada</span> : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
