CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@blabbun.com', '$2b$08$XT7g0TlY3LV6QYqdYR391ucgWPfEuilllfNb.sAu3OPrRTnql0ov6', 'admin');
