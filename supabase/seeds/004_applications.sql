-- ============================================
-- Seed: Applications
-- ============================================

INSERT INTO public.applications (id, applicant_id, position_id, cover_letter, resume_url, school_letter_url, status, reviewed_by, reviewer_notes, created_at, updated_at) VALUES
  ('0a7df7aa-eba0-4866-b8d1-1d5548588d42', '031e58c9-aec2-41bf-a28d-274afece9f96', 'f7796e4b-3231-43fb-b170-816587a5fdbe', 'Saya Siti Nurhaliza, sangat tertarik dengan posisi ini.', NULL, NULL, 'reviewing', NULL, NULL, '2026-04-12 01:51:05.206159+00', '2026-04-12 01:51:05.206159+00'),
  ('59a3fe5a-27ce-4d00-b961-cdda62cef844', 'e3d96c8d-49a8-49f1-93af-4d2fb1ac0622', 'b0ed41c1-ab0e-4287-b812-83078e32bb86', 'Saya Ahmad Fadillah, sangat tertarik dengan posisi ini.', NULL, NULL, 'reviewing', NULL, '', '2026-04-12 01:51:05.206159+00', '2026-04-12 08:26:26.263238+00'),
  ('b4629128-92cb-4a87-8cd5-19f9fd8c1b75', '4c442409-6c15-4ac3-bad0-4048edf4b3b1', 'c70f4c08-7e90-4e80-98d6-9c910c3afa42', 'Saya Budi Santoso, sangat tertarik dengan posisi ini.', NULL, NULL, 'accepted', NULL, '', '2026-04-12 01:51:05.206159+00', '2026-04-12 09:47:43.087694+00')
ON CONFLICT (id) DO NOTHING;
