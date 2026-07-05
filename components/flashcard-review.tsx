"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";

type Card = {
  id: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: string;
  nextReviewAt: string;
  intervalDays: number;
  correctCount: number;
  wrongCount: number;
};

type Result = {
  id: string;
  result: string;
  intervalDays: number;
  nextReviewAt: string;
  correctCount: number;
  wrongCount: number;
};

export function FlashcardReview({ cards }: { cards: Card[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [isPending, startTransition] = useTransition();

  function review(cardId: string, result: string) {
    startTransition(async () => {
      const response = await fetch("/api/revisoes/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcardId: cardId, result })
      });
      if (response.ok) {
        const data = (await response.json()) as Result;
        setResults((current) => ({ ...current, [cardId]: data }));
      }
    });
  }

  return (
    <section className="flashcard-list">
      {cards.map((card) => {
        const result = results[card.id];
        return (
          <article className="flashcard" key={card.id}>
            <header>
              <div>
                <span className="eyebrow">{card.subject} - {card.topic}</span>
                <h2>{flipped[card.id] ? "Resposta" : "Pergunta"}</h2>
              </div>
              <span className="tag">{card.difficulty}</span>
            </header>
            <button
              className="flashcard-face"
              onClick={() => setFlipped((current) => ({ ...current, [card.id]: !current[card.id] }))}
              type="button"
            >
              <RotateCcw size={18} />
              <span>{flipped[card.id] ? card.back : card.front}</span>
            </button>
            <div className="tag-row">
              <span className="tag">Intervalo atual: {result?.intervalDays ?? card.intervalDays} dia(s)</span>
              <span className="tag">Proxima: {result ? new Date(result.nextReviewAt).toLocaleDateString("pt-BR") : card.nextReviewAt}</span>
              <span className="tag">Acertos {result?.correctCount ?? card.correctCount}</span>
              <span className="tag tag-danger">Erros {result?.wrongCount ?? card.wrongCount}</span>
            </div>
            <div className="review-buttons">
              <button disabled={isPending} onClick={() => review(card.id, "ERREI")} type="button">Errei</button>
              <button disabled={isPending} onClick={() => review(card.id, "DIFICIL")} type="button">Dificil</button>
              <button disabled={isPending} onClick={() => review(card.id, "MEDIO")} type="button">Medio</button>
              <button disabled={isPending} onClick={() => review(card.id, "FACIL")} type="button">Facil</button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
