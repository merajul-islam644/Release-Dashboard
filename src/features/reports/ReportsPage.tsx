import { useState } from "react";
import { rangeFor } from "../../lib/dateRange";
import type { DateRangeKey } from "../../lib/dateRange";
import { useDeployments, useEnvironments, useIssues, useTestRuns } from "../data/useData";
import { DateRangePicker } from "../../shared/ui/DateRangePicker";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusPill } from "../../shared/ui/StatusPill";

export function ReportsPage() {
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("30d");
  const range = rangeFor(rangeKey);
  const deployments = useDeployments();
  const environments = useEnvironments();
  const issues = useIssues();
  const testRuns = useTestRuns();

  const depList = deployments.data?.items ?? [];
  const envList = environments.data ?? [];
  const issueList = issues.data ?? [];
  const runList = testRuns.data ?? [];

  const envSummary = envList.map((env) => ({
    name: env.Name,
    deployments: depList.filter((d) => d.Environment === env.Name).length,
    issues: issueList.filter((i) => i.Environment === env.Name).length,
    health: env.HealthScore ?? 0,
    status: env.Status
  }));

  const totalDeployments = depList.length;
  const totalIssues = issueList.length;
  const openIssues = issueList.filter((i) => i.Status !== "Resolved").length;
  const avgHealth = envList.length ? Math.round(envList.reduce((s, e) => s + (e.HealthScore ?? 0), 0) / envList.length) : 0;
  const passed = runList.reduce((s, r) => s + (r.Passed ?? 0), 0);
  const totalTests = runList.reduce((s, r) => s + (r.Total ?? 0), 0);

  const error = deployments.error || environments.error || issues.error || testRuns.error;
  const loading = deployments.isLoading || environments.isLoading || issues.isLoading || testRuns.isLoading;

  return (
    <section>
      <PageHeader title="Reports" subtitle="Grouped totals and summaries for the selected range." actions={<DateRangePicker range={range} onChange={(r) => setRangeKey(r.key)} />} />

      {error ? (
        <ErrorState message="Something went wrong while loading reports." onRetry={() => deployments.refetch()} />
      ) : loading ? (
        <div className="panel"><span className="skeleton skeleton-line-lg" /></div>
      ) : (
        <div className="dashboard">
          <div className="kpi-row">
            <div className="kpi-card"><span className="kpi-label">Total Deployments</span><span className="kpi-value">{totalDeployments}</span></div>
            <div className="kpi-card"><span className="kpi-label">Total Issues</span><span className="kpi-value">{totalIssues}</span><span className="kpi-delta-label">{openIssues} open</span></div>
            <div className="kpi-card"><span className="kpi-label">Avg Health</span><span className="kpi-value">{avgHealth}</span></div>
            <div className="kpi-card"><span className="kpi-label">Tests Passed</span><span className="kpi-value">{totalTests ? `${passed}/${totalTests}` : "—"}</span></div>
          </div>

          <div className="panel">
            <div className="panel-title"><span>Health by Environment</span></div>
            {envSummary.length === 0 ? (
              <p className="text-muted">No environments configured.</p>
            ) : (
              <div className="env-list">
                {envSummary.map((env) => (
                  <div key={env.name} className="env-row report-env-row">
                    <span className="env-row-name">{env.name}</span>
                    <span className="muted">{env.deployments} deployments · {env.issues} issues</span>
                    <span className="env-row-score">{env.health}</span>
                    <StatusPill status={env.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-title"><span>Issue Summary by Severity</span></div>
            <div className="report-grid">
              {["High", "Medium", "Low"].map((severity) => (
                <div key={severity} className="report-severity">
                  <span className={`severity severity-${severity.toLowerCase()}`}>{severity}</span>
                  <strong>{issueList.filter((i) => i.Severity === severity).length}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}