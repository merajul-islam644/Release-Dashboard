import { useMemo, useState } from "react";

export type SortState = { key: string; direction: "asc" | "desc" } | undefined;

export function useTableState<T>(rows: T[], searchFn: (row: T, query: string) => boolean, searchableKeys: string[]) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortState>(undefined);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => searchableKeys.some((key) => String((row as Record<string, unknown>)[key] ?? "").toLowerCase().includes(q)));
  }, [rows, query, searchableKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, direction } = sort;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[key] ?? "";
      const bv = (b as Record<string, unknown>)[key] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { pageRows, total, page: safePage, totalPages, pageSize, query, setQuery, setPage, setPageSize, sort, setSort };
}