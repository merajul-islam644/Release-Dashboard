import { ArrowUpDown, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useCanEditDeployments } from "../../lib/roles";
import { useTableState } from "../../lib/useTableState";
import { formatDate, shortCommit } from "../../lib/lattice";
import { useDeployments } from "../data/useData";
import type { Deployment } from "../data/types";
import { Alert } from "../../shared/ui/Alert";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusPill } from "../../shared/ui/StatusPill";
import { NewDeploymentModal } from "./NewDeploymentModal";
import { ENVIRONMENTS } from "../../lib/environments";

export function DeploymentsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const deployments = useDeployments();
  const [creating, setCreating] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState(false);
  const [envFilter, setEnvFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const canEdit = useCanEditDeployments();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const env = params.get("environment");
    if (env) setEnvFilter(env);
  }, []);

  const rows = (deployments.data?.items ?? []).filter((d) => (!envFilter || d.Environment === envFilter) && (!statusFilter || d.Status === statusFilter));

  const table = useTableState<Deployment>(rows, (row, query) =>
    [row.Version, row.Environment, row.Branch, row.Commit, row.DeployedBy].some((value) => String(value ?? "").toLowerCase().includes(query)),
    ["Version", "Environment", "Branch", "Commit", "DeployedBy"]
  );

  const columns: Column<Deployment>[] = [
    { key: "version", header: "Version", render: (d) => <button className="link-button" onClick={() => onNavigate(`/deployments/${d.itemId ?? d.id}`)}>{d.Version}</button> },
    { key: "environment", header: "Environment", render: (d) => d.Environment },
    { key: "branch", header: "Branch", render: (d) => d.Branch },
    { key: "commit", header: "Commit", render: (d) => <span className="mono">#{shortCommit(d.Commit)}</span> },
    { key: "deployedBy", header: "Deployed By", render: (d) => d.DeployedBy },
    { key: "deployedAt", header: "Deployed At", render: (d) => formatDate(d.DeployedAt) },
    { key: "status", header: "Status", render: (d) => <StatusPill status={d.Status} /> },
    { key: "actions", header: "Actions", render: (d) => <button className="link-button" onClick={() => onNavigate(`/deployments/${d.itemId ?? d.id}`)}>View</button> }
  ];

  function handleNew() {
    if (canEdit) setCreating(true);
    else setPermissionNotice(true);
  }

  return (
    <section>
      <PageHeader
        title="Deployments"
        subtitle="Every release of a service to an environment, with its pipeline and status."
        actions={
          <button className="primary-button" onClick={handleNew}><Plus size={16} /> New Deployment</button>
        }
      />

      {permissionNotice ? <Alert tone="warn">You don't have permission to change deployments.</Alert> : null}

      <div className="toolbar">
        <label className="search-box"><Search size={15} /><input placeholder="Search deployments..." value={table.query} onChange={(event) => { table.setQuery(event.target.value); table.setPage(1); }} /></label>
        <div className="toolbar-actions">
          <select className="select" value={envFilter} onChange={(event) => setEnvFilter(event.target.value)} aria-label="Filter by environment">
            <option value="">All environments</option>
            {ENVIRONMENTS.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {["Healthy", "Degraded", "Failed", "Deploying"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="icon-button" onClick={() => table.setSort(table.sort?.key === "DeployedAt" && table.sort.direction === "desc" ? undefined : { key: "DeployedAt", direction: "desc" })} aria-label="Sort by date">
            <ArrowUpDown size={16} />
          </button>
        </div>
      </div>

      {deployments.error ? (
        <ErrorState message="Something went wrong while loading deployments." onRetry={() => deployments.refetch()} />
      ) : deployments.isLoading ? (
        <div className="table-shell"><div className="skeleton-table">Loading deployments…</div></div>
      ) : table.total === 0 ? (
        <EmptyState
          title="No deployments yet"
          description="Once your first deployment is connected, deployment health and verification results will appear here."
          action={canEdit ? <button className="primary-button" onClick={() => setCreating(true)}><Plus size={16} /> Connect Deployment</button> : undefined}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={table.pageRows} />
          <div className="pagination">
            <span className="pagination-count">{table.total} deployments</span>
            <div className="pagination-controls">
              <span className="pagination-size">
                Rows <select value={table.pageSize} onChange={(event) => { table.setPageSize(Number(event.target.value)); table.setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
              </span>
              <button className="icon-button" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>Prev</button>
              <span>{table.page} / {table.totalPages}</span>
              <button className="icon-button" disabled={table.page >= table.totalPages} onClick={() => table.setPage(table.page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}

      {creating ? <NewDeploymentModal onClose={() => setCreating(false)} /> : null}
    </section>
  );
}