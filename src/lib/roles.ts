import { useCurrentUser } from "../features/profile/useCurrentUser";

export const ROLES = {
  ADMIN: "admin",
  RELEASE_MANAGER: "release-manager",
  ENGINEER: "engineer",
  QA_ENGINEER: "qa-engineer",
  VIEWER: "viewer"
} as const;

export type RoleSlug = (typeof ROLES)[keyof typeof ROLES];

// Who may change each record type. Engineered / QA can change verification,
// issues and test runs; Admin and Release Manager can change deployments.
const deploymentRoles: RoleSlug[] = [ROLES.ADMIN, ROLES.RELEASE_MANAGER];
const changeRoles: RoleSlug[] = [ROLES.ADMIN, ROLES.RELEASE_MANAGER, ROLES.ENGINEER, ROLES.QA_ENGINEER];

export function useRole(): RoleSlug | undefined {
  const me = useCurrentUser();
  const roles = me.data?.data?.roles;
  const slug = roles?.find((entry) => (Object.values(ROLES) as string[]).includes(entry)) as RoleSlug | undefined;
  return slug;
}

export function useCanEditDeployments(): boolean {
  const role = useRole();
  return role !== undefined && deploymentRoles.includes(role);
}

export function useCanChangeRecords(): boolean {
  const role = useRole();
  return role !== undefined && changeRoles.includes(role);
}

export const ROLE_LABEL: Record<RoleSlug, string> = {
  admin: "Admin",
  "release-manager": "Release Manager",
  engineer: "Engineer",
  "qa-engineer": "QA Engineer",
  viewer: "Viewer"
};