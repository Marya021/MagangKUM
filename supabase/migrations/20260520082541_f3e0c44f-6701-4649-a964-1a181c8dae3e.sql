
-- Create auth users for seeded demo accounts with password 'password123'
DO $$
DECLARE
  demo RECORD;
BEGIN
  FOR demo IN
    SELECT * FROM (VALUES
      ('fb502036-674e-461b-996c-681768ae215d'::uuid, 'admin@magangkum.go.id', 'Administrator'),
      ('72681bab-8843-497e-952b-737b82750643'::uuid, 'reviewer@magangkum.go.id', 'Reviewer Utama'),
      ('4c442409-6c15-4ac3-bad0-4048edf4b3b1'::uuid, 'budi.santoso@mail.com', 'Budi Santoso'),
      ('031e58c9-aec2-41bf-a28d-274afece9f96'::uuid, 'siti.nurhaliza@mail.com', 'Siti Nurhaliza'),
      ('e3d96c8d-49a8-49f1-93af-4d2fb1ac0622'::uuid, 'ahmad.fadillah@mail.com', 'Ahmad Fadillah'),
      ('02b0b19e-7c70-47a9-8cdb-46d11096a9a9'::uuid, 'dewi.lestari@mail.com', 'Dewi Lestari'),
      ('d2da103d-b80b-4a43-bef2-1412fd89d919'::uuid, 'rizky.pratama@mail.com', 'Rizky Pratama'),
      ('61da5acd-f630-4d64-9fd1-18c7e5128923'::uuid, 'supervisor@magangkum.go.id', 'Pembimbing Utama')
    ) AS t(uid, email, name)
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      demo.uid, 'authenticated', 'authenticated', demo.email,
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', demo.name),
      now(), now(), '', '', '', ''
    )
    ON CONFLICT (id) DO UPDATE
      SET encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now());

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), demo.uid,
      jsonb_build_object('sub', demo.uid::text, 'email', demo.email),
      'email', demo.uid::text, now(), now(), now()
    )
    ON CONFLICT (provider, provider_id) DO NOTHING;
  END LOOP;
END $$;
