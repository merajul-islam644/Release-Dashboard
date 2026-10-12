import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { AppShell } from "../layout/AppShell";
import { RedirectIfAuthenticated, RequireAuth } from "./guards";
import { CallbackPage } from "../../features/auth/CallbackPage";
import { ErrorPage } from "../../features/auth/ErrorPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { NotFoundPage } from "../../features/auth/NotFoundPage";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { DeploymentDetailPage } from "../../features/deployments/DeploymentDetailPage";
import { DeploymentsPage } from "../../features/deployments/DeploymentsPage";
import { IssueDetailPage } from "../../features/issues/IssueDetailPage";
import { IssuesPage } from "../../features/issues/IssuesPage";
import { ProfilePage } from "../../features/profile/ProfilePage";
import { ReportsPage } from "../../features/reports/ReportsPage";
import { SettingsPage } from "../../features/settings/SettingsPage";
import { TestRunsPage } from "../../features/test-runs/TestRunsPage";
import { VerificationPage } from "../../features/verification/VerificationPage";

type RouteDef = { pattern: string; component: ComponentType<{ path: string; id?: string; onNavigate: (path: string) => void }> };

const routes: RouteDef[] = [
  { pattern: "/", component: DashboardPage },
  { pattern: "/deployments", component: DeploymentsPage },
  { pattern: "/deployments/:id", component: DeploymentDetailPage },
  { pattern: "/verification", component: VerificationPage },
  { pattern: "/issues", component: IssuesPage },
  { pattern: "/issues/:id", component: IssueDetailPage },
  { pattern: "/test-runs", component: TestRunsPage },
  { pattern: "/reports", component: ReportsPage },
  { pattern: "/settings", component: SettingsPage },
  { pattern: "/profile", component: ProfilePage }
];

function matchRoute(path: string): { def: RouteDef; id?: string } | undefined {
  for (const def of routes) {
    if (!def.pattern.includes(":")) {
      if (def.pattern === path) return { def };
      continue;
    }
    const idx = def.pattern.indexOf(":");
    const prefix = def.pattern.slice(0, idx);
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length);
      if (!rest) continue;
      const id = rest.split("/")[0];
      if (id) return { def, id };
    }
  }
  return undefined;
}

export function AppRouter() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    const [nextPathname = "/"] = nextPath.split("?");
    setPath(nextPathname);
    setSearch(window.location.search);
  }

  if (path === "/login/callback") {
    return <CallbackPage onNavigate={navigate} />;
  }

  if (path === "/login") {
    const returnTo = new URLSearchParams(search).get("returnTo") || undefined;
    return (
      <RedirectIfAuthenticated onNavigate={navigate}>
        <LoginPage returnTo={returnTo} />
      </RedirectIfAuthenticated>
    );
  }

  const match = matchRoute(path);
  if (!match) {
    return <NotFoundPage onNavigate={navigate} />;
  }

  const Page = match.def.component;
  return (
    <RequireAuth currentPath={path} onNavigate={navigate}>
      <AppShell activePath={path} onNavigate={navigate}>
        <Page path={path} id={match.id} onNavigate={navigate} />
      </AppShell>
    </RequireAuth>
  );
}