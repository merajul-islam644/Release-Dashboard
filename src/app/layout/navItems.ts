import { Bug, FileText, FlaskConical, Gauge, LayoutDashboard, Rocket, Settings } from "lucide-react";

export const navItems = [
  { href: "/", labelKey: "nav.home", icon: LayoutDashboard },
  { href: "/deployments", labelKey: "nav.deployments", icon: Rocket },
  { href: "/verification", labelKey: "nav.verification", icon: Gauge },
  { href: "/issues", labelKey: "nav.issues", icon: Bug },
  { href: "/test-runs", labelKey: "nav.testRuns", icon: FlaskConical },
  { href: "/reports", labelKey: "nav.reports", icon: FileText },
  { href: "/settings", labelKey: "nav.settings", icon: Settings }
] as const;