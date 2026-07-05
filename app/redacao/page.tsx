import { NotebookPen } from "lucide-react";
import { EssayPractice } from "@/components/essay-practice";
import { getEssayPracticeData } from "@/lib/essay";

export const dynamic = "force-dynamic";

export default async function RedacaoPage() {
  const data = await getEssayPracticeData();

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <span className="eyebrow">Redacao PMERJ</span>
          <h1>Treino discursivo-argumentativo</h1>
          <p>
            Sorteie temas frequentes de concurso publico, escreva dentro da quantidade oficial de linhas e receba
            correcao objetiva para perseguir a nota maxima.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <NotebookPen className="panel-icon" size={30} />
            <h2>Regra da prova</h2>
            <p>
              Modelo dissertativo-argumentativo, com {data.rules.minLines} a {data.rules.maxLines} linhas. A nota
              soma dominio formal, organizacao textual e desenvolvimento tecnico-argumentativo.
            </p>
          </div>
        </div>
      </section>

      <EssayPractice rules={data.rules} prompts={data.prompts} submissions={data.submissions} />
    </div>
  );
}
