import { ArrowRight, Rocket } from "lucide-react";
import type { Deployment } from "../data/types";
import { formatDate, parsePipeline, pipelineTotalTime, shortCommit } from "../../lib/lattice";
import { Pipeline } from "../../shared/ui/Pipeline";
import { StatusPill } from "../../shared/ui/StatusPill";

export function LatestDeploymentCard({ deployment, onViewAll, onOpen }: { deployment?: Deployment; onViewAll: () => void; onOpen: () => void }) {
  if (!deployment) return null;
  const stages = parsePipeline(deployment.Pipeline);
  const completed = stages.filter((s) => s.status === "completed").length;

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><Rocket size={16} /><span>Latest Deployment</span></div>
        <button className="link-button" onClick={onViewAll}>View all <ArrowRight size={13} /></button>
      </div>
      <div className="deploy-head" onClick={onOpen}>
        <div>
          <div className="deploy-version">{deployment.Version} <span className="muted mono">#{shortCommit(deployment.Commit)}</span></div>
          <div className="muted">{deployment.Environment} · {deployment.Branch} · {formatDate(deployment.DeployedAt)}</div>
        </div>
        <StatusPill status={deployment.Status} />
      </div>
      <div className="deploy-steps">
        {stages.map((stage) => (
          <div key={stage.name} className="deploy-step">
            <span className={`deploy-step-dot deploy-${stage.status}`} />
            <span>{stage.name}</span>
            <span className="muted">{stage.duration}</span>
          </div>
        ))}
      </div>
      <div className="muted">{completed}/{stages.length} steps completed · {pipelineTotalTime(stages)}</div>
    </div>
  );
}

export function DeploymentPipelineCard({ deployment, onOpen }: { deployment?: Deployment; onOpen: () => void }) {
  if (!deployment) return null;
  const stages = parsePipeline(deployment.Pipeline);
  const completed = stages.every((s) => s.status === "completed" || s.status === "failed");
  const failed = stages.some((s) => s.status === "failed");

  return (
    <div className="panel" onClick={onOpen}>
      <div className="panel-title"><span>Deployment Pipeline</span></div>
      <Pipeline stages={stages} />
      <div className="muted">
        {failed ? "Failed" : completed ? `Completed · ${pipelineTotalTime(stages)}` : `${stages.filter((s) => s.status === "completed").length}/${stages.length} steps`}
      </div>
    </div>
  );
}