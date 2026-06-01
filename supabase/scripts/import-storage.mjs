// ============================================
// Import semua file ke Supabase Storage
// ============================================
// Usage:
//   export SUPABASE_URL="https://<ref>.supabase.co"
//   export SUPABASE_SERVICE_ROLE_KEY="<service_role>"
//   node supabase/scripts/import-storage.mjs ./storage-backup
//
// Struktur folder: <SRC>/<bucket>/<path>/<file>
// Bucket harus sudah dibuat (lewat migrasi). Script ini hanya upload isi.
// ============================================

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SRC = process.argv[2] || "./storage-backup";

if (!URL || !KEY) {
  console.error("❌ Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dulu.");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const st = await stat(full);
    if (st.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const buckets = await readdir(SRC);
console.log(`📦 Import ${buckets.length} bucket dari ${SRC}\n`);

for (const bucket of buckets) {
  const root = join(SRC, bucket);
  const st = await stat(root);
  if (!st.isDirectory()) continue;

  console.log(`📂 Bucket: ${bucket}`);
  const files = await walk(root);

  for (const file of files) {
    const path = relative(root, file).split("\\").join("/");
    const buf = await readFile(file);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buf, { upsert: true, contentType: "application/octet-stream" });
    if (error) console.warn(`  ⚠️  ${path}: ${error.message}`);
    else console.log(`  ✓ ${path}`);
  }
}

console.log("\n✅ Selesai.");
