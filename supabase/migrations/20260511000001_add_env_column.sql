BEGIN;

-- post_claps: drop single-column PK, add env column, add composite PK
ALTER TABLE post_claps DROP CONSTRAINT post_claps_pkey;
ALTER TABLE post_claps
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT post_claps_env_check CHECK (env IN ('staging', 'live'));
ALTER TABLE post_claps ADD PRIMARY KEY (env, post_slug);

-- post_views: drop single-column PK, add env column, add composite PK
ALTER TABLE post_views DROP CONSTRAINT post_views_pkey;
ALTER TABLE post_views
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT post_views_env_check CHECK (env IN ('staging', 'live'));
ALTER TABLE post_views ADD PRIMARY KEY (env, post_slug);

-- post_notifications: drop single-column PK, add env column, add composite PK
ALTER TABLE post_notifications DROP CONSTRAINT post_notifications_pkey;
ALTER TABLE post_notifications
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT post_notifications_env_check CHECK (env IN ('staging', 'live'));
ALTER TABLE post_notifications ADD PRIMARY KEY (env, post_slug);

-- clap_votes: drop composite PK, add env column, add new composite PK
ALTER TABLE clap_votes DROP CONSTRAINT clap_votes_pkey;
ALTER TABLE clap_votes
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT clap_votes_env_check CHECK (env IN ('staging', 'live'));
ALTER TABLE clap_votes ADD PRIMARY KEY (env, post_slug, ip_hash);

-- subscribers: drop email unique constraint, add env column, add composite unique
ALTER TABLE subscribers DROP CONSTRAINT subscribers_email_key;
ALTER TABLE subscribers
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT subscribers_env_check CHECK (env IN ('staging', 'live'));
ALTER TABLE subscribers ADD CONSTRAINT subscribers_env_email_key UNIQUE (env, email);

-- admin_users: drop email unique constraint, add env column, add composite unique
ALTER TABLE admin_users DROP CONSTRAINT admin_users_email_key;
ALTER TABLE admin_users
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT admin_users_env_check CHECK (env IN ('staging', 'live'));
ALTER TABLE admin_users ADD CONSTRAINT admin_users_env_email_key UNIQUE (env, email);

-- comments: just add env column (id UUID PRIMARY KEY is not affected)
ALTER TABLE comments
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CONSTRAINT comments_env_check CHECK (env IN ('staging', 'live'));

-- Backfill is handled by DEFAULT 'staging' above; explicit UPDATE for clarity
UPDATE comments           SET env = 'staging';
UPDATE post_claps         SET env = 'staging';
UPDATE clap_votes         SET env = 'staging';
UPDATE subscribers        SET env = 'staging';
UPDATE post_views         SET env = 'staging';
UPDATE post_notifications SET env = 'staging';
UPDATE admin_users        SET env = 'staging';

-- Indexes: only where the PK doesn't already cover (env, post_slug)
-- post_claps, post_views, post_notifications already have (env, post_slug) PK — no extra index needed
-- clap_votes PK is (env, post_slug, ip_hash) — add index on (env, post_slug) for range queries
CREATE INDEX idx_clap_votes_env_post_slug ON clap_votes(env, post_slug);

-- comments: post_slug is not part of PK, so composite index needed
CREATE INDEX idx_comments_env_post_slug ON comments(env, post_slug);

-- Simple indexes for non-slug tables
CREATE INDEX idx_subscribers_env ON subscribers(env);
CREATE INDEX idx_admin_users_env ON admin_users(env);

COMMIT;
