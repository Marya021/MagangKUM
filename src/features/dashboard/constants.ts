import type { ChartConfig } from "@/components/ui/chart";

export const STATUS_COLORS = {
  pending: "hsl(38, 92%, 50%)",
  reviewing: "hsl(197, 71%, 52%)",
  accepted: "hsl(152, 60%, 45%)",
  rejected: "hsl(0, 72%, 51%)",
};

export const pieConfig: ChartConfig = {
  pending: { label: "Menunggu", color: STATUS_COLORS.pending },
  reviewing: { label: "Direview", color: STATUS_COLORS.reviewing },
  accepted: { label: "Diterima", color: STATUS_COLORS.accepted },
  rejected: { label: "Ditolak", color: STATUS_COLORS.rejected },
};

export const trendConfig: ChartConfig = {
  count: { label: "Lamaran", color: "hsl(197, 71%, 52%)" },
};

export const attendanceConfig: ChartConfig = {
  ontime: { label: "Tepat Waktu", color: "hsl(152, 60%, 45%)" },
  late: { label: "Terlambat", color: "hsl(38, 92%, 50%)" },
  absent: { label: "Tidak Hadir", color: "hsl(0, 72%, 51%)" },
};

export const quotaConfig: ChartConfig = {
  terisi: { label: "Terisi", color: "hsl(152, 60%, 45%)" },
  sisa: { label: "Sisa", color: "hsl(200, 20%, 88%)" },
};
