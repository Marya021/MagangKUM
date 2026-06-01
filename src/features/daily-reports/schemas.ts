import { z } from "zod";

export const reportSchema = z.object({
  activities: z.string().trim().min(10, "Aktivitas minimal 10 karakter").max(3000, "Terlalu panjang"),
  obstacles: z.string().trim().max(2000, "Terlalu panjang").optional().or(z.literal("")),
  plan_tomorrow: z.string().trim().max(2000, "Terlalu panjang").optional().or(z.literal("")),
});

export type ReportValues = z.infer<typeof reportSchema>;
