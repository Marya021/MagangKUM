import { Clock, Search, CheckCircle2, XCircle } from "lucide-react";

export const PENEMPATAN_OPTIONS = [
  "Umum",
  "Yankum dan Helpdesk",
  "Humas",
  "Program",
  "Keuangan",
  "Kepegawaian",
  "P3H (Perancang)",
  "Yankum",
] as const;

export const PAGE_SIZE = 10;

export const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock, label: "Menunggu" },
  reviewing: { color: "bg-primary/10 text-primary border-primary/20", icon: Search, label: "Sedang Direview" },
  accepted: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Diterima" },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle, label: "Ditolak" },
};

export const statusSteps = ["pending", "reviewing", "accepted", "rejected"] as const;
