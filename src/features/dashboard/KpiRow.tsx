import { Activity, Bug, Gauge, Link2, Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { KpiCard } from "../../shared/ui/KpiCard";
import type { KpiData } from "./dashboard";

const ICONS: Record<string, ReactNode> = {
  "Production Health": <Gauge size={16} />,
  "Tests Passed": <Activity size={16} />,
  Errors: <Bug size={16} />,
  "Broken Links": <Link2 size={16} />,
  Performance: <Rocket size={16} />
};

export function KpiRow({ kpis }: { kpis: KpiData[] }) {
  return (
    <div className="kpi-row">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} icon={ICONS[kpi.label]} invert={kpi.invert} label={kpi.label} sub={kpi.sub} value={kpi.value} change={kpi.change} />
      ))}
    </div>
  );
}