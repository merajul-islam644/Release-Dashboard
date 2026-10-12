import { Bell, Moon, PanelLeft, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { ENVIRONMENTS, ENVIRONMENT_DOT_CLASS } from "../../lib/environments";
import { useTheme } from "../providers/ThemeProvider";
import { LatticeLogo } from "../../shared/ui/LatticeLogo";
import { NotificationsMenu } from "./NotificationsMenu";
import { navItems } from "./navItems";
import { UserMenu } from "./UserMenu";

const COLLAPSED_KEY = "blocks-app:sidebar-collapsed";
const MOBILE_QUERY = "(max-width: 880px)";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function isActive(activePath: string, href: string): boolean {
  if (activePath === href) return true;
  if (href !== "/" && activePath.startsWith(href)) return true;
  return false;
}

export function AppShell({ activePath, children, onNavigate }: { activePath: string; children: ReactNode; onNavigate: (path: string) => void }) {
  const isMobile = useIsMobile();
  const [collapsedPref, setCollapsedPref] = useState(() => localStorage.getItem(COLLAPSED_KEY) === "true");
  const { theme, toggleTheme } = useTheme();
  const { t } = useT();
  const collapsed = collapsedPref || isMobile;

  return (
    <div className="shell">
      <aside className={collapsed ? "collapsed" : ""}>
        <div className="sidebar-header">
          {collapsed ? null : (
            <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }}>
              <span className="brand-mark"><LatticeLogo size={16} /></span>
              <span>Lattice</span>
            </a>
          )}
          <button className="icon-button sidebar-collapse-toggle" onClick={() => setCollapsedPref((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <PanelLeft size={16} />
          </button>
        </div>
        <nav>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-tooltip={t(item.labelKey)}
              className={`nav-link${isActive(activePath, item.href) ? " active" : ""}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.href);
              }}
            >
              <item.icon size={18} />
              {collapsed ? null : <span>{t(item.labelKey)}</span>}
            </a>
          ))}
          <div className="nav-section-label">{collapsed ? null : "Environments"}</div>
          {ENVIRONMENTS.map((environment) => (
            <span key={environment} className="nav-link">
              <span className={ENVIRONMENT_DOT_CLASS[environment]} />
              {collapsed ? null : <span>{environment}</span>}
            </span>
          ))}
        </nav>
      </aside>
      <div className="content">
        <header className="topbar">
          <label className="topbar-search">
            <Search size={15} />
            <input type="search" placeholder="Search deployments, services, or commits..." aria-label="Search" />
            <span className="search-kbd">⌘K</span>
          </label>
          <div className="topbar-spacer" />
          <button className="icon-button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NotificationsMenu />
          <UserMenu onNavigate={onNavigate} />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}