import { z } from "zod";

export const editInternSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  asal: z.string().min(1, "Asal wajib diisi"),
  jurusan: z.string().min(1, "Jurusan wajib diisi"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  penempatan: z.string(),
  status: z.string().min(1, "Status wajib dipilih"),
});

export type EditInternValues = z.infer<typeof editInternSchema>;
