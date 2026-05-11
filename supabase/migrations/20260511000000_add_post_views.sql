CREATE TABLE post_views (
  post_slug TEXT PRIMARY KEY,
  count     INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can read view counts
CREATE POLICY "post_views_public_read"
  ON post_views FOR SELECT TO anon USING (true);
