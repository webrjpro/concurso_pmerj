"use client";

import { useState, useTransition } from "react";
import { Loader2, PlayCircle } from "lucide-react";

const simulationTypes = [
  { type: "COMPLETO", title: "Simulado completo", description: "Distribuicao ampla no estilo da prova." },
  { type: "MATERIA", title: "Por materia", description: "Treino focado em uma disciplina." },
  { type: "ASSUNTO", title: "Por assunto", description: "Recorte por topico do edital." },
  { type: "ASSUNTOS_FRACOS", title: "Assuntos fracos", description: "Baseado nas menores taxas de acerto." },
  { type: "QUESTOES_ERRADAS", title: "Questoes erradas", description: "Reforco em itens do caderno de erros." },
  { type: "CRONOMETRADO", title: "Cronometrado", description: "Treino com limite de tempo." }
];

type CreatedSimulation = {
  id: string;
  title: string;
  type: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  message: string;
};

export function SimulationLauncher({ defaultSubjectSlug }: { defaultSubjectSlug?: string }) {
  const [created, setCreated] = useState<CreatedSimulation | null>(null);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function createSimulation(type: string) {
    setPendingType(type);
    startTransition(async () => {
      const response = await fetch("/api/simulados/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subjectSlug: defaultSubjectSlug })
      });
      if (response.ok) {
        setCreated((await response.json()) as CreatedSimulation);
      }
      setPendingType(null);
    });
  }

  return (
    <section className="grid-3">
      {simulationTypes.map((item) => (
        <article className="module-card" key={item.type}>
          <PlayCircle size={28} />
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <button
            className="primary-action"
            disabled={isPending}
            onClick={() => createSimulation(item.type)}
            type="button"
          >
            {pendingType === item.type ? <Loader2 size={18} /> : null}
            Criar
          </button>
        </article>
      ))}

      {created ? (
        <article className="panel created-simulation">
          <span className="eyebrow">Simulado criado</span>
          <h2>{created.title}</h2>
          <p>{created.message}</p>
          <div className="tag-row">
            <span className="tag">{created.totalQuestions} questoes</span>
            <span className="tag">{created.timeLimitMinutes} min</span>
            <span className="tag">{created.type}</span>
          </div>
        </article>
      ) : null}
    </section>
  );
}
