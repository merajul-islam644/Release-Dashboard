import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deploymentApi, environmentApi, historyApi, issueApi, testRunApi, verificationApi } from "./dataApi";
import type { Deployment, EnvironmentRecord, HistoryEntry, Issue } from "./types";

export function useDeployments() {
  return useQuery({ queryKey: ["deployments"], queryFn: () => deploymentApi.list() });
}

export function useDeployment(itemId?: string) {
  return useQuery({
    queryKey: ["deployments", itemId],
    queryFn: () => deploymentApi.get(itemId as string),
    enabled: Boolean(itemId)
  });
}

export function useVerifications(deploymentId?: string) {
  return useQuery({ queryKey: ["verifications", deploymentId ?? "all"], queryFn: () => verificationApi.list(deploymentId) });
}

export function useIssues() {
  return useQuery({ queryKey: ["issues"], queryFn: () => issueApi.list() });
}

export function useIssue(itemId?: string) {
  return useQuery({ queryKey: ["issues", itemId], queryFn: () => issueApi.get(itemId as string), enabled: Boolean(itemId) });
}

export function useTestRuns() {
  return useQuery({ queryKey: ["testRuns"], queryFn: () => testRunApi.list() });
}

export function useEnvironments() {
  return useQuery({ queryKey: ["environments"], queryFn: () => environmentApi.list() });
}

export function useHistory(recordId?: string) {
  return useQuery({ queryKey: ["history", recordId ?? "all"], queryFn: () => historyApi.list(recordId) });
}

export function useCreateDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deploymentApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deployments"] })
  });
}

export function useUpdateDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<Deployment> }) => deploymentApi.update(itemId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deployments"] })
  });
}

export function useCreateVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verificationApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["verifications"] })
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] })
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<Issue> }) => issueApi.update(itemId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] })
  });
}

export function useRecordHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: historyApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] })
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: Partial<EnvironmentRecord> }) => environmentApi.update(itemId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["environments"] })
  });
}

export type { Deployment, HistoryEntry, Issue };