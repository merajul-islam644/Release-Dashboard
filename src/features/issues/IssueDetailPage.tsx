import { useState } from "react";
import { useCanChangeRecords } from "../../lib/roles";
import { formatDateFull } from "../../lib/lattice";
import { useDeployment, useHistory, useIssue, useRecordHistory, useUpdateIssue } from "../data/useData";
import { useCurrentUser } from "../profile/useCurrentUser";
import { Alert } from "../../shared/ui/Alert";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusPill } from "../../shared/ui/StatusPill";

const ISSUE_STATUSES = ["Open", "In Progress", "Resolved"];

export function IssueDetailPage({ id, onNavigate }: { id?: string; onNavigate: (path: string) => void }) {
  const issue = useIssue(id);
  const history = useHistory(id);
  const updateIssue = useUpdateIssue();
  const recordHistory = useRecordHistory();
  const me = useCurrentUser();
  const [permissionNotice, setPermissionNotice] = useState(false);
  const canChange = useCanChangeRecords();
  const deployment = useDeployment(issue.data?.DeploymentId);

  if (issue.isLoading) {
    return <section><PageHeader title="Issue" subtitle="Loading issue…" /></section>;
  }
  if (issue.error || !issue.data) {
    return (
      <section>
        <PageHeader title="Issue not found" subtitle="The issue you're looking for doesn't exist." />
        <ErrorState message="Something went wrong while loading the issue." onRetry={() => issue.refetch()} />
      </section>
    );
  }

  const current = issue.data as NonNullable<typeof issue.data> & Record<string, unknown>;

  function changeStatus(next: string) {
    if (!canChange) {
      setPermissionNotice(true);
      return;
    }
    if (id) {
      updateIssue.mutate({ itemId: id, input: { Status: next } });
      recordHistory.mutate({
        RecordType: "Issue",
        RecordId: id,
        Action: "Status changed",
        Detail: `${String(current.Status)} → ${next}`,
        ChangedBy: me.data?.data?.email ?? "unknown",
        ChangedAt: new Date().toISOString()
      });
    }
  }

  return (
    <section>
      <button className="link-button back-link" onClick={() => onNavigate("/issues")}>← Back to issues</button>

      <PageHeader title={`${current.Title}`} subtitle={`Reported ${formatDateFull(current.ReportedAt as string)} · ${current.Environment as string}`} actions={<StatusPill status={current.Status as string} />} />

      {permissionNotice ? <Alert tone="warn">You don't have permission to change this.</Alert> : null}

      <div className="panel">
        <div className="panel-title"><span>Issue</span></div>
        <div className="issue-meta">
          <div><span className="muted">Severity</span><span className={`severity severity-${String(current.Severity).toLowerCase()}`}>{current.Severity}</span></div>
          <div><span className="muted">Environment</span><span>{current.Environment}</span></div>
          <div><span className="muted">Status</span>
            {canChange ? (
              <select className="select" value={String(current.Status)} onChange={(event) => changeStatus(event.target.value)}>
                {ISSUE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            ) : <span>{String(current.Status)}</span>}
          </div>
          {current.DeploymentId ? (
            <div><span className="muted">Deployment</span><button className="link-button" onClick={() => onNavigate(`/deployments/${current.DeploymentId}`)}>{String(deployment.data?.Version ?? "View deployment")}</button></div>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title"><span>History</span></div>
        {(history.data ?? []).length === 0 ? (
          <p className="text-muted">No history recorded yet.</p>
        ) : (
          <div className="history-list">
            {(history.data ?? []).map((entry) => (
              <div key={entry.itemId ?? entry.id} className="history-row">
                <div className="history-main"><strong>{entry.Action}</strong> <span className="muted">{entry.Detail}</span></div>
                <div className="muted">{entry.ChangedBy} · {formatDateFull(entry.ChangedAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}