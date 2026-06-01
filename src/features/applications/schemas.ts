import { z } from "zod";

export const reviewSchema = z.object({
  status: z.literal("pending").or(z.literal("reviewing")).or(z.literal("accepted")).or(z.literal("rejected")),
  reviewerNotes: z.string().max(2000, "Catatan terlalu panjang").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  penempatan: z.string().optional(),
  acceptanceLetterFile: z
    .instanceof(File)
    .refine((f) => f.type === "application/pdf", "File harus berformat PDF")
    .refine((f) => f.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5MB")
    .optional(),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
