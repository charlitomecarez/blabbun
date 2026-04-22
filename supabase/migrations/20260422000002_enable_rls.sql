-- Enable RLS on all tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_claps ENABLE ROW LEVEL SECURITY;
ALTER TABLE clap_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- comments: anyone can read, no direct writes (all writes via service role API)
CREATE POLICY "comments_public_read"
  ON comments FOR SELECT TO anon USING (true);

-- post_claps: anyone can read clap counts
CREATE POLICY "post_claps_public_read"
  ON post_claps FOR SELECT TO anon USING (true);

-- clap_votes: no public access (stores hashed IPs)
-- subscribers: no public access (stores emails)
