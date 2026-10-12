import { useTestRuns } from "../data/useData";
import { pct } from "../../lib/lattice";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusPill } from "../../shared/ui/StatusPill";
import type { TestRun } from "../data/types";

export function TestRunsPage() {
  const testRuns = useTestRuns();

  const columns: Column<TestRun>[] = [
    { key: "name", header: "Name", render: (t) => t.Name },
    { key: "passed", header: "Passed / Total", render: (t) => `${t.Passed} / ${t.Total}` },
    { key: "rate", header: "Pass Rate", render: (t) => `${pct(t.Passed, t.Total)}%` },
    { key: "environment", header: "Environment", render: (t) => t.Environment },
    { key: "status", header: "Status", render: (t) => <StatusPill status={t.Status} /> }
  ];

  return (
    <section>
      <PageHeader title="Test Runs" subtitle="Automated test runs with passed/total counts and per-environment status." />
      {testRuns.error ? (
        <ErrorState message="Something went wrong while loading test runs." onRetry={() => testRuns.refetch()} />
      ) : testRuns.isLoading ? (
        <div className="table-shell"><div className="skeleton-table">Loading test runs…</div></div>
      ) : (testRuns.data ?? []).length === 0 ? (
        <EmptyState title="No test runs yet" description="Test run results will appear here once they're recorded." />
      ) : (
        <DataTable columns={columns} rows={testRuns.data ?? []} />
      )}
    </section>
  );
}