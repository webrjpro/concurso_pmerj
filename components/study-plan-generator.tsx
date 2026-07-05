"use client";

import { useState, useTransition } from "react";
import { Loader2, Wand2 } from "lucide-react";

type GeneratedPlan = {
  id: string;
  title: string;
  tasks: number;
  dailyMinutes: number;
  days: number;
};

export function StudyPlanGenerator({ defaultMinutes }: { defaultMinutes: number }) {
  const [dailyMinutes, setDailyMinutes] = useState(defaultMinutes);
  const [days, setDays] = useState(7);
  const [generated, setGenerated] = useState<GeneratedPlan | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const response = await fetch("/api/plano/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyMinutes, days })
      });
      if (response.ok) {
        setGenerated((await response.json()) as GeneratedPlan);
      }
    });
  }

  return (
    <article className="panel">
      <span className="eyebrow">Gerador automatico</span>
      <h2>Criar novo ciclo</h2>
      <div className="filter-grid">
        <label>
          Minutos por dia
          <input min={30} max={360} type="number" value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value))} />
        </label>
        <label>
          Dias do ciclo
          <input min={3} max={30} type="number" value={days} onChange={(event) => setDays(Number(event.target.value))} />
        </label>
      </div>
      <div className="practice-actions" style={{ marginTop: 16 }}>
        <button className="primary-action" disabled={isPending} onClick={generate} type="button">
          {isPending ? <Loader2 size={18} /> : <Wand2 size={18} />}
          Gerar plano
        </button>
      </div>
      {generated ? (
        <div className="diagnosis-box" style={{ marginTop: 16 }}>
          <strong>{generated.title}</strong>
          <p>{generated.tasks} tarefa(s), {generated.dailyMinutes} min/dia, {generated.days} dias. Atualize a pagina para ver o ciclo ativo.</p>
        </div>
      ) : null}
    </article>
  );
}
