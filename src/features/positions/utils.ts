export const getAppStatus = (
  myApplications: { position_id: string; status: string }[] | undefined,
  posId: string,
) => myApplications?.find((a) => a.position_id === posId)?.status;

export const getRemainingQuota = (
  pos: { quota?: number | null; id: string },
  acceptedCounts: Record<string, number>,
) => Math.max(0, (pos.quota ?? 20) - (acceptedCounts[pos.id] ?? 0));

export const isQuotaFull = (
  pos: { quota?: number | null; id: string },
  acceptedCounts: Record<string, number>,
) => getRemainingQuota(pos, acceptedCounts) <= 0;

export const statusColor = (s: string) =>
  s === "open"
    ? "bg-success/10 text-success border-success/20"
    : s === "closed"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : "bg-muted text-muted-foreground";
