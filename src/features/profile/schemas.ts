import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  asal: z.string().max(200, "Terlalu panjang"),
  jurusan: z.string().max(200, "Terlalu panjang"),
});

export const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password minimal 8 karakter").max(72, "Password terlalu panjang"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
