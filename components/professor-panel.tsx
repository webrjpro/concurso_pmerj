"use client";

import { useState, useTransition } from "react";
import { Brain, Loader2 } from "lucide-react";

type Professor = {
  id: string;
  name: string;
  shortName: string;
  objective: string;
  howItFalls: string;
  mainTopics: string[];
  strategy: string;
  commonMistakes: string[];
  evolutionPlan: string[];
  classes: { title: string; description: string }[];
  commentedQuestions: { title: string; topic: string; review: string }[];
};

type Explanation = {
  simple: string;
  practicalExample: string;
  analogy: string;
  commonErrors: string[];
  traps: string[];
  howBankCharges: string;
  memorySummary: string;
  trainingQuestions: string[];
  quickReview: string;
};

export function ProfessorPanel({ professors }: { professors: Professor[] }) {
  const [selected, setSelected] = useState(professors[0]?.id ?? "");
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isPending, startTransition] = useTransition();

  const professor = professors.find((item) => item.id === selected) ?? professors[0];

  function explain(topic: string) {
    startTransition(async () => {
      const response = await fetch("/api/professor/explicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: professor.name, topic })
      });
      if (response.ok) {
        setExplanation((await response.json()) as Explanation);
      }
    });
  }

  if (!professor) return null;

  return (
    <div className="teacher-layout">
      <aside className="teacher-list">
        {professors.map((item) => (
          <button
            className={selected === item.id ? "teacher-tab active" : "teacher-tab"}
            key={item.id}
            onClick={() => {
              setSelected(item.id);
              setExplanation(null);
            }}
            type="button"
          >
            {item.shortName}
          </button>
        ))}
      </aside>

      <section className="teacher-main">
        <article className="panel">
          <span className="eyebrow">Professor IA</span>
          <h2>{professor.name}</h2>
          <p>{professor.objective}</p>
          <div className="tag-row">
            <span className="tag">Como cai: {professor.howItFalls}</span>
          </div>
        </article>

        <section className="grid-2">
          <article className="panel">
            <h3>Estrategia de estudo</h3>
            <p>{professor.strategy}</p>
            <ul className="clean-list">
              {professor.commonMistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="panel">
            <h3>Plano de evolucao</h3>
            <ul className="clean-list">
              {professor.evolutionPlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid-2">
          {professor.classes.map((lesson) => (
            <article className="module-card" key={lesson.title}>
              <Brain size={26} />
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <button className="primary-action" onClick={() => explain(lesson.title)} type="button">
                {isPending ? <Loader2 size={18} /> : null}
                Explicar
              </button>
            </article>
          ))}
        </section>

        {explanation ? (
          <article className="teacher-explanation">
            <h2>Explicacao guiada</h2>
            <p><strong>Explicacao simples:</strong> {explanation.simple}</p>
            <p><strong>Exemplo pratico:</strong> {explanation.practicalExample}</p>
            <p><strong>Analogia:</strong> {explanation.analogy}</p>
            <p><strong>Como a banca cobra:</strong> {explanation.howBankCharges}</p>
            <p><strong>Resumo de memorizacao:</strong> {explanation.memorySummary}</p>
            <div className="tag-row">
              {explanation.traps.map((trap) => (
                <span className="tag tag-danger" key={trap}>{trap}</span>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
