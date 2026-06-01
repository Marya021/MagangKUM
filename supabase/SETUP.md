# Backend Portability Guide — Magang Kemenkum

Panduan lengkap untuk memindahkan / mereplikasi backend project ini ke project Supabase / Lovable Cloud baru.

Semua yang dibutuhkan ada di folder `supabase/`:

```
supabase/
├── SETUP.md              ← file ini
├── config.toml           ← konfigurasi Supabase
├── migrations/           ← skema database (urut kronologis)
├── seeds/                ← data awal (users, roles, positions, dst.)
└── scripts/              ← helper untuk storage & seeding
    ├── run-seeds.sh      ← jalankan semua seed berurutan
    ├── export-storage.mjs← download semua file dari bucket
    └── import-storage.mjs← upload semua file ke project baru
```

---

## 1. Pindahkan Skema Database

Semua perubahan struktur ada di `supabase/migrations/`. Jalankan berurutan
(nama file sudah ber-timestamp jadi urut secara alfabet).

### Opsi A — via Supabase CLI (rekomendasi)
```bash
supabase link --project-ref <PROJECT_REF_BARU>
supabase db push
```

### Opsi B — via SQL Editor (manual)
Jalankan setiap file `supabase/migrations/*.sql` di SQL Editor secara urut.

### Opsi C — via Lovable Cloud
Lovable Cloud otomatis menjalankan migrasi saat project baru di-clone /
fork dari project ini.

---

## 2. Pindahkan Data (Seeds)

Seed berisi: users, roles, positions, applications, attendances, reports.
File berada di `supabase/seeds/` dan **harus dijalankan berurutan**:

| File | Isi |
|---|---|
| `000_auth_users.sql` | Akun auth (admin, reviewer, supervisor, applier demo) |
| `001_users.sql`      | Profil user di `public.users` |
| `002_roles.sql`      | Mapping user → role |
| `003_positions.sql`  | Posisi magang |
| `004_applications.sql` | Lamaran demo |
| `005_attendances.sql`  | Absensi demo |
| `006_reports.sql`      | Jurnal harian demo |

### Cara cepat — via script
```bash
export SUPABASE_DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"
bash supabase/scripts/run-seeds.sh
```

### Manual
Tempel isi tiap file ke SQL Editor, urut `000 → 006`.

### Akun test setelah seeding
| Role | Email | Password |
|---|---|---|
| Admin | `admin@magangkum.go.id` | `Admin12345!` |
| Reviewer | `reviewer@magangkum.go.id` | `Reviewer12345!` |
| Supervisor | `supervisor@magangkum.go.id` | `Supervisor12345!` |
| Applier | `budi.santoso@mail.com` | `Applier12345!` |

> ⚠️ Ganti password ini sebelum dipakai di production.

---

## 3. Pindahkan File Storage (resumes, avatars, dll.)

### Export dari project lama
```bash
export SUPABASE_URL="https://<OLD_REF>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service_role_key_lama>"
node supabase/scripts/export-storage.mjs ./storage-backup
```
Semua file akan tersimpan di `./storage-backup/<bucket>/<path>`.

### Import ke project baru
```bash
export SUPABASE_URL="https://<NEW_REF>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service_role_key_baru>"
node supabase/scripts/import-storage.mjs ./storage-backup
```

Bucket (`resumes` private, `avatars` public) sudah dibuat oleh migrasi —
script hanya mengisi ulang isinya.

---

## 4. Konfigurasi Auth & Secrets

Setelah skema + data + storage siap, set kembali:

1. **Auth → URL Configuration**
   - Site URL: `https://magangkum.xyz` (sesuaikan)
   - Redirect URLs: tambahkan domain preview & production
2. **Auth → Email Templates**: gunakan template default atau custom yang sama
3. **Edge Functions Secrets** (jika ada): `LOVABLE_API_KEY`, `RESEND_API_KEY`, dst.
4. **Frontend `.env`**: otomatis di-generate Lovable Cloud. Jika manual:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   VITE_SUPABASE_PROJECT_ID=...
   ```

---

## 5. Checklist Verifikasi

- [ ] Login dengan 4 akun test berhasil
- [ ] Admin lihat semua lamaran & user
- [ ] Applier bisa apply posisi
- [ ] Upload CV (storage `resumes`) berfungsi
- [ ] Upload avatar (storage `avatars`) berfungsi
- [ ] Notifikasi realtime jalan
- [ ] PDF sertifikat generate

---

## Catatan

- **Jangan** edit `src/integrations/supabase/{client,types}.ts` — auto-generate.
- **Jangan** edit `.env` — Lovable Cloud yang isi.
- File seed pakai `ON CONFLICT DO NOTHING` → aman dijalankan ulang (idempotent).
- Migrasi pakai timestamp → jangan rename / hapus, urutan penting.
