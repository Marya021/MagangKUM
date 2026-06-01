import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Masukkan email yang valid").max(255, "Email terlalu panjang"),
  password: z.string().min(1, "Password wajib diisi").min(8, "Kata sandi minimal 8 karakter").max(128, "Kata sandi terlalu panjang"),
  fullName: z.string().trim().max(100, "Nama terlalu panjang").optional(),
});

export type AuthValues = z.infer<typeof authSchema>;
