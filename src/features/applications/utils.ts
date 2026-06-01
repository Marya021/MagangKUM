import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Format a download filename from applicant data using DDMMYYYYHHMM_name.ext pattern.
 */
export function formatDownloadFilename(
  fullName: string,
  createdAt: string,
  filePath: string,
  prefix?: string,
): string {
  const name = (fullName || "unknown").replace(/\s+/g, "_");
  const d = new Date(createdAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}${pad(d.getHours())}${pad(d.getMinutes())}`;
  const ext = (filePath.split(".").pop() || "pdf").toLowerCase();
  return prefix ? `${dateStr}_${prefix}_${name}.${ext}` : `${dateStr}_${name}.${ext}`;
}

/**
 * Download a file from Supabase storage and trigger browser download.
 */
export async function downloadStorageFile(
  supabase: SupabaseClient,
  bucket: string,
  filePath: string,
  filename: string,
) {
  const { data, error } = await supabase.storage.from(bucket).download(filePath);
  if (error) throw error;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
