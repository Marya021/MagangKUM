export function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "-";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  if (startDate && endDate) return `${fmt(startDate)} s.d ${fmt(endDate)}`;
  if (startDate) return `Mulai ${fmt(startDate)}`;
  return `s.d ${fmt(endDate!)}`;
}
