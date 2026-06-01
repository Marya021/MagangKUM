import { useState, forwardRef } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { useActivityLogs, type ActivityLogRow } from "./hooks";
import {
  ACTION_BADGE_CLASS,
  ACTION_LABELS,
  ACTION_LABELS_EXTRA,
  ENTITY_LABELS,
  PAGE_SIZE,
  ROLE_LABEL,
} from "./constants";
import { cn } from "@/lib/utils";

const ActionBadge = forwardRef<HTMLSpanElement, { action: string }>(({ action }, ref) => {
  const label = ACTION_LABELS[action] ?? ACTION_LABELS_EXTRA[action] ?? action;
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ACTION_BADGE_CLASS[action] ?? "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
});
ActionBadge.displayName = "ActionBadge";

function LogRow({ row }: { row: ActivityLogRow }) {
  const [open, setOpen] = useState(false);
  const created = parseISO(row.created_at);
  const hasDetails = !!row.metadata || !!row.user_agent || !!row.ip_address;

  return (
    <>
      <TableRow className="align-top">
        <TableCell className="whitespace-nowrap text-sm">
          <div className="font-medium text-foreground">
            {(() => {
              const s = formatDistanceToNow(created, { addSuffix: true, locale: idLocale });
              return s.charAt(0).toUpperCase() + s.slice(1);
            })()}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(created, "dd MMM yyyy, HH:mm:ss", { locale: idLocale })}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium text-foreground">{row.user_email ?? "—"}</div>
          <div className="text-xs text-muted-foreground">
            {row.user_role ? ROLE_LABEL[row.user_role] ?? row.user_role : "Sistem"}
          </div>
        </TableCell>
        <TableCell><ActionBadge action={row.action} /></TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {ENTITY_LABELS[row.entity] ?? row.entity}
        </TableCell>
        <TableCell className="text-sm text-foreground max-w-md">
          <div className="break-words">{row.description}</div>
        </TableCell>
        <TableCell className="w-10">
          {hasDetails && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen((v) => !v)}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {open && hasDetails && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6}>
            <div className="space-y-2 p-2 text-xs">
              {row.metadata !== null && row.metadata !== undefined && (
                <div>
                  <div className="font-semibold text-foreground mb-1">Detail:</div>
                  <pre className="rounded-md bg-background p-3 overflow-x-auto border border-border text-foreground">
{JSON.stringify(row.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {row.user_agent && (
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">User Agent:</span> {row.user_agent}
                </div>
              )}
              {row.ip_address && (
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">IP:</span> {row.ip_address}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function LogCard({ row }: { row: ActivityLogRow }) {
  const [open, setOpen] = useState(false);
  const created = parseISO(row.created_at);
  const hasDetails = !!row.metadata || !!row.user_agent || !!row.ip_address;
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">
            {format(created, "dd MMM yyyy, HH:mm", { locale: idLocale })}
          </div>
          <div className="text-sm font-medium text-foreground truncate">
            {row.user_email ?? "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.user_role ? ROLE_LABEL[row.user_role] ?? row.user_role : "Sistem"}
          </div>
        </div>
        <ActionBadge action={row.action} />
      </div>
      <div className="text-xs text-muted-foreground">
        {ENTITY_LABELS[row.entity] ?? row.entity}
      </div>
      <div className="text-sm text-foreground break-words">{row.description}</div>
      {hasDetails && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
            {open ? "Sembunyikan detail" : "Lihat detail"}
          </Button>
          {open && (
            <div className="space-y-2 text-xs bg-muted/30 rounded-md p-2">
              {row.metadata !== null && row.metadata !== undefined && (
                <pre className="rounded-md bg-background p-2 overflow-x-auto border border-border text-foreground text-[11px]">
{JSON.stringify(row.metadata, null, 2)}
                </pre>
              )}
              {row.user_agent && (
                <div className="text-muted-foreground break-all">
                  <span className="font-semibold text-foreground">UA:</span> {row.user_agent}
                </div>
              )}
              {row.ip_address && (
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">IP:</span> {row.ip_address}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ActivityLogsContent() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [entity, setEntity] = useState("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useActivityLogs({
    search,
    action,
    entity,
    from: from || null,
    to: to || null,
    page,
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleExport = () => {
    if (!rows.length) return;
    const headers = ["Waktu", "Email", "Peran", "Aksi", "Entitas", "Deskripsi"];
    const lines = rows.map((r) => [
      format(parseISO(r.created_at), "yyyy-MM-dd HH:mm:ss"),
      r.user_email ?? "",
      r.user_role ? ROLE_LABEL[r.user_role] ?? r.user_role : "Sistem",
      ACTION_LABELS[r.action] ?? ACTION_LABELS_EXTRA[r.action] ?? r.action,
      ENTITY_LABELS[r.entity] ?? r.entity,
      r.description.replace(/"/g, '""'),
    ]);
    const csv = [headers, ...lines]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `log-aktivitas-${format(new Date(), "yyyyMMddHHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Log Aktivitas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Catatan semua aksi yang dilakukan pengguna pada platform.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!rows.length}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Ekspor CSV
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari email atau deskripsi…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
            <Select value={action} onValueChange={(v) => { setAction(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Aksi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entity} onValueChange={(v) => { setEntity(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Entitas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Entitas</SelectItem>
                {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Dari tanggal</label>
              <Input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(0); }}
                aria-label="Dari tanggal"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Sampai tanggal</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(0); }}
                aria-label="Sampai tanggal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
      ) : !rows.length ? (
        <Card className="border-border/50">
          <CardContent className="py-10">
            <EmptyState
              title="Belum ada log"
              description="Belum ada aktivitas yang tercatat untuk filter yang dipilih."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          {/* Mobile: card list */}
          <div className="md:hidden divide-y divide-border">
            {rows.map((r) => <LogCard key={r.id} row={r} />)}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Entitas</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => <LogRow key={r.id} row={r} />)}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border px-4 py-3">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Menampilkan {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} dari {total}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs text-muted-foreground tabular-nums">
                {page + 1} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
