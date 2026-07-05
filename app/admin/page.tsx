import { BookOpen, Database, FileQuestion, Settings, Users } from "lucide-react";
import { AdminConsole } from "@/components/admin-console";
import { MetricCard } from "@/components/metric-card";
import { getAdminDashboard } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return (
    <div className="page-stack">
      <section className="panel admin-band">
        <span className="eyebrow">Area administrativa</span>
        <h1>Gestao separada da area do aluno</h1>
        <p>
          Cadastre materias, topicos, questoes, veja desempenho dos alunos e acompanhe estatisticas gerais
          da plataforma.
        </p>
      </section>

      <section className="grid-4">
        <MetricCard label="Usuarios" value={String(dashboard.stats.users)} detail="Alunos e admins" icon={Users} />
        <MetricCard label="Materias" value={String(dashboard.stats.subjects)} detail="Disciplinas cadastradas" icon={BookOpen} tone="blue" />
        <MetricCard label="Questoes" value={String(dashboard.stats.questions)} detail="Banco de treino" icon={FileQuestion} tone="gold" />
        <MetricCard label="Simulados" value={String(dashboard.stats.simulations)} detail="Criados no sistema" icon={Database} tone="red" />
      </section>

      <AdminConsole subjects={dashboard.subjects} />

      <section className="grid-2">
        <article className="panel">
          <span className="eyebrow">Conteudo</span>
          <h2>Materias e questoes</h2>
          <div className="review-list">
            {dashboard.subjects.map((subject) => (
              <div className="review-item" key={subject.id}>
                <Settings size={18} />
                <span>
                  <strong>{subject.name}</strong>
                  <small>{subject.topics.length} topicos, {subject.questions} questoes</small>
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <span className="eyebrow">Usuarios</span>
          <h2>Desempenho dos alunos</h2>
          <div className="review-list">
            {dashboard.users.map((user) => (
              <div className="review-item" key={user.id}>
                <Users size={18} />
                <span>
                  <strong>{user.name} - {user.role}</strong>
                  <small>{user.email} - edital {user.editalPercent}% - acerto {user.accuracy}%</small>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
