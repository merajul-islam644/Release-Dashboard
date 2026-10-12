export type DateRangeKey = "24h" | "7d" | "30d" | "90d" | "custom";

export type DateRange = { key: DateRangeKey; from: Date; to: Date };

export const DATE_RANGE_PRESETS: { key: DateRangeKey; label: string }[] = [
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "custom", label: "Custom range" }
];

function daysAgo(n: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - n);
  return date;
}

export function rangeFor(key: DateRangeKey, customFrom?: Date, customTo?: Date): DateRange {
  if (key === "custom") {
    return { key, from: customFrom ?? daysAgo(7), to: customTo ?? new Date() };
  }
  if (key === "24h") {
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return { key, from, to: new Date() };
  }
  const n = Number(key.replace("d", ""));
  return { key, from: daysAgo(n), to: new Date() };
}

export function rangeLabel(range: DateRange): string {
  const preset = DATE_RANGE_PRESETS.find((p) => p.key === range.key);
  if (preset && range.key !== "custom") return preset.label;
  return `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`;
}

export function inRange(value?: string | number, range?: DateRange): boolean {
  if (!range || !value) return true;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return true;
  return time >= range.from.getTime() && time <= range.to.getTime();
}