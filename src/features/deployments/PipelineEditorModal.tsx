import { useState } from "react";
import { useRecordHistory, useUpdateDeployment } from "../data/useData";
import type { PipelineStage } from "../data/types";
import { parsePipeline } from "../../lib/lattice";
import { useCurrentUser } from "../profile/useCurrentUser";
import { Modal } from "../../shared/ui/Modal";

const STAGES: PipelineStage["name"][] = ["Build", "Test", "Security Scan", "Deploy", "Verify"];
const STATUSES: PipelineStage["status"][] = ["pending", "running", "completed", "failed"];

export function PipelineEditorModal({ deploymentId, pipeline, onClose }: { deploymentId: string; pipeline?: string; onClose: () => void }) {
  const initial = parsePipeline(pipeline);
  const [stages, setStages] = useState<PipelineStage[]>(
    initial.length ? initial : STAGES.map((name) => ({ name, status: "pending" as const, duration: "" }))
  );
  const [error, setError] = useState("");

  const updateDeployment = useUpdateDeployment();
  const recordHistory = useRecordHistory();
  const me = useCurrentUser();

  function setStage(index: number, patch: Partial<PipelineStage>) {
    setStages((prev) => prev.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));
  }

  function statusFor(stage: PipelineStage): PipelineStage["status"] {
    return stage.status;
  }

  async function save() {
    setError("");
    const failed = stages.some((s) => s.status === "failed");
    const running = stages.some((s) => s.status === "running");
    const completed = stages.filter((s) => s.status === "completed").length;
    const nextStatus = failed ? "Failed" : running ? "Deploying" : completed === stages.length ? "Healthy" : "Deploying";
    const totalTime = stages.filter((s) => s.duration).map((s) => s.duration).join(" · ");

    try {
      await updateDeployment.mutateAsync({ itemId: deploymentId, input: { Pipeline: JSON.stringify(stages), Status: nextStatus, TotalTime: totalTime } });
      await recordHistory.mutateAsync({
        RecordType: "Deployment",
        RecordId: deploymentId,
        Action: "Updated",
        Detail: failed ? "Pipeline failed" : "Pipeline updated",
        ChangedBy: me.data?.data?.email ?? "unknown",
        ChangedAt: new Date().toISOString()
      });
      onClose();
    } catch {
      setError("Could not save the pipeline.");
    }
  }

  return (
    <Modal title="Edit Deployment Pipeline" onClose={onClose}>
      <p className="text-muted">Mark each stage completed, failed, or running and record its duration.</p>
      <div className="pipeline-editor">
        {stages.map((stage, index) => (
          <div key={stage.name} className="pipeline-edit-row">
            <span className="pipeline-edit-name">{stage.name}</span>
            <select className="select" value={statusFor(stage)} onChange={(event) => setStage(index, { status: event.target.value as PipelineStage["status"] })}>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input className="pipeline-edit-duration" value={stage.duration} onChange={(event) => setStage(index, { duration: event.target.value })} placeholder="e.g. 12s" />
          </div>
        ))}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="icon-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={save} disabled={updateDeployment.isPending}>Save</button>
      </div>
    </Modal>
  );
}