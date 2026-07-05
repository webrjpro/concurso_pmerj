type ProgressBarProps = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-wrap" aria-label={label ?? `Progresso ${bounded}%`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${bounded}%` }} />
      </div>
      <span>{bounded}%</span>
    </div>
  );
}
