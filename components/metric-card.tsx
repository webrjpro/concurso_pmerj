import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon?: LucideIcon;
  tone?: string;
};

export function MetricCard({ label, value, detail, icon: Icon, tone = "green" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      {Icon ? (
        <div className="metric-icon" aria-hidden="true">
          <Icon size={20} />
        </div>
      ) : null}
    </article>
  );
}
