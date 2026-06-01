import { z } from "zod";

export const editAttendanceSchema = z.object({
  timeIn: z.string(),
  timeOut: z.string(),
});

export type EditAttendanceValues = z.infer<typeof editAttendanceSchema>;

export const bulkAttendanceSchema = z.object({
  timeIn: z.string(),
  timeOut: z.string(),
});

export type BulkAttendanceValues = z.infer<typeof bulkAttendanceSchema>;
