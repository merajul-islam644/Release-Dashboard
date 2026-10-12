import { ArrowRight, Bug } from "lucide-react";
import type { Deployment, Issue } from "../data/types";
import { formatDate, shortCommit } from "../../lib/lattice";
import { StatusPill } from "../../shared/ui/StatusPill";

export function RecentDeploymentsCard({ deployments, onViewAll, onOpen }: { deployments: Deployment[]; onViewAll: () => void; onOpen: (id: string) => void }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title"><span>Recent Deployments</span></div>
        <button className="link-button" onClick={onViewAll}>View all <ArrowRight size={13} /></button>
      </div>
      {deployments.length === 0 ? (
        <p className="text-muted">No deployments yet.</p>
      ) : (
        <div className="recent-table">
          {deployments.slice(0, 6).map((deployment) => (
            <div key={deployment.itemId ?? deployment.id} className="recent-row" onClick={() => onOpen(deployment.itemId ?? deployment.id ?? "")}>
              <div className="recent-main">
                <strong>{deployment.Version}</strong>
                <span className="muted mono">#{shortCommit(deployment.Commit)}</span>
              </div>
              <div className="muted">{deployment.Environment} · {deployment.Branch}</div>
              <div className="muted">{deployment.DeployedBy} · {formatDate(deployment.DeployedAt)}</div>
              <StatusPill status={deployment.Status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentIssuesCard({ issues, onOpen }: { issues: Issue[]; onOpen: (id: string) => void }) {
  return (
    <div className="panel">
      <div className="panel-title"><Bug size={16} /><span>Recent Issues</span></div>
      {issues.length === 0 ? (
        <p className="text-muted">No open issues.</p>
      ) : (
        <div className="issue-list">
          {issues.slice(0, 5).map((issue) => (
            <button key={issue.itemId ?? issue.id} className="issue-row" onClick={() => onOpen(issue.itemId ?? issue.id ?? "")}>
              <span className={`severity severity-${issue.Severity?.toLowerCase()}`}>{issue.Severity}</span>
              <span className="issue-title">{issue.Title}</span>
              <span className="muted">{issue.Environment} · {formatDate(issue.ReportedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}