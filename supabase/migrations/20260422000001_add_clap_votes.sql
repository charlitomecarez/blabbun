CREATE TABLE clap_votes (
  post_slug  TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_slug, ip_hash)
);
