import { z } from "zod";

export const userFormSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string(),
  role: z.enum(["admin", "reviewer", "supervisor"]),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
