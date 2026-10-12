import { Search } from "lucide-react";
import { useState } from "react";
import { useIssues } from "../data/useData";
import type { Issue } from "../data/types";
import { formatDate } from "../../lib/lattice";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusPill } from "../../shared/ui/StatusPill";

export function IssuesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const issues = useIssues();
  const [severityFilter, setSeverityFilter] = useState("");
  const [envFilter, setEnvFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");

  const rows = (issues.data ?? []).filter((issue) =>
    (!severityFilter || issue.Severity === severityFilter) &&
    (!envFilter || issue.Environment === envFilter) &&
    (!statusFilter || issue.Status === statusFilter) &&
    (!query || [issue.Title, issue.Severity, issue.Environment].some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase())))
  );

  const environments = [...new Set((issues.data ?? []).map((issue) => issue.Environment).filter(Boolean))];

  const columns: Column<Issue>[] = [
    { key: "title", header: "Title", render: (issue) => <button className="link-button" onClick={() => onNavigate(`/issues/${issue.itemId ?? issue.id}`)}>{issue.Title}</button> },
    { key: "severity", header: "Severity", render: (issue) => <span className={`severity severity-${issue.Severity?.toLowerCase()}`}>{issue.Severity}</span> },
    { key: "environment", header: "Environment", render: (issue) => issue.Environment },
    { key: "status", header: "Status", render: (issue) => <StatusPill status={issue.Status} /> },
    { key: "reportedAt", header: "Reported", render: (issue) => formatDate(issue.ReportedAt) }
  ];

  return (
    <section>
      <PageHeader title="Issues" subtitle="Reported issues across deployments, filterable by severity, environment, and status." />
      <div className="toolbar">
        <label className="search-box"><Search size={15} /><input placeholder="Search issues..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="toolbar-actions">
          <select className="select" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} aria-label="Filter by severity">
            <option value="">All severities</option>
            <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
          </select>
          <select className="select" value={envFilter} onChange={(event) => setEnvFilter(event.target.value)} aria-label="Filter by environment">
            <option value="">All environments</option>
            {environments.map((env) => <option key={env} value={env}>{env}</option>)}
          </select>
          <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {issues.error ? (
        <ErrorState message="Something went wrong while loading issues." onRetry={() => issues.refetch()} />
      ) : issues.isLoading ? (
        <div className="table-shell"><div className="skeleton-table">Loading issues…</div></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No issues yet" description="Reported issues from deployments will appear here." />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}
    </section>
  );
}