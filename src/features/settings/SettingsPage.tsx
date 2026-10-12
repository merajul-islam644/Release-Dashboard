import { Plus, UserCog } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { blocksClient } from "../../lib/blocks/client";
import { useRole, ROLES } from "../../lib/roles";
import { userDisplayName, userInitials } from "../profile/useCurrentUser";
import type { BlocksUser } from "@seliseblocks/client";
import { Alert } from "../../shared/ui/Alert";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Modal } from "../../shared/ui/Modal";

type UserRecord = BlocksUser & { itemId?: string; id?: string };

export function SettingsPage() {
  const role = useRole();
  const isAdmin = role === ROLES.ADMIN;
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState("");

  const users = useQuery({
    queryKey: ["iam", "users"],
    queryFn: () => blocksClient.iam.users.list({ pageNo: 1, pageSize: 100 })
  });

  const list = (users.data?.data ?? []) as UserRecord[];

  const columns: Column<UserRecord>[] = [
    { key: "user", header: "User", render: (u) => <span className="user-cell"><span className="avatar avatar-sm">{userInitials(u)}</span><strong>{userDisplayName(u)}</strong></span> },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "roles", header: "Roles", render: (u) => <span className="roles-cell">{(u.roles ?? []).join(", ")}</span> },
    { key: "active", header: "Status", render: (u) => <span className={u.isActive === false ? "status-pill status-failed" : "status-pill status-good"}>{u.isActive === false ? "Inactive" : "Active"}</span> },
    { key: "actions", header: "Actions", render: (u) => <ManageActions user={u} isAdmin={isAdmin} onNotice={setNotice} /> }
  ];

  return (
    <section>
      <PageHeader
        title="Settings"
        subtitle="Manage the people who can use Lattice and the roles they hold."
        actions={isAdmin ? <button className="primary-button" onClick={() => setInviting(true)}><Plus size={16} /> Invite User</button> : undefined}
      />

      {notice ? <Alert tone="info">{notice}</Alert> : null}
      {!isAdmin ? <Alert tone="warn">You have read-only access to settings. Only Admins can invite, edit, or change roles.</Alert> : null}

      {users.error ? (
        <ErrorState message="Something went wrong while loading users." onRetry={() => users.refetch()} />
      ) : users.isLoading ? (
        <div className="table-shell"><div className="skeleton-table">Loading users…</div></div>
      ) : list.length === 0 ? (
        <EmptyState title="No users yet" description="Invite your team to start using Lattice." action={isAdmin ? <button className="primary-button" onClick={() => setInviting(true)}><Plus size={16} /> Invite User</button> : undefined} />
      ) : (
        <DataTable columns={columns} rows={list} />
      )}

      {inviting ? <InviteUserModal onClose={() => { setInviting(false); users.refetch(); }} /> : null}
    </section>
  );
}

function ManageActions({ user, isAdmin, onNotice }: { user: UserRecord; isAdmin: boolean; onNotice: (message: string) => void }) {
  const userId = user.itemId ?? user.id ?? "";
  const [busy, setBusy] = useState(false);
  const active = user.isActive !== false;

  if (!isAdmin) return <span className="muted">—</span>;

  async function changeRole(next: string) {
    setBusy(true);
    try {
      await blocksClient.iam.users.updateAccess({ userId, roles: [next] });
      onNotice(`Updated ${user.email}'s role.`);
    } catch {
      onNotice("Could not update the user's role.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    try {
      if (active) {
        await blocksClient.iam.users.deactivate({ userId });
        onNotice(`Deactivated ${user.email}.`);
      } else {
        await blocksClient.iam.users.activate({ userId });
        onNotice(`Activated ${user.email}.`);
      }
    } catch {
      onNotice("Could not update this user's access.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="row-actions">
      <select className="select" value={(user.roles ?? [])[0] ?? ""} disabled={busy} onChange={(event) => changeRole(event.target.value)} aria-label="Change role">
        <option value="" disabled>Select role</option>
        <option value={ROLES.ADMIN}>Admin</option>
        <option value={ROLES.RELEASE_MANAGER}>Release Manager</option>
        <option value={ROLES.ENGINEER}>Engineer</option>
        <option value={ROLES.QA_ENGINEER}>QA Engineer</option>
        <option value={ROLES.VIEWER}>Viewer</option>
      </select>
      <button className="link-button" onClick={toggleActive} disabled={busy}>{active ? "Deactivate" : "Activate"}</button>
    </span>
  );
}

function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<string>(ROLES.VIEWER);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!email) {
      setError("Email is required.");
      return;
    }
    try {
      await blocksClient.iam.users.create({ email, firstName, lastName, roles: [role] });
      onClose();
    } catch {
      setError("Could not invite this user. Check the email and try again.");
    }
  }

  return (
    <Modal title="Invite User" onClose={onClose}>
      <div className="form-grid">
        <label className="form-field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" /></label>
        <label className="form-field"><span>Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.RELEASE_MANAGER}>Release Manager</option>
            <option value={ROLES.ENGINEER}>Engineer</option>
            <option value={ROLES.QA_ENGINEER}>QA Engineer</option>
            <option value={ROLES.VIEWER}>Viewer</option>
          </select>
        </label>
        <label className="form-field"><span>First name</span><input value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
        <label className="form-field"><span>Last name</span><input value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
      </div>
      <div className="settings-invite-icon"><UserCog size={40} /></div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="icon-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={submit}>Send Invite</button>
      </div>
    </Modal>
  );
}