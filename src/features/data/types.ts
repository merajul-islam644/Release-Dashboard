export type EnvStatus = "Healthy" | "Degraded" | "Failed" | "Deploying" | "Unknown";

export type PipelineStageName = "Build" | "Test" | "Security Scan" | "Deploy" | "Verify";

export type PipelineStage = {
  name: PipelineStageName;
  status: "completed" | "running" | "failed" | "pending";
  duration: string;
};

export type DeploymentStatus = "Healthy" | "Degraded" | "Failed" | "Deploying";

export type Deployment = {
  itemId?: string;
  id?: string;
  Version: string;
  Environment: string;
  Branch: string;
  Commit: string;
  DeployedBy: string;
  DeployedAt: string;
  Status: DeploymentStatus;
  Pipeline: string;
  TotalTime: string;
};

export type VerificationType = "Application Load" | "Console Errors" | "Network Requests" | "Navigation" | "Broken Links";

export type Verification = {
  itemId?: string;
  id?: string;
  Type: VerificationType;
  Result: string;
  Pass: string;
  Evidence: string;
  DeploymentId: string;
};

export type IssueSeverity = "High" | "Medium" | "Low";

export type Issue = {
  itemId?: string;
  id?: string;
  Title: string;
  Severity: IssueSeverity;
  Environment: string;
  Status: string;
  DeploymentId: string;
  ReportedAt: string;
};

export type TestRun = {
  itemId?: string;
  id?: string;
  Name: string;
  Passed: number;
  Total: number;
  Environment: string;
  Status: string;
};

export type EnvironmentRecord = {
  itemId?: string;
  id?: string;
  Name: string;
  Status: EnvStatus;
  HealthScore: number;
};

export type HistoryEntry = {
  itemId?: string;
  id?: string;
  RecordType: string;
  RecordId: string;
  Action: string;
  Detail: string;
  ChangedBy: string;
  ChangedAt: string;
};