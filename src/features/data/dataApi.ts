import { blocksClient } from "../../lib/blocks/client";
import type { Deployment, EnvironmentRecord, HistoryEntry, Issue, TestRun, Verification } from "./types";

function normalizeList<T>(response: unknown): { items: T[]; totalCount: number } {
  const record = response as {
    data?: { items?: T[]; totalCount?: number };
    items?: T[];
    totalCount?: number;
  };
  const gateway = record.data;
  const items = gateway?.items ?? record.items ?? [];
  return { items, totalCount: gateway?.totalCount ?? record.totalCount ?? items.length };
}

function recordId(record: Record<string, unknown>): string {
  const id = record.itemId ?? record.id;
  if (!id) throw new Error("Record item id is missing.");
  return String(id);
}

const deploymentFields = ["Version", "Environment", "Branch", "Commit", "DeployedBy", "DeployedAt", "Status", "Pipeline", "TotalTime"];
const deployments = blocksClient.data.collection<Deployment>("Deployment", { fields: deploymentFields });

const verificationFields = ["Type", "Result", "Pass", "Evidence", "DeploymentId"];
const verifications = blocksClient.data.collection<Verification>("Verification", { fields: verificationFields });

const issueFields = ["Title", "Severity", "Environment", "Status", "DeploymentId", "ReportedAt"];
const issues = blocksClient.data.collection<Issue>("Issue", { fields: issueFields });

const testRunFields = ["Name", "Passed", "Total", "Environment", "Status"];
const testRuns = blocksClient.data.collection<TestRun>("TestRun", { fields: testRunFields });

const environmentFields = ["Name", "Status", "HealthScore"];
const environments = blocksClient.data.collection<EnvironmentRecord>("Environment", { fields: environmentFields });

const historyFields = ["RecordType", "RecordId", "Action", "Detail", "ChangedBy", "ChangedAt"];
const history = blocksClient.data.collection<HistoryEntry>("History", { fields: historyFields });

export const deploymentApi = {
  list: async (): Promise<{ items: Deployment[]; totalCount: number }> => normalizeList(await deployments.list({ pageSize: 500, sort: { DeployedAt: -1 } })),
  get: async (itemId: string): Promise<Deployment> => (await deployments.get(itemId)) as Deployment,
  create: (input: Partial<Deployment>) => deployments.create(input),
  update: (itemId: string, input: Partial<Deployment>) => deployments.update(itemId, input)
};

export const verificationApi = {
  list: async (deploymentId?: string): Promise<Verification[]> => {
    const { items } = normalizeList<Verification>(await verifications.list({ pageSize: 500, ...(deploymentId ? { filter: { DeploymentId: deploymentId } } : {}) }));
    return items;
  },
  create: (input: Partial<Verification>) => verifications.create(input)
};

export const issueApi = {
  list: async (): Promise<Issue[]> => {
    const { items } = normalizeList<Issue>(await issues.list({ pageSize: 500, sort: { ReportedAt: -1 } }));
    return items;
  },
  get: async (itemId: string): Promise<Issue> => (await issues.get(itemId)) as Issue,
  create: (input: Partial<Issue>) => issues.create(input),
  update: (itemId: string, input: Partial<Issue>) => issues.update(itemId, input)
};

export const testRunApi = {
  list: async (): Promise<TestRun[]> => {
    const { items } = normalizeList<TestRun>(await testRuns.list({ pageSize: 500 }));
    return items;
  }
};

export const environmentApi = {
  list: async (): Promise<EnvironmentRecord[]> => {
    const { items } = normalizeList<EnvironmentRecord>(await environments.list({ pageSize: 500 }));
    return items;
  },
  update: (itemId: string, input: Partial<EnvironmentRecord>) => environments.update(itemId, input)
};

export const historyApi = {
  list: async (recordId?: string): Promise<HistoryEntry[]> => {
    const { items } = normalizeList<HistoryEntry>(await history.list({ pageSize: 500, ...(recordId ? { filter: { RecordId: recordId } } : {}) }));
    return items;
  },
  create: (input: Partial<HistoryEntry>) => history.create(input)
};

export function recordItemId(record: Record<string, unknown>): string {
  return recordId(record);
}