// ============================================
// Export semua file dari Supabase Storage
// ============================================
// Usage:
//   export SUPABASE_URL="https://<ref>.supabase.co"
//   export SUPABASE_SERVICE_ROLE_KEY="<service_role>"
//   node supabase/scripts/export-storage.mjs ./storage-backup
// ============================================

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUT = process.argv[2] || "./storage-backup";

if (!URL || !KEY) {
  console.error("❌ Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dulu.");
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

async function walk(bucket, prefix = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;

  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      // folder
      await walk(bucket, path);
    } else {
      const { data: blob, error: dErr } = await supabase.storage.from(bucket).download(path);
      if (dErr) {
        console.warn(`  ⚠️  skip ${path}: ${dErr.message}`);
        continue;
      }
      const dest = join(OUT, bucket, path);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(await blob.arrayBuffer()));
      console.log(`  ✓ ${bucket}/${path}`);
    }
  }
}

const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
if (bErr) {
  console.error("❌ Gagal list bucket:", bErr.message);
  process.exit(1);
}

console.log(`📦 Export ${buckets.length} bucket → ${OUT}\n`);
for (const b of buckets) {
  console.log(`📂 Bucket: ${b.name} (${b.public ? "public" : "private"})`);
  await walk(b.name);
}
console.log("\n✅ Selesai.");
