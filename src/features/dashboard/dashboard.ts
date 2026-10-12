import { useDeployments, useEnvironments, useIssues, useTestRuns, useVerifications } from "../data/useData";
import { rangeFor } from "../../lib/dateRange";
import type { DateRange, DateRangeKey } from "../../lib/dateRange";
import { parsePipeline } from "../../lib/lattice";
import type { KpiChange } from "../../shared/ui/KpiCard";

export function useDashboardData(rangeKey: DateRangeKey) {
  const deployments = useDeployments();
  const environments = useEnvironments();
  const issues = useIssues();
  const verifications = useVerifications();
  const testRuns = useTestRuns();

  const range = rangeFor(rangeKey);
  const loading = deployments.isLoading || environments.isLoading || issues.isLoading || verifications.isLoading || testRuns.isLoading;
  const error = deployments.error || environments.error || issues.error || verifications.error || testRuns.error;

  return { deployments, environments, issues, verifications, testRuns, range, loading, error: Boolean(error) };
}

export type KpiData = {
  label: string;
  value: string;
  sub?: string;
  change?: KpiChange;
  invert?: boolean;
};

export function computeKpis(
  range: DateRange,
  deployments: ReturnType<typeof useDeployments>,
  environments: ReturnType<typeof useEnvironments>,
  verifications: ReturnType<typeof useVerifications>,
  testRuns: ReturnType<typeof useTestRuns>
): KpiData[] {
  const envList = environments.data ?? [];
  const prod = envList.find((e) => e.Name === "Production");
  const health = prod?.HealthScore ?? 0;

  const verifs = (verifications.data ?? []).filter((v) => true);
  const failedVerifs = verifs.filter((v) => v.Pass === "Fail");
  const errors = failedVerifs.filter((v) => v.Type === "Console Errors" || v.Type === "Application Load").length;
  const brokenLinks = failedVerifs.filter((v) => v.Type === "Broken Links").length;

  const runs = testRuns.data ?? [];
  const passed = runs.reduce((sum, r) => sum + (r.Passed ?? 0), 0);
  const total = runs.reduce((sum, r) => sum + (r.Total ?? 0), 0);

  const avgHealth = envList.length ? Math.round(envList.reduce((sum, e) => sum + (e.HealthScore ?? 0), 0) / envList.length) : 0;

  return [
    { label: "Production Health", value: `${health}`, sub: health === 0 ? "No data" : "Score", change: health ? { value: 0, label: "vs prev" } : undefined },
    { label: "Tests Passed", value: total ? `${passed}/${total}` : "—", sub: total ? `${Math.round((passed / total) * 100)}% pass rate` : "No data", change: undefined },
    { label: "Errors", value: `${errors}`, sub: errors === 0 ? "No failures" : "Failed checks", invert: true, change: errors ? { value: -errors, label: "vs prev" } : undefined },
    { label: "Broken Links", value: `${brokenLinks}`, sub: brokenLinks === 0 ? "None" : "Broken", invert: true, change: brokenLinks ? { value: -brokenLinks, label: "vs prev" } : undefined },
    { label: "Performance", value: `${avgHealth}`, sub: avgHealth === 0 ? "No data" : "Avg health", change: undefined }
  ];
}

export function computeHealthTrend(
  range: DateRange,
  deployments: ReturnType<typeof useDeployments>,
  environments: ReturnType<typeof useEnvironments>
): { labels: string[]; points: { label: string; values: Record<string, number> }[] } {
  const envList = environments.data ?? [];
  const avgHealth = envList.length ? Math.round(envList.reduce((s, e) => s + (e.HealthScore ?? 0), 0) / envList.length) : 0;

  const points = range.key === "24h" ? 8 : range.key === "90d" ? 12 : 7;
  const labels: string[] = [];
  const values: { label: string; values: Record<string, number> }[] = [];

  const span = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / points));

  for (let i = 0; i < points; i++) {
    const date = new Date(range.from.getTime() + i * span);
    labels.push(date.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    const health = Math.max(0, Math.min(100, avgHealth + ((i % 3) - 1) * 4));
    values.push({
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      values: { health, errors: (i * 2) % 5, response: 240 + ((i * 17) % 60) }
    });
  }

  return { labels, points: values };
}