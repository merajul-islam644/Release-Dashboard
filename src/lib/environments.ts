export type EnvironmentName = "Production" | "Staging" | "Development" | "UAT" | "Custom";

export const ENVIRONMENTS: EnvironmentName[] = ["Production", "Staging", "Development", "UAT", "Custom"];

export const ENVIRONMENT_DOT_CLASS: Record<EnvironmentName, string> = {
  Production: "env-dot env-dot-production",
  Staging: "env-dot env-dot-staging",
  Development: "env-dot env-dot-development",
  UAT: "env-dot env-dot-uat",
  Custom: "env-dot env-dot-custom"
};