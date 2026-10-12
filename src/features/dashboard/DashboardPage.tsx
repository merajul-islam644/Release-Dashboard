import { Plus } from "lucide-react";
import { useState } from "react";
import { useCanEditDeployments } from "../../lib/roles";
import { DateRangePicker } from "../../shared/ui/DateRangePicker";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { HealthChart } from "../../shared/ui/HealthChart";
import type { SeriesConfig } from "../../shared/ui/HealthChart";
import { NewDeploymentModal } from "../deployments/NewDeploymentModal";
import { computeHealthTrend, computeKpis, useDashboardData } from "./dashboard";
import type { DateRangeKey } from "../../lib/dateRange";
import { KpiRow } from "./KpiRow";
import { DeploymentPipelineCard, LatestDeploymentCard } from "./LatestDeploymentCard";
import { EnvironmentStatusCard } from "./EnvironmentStatusCard";
import { RecentDeploymentsCard, RecentIssuesCard } from "./RecentListsCard";

const HEALTH_SERIES: SeriesConfig[] = [
  { key: "health", label: "Health", color: "hsl(var(--primary))" },
  { key: "errors", label: "Errors", color: "hsl(var(--destructive))" },
  { key: "response", label: "Response", color: "hsl(var(--env-staging))" }
];

function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="kpi-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="kpi-card skeleton-block"><span className="skeleton skeleton-line-lg" /><span className="skeleton skeleton-line-lg" /></div>
        ))}
      </div>
      <div className="grid-2">
        <div className="panel"><span className="skeleton skeleton-line-lg" /><span className="skeleton" /></div>
        <div className="panel"><span className="skeleton skeleton-line-lg" /></div>
      </div>
      <div className="grid-2">
        <div className="panel"><span className="skeleton skeleton-line-lg" /></div>
        <div className="panel"><span className="skeleton skeleton-line-lg" /></div>
      </div>
    </div>
  );
}

export function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("7d");
  const [creating, setCreating] = useState(false);
  const canEditDeployments = useCanEditDeployments();

  const { deployments, environments, issues, verifications, testRuns, range, loading, error } = useDashboardData(rangeKey);

  const kpis = computeKpis(range, deployments, environments, verifications, testRuns);
  const trend = computeHealthTrend(range, deployments, environments);
  const latest = deployments.data?.items?.[0];
  const latestEnvironments = environments.data ?? [];

  return (
    <section>
      <PageHeader
        title="Release health at a glance"
        subtitle="See what was deployed, whether it passed verification, and how production is doing."
        actions={
          <>
            <DateRangePicker range={range} onChange={(r) => setRangeKey(r.key)} />
            {canEditDeployments ? <button className="primary-button" onClick={() => setCreating(true)}><Plus size={16} /> New Deployment</button> : null}
          </>
        }
      />

      {error ? (
        <ErrorState message="Something went wrong while loading the dashboard." onRetry={() => deployments.refetch()} />
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="dashboard">
          <KpiRow kpis={kpis} />

          <div className="grid-2">
            <DeploymentPipelineCard deployment={latest} onOpen={() => onNavigate(latest?.itemId ? `/deployments/${latest.itemId}` : "/deployments")} />
            <LatestDeploymentCard deployment={latest} onViewAll={() => onNavigate("/deployments")} onOpen={() => onNavigate(latest?.itemId ? `/deployments/${latest.itemId}` : "/deployments")} />
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-title"><span>Application Health Trend</span></div>
              <div className="chart-legend">
                {HEALTH_SERIES.map((s) => (
                  <span key={s.key} className="legend-item"><span className="legend-dot" style={{ background: s.color }} />{s.label}</span>
                ))}
              </div>
              <HealthChart points={trend.points} series={HEALTH_SERIES} />
            </div>
            <EnvironmentStatusCard environments={latestEnvironments} onOpenDeployment={(env) => onNavigate(`/deployments?environment=${env}`)} />
          </div>

          <div className="grid-2">
            <RecentDeploymentsCard deployments={deployments.data?.items ?? []} onViewAll={() => onNavigate("/deployments")} onOpen={(id) => onNavigate(`/deployments/${id}`)} />
            <RecentIssuesCard issues={issues.data ?? []} onOpen={(id) => onNavigate(`/issues/${id}`)} />
          </div>
        </div>
      )}

      {creating ? <NewDeploymentModal onClose={() => { setCreating(false); }} /> : null}
    </section>
  );
}