#!/usr/bin/env bash
# ============================================
# Jalankan semua seed berurutan
# ============================================
# Usage:
#   export SUPABASE_DB_URL="postgresql://postgres:<pw>@<host>:5432/postgres"
#   bash supabase/scripts/run-seeds.sh
# ============================================

set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "❌ SUPABASE_DB_URL belum di-set."
  echo "   export SUPABASE_DB_URL=\"postgresql://postgres:<pw>@<host>:5432/postgres\""
  exit 1
fi

SEEDS_DIR="$(cd "$(dirname "$0")/.." && pwd)/seeds"

echo "🌱 Menjalankan seed dari: $SEEDS_DIR"
echo ""

for f in $(ls "$SEEDS_DIR"/*.sql | sort); do
  echo "▶  $(basename "$f")"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo ""
echo "✅ Semua seed berhasil dijalankan."
