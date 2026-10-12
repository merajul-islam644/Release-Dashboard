import type { Deployment, PipelineStage } from "../features/data/types";

export function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDateFull(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function parsePipeline(pipeline?: string): PipelineStage[] {
  if (!pipeline) return [];
  try {
    const parsed = JSON.parse(pipeline);
    if (Array.isArray(parsed)) return parsed as PipelineStage[];
    return [];
  } catch {
    return [];
  }
}

const STAGE_ORDER: PipelineStage["name"][] = ["Build", "Test", "Security Scan", "Deploy", "Verify"];

export function defaultPipeline(): PipelineStage[] {
  return STAGE_ORDER.map((name) => ({ name, status: "pending", duration: "" }));
}

export function pipelineTotalTime(stages: PipelineStage[]): string {
  const finished = stages.filter((s) => s.duration);
  if (finished.length === 0) return "—";
  return finished.map((s) => s.duration).join(" · ");
}

export function shortCommit(commit?: string): string {
  if (!commit) return "—";
  return commit.length > 8 ? commit.slice(0, 8) : commit;
}

export function pct(passed?: number, total?: number): number {
  if (!total) return 0;
  return Math.round(((passed ?? 0) / total) * 100);
}