import { FileCode, Image, Monitor, Network } from "lucide-react";
import type { Verification } from "../data/types";
import { Modal } from "../../shared/ui/Modal";

const EVIDENCE_ICONS: Record<string, typeof Image> = { Screenshots: Image, Logs: FileCode, Network: Network, Console: Monitor };

export function VerificationEvidenceModal({ verification, onClose }: { verification: Verification; onClose: () => void }) {
  let evidence: string[] = [];
  try {
    evidence = verification.Evidence ? JSON.parse(verification.Evidence) : [];
  } catch {
    evidence = [];
  }

  const items = evidence.length ? evidence : ["Screenshots", "Logs", "Network", "Console"];

  return (
    <Modal title={`${verification.Type} — Evidence`} onClose={onClose}>
      <div className="evidence-detail">
        <p className="text-muted">Result: <strong>{verification.Result}</strong> · <strong>{verification.Pass}</strong></p>
        <div className="evidence-gallery">
          {items.map((item) => {
            const Icon = EVIDENCE_ICONS[item] ?? Image;
            return (
              <div key={item} className="evidence-item">
                <span className="evidence-item-icon"><Icon size={18} /></span>
                <span>{item}</span>
                <span className="muted">Available</span>
              </div>
            );
          })}
        </div>
        <p className="text-muted">Evidence captures for this failed check are recorded with the deployment. Re-run the check or add new captures from the deployment detail.</p>
      </div>
    </Modal>
  );
}