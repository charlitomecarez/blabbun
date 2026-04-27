-- Tracks which posts have had subscriber notification emails sent,
-- so the cron job never double-sends when it runs again the next day.
CREATE TABLE post_notifications (
  post_slug   TEXT        PRIMARY KEY,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
