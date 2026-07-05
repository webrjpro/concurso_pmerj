import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { getEditalMap } from "@/lib/edital-map";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const subjects = await getEditalMap();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Mapa completo do edital</span>
          <h1>Disciplinas, topicos e prioridade</h1>
          <p>
            O edital foi organizado em blocos de estudo. Nesta fase os dados sao estaticos; a proxima etapa
            cria persistencia para status, dominio e revisoes por aluno.
          </p>
        </div>
      </section>

      <section className="edital-map">
        {subjects.map((subject) => (
          <article className="subject-card edital-subject" key={subject.name}>
            <header className="subject-map-header">
              <div>
                <span className="eyebrow">{subject.shortName}</span>
                <h2>{subject.name}</h2>
                <p>{subject.description}</p>
              </div>
              <StatusPill status={subject.status} />
            </header>
            <ProgressBar value={subject.progress} label={`Dominio em ${subject.name}`} />
            <div className="tag-row">
              <span className="tag">Dominio {subject.mastery}%</span>
              <span className="tag">Acerto {subject.accuracy}%</span>
              <span className="tag">{subject.topics.length} topicos</span>
            </div>

            <div className="topic-map-list">
              {subject.topics.map((topic) => (
                <section className="topic-block" key={topic.id}>
                  <div className="topic-block-header">
                    <div>
                      <span className="topic-code">{topic.code}</span>
                      <h3>{topic.title}</h3>
                    </div>
                    <StatusPill status={topic.status} />
                  </div>
                  <div className="tag-row">
                    <span className="tag">Prioridade {topic.priority}</span>
                    <span className="tag">Dominio {topic.mastery}%</span>
                    <span className="tag">{topic.questionsLinked} questoes vinculadas</span>
                    {topic.reviewDue ? <span className="tag tag-danger">Revisao pendente</span> : null}
                  </div>
                  <div className="subtopic-grid">
                    {topic.children.map((child) => (
                      <article className="subtopic-card" key={child.id}>
                        <div>
                          <span className="topic-code">{child.code}</span>
                          <strong>{child.title}</strong>
                        </div>
                        <StatusPill status={child.status} />
                        <ProgressBar value={child.mastery} label={`Dominio em ${child.title}`} />
                        <div className="tag-row">
                          <span className="tag">Prioridade {child.priority}</span>
                          <span className="tag">{child.questionsLinked} questoes</span>
                          {child.reviewDue ? <span className="tag tag-danger">Revisar</span> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
