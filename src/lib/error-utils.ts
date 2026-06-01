import { toast } from "sonner";

/**
 * Extract a human-readable message from any thrown value.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "Terjadi kesalahan tidak diketahui";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const e = error as { message?: string; error_description?: string; msg?: string };
    return e.message || e.error_description || e.msg || "Terjadi kesalahan tidak diketahui";
  }
  return "Terjadi kesalahan tidak diketahui";
}

/**
 * Translate common Supabase / network error messages to Indonesian.
 */
export function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("failed to fetch") || m.includes("network")) return "Koneksi internet bermasalah. Silakan periksa jaringan Anda.";
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi.";
  if (m.includes("user already registered") || m.includes("already exists")) return "Akun sudah terdaftar.";
  if (m.includes("rate limit") || m.includes("too many")) return "Terlalu banyak percobaan. Silakan tunggu sebentar.";
  if (m.includes("jwt") || m.includes("expired")) return "Sesi telah berakhir. Silakan masuk kembali.";
  if (m.includes("permission") || m.includes("not authorized") || m.includes("rls")) return "Anda tidak memiliki izin untuk tindakan ini.";
  if (m.includes("not found")) return "Data tidak ditemukan.";
  if (m.includes("duplicate") || m.includes("unique")) return "Data duplikat ditemukan.";
  if (m.includes("violates foreign key")) return "Data terkait tidak ditemukan.";
  if (m.includes("timeout")) return "Permintaan terlalu lama. Silakan coba lagi.";
  return message;
}

/**
 * Show a toast for any error with a friendly Indonesian message.
 */
export function showError(error: unknown, title = "Terjadi Kesalahan") {
  const raw = getErrorMessage(error);
  const message = translateError(raw);
  toast.error(title, { description: message });
}
