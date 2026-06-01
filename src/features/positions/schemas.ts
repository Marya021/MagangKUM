import { z } from "zod";

export const positionSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200, "Judul terlalu panjang"),
  department: z.string().trim().min(1, "Departemen wajib diisi").max(100, "Departemen terlalu panjang"),
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(5000, "Deskripsi terlalu panjang"),
  requirements: z.string().trim().min(10, "Persyaratan minimal 10 karakter").max(5000, "Persyaratan terlalu panjang"),
  location: z.string().trim().min(1, "Lokasi wajib diisi").max(200, "Lokasi terlalu panjang"),
  status: z.enum(["open", "closed", "draft"]),
  quota: z.number().int().min(1, "Kuota minimal 1").max(1000, "Kuota maksimal 1000"),
  deadline: z.date({ message: "Deadline wajib diisi" }).nullable().optional(),
});

export type PositionValues = z.infer<typeof positionSchema>;

export const fileValidation = z
  .instanceof(File)
  .refine((f) => f.size <= 10 * 1024 * 1024, "Ukuran file maksimal 10MB")
  .refine(
    (f) =>
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(f.type),
    "Hanya file PDF dan Word yang diterima",
  );

export const applySchema = z.object({
  coverLetter: z.string().trim().max(3000, "Surat lamaran terlalu panjang").optional().or(z.literal("")),
  resumeFile: fileValidation.refine(() => true, { message: "Silakan unggah CV Anda" }),
  schoolLetterFile: fileValidation.refine(() => true, { message: "Silakan unggah Surat Keterangan dari Sekolah" }),
  durationMonths: z
    .number({ message: "Durasi magang wajib diisi" })
    .int("Durasi harus berupa angka bulat")
    .min(1, "Durasi minimal 1 bulan")
    .max(12, "Durasi maksimal 12 bulan"),
});

export type ApplyValues = z.infer<typeof applySchema>;

export const statusLabel = (s: string) => (s === "open" ? "Dibuka" : s === "closed" ? "Ditutup" : "Draf");
