"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

type Option = {
  id: string;
  label: string;
  text: string;
};

type Question = {
  id: string;
  examNumber: number | null;
  statement: string;
  difficulty: string;
  explanation: string;
  correctExplanation: string;
  wrongExplanation: string;
  trap: string | null;
  reviewConcept: string;
  subject: {
    name: string;
    shortName: string;
    slug: string;
  };
  topic: {
    title: string;
  };
  options: Option[];
};

type AnswerResult = {
  isCorrect: boolean;
  selectedLabel: string;
  correctLabel: string;
  selectedExplanation: string;
  explanation: string;
  correctExplanation: string;
  wrongExplanation: string;
  trap: string | null;
  reviewConcept: string;
  errorCreated: boolean;
};

export function QuestionPractice({ questions }: { questions: Question[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const answeredCount = useMemo(() => Object.keys(results).length, [results]);

  function answerQuestion(questionId: string) {
    const selectedOptionId = selected[questionId];
    if (!selectedOptionId) return;

    setPendingQuestion(questionId);
    startTransition(async () => {
      const response = await fetch("/api/questoes/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedOptionId,
          confidence: 3,
          timeSpentSeconds: 60
        })
      });

      if (!response.ok) {
        setPendingQuestion(null);
        return;
      }

      const data = (await response.json()) as AnswerResult;
      setResults((current) => ({ ...current, [questionId]: data }));
      setPendingQuestion(null);
    });
  }

  return (
    <div className="question-practice">
      <div className="practice-summary">
        <strong>{questions.length}</strong>
        <span>questoes carregadas</span>
        <strong>{answeredCount}</strong>
        <span>respondidas nesta sessao</span>
      </div>

      {questions.map((question) => {
        const result = results[question.id];
        const disabled = Boolean(result) || (isPending && pendingQuestion === question.id);

        return (
          <article className="practice-card" key={question.id}>
            <header>
              <div>
                <span className="eyebrow">
                  {question.subject.shortName} - {question.topic.title}
                </span>
                <h2>{question.examNumber ? `Questao ${question.examNumber}` : "Questao de treino"}</h2>
              </div>
              <span className="tag">{question.difficulty}</span>
            </header>

            <p className="question-statement">{question.statement}</p>

            <div className="choice-list">
              {question.options.map((option) => {
                const checked = selected[question.id] === option.id;

                return (
                  <button
                    className={checked ? "choice selected" : "choice"}
                    disabled={disabled}
                    key={option.id}
                    onClick={() => setSelected((current) => ({ ...current, [question.id]: option.id }))}
                    type="button"
                  >
                    {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    <span>
                      <strong>{option.label}</strong>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="practice-actions">
              <button
                className="primary-action"
                disabled={!selected[question.id] || disabled}
                onClick={() => answerQuestion(question.id)}
                type="button"
              >
                {pendingQuestion === question.id ? <Loader2 size={18} /> : null}
                Corrigir
              </button>
            </div>

            {result ? (
              <section className={result.isCorrect ? "answer-result correct" : "answer-result wrong"}>
                <h3>
                  {result.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  {result.isCorrect ? "Resposta correta" : "Resposta errada registrada"}
                </h3>
                <p>
                  Voce marcou {result.selectedLabel}. Gabarito: {result.correctLabel}.
                </p>
                <p>{result.explanation}</p>
                <p>
                  <strong>Certa:</strong> {result.correctExplanation}
                </p>
                <p>
                  <strong>Erradas:</strong> {result.wrongExplanation}
                </p>
                {result.trap ? (
                  <p>
                    <strong>Pegadinha:</strong> {result.trap}
                  </p>
                ) : null}
                <p>
                  <strong>Revisar:</strong> {result.reviewConcept}
                </p>
                {result.errorCreated ? <span className="tag tag-danger">Adicionado ao caderno de erros</span> : null}
              </section>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
