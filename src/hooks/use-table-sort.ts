import { useState, useCallback } from "react";

export interface SortConfig<K extends string> {
  key: K | null;
  direction: "asc" | "desc" | null;
}

export function useTableSort<K extends string>(defaultKey?: K | null) {
  const [sortConfig, setSortConfig] = useState<SortConfig<K>>({
    key: defaultKey ?? null,
    direction: null,
  });

  const toggleSort = useCallback((key: K) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }, []);

  const sortData = useCallback(
    <T>(data: T[], accessor?: (item: T, key: K) => string | number | null | undefined): T[] => {
      if (!sortConfig.key || !sortConfig.direction) return data;
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      const k = sortConfig.key;
      return [...data].sort((a, b) => {
        const valA = accessor ? accessor(a, k) : (a as Record<string, unknown>)[k];
        const valB = accessor ? accessor(b, k) : (b as Record<string, unknown>)[k];
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB, "id") * dir;
        }
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    },
    [sortConfig],
  );

  return { sortConfig, toggleSort, sortData };
}
