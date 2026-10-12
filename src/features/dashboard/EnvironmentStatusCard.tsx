import type { EnvironmentRecord } from "../data/types";
import { ENVIRONMENTS, ENVIRONMENT_DOT_CLASS } from "../../lib/environments";
import { StatusPill } from "../../shared/ui/StatusPill";

export function EnvironmentStatusCard({ environments, onOpenDeployment }: { environments: EnvironmentRecord[]; onOpenDeployment: (environment: string) => void }) {
  const byName = new Map(environments.map((e) => [e.Name, e]));
  const rows = ENVIRONMENTS.map((name) => {
    const record = byName.get(name);
    return { name, status: record?.Status ?? "Unknown", health: record?.HealthScore, id: record?.itemId ?? name };
  });

  return (
    <div className="panel">
      <div className="panel-title"><span>Environment Status</span></div>
      <div className="env-list">
        {rows.map((row) => {
          const dotClass = ENVIRONMENT_DOT_CLASS[row.name as keyof typeof ENVIRONMENT_DOT_CLASS] ?? "env-dot env-dot-custom";
          return (
            <button key={row.id} className="env-row" onClick={() => onOpenDeployment(row.name)}>
              <span className={dotClass} />
              <span className="env-row-name">{row.name}</span>
              <span className="env-row-score">{row.health !== undefined ? row.health : "—"}</span>
              <StatusPill status={row.status} />
            </button>
          );
        })}
      </div>
    </div>
  );
}