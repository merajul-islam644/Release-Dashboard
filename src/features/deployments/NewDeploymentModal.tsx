import { useState } from "react";
import { useCurrentUser } from "../profile/useCurrentUser";
import { defaultPipeline } from "../../lib/lattice";
import { useCreateDeployment, useRecordHistory } from "../data/useData";
import { Modal } from "../../shared/ui/Modal";
import { ENVIRONMENTS } from "../../lib/environments";

export function NewDeploymentModal({ onClose }: { onClose: () => void }) {
  const [version, setVersion] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [branch, setBranch] = useState("");
  const [commit, setCommit] = useState("");
  const [error, setError] = useState("");

  const me = useCurrentUser();
  const profile = me.data?.data;
  const createDeployment = useCreateDeployment();
  const recordHistory = useRecordHistory();

  async function submit() {
    setError("");
    if (!version || !branch || !commit) {
      setError("Version, branch, and commit are required.");
      return;
    }
    try {
      const result = (await createDeployment.mutateAsync({
        Version: version,
        Environment: environment,
        Branch: branch,
        Commit: commit,
        DeployedBy: profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email : "Unknown",
        DeployedAt: new Date().toISOString(),
        Status: "Deploying",
        Pipeline: JSON.stringify(defaultPipeline()),
        TotalTime: ""
      })) as { data?: { itemId?: string }; itemId?: string };

      const itemId = result.itemId ?? result.data?.itemId;
      await recordHistory.mutateAsync({
        RecordType: "Deployment",
        RecordId: String(itemId ?? ""),
        Action: "Created",
        Detail: `Deployed ${version} to ${environment}`,
        ChangedBy: profile?.email ?? "unknown",
        ChangedAt: new Date().toISOString()
      });
      onClose();
    } catch {
      setError("Could not create the deployment. Please try again.");
    }
  }

  return (
    <Modal title="New Deployment" onClose={onClose}>
      <div className="form-grid">
        <label className="form-field">
          <span>Version</span>
          <input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="v1.24.0" />
        </label>
        <label className="form-field">
          <span>Environment</span>
          <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
            {ENVIRONMENTS.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Branch</span>
          <input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="main" />
        </label>
        <label className="form-field">
          <span>Commit</span>
          <input value={commit} onChange={(event) => setCommit(event.target.value)} placeholder="8f2a1c4" />
        </label>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="icon-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={submit} disabled={createDeployment.isPending}>Deploy</button>
      </div>
    </Modal>
  );
}