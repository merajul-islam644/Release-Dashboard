import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useVerifications, useDeployments } from "../data/useData";
import type { Verification } from "../data/types";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { VerificationEvidenceModal } from "../deployments/VerificationEvidenceModal";

export function VerificationPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const verifications = useVerifications();
  const deployments = useDeployments();
  const [deploymentFilter, setDeploymentFilter] = useState("");
  const [envFilter, setEnvFilter] = useState("");
  const [query, setQuery] = useState("");
  const [evidence, setEvidence] = useState<Verification | undefined>();

  const deploymentVersions = useMemo(() => {
    const map = new Map<string, string>();
    (deployments.data?.items ?? []).forEach((d) => { if (d.itemId) map.set(d.itemId, d.Version); });
    return map;
  }, [deployments.data]);

  const environmentOf = useMemo(() => {
    const map = new Map<string, string>();
    (deployments.data?.items ?? []).forEach((d) => { if (d.itemId) map.set(d.itemId, d.Environment); });
    return map;
  }, [deployments.data]);

  const rows = (verifications.data ?? []).filter((v) =>
    (!deploymentFilter || v.DeploymentId === deploymentFilter) &&
    (!envFilter || environmentOf.get(v.DeploymentId) === envFilter) &&
    (!query || [v.Type, v.Result, v.Pass].some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase())))
  );

  const columns: Column<Verification>[] = [
    { key: "type", header: "Type", render: (v) => v.Type },
    { key: "result", header: "Result", render: (v) => v.Result },
    { key: "pass", header: "Pass / Fail", render: (v) => <span className={v.Pass === "Pass" ? "status-pill status-good" : "status-pill status-failed"}>{v.Pass}</span> },
    { key: "deployment", header: "Deployment", render: (v) => <button className="link-button" onClick={() => onNavigate(`/deployments/${v.DeploymentId}`)}>{deploymentVersions.get(v.DeploymentId) ?? "Deployment"}</button> },
    { key: "evidence", header: "Evidence", render: (v) => (v.Pass === "Fail" ? <button className="link-button" onClick={() => setEvidence(v)}>Inspect</button> : <span className="muted">—</span>) }
  ];

  return (
    <section>
      <PageHeader title="Verification" subtitle="Automated check results attached to each deployment." />
      <div className="toolbar">
        <label className="search-box"><Search size={15} /><input placeholder="Search checks..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="toolbar-actions">
          <select className="select" value={deploymentFilter} onChange={(event) => setDeploymentFilter(event.target.value)} aria-label="Filter by deployment">
            <option value="">All deployments</option>
            {[...deploymentVersions.entries()].map(([id, version]) => <option key={id} value={id}>{version}</option>)}
          </select>
          <select className="select" value={envFilter} onChange={(event) => setEnvFilter(event.target.value)} aria-label="Filter by environment">
            <option value="">All environments</option>
            {[...new Set(environmentOf.values())].map((env) => <option key={env} value={env}>{env}</option>)}
          </select>
        </div>
      </div>

      {verifications.error ? (
        <ErrorState message="Something went wrong while loading verification results." onRetry={() => verifications.refetch()} />
      ) : verifications.isLoading ? (
        <div className="table-shell"><div className="skeleton-table">Loading verification results…</div></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No verification results yet" description="Add verification checks to a deployment to see them here." />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}

      {evidence ? <VerificationEvidenceModal verification={evidence} onClose={() => setEvidence(undefined)} /> : null}
    </section>
  );
}