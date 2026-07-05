"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Send, Shuffle, Target, Trophy } from "lucide-react";

type EssayRules = {
  type: string;
  minLines: number;
  maxLines: number;
  formalPoints: number;
  textualPoints: number;
  technicalPoints: number;
  maxScore: number;
};

type EssayPrompt = {
  id: string;
  title: string;
  theme: string;
  category: string;
  source: string;
  statement: string;
  supportText: string | null;
};

type EssaySubmission = {
  id: string;
  theme: string;
  score: number;
  lineCount: number;
  model: string;
  createdAt: string;
};

type CorrectionResult = {
  id: string;
  provider: string;
  model: string;
  lineCount: number;
  officialLineRange: string;
  score: number;
  formalScore: number;
  textualScore: number;
  technicalScore: number;
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  lineFeedback: string;
  finalMessage: string;
};

type EssayPracticeProps = {
  rules: EssayRules;
  prompts: EssayPrompt[];
  submissions: EssaySubmission[];
};

function countLines(content: string) {
  return content.replace(/\r/g, "").split("\n").filter((line) => line.trim().length > 0).length;
}

function pickRandomPrompt(prompts: EssayPrompt[], currentId?: string) {
  if (prompts.length <= 1) return prompts[0];
  const pool = prompts.filter((prompt) => prompt.id !== currentId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function EssayPractice({ rules, prompts, submissions }: EssayPracticeProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | undefined>(() => prompts[0]);
  const [content, setContent] = useState("");
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const lineCount = useMemo(() => countLines(content), [content]);
  const words = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);
  const lineStatus =
    lineCount === 0
      ? "neutral"
      : lineCount < rules.minLines || lineCount > rules.maxLines
        ? "warning"
        : "ready";

  function drawPrompt() {
    const nextPrompt = pickRandomPrompt(prompts, selectedPrompt?.id);
    setSelectedPrompt(nextPrompt);
    setResult(null);
    setError(null);
  }

  function correctEssay() {
    if (!selectedPrompt || !content.trim()) return;

    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/redacao/corrigir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: selectedPrompt.id, content })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Nao foi possivel corrigir a redacao.");
        return;
      }

      setResult(data as CorrectionResult);
    });
  }

  if (!selectedPrompt) {
    return (
      <section className="panel">
        <p>Nenhum tema ativo encontrado. Cadastre temas no banco para iniciar o treino de redacao.</p>
      </section>
    );
  }

  return (
    <div className="essay-practice">
      <section className="essay-toolbar">
        <div className="essay-stat">
          <FileText size={20} />
          <span>{rules.type}</span>
          <strong>
            {rules.minLines}-{rules.maxLines} linhas
          </strong>
        </div>
        <div className="essay-stat">
          <Target size={20} />
          <span>criterios</span>
          <strong>
            {rules.formalPoints}/{rules.textualPoints}/{rules.technicalPoints}
          </strong>
        </div>
        <div className={`essay-stat line-${lineStatus}`}>
          {lineStatus === "ready" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>linhas escritas</span>
          <strong>{lineCount}</strong>
        </div>
        <button className="secondary-action" onClick={drawPrompt} type="button">
          <Shuffle size={18} />
          Sortear tema
        </button>
      </section>

      <div className="essay-layout">
        <section className="essay-editor">
          <article className="essay-prompt">
            <div>
              <span className="eyebrow">{selectedPrompt.category}</span>
              <h2>{selectedPrompt.theme}</h2>
              <p>{selectedPrompt.statement}</p>
              {selectedPrompt.supportText ? <blockquote>{selectedPrompt.supportText}</blockquote> : null}
            </div>
            <span className="tag">{selectedPrompt.source}</span>
          </article>

          <label className="essay-field">
            <span>Redacao do aluno</span>
            <textarea
              className="essay-textarea"
              onChange={(event) => {
                setContent(event.target.value);
                setResult(null);
                setError(null);
              }}
              placeholder="Escreva aqui sua redacao, separando as linhas como faria na folha oficial."
              rows={30}
              value={content}
            />
          </label>

          <div className="essay-footer">
            <div className="line-counter">
              <strong>{lineCount}</strong>
              <span>
                linhas preenchidas | {words} palavras | oficial: {rules.minLines}-{rules.maxLines}
              </span>
            </div>
            <button className="primary-action" disabled={!content.trim() || isPending} onClick={correctEssay} type="button">
              {isPending ? <Loader2 size={18} /> : <Send size={18} />}
              Corrigir com IA
            </button>
          </div>

          {error ? <div className="answer-result wrong">{error}</div> : null}
        </section>

        <aside className="score-panel">
          {result ? (
            <>
              <div className="score-head">
                <Trophy size={28} />
                <span>nota real</span>
                <strong>{result.score}</strong>
                <small>
                  {result.provider === "groq" ? "IA Groq" : "corretor local"} | {result.model}
                </small>
              </div>

              <div className="score-grid">
                <div>
                  <span>formal</span>
                  <strong>
                    {result.formalScore}/{rules.formalPoints}
                  </strong>
                </div>
                <div>
                  <span>textual</span>
                  <strong>
                    {result.textualScore}/{rules.textualPoints}
                  </strong>
                </div>
                <div>
                  <span>argumento</span>
                  <strong>
                    {result.technicalScore}/{rules.technicalPoints}
                  </strong>
                </div>
              </div>

              <p className="score-message">{result.lineFeedback}</p>
              <p className="score-message">{result.finalMessage}</p>

              <CorrectionList title="Pontos fortes" items={result.strengths} />
              <CorrectionList title="Pontos fracos" items={result.weaknesses} />
              <CorrectionList title="Plano para subir nota" items={result.actionPlan} />
            </>
          ) : (
            <div className="empty-correction">
              <Target size={34} />
              <h2>Correcao rigorosa</h2>
              <p>
                A nota considera norma formal, estrutura textual e conteudo argumentativo. O objetivo e mostrar onde
                ganhar ponto ate chegar ao desempenho maximo.
              </p>
            </div>
          )}
        </aside>
      </div>

      {submissions.length ? (
        <section className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Historico</span>
              <h2>Ultimas correcoes</h2>
            </div>
          </div>
          <div className="essay-history">
            {submissions.map((submission) => (
              <article key={submission.id}>
                <strong>{submission.score}/100</strong>
                <span>{submission.theme}</span>
                <small>
                  {submission.lineCount} linhas | {submission.model} | {submission.createdAt}
                </small>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CorrectionList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="correction-block">
      <h3>{title}</h3>
      <ul className="clean-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
