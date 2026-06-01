UPDATE auth.users
SET encrypted_password = crypt('Z1fkyganteng', gen_salt('bf')),
    updated_at = now()
WHERE email = 'zifky1234zifky.el6677@student.unri.ac.id';