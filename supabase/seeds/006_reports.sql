-- ============================================
-- Seed: Reports (formerly daily_reports)
-- ============================================

INSERT INTO public.reports (id, user_id, report_date, activities, obstacles, plan_tomorrow, created_at, updated_at) VALUES
  -- Budi Santoso
  ('3353d779-6113-44de-9374-ddac19ebab66', '4c442409-6c15-4ac3-bad0-4048edf4b3b1', '2026-04-11', 'Hari 1: Mengerjakan tugas pengembangan fitur dan review code', 'Kesulitan integrasi API', 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.015999+00', '2026-04-12 01:51:08.015999+00'),
  ('40b70083-3be8-44ad-897e-9c15a1cc2d5f', '4c442409-6c15-4ac3-bad0-4048edf4b3b1', '2026-04-10', 'Hari 2: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.015999+00', '2026-04-12 01:51:08.015999+00'),
  ('2506ca72-514d-4d8a-88db-89efe329aad3', '4c442409-6c15-4ac3-bad0-4048edf4b3b1', '2026-04-09', 'Hari 3: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.015999+00', '2026-04-12 01:51:08.015999+00'),

  -- Siti Nurhaliza
  ('b8f8eb89-675d-407f-8566-c5c56728f83c', '031e58c9-aec2-41bf-a28d-274afece9f96', '2026-04-11', 'Hari 1: Mengerjakan tugas pengembangan fitur dan review code', 'Kesulitan integrasi API', 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.296408+00', '2026-04-12 01:51:08.296408+00'),
  ('cc4032f2-b728-4ab0-a399-88bf9ffcdd96', '031e58c9-aec2-41bf-a28d-274afece9f96', '2026-04-10', 'Hari 2: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.296408+00', '2026-04-12 01:51:08.296408+00'),
  ('ad71489e-8417-44f6-a8b5-32fe322a3f6e', '031e58c9-aec2-41bf-a28d-274afece9f96', '2026-04-09', 'Hari 3: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.296408+00', '2026-04-12 01:51:08.296408+00'),

  -- Ahmad Fadillah
  ('4ea3580b-579b-485e-8272-a6a4b97670ea', 'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622', '2026-04-11', 'Hari 1: Mengerjakan tugas pengembangan fitur dan review code', 'Kesulitan integrasi API', 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.576127+00', '2026-04-12 01:51:08.576127+00'),
  ('d1eeba35-7227-47f5-8b76-b84c427c4931', 'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622', '2026-04-10', 'Hari 2: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.576127+00', '2026-04-12 01:51:08.576127+00'),
  ('14996f97-3b16-4528-b744-ff47d8836f8c', 'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622', '2026-04-09', 'Hari 3: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.576127+00', '2026-04-12 01:51:08.576127+00'),

  -- Dewi Lestari
  ('537efac4-9816-4e33-ae20-f6cf98d1bd2c', '02b0b19e-7c70-47a9-8cdb-46d11096a9a9', '2026-04-11', 'Hari 1: Mengerjakan tugas pengembangan fitur dan review code', 'Kesulitan integrasi API', 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.852623+00', '2026-04-12 01:51:08.852623+00'),
  ('88f3d8e5-0a58-4bf0-8346-dc18604fbd5a', '02b0b19e-7c70-47a9-8cdb-46d11096a9a9', '2026-04-10', 'Hari 2: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.852623+00', '2026-04-12 01:51:08.852623+00'),
  ('14dba163-e3f0-4971-a2aa-d2d3abc287f4', '02b0b19e-7c70-47a9-8cdb-46d11096a9a9', '2026-04-09', 'Hari 3: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:08.852623+00', '2026-04-12 01:51:08.852623+00'),

  -- Rizky Pratama
  ('3699a0d0-0e86-485a-a59e-790c3049c978', 'd2da103d-b80b-4a43-bef2-1412fd89d919', '2026-04-11', 'Hari 1: Mengerjakan tugas pengembangan fitur dan review code', 'Kesulitan integrasi API', 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:09.129178+00', '2026-04-12 01:51:09.129178+00'),
  ('4c5c1a47-2754-4e4e-a14d-204ee58412fa', 'd2da103d-b80b-4a43-bef2-1412fd89d919', '2026-04-10', 'Hari 2: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:09.129178+00', '2026-04-12 01:51:09.129178+00'),
  ('d276ed0c-8023-4ace-9326-8541140cb96e', 'd2da103d-b80b-4a43-bef2-1412fd89d919', '2026-04-09', 'Hari 3: Mengerjakan tugas pengembangan fitur dan review code', NULL, 'Melanjutkan pengerjaan fitur', '2026-04-12 01:51:09.129178+00', '2026-04-12 01:51:09.129178+00')
ON CONFLICT (id) DO NOTHING;
