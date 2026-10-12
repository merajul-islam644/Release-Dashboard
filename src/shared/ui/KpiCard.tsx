import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { ReactNode } from "react";

export type KpiChange = { value: number; label: string } | undefined;

function Delta({ change, invert }: { change: NonNullable<KpiChange>; invert?: boolean }) {
  const delta = change.value;
  const good = invert ? delta < 0 : delta > 0;
  const Icon = delta === 0 ? Minus : delta > 0 ? ArrowUp : ArrowDown;
  const text = delta === 0 ? "0%" : `${delta > 0 ? "+" : ""}${delta}%`;

  return (
    <span className={good ? "kpi-delta kpi-delta-good" : "kpi-delta kpi-delta-bad"}>
      <Icon size={13} />
      {text}
      <span className="kpi-delta-label">{change.label}</span>
    </span>
  );
}

export function KpiCard({ icon, invert, label, sub, value, change }: { icon: ReactNode; invert?: boolean; label: string; sub?: string; value: ReactNode; change?: KpiChange }) {
  return (
    <div className="kpi-card">
      <div className="kpi-head">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        {change ? <Delta change={change} invert={invert} /> : <span className="kpi-delta-label">{sub}</span>}
      </div>
    </div>
  );
}