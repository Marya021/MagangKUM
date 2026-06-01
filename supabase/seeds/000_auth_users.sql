-- ============================================
-- Seed: Auth Users
-- ============================================
-- Membuat akun di auth.users supaya seed lain (users, roles, dsb.)
-- yang merefer ke user_id ini tetap konsisten saat di-restore ke
-- project Supabase baru.
--
-- Password default (BCRYPT-hashed via crypt()):
--   admin@magangkum.go.id      → Admin12345!
--   reviewer@magangkum.go.id   → Reviewer12345!
--   supervisor@magangkum.go.id → Supervisor12345!
--   *.@mail.com (applier)      → Applier12345!
--
-- ⚠️ GANTI password ini sebelum dipakai production!
-- ============================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'fb502036-674e-461b-996c-681768ae215d', 'authenticated', 'authenticated',
   'admin@magangkum.go.id', crypt('Admin12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Administrator"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '72681bab-8843-497e-952b-737b82750643', 'authenticated', 'authenticated',
   'reviewer@magangkum.go.id', crypt('Reviewer12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Reviewer Utama"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '61da5acd-f630-4d64-9fd1-18c7e5128923', 'authenticated', 'authenticated',
   'supervisor@magangkum.go.id', crypt('Supervisor12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Pembimbing Utama"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '4c442409-6c15-4ac3-bad0-4048edf4b3b1', 'authenticated', 'authenticated',
   'budi.santoso@mail.com', crypt('Applier12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Budi Santoso"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '031e58c9-aec2-41bf-a28d-274afece9f96', 'authenticated', 'authenticated',
   'siti.nurhaliza@mail.com', crypt('Applier12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Siti Nurhaliza"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', 'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622', 'authenticated', 'authenticated',
   'ahmad.fadillah@mail.com', crypt('Applier12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmad Fadillah"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '02b0b19e-7c70-47a9-8cdb-46d11096a9a9', 'authenticated', 'authenticated',
   'dewi.lestari@mail.com', crypt('Applier12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Dewi Lestari"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', 'd2da103d-b80b-4a43-bef2-1412fd89d919', 'authenticated', 'authenticated',
   'rizky.pratama@mail.com', crypt('Applier12345!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Rizky Pratama"}',
   now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Identitas email/password supaya bisa login via /auth/v1/token
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  u.id::text,
  now(), now(), now()
FROM auth.users u
WHERE u.id IN (
  'fb502036-674e-461b-996c-681768ae215d',
  '72681bab-8843-497e-952b-737b82750643',
  '61da5acd-f630-4d64-9fd1-18c7e5128923',
  '4c442409-6c15-4ac3-bad0-4048edf4b3b1',
  '031e58c9-aec2-41bf-a28d-274afece9f96',
  'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622',
  '02b0b19e-7c70-47a9-8cdb-46d11096a9a9',
  'd2da103d-b80b-4a43-bef2-1412fd89d919'
)
ON CONFLICT (provider, provider_id) DO NOTHING;
