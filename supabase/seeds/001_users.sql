-- ============================================
-- Seed: Users (formerly profiles)
-- ============================================
-- PREREQUISITE: Auth users must exist first.
-- These users are created by the handle_new_user() trigger,
-- but this file can re-insert them if needed.
-- ============================================

INSERT INTO public.users (id, user_id, full_name, email, avatar_url, created_at, updated_at) VALUES
  ('ed6bb19a-741c-4cbf-b57f-950248470bfb', 'fb502036-674e-461b-996c-681768ae215d', 'Administrator', 'admin@magangkum.go.id', NULL, '2026-04-11 17:36:24.131247+00', '2026-04-11 17:36:24.131247+00'),
  ('9c256d37-d39d-4570-b4b2-81be6df39cfc', '72681bab-8843-497e-952b-737b82750643', 'Reviewer Utama', 'reviewer@magangkum.go.id', NULL, '2026-04-12 01:50:51.429073+00', '2026-04-12 01:50:51.429073+00'),
  ('1f6d1694-9e69-4beb-bd2a-1a6b653a95cd', '4c442409-6c15-4ac3-bad0-4048edf4b3b1', 'Budi Santoso', 'budi.santoso@mail.com', NULL, '2026-04-12 01:50:54.290511+00', '2026-04-12 01:50:54.290511+00'),
  ('2fad4552-d7d4-4c52-af3c-ba150f44d308', '031e58c9-aec2-41bf-a28d-274afece9f96', 'Siti Nurhaliza', 'siti.nurhaliza@mail.com', NULL, '2026-04-12 01:50:56.859618+00', '2026-04-12 01:50:56.859618+00'),
  ('5658ae8d-4df2-4fa8-acc6-3361b8f31b5f', 'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622', 'Ahmad Fadillah', 'ahmad.fadillah@mail.com', NULL, '2026-04-12 01:50:59.435178+00', '2026-04-12 01:50:59.435178+00'),
  ('7eb8c7d5-19fb-45c2-b0c2-f3b82d1678ec', '02b0b19e-7c70-47a9-8cdb-46d11096a9a9', 'Dewi Lestari', 'dewi.lestari@mail.com', NULL, '2026-04-12 01:51:02.037288+00', '2026-04-12 01:51:02.037288+00'),
  ('78e97234-caa3-4d15-a56a-3720014de0bf', 'd2da103d-b80b-4a43-bef2-1412fd89d919', 'Rizky Pratama', 'rizky.pratama@mail.com', NULL, '2026-04-12 01:51:04.631281+00', '2026-04-12 01:51:04.631281+00'),
  ('a3c1d2e4-f5b6-4a78-9012-3456789abcde', '61da5acd-f630-4d64-9fd1-18c7e5128923', 'Pembimbing Utama', 'supervisor@magangkum.go.id', NULL, '2026-04-15 00:00:00.000000+00', '2026-04-15 00:00:00.000000+00')
ON CONFLICT (id) DO NOTHING;
