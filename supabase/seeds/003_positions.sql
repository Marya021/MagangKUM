-- ============================================
-- Seed: Positions
-- ============================================

INSERT INTO public.positions (id, title, department, description, requirements, location, quota, status, deadline, created_by, created_at, updated_at) VALUES
  ('c70f4c08-7e90-4e80-98d6-9c910c3afa42', 'Frontend Developer Intern', 'IT & Development', 'Mengembangkan antarmuka pengguna menggunakan React dan TypeScript', 'Mahasiswa S1 Teknik Informatika, menguasai HTML/CSS/JS', 'Jakarta', 5, 'open', '2026-06-30', 'fb502036-674e-461b-996c-681768ae215d', '2026-04-11 17:36:40.211629+00', '2026-04-11 17:36:40.211629+00'),
  ('f7796e4b-3231-43fb-b170-816587a5fdbe', 'Data Analyst Intern', 'Data & Analytics', 'Menganalisis data untuk mendukung pengambilan keputusan', 'Mahasiswa S1 Statistika/Matematika, menguasai Python/SQL', 'Bandung', 3, 'open', '2026-07-15', 'fb502036-674e-461b-996c-681768ae215d', '2026-04-11 17:36:40.211629+00', '2026-04-11 17:36:40.211629+00'),
  ('b0ed41c1-ab0e-4287-b812-83078e32bb86', 'UI/UX Designer Intern', 'Design', 'Merancang pengalaman pengguna yang intuitif', 'Mahasiswa Desain, menguasai Figma', 'Remote', 4, 'open', '2026-06-15', 'fb502036-674e-461b-996c-681768ae215d', '2026-04-11 17:36:40.211629+00', '2026-04-11 17:36:40.211629+00')
ON CONFLICT (id) DO NOTHING;
