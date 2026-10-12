import { useState } from "react";
import { useCreateVerification, useRecordHistory } from "../data/useData";
import { useCurrentUser } from "../profile/useCurrentUser";
import { Modal } from "../../shared/ui/Modal";
import type { VerificationType } from "../data/types";

const VERIFICATION_TYPES = ["Application Load", "Console Errors", "Network Requests", "Navigation", "Broken Links"];
const EVIDENCE_OPTIONS = ["Screenshots", "Logs", "Network", "Console"];

export function AddVerificationModal({ deploymentId, onClose }: { deploymentId: string; onClose: () => void }) {
  const [type, setType] = useState(VERIFICATION_TYPES[0]);
  const [result, setResult] = useState("");
  const [pass, setPass] = useState("Pass");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [error, setError] = useState("");

  const me = useCurrentUser();
  const createVerification = useCreateVerification();
  const recordHistory = useRecordHistory();

  function toggleEvidence(value: string) {
    setEvidence((prev) => (prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]));
  }

  async function submit() {
    setError("");
    if (!result) {
      setError("Enter a result value.");
      return;
    }
    try {
      const created = (await createVerification.mutateAsync({
        Type: type as VerificationType,
        Result: result,
        Pass: pass,
        Evidence: JSON.stringify(evidence),
        DeploymentId: deploymentId
      })) as { data?: { itemId?: string }; itemId?: string };
      const itemId = created.itemId ?? created.data?.itemId;
      await recordHistory.mutateAsync({
        RecordType: "Verification",
        RecordId: String(itemId ?? ""),
        Action: "Created",
        Detail: `${type} — ${pass}`,
        ChangedBy: me.data?.data?.email ?? "unknown",
        ChangedAt: new Date().toISOString()
      });
      onClose();
    } catch {
      setError("Could not save the verification result.");
    }
  }

  return (
    <Modal title="Add Verification Result" onClose={onClose}>
      <div className="form-grid">
        <label className="form-field">
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {VERIFICATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Result value</span>
          <input value={result} onChange={(event) => setResult(event.target.value)} placeholder="e.g. 0 console errors" />
        </label>
        <label className="form-field">
          <span>Pass / Fail</span>
          <select value={pass} onChange={(event) => setPass(event.target.value)}>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>
        </label>
        <div className="form-field">
          <span>Evidence</span>
          <div className="evidence-checkboxes">
            {EVIDENCE_OPTIONS.map((option) => (
              <label key={option} className="evidence-option">
                <input type="checkbox" checked={evidence.includes(option)} onChange={() => toggleEvidence(option)} />
                {option}
              </label>
            ))}
          </div>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="icon-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={submit} disabled={createVerification.isPending}>Save</button>
      </div>
    </Modal>
  );
}