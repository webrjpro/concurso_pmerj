import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { QuestionPractice } from "@/components/question-practice";
import { getQuestionBank } from "@/lib/questions";

export const dynamic = "force-dynamic";

type QuestionsPageProps = {
  searchParams?: Promise<{ subject?: string }>;
};

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const params = await searchParams;
  const subject = params?.subject;
  const bank = await getQuestionBank(subject);

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Banco de questoes</span>
          <h1>Treino com correcao automatica</h1>
          <p>
            Responda, corrija e registre seu desempenho. Quando houver erro, a plataforma gera entrada no
            caderno de erros e flashcard automatico para revisao.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <FileQuestion className="panel-icon" size={30} />
            <h2>Filtrar por materia</h2>
          </div>
        </div>
        <div className="tag-row" style={{ marginTop: 14 }}>
          <Link className={!subject ? "tag active-tag" : "tag"} href="/questoes">
            Todas
          </Link>
          {bank.subjects.map((item) => (
            <Link
              className={subject === item.slug ? "tag active-tag" : "tag"}
              href={`/questoes?subject=${item.slug}`}
              key={item.slug}
            >
              {item.shortName}
            </Link>
          ))}
        </div>
      </section>

      <QuestionPractice questions={bank.questions} />
    </div>
  );
}
