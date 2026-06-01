import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { SortConfig } from "@/hooks/use-table-sort";

interface SortableTableHeadProps<K extends string> {
  sortKey: K;
  sortConfig: SortConfig<K>;
  onToggle: (key: K) => void;
  children: React.ReactNode;
  className?: string;
}

export function SortableTableHead<K extends string>({
  sortKey,
  sortConfig,
  onToggle,
  children,
  className,
}: SortableTableHeadProps<K>) {
  const isActive = sortConfig.key === sortKey;
  const Icon = isActive
    ? sortConfig.direction === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onToggle(sortKey)}
      >
        {children}
        <Icon className={`h-3.5 w-3.5 ${isActive ? "text-foreground" : "text-muted-foreground/50"}`} />
      </button>
    </TableHead>
  );
}
