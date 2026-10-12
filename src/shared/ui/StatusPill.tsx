const STATUS_CLASS: Record<string, string> = {
  Healthy: "status-good",
  Passed: "status-good",
  Deploying: "status-deploying",
  Degraded: "status-degraded",
  Failed: "status-failed",
  Unknown: "status-unknown",
  Open: "status-deploying",
  InProgress: "status-deploying",
  Resolved: "status-good",
  Pass: "status-good",
  Fail: "status-failed",
  Completed: "status-good"
};

export function statusTone(status?: string): string {
  if (!status) return "status-unknown";
  return STATUS_CLASS[status] ?? "status-unknown";
}

export function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  return <span className={`status-pill ${statusTone(status)}`}>{status}</span>;
}