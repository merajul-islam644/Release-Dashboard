import { useState } from "react";
import { useCreateIssue, useRecordHistory } from "../data/useData";
import { useCurrentUser } from "../profile/useCurrentUser";
import { Modal } from "../../shared/ui/Modal";
import type { IssueSeverity } from "../data/types";

export function AddIssueModal({ deploymentId, environment, onClose }: { deploymentId: string; environment?: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("Medium");
  const [status, setStatus] = useState("Open");
  const [error, setError] = useState("");

  const me = useCurrentUser();
  const createIssue = useCreateIssue();
  const recordHistory = useRecordHistory();

  async function submit() {
    setError("");
    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }
    try {
      const created = (await createIssue.mutateAsync({
        Title: title,
        Severity: severity,
        Environment: environment ?? "Production",
        Status: status,
        DeploymentId: deploymentId,
        ReportedAt: new Date().toISOString()
      })) as { data?: { itemId?: string }; itemId?: string };
      const itemId = created.itemId ?? created.data?.itemId;
      await recordHistory.mutateAsync({
        RecordType: "Issue",
        RecordId: String(itemId ?? ""),
        Action: "Created",
        Detail: `${title} (${severity})`,
        ChangedBy: me.data?.data?.email ?? "unknown",
        ChangedAt: new Date().toISOString()
      });
      onClose();
    } catch {
      setError("Could not save the issue.");
    }
  }

  return (
    <Modal title="Add Issue" onClose={onClose}>
      <div className="form-grid">
        <label className="form-field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Describe the issue" />
        </label>
        <label className="form-field">
          <span>Severity</span>
          <select value={severity} onChange={(event) => setSeverity(event.target.value as IssueSeverity)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <label className="form-field">
          <span>Environment</span>
          <input value={environment ?? "Production"} readOnly />
        </label>
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </label>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="icon-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={submit} disabled={createIssue.isPending}>Save</button>
      </div>
    </Modal>
  );
}