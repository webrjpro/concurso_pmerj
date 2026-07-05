"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Filter, Layers } from "lucide-react";

type ErrorEntry = {
  id: string;
  subject: string;
  subjectFull: string;
  topic: string;
  difficulty: string;
  reason: string;
  createdAt: string;
  nextReviewAt: string;
  selectedLabel: string;
  correctLabel: string;
  statement: string;
  simplifiedExplanation: string;
  contentGap: boolean;
  attentionGap: boolean;
  trapFall: boolean;
  mandatoryReview: boolean;
  flashcardFront: string | null;
  reviewConcept: string;
};

export function ErrorNotebook({ entries }: { entries: ErrorEntry[] }) {
  const [subject, setSubject] = useState("Todos");
  const [reason, setReason] = useState("Todos");
  const [difficulty, setDifficulty] = useState("Todos");
  const [date, setDate] = useState("");

  const subjects = useMemo(() => ["Todos", ...Array.from(new Set(entries.map((entry) => entry.subject)))], [entries]);
  const reasons = useMemo(() => ["Todos", ...Array.from(new Set(entries.map((entry) => entry.reason)))], [entries]);
  const difficulties = useMemo(() => ["Todos", ...Array.from(new Set(entries.map((entry) => entry.difficulty)))], [entries]);

  const filtered = entries.filter((entry) => {
    const subjectMatch = subject === "Todos" || entry.subject === subject;
    const reasonMatch = reason === "Todos" || entry.reason === reason;
    const difficultyMatch = difficulty === "Todos" || entry.difficulty === difficulty;
    const dateMatch = !date || entry.createdAt.includes(date.split("-").reverse().join("/"));
    return subjectMatch && reasonMatch && difficultyMatch && dateMatch;
  });

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-header">
          <div>
            <Filter className="panel-icon" size={28} />
            <h2>Filtros do caderno</h2>
          </div>
        </div>
        <div className="filter-grid">
          <label>
            Materia
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>
              {subjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Motivo
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              {reasons.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Dificuldade
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {difficulties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="grid-3">
        <article className="kpi-card">
          <AlertTriangle size={20} />
          <strong>{entries.length}</strong>
          <span>erros registrados</span>
        </article>
        <article className="kpi-card">
          <Layers size={20} />
          <strong>{filtered.length}</strong>
          <span>erros filtrados</span>
        </article>
        <article className="kpi-card">
          <CalendarClock size={20} />
          <strong>{entries.filter((entry) => entry.mandatoryReview).length}</strong>
          <span>revisoes obrigatorias</span>
        </article>
      </section>

      <section className="error-list">
        {filtered.map((entry) => (
          <article className="error-card" key={entry.id}>
            <header>
              <div>
                <span className="eyebrow">{entry.subject} - {entry.topic}</span>
                <h2>{entry.statement}</h2>
              </div>
              <span className="tag tag-danger">{entry.reason}</span>
            </header>
            <div className="tag-row">
              <span className="tag">Marcada: {entry.selectedLabel}</span>
              <span className="tag">Gabarito: {entry.correctLabel}</span>
              <span className="tag">Dificuldade {entry.difficulty}</span>
              <span className="tag">Erro em {entry.createdAt}</span>
              <span className="tag tag-danger">Revisar em {entry.nextReviewAt}</span>
            </div>
            <p>{entry.simplifiedExplanation}</p>
            <div className="tag-row">
              {entry.contentGap ? <span className="tag tag-danger">Falta de conteudo</span> : null}
              {entry.attentionGap ? <span className="tag tag-danger">Falta de atencao</span> : null}
              {entry.trapFall ? <span className="tag tag-danger">Pegadinha</span> : null}
            </div>
            <div className="diagnosis-box">
              <span className="eyebrow">Flashcard automatico</span>
              <p>{entry.flashcardFront ?? `Explique: ${entry.reviewConcept}`}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
