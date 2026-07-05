import type { TopicStatus } from "@/lib/edital-data";

const labels: Record<TopicStatus, string> = {
  "nao-iniciado": "Nao iniciado",
  estudando: "Estudando",
  revisando: "Revisando",
  dominado: "Dominado"
};

export function StatusPill({ status }: { status: TopicStatus }) {
  return <span className={`status-pill status-${status}`}>{labels[status]}</span>;
}
