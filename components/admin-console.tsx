"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  shortName: string;
  topics: { id: string; title: string; parentId: string | null }[];
};

export function AdminConsole({ subjects }: { subjects: Subject[] }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitJson(path: string, data: Record<string, unknown>) {
    startTransition(async () => {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      setMessage(response.ok ? "Registro salvo. Atualize a pagina para ver na lista." : "Falha ao salvar registro.");
    });
  }

  const firstSubject = subjects[0];
  const firstTopic = firstSubject?.topics[0];

  return (
    <section className="grid-3">
      <article className="panel admin-form">
        <span className="eyebrow">Cadastrar materia</span>
        <h2>Nova disciplina</h2>
        <button
          className="primary-action"
          disabled={isPending}
          onClick={() =>
            submitJson("/api/admin/subjects", {
              name: "Redacao",
              shortName: "Redacao",
              description: "Producao textual dissertativo-argumentativa."
            })
          }
          type="button"
        >
          {isPending ? <Loader2 size={18} /> : <Plus size={18} />}
          Criar exemplo
        </button>
      </article>

      <article className="panel admin-form">
        <span className="eyebrow">Cadastrar topico</span>
        <h2>Novo topico</h2>
        <button
          className="primary-action"
          disabled={isPending || !firstSubject}
          onClick={() => submitJson("/api/admin/topics", { subjectId: firstSubject.id, title: "Topico administrativo de exemplo" })}
          type="button"
        >
          {isPending ? <Loader2 size={18} /> : <Plus size={18} />}
          Criar exemplo
        </button>
      </article>

      <article className="panel admin-form">
        <span className="eyebrow">Importar questao</span>
        <h2>Questao objetiva</h2>
        <button
          className="primary-action"
          disabled={isPending || !firstSubject || !firstTopic}
          onClick={() =>
            submitJson("/api/admin/questions", {
              subjectId: firstSubject.id,
              topicId: firstTopic.id,
              statement: "Questao administrativa de exemplo para validar importacao.",
              correctLabel: "A",
              options: {
                A: "Alternativa correta",
                B: "Alternativa incorreta",
                C: "Alternativa incorreta",
                D: "Alternativa incorreta",
                E: "Alternativa incorreta"
              }
            })
          }
          type="button"
        >
          {isPending ? <Loader2 size={18} /> : <Plus size={18} />}
          Importar exemplo
        </button>
      </article>
      {message ? <div className="created-simulation">{message}</div> : null}
    </section>
  );
}
