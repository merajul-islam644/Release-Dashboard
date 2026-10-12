import { Check, X } from "lucide-react";
import type { PipelineStage } from "../../features/data/types";

export function Pipeline({ stages, compact }: { stages: PipelineStage[]; compact?: boolean }) {
  return (
    <div className={compact ? "pipeline pipeline-compact" : "pipeline"}>
      {stages.map((stage) => (
        <div key={stage.name} className={`pipeline-stage pipeline-${stage.status}`}>
          <span className="pipeline-dot">
            {stage.status === "failed" ? <X size={12} /> : stage.status === "completed" ? <Check size={12} /> : null}
          </span>
          <div className="pipeline-stage-body">
            <span className="pipeline-name">{stage.name}</span>
            <span className="pipeline-duration">{stage.duration || (stage.status === "pending" ? "Pending" : "—")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PipelineSummary({ stages, completedLabel }: { stages: PipelineStage[]; completedLabel: string }) {
  const completed = stages.filter((s) => s.status === "completed").length;
  const failed = stages.some((s) => s.status === "failed");
  const label = failed ? "Failed" : completed === stages.length ? completedLabel : `${completed}/${stages.length} steps`;
  return <span className={failed ? "muted" : "muted"}>{label}</span>;
}