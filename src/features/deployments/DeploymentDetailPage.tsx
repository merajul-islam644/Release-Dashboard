import { Bug, CheckCircle2, History, Plus, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { useCanChangeRecords, useCanEditDeployments, useRole } from "../../lib/roles";
import { formatDateFull, parsePipeline, pipelineTotalTime } from "../../lib/lattice";
import { useDeployment, useHistory, useIssues, useVerifications } from "../data/useData";
import type { Verification } from "../data/types";
import { ActionButton } from "../../shared/ui/ActionButton";
import { Alert } from "../../shared/ui/Alert";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Pipeline } from "../../shared/ui/Pipeline";
import { StatusPill } from "../../shared/ui/StatusPill";
import { AddIssueModal } from "./AddIssueModal";
import { AddVerificationModal } from "./AddVerificationModal";
import { PipelineEditorModal } from "./PipelineEditorModal";
import { VerificationEvidenceModal } from "./VerificationEvidenceModal";

export function DeploymentDetailPage({ id, onNavigate }: { id?: string; onNavigate: (path: string) => void }) {
  const deployment = useDeployment(id);
  const verifications = useVerifications(id);
  const issues = useIssues();
  const history = useHistory(id);
  const [addingVerification, setAddingVerification] = useState(false);
  const [addingIssue, setAddingIssue] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(false);
  const [evidence, setEvidence] = useState<Verification | undefined>();
  const [permissionNotice, setPermissionNotice] = useState(false);
  const canChange = useCanChangeRecords();
  const canEditDeployments = useCanEditDeployments();
  const role = useRole();

  if (deployment.isLoading) {
    return <section><PageHeader title="Deployment" subtitle="Loading deployment…" /><div className="panel"><span className="skeleton skeleton-line-lg" /></div></section>;
  }
  if (deployment.error || !deployment.data) {
    return (
      <section>
        <PageHeader title="Deployment not found" subtitle="The deployment you're looking for doesn't exist or couldn't be loaded." />
        <ErrorState message="Something went wrong while loading the deployment." onRetry={() => deployment.refetch()} />
      </section>
    );
  }

  const d = deployment.data as NonNullable<typeof deployment.data> & Record<string, unknown>;
  const stages = parsePipeline(d.Pipeline as string);
  const deploymentVerifications = verifications.data ?? [];
  const deploymentIssues = (issues.data ?? []).filter((issue) => issue.DeploymentId === id);
  const historyEntries = history.data ?? [];

  function handleAddVerification() {
    if (canChange) setAddingVerification(true);
    else setPermissionNotice(true);
  }

  function handleAddIssue() {
    if (canChange) setAddingIssue(true);
    else setPermissionNotice(true);
  }

  return (
    <section>
      <button className="link-button back-link" onClick={() => onNavigate("/deployments")}>← Back to deployments</button>

      <PageHeader
        title={`${d.Version as string}`}
        subtitle={`${d.Environment as string} · ${d.Branch as string} · #${String(d.Commit).slice(0, 8)} · deployed ${formatDateFull(d.DeployedAt as string)} by ${d.DeployedBy as string}`}
        actions={
          canEditDeployments ? <StatusPill status={d.Status as string} /> : <StatusPill status={d.Status as string} />
        }
      />

      {permissionNotice ? <Alert tone="warn">You don't have permission to change this.</Alert> : null}

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title"><History size={16} /><span>Deployment Pipeline</span></div>
            {canEditDeployments ? <button className="link-button" onClick={() => setEditingPipeline(true)}>Edit</button> : null}
          </div>
          <Pipeline stages={stages} />
          <div className="muted">Total time: {pipelineTotalTime(stages)}</div>
        </div>
        <div className="panel">
          <div className="panel-title"><ShieldCheck size={16} /><span>Verification Results</span></div>
          <div className="verification-list">
            {deploymentVerifications.length === 0 ? (
              <p className="text-muted">No verification results yet.</p>
            ) : (
              deploymentVerifications.map((verification) => {
                const failed = verification.Pass === "Fail";
                return (
                  <button key={verification.itemId ?? verification.id} className="verification-row" onClick={() => failed && setEvidence(verification)} disabled={!failed}>
                    {failed ? <XCircle size={16} className="verification-fail" /> : <CheckCircle2 size={16} className="verification-pass" />}
                    <span>{verification.Type}</span>
                    <span className="muted">{verification.Result}</span>
                    <span className={failed ? "status-pill status-failed" : "status-pill status-good"}>{verification.Pass}</span>
                  </button>
                );
              })
            )}
          </div>
          {canChange ? <ActionButton icon={<Plus size={16} />} onClick={handleAddVerification}>Add Verification Result</ActionButton> : null}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-title"><Bug size={16} /><span>Issues on this deployment</span></div>
          {deploymentIssues.length === 0 ? (
            <EmptyState title="No issues yet" description="No issues reported for this deployment." />
          ) : (
            <div className="issue-list">
              {deploymentIssues.map((issue) => (
                <button key={issue.itemId ?? issue.id} className="issue-row" onClick={() => onNavigate(`/issues/${issue.itemId ?? issue.id}`)}>
                  <span className={`severity severity-${issue.Severity?.toLowerCase()}`}>{issue.Severity}</span>
                  <span className="issue-title">{issue.Title}</span>
                  <span className="muted">{issue.Status}</span>
                </button>
              ))}
            </div>
          )}
          {canChange ? <ActionButton icon={<Plus size={16} />} onClick={handleAddIssue}>Add Issue</ActionButton> : null}
        </div>
        <div className="panel">
          <div className="panel-title"><History size={16} /><span>History</span></div>
          {historyEntries.length === 0 ? (
            <p className="text-muted">No history recorded yet.</p>
          ) : (
            <div className="history-list">
              {historyEntries.map((entry) => (
                <div key={entry.itemId ?? entry.id} className="history-row">
                  <div className="history-main"><strong>{entry.Action}</strong> <span className="muted">{entry.Detail}</span></div>
                  <div className="muted">{entry.ChangedBy} · {formatDateFull(entry.ChangedAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {role ? <div className="role-note">Signed in as {role}</div> : null}
      {addingVerification ? <AddVerificationModal deploymentId={id ?? ""} onClose={() => setAddingVerification(false)} /> : null}
      {addingIssue ? <AddIssueModal deploymentId={id ?? ""} environment={d.Environment as string} onClose={() => setAddingIssue(false)} /> : null}
      {editingPipeline ? <PipelineEditorModal deploymentId={id ?? ""} pipeline={d.Pipeline as string} onClose={() => setEditingPipeline(false)} /> : null}
      {evidence ? <VerificationEvidenceModal verification={evidence} onClose={() => setEvidence(undefined)} /> : null}
    </section>
  );
}