import { Mail, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Skeleton } from "../../shared/ui/Skeleton";
import { useCurrentUser, userDisplayName, userInitials } from "./useCurrentUser";

export function ProfilePage() {
  const me = useCurrentUser();
  const profile = me.data?.data;
  const name = userDisplayName(profile);

  return (
    <section>
      <PageHeader title="Profile" subtitle="Your account details." />

      {me.isLoading ? (
        <div className="profile-card">
          <Skeleton className="skeleton-avatar-lg" />
          <div className="profile-heading">
            <Skeleton className="skeleton-line-lg" />
            <Skeleton className="skeleton-line" />
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <span className="avatar avatar-lg">{userInitials(profile)}</span>
          <div className="profile-heading">
            <h3>{name || (me.isError ? "Account unavailable" : "Unknown user")}</h3>
            {profile?.email ? <span className="muted"><Mail size={14} /> {profile.email}</span> : null}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title"><ShieldCheck size={16} /><span>Roles</span></div>
        {me.isLoading ? (
          <Skeleton className="skeleton-line" />
        ) : (profile?.roles?.length ?? 0) > 0 ? (
          <div className="chips">
            {profile!.roles!.map((role) => <span key={role} className="chip">{role}</span>)}
          </div>
        ) : (
          <p className="text-muted">No roles assigned.</p>
        )}
      </div>
    </section>
  );
}