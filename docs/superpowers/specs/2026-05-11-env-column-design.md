# Design: Environment Column (staging / live)

**Date:** 2026-05-11  
**Status:** Approved

## Problem

All Supabase tables share a single dataset. There is no way to separate test/staging data from production/live data. Staging traffic pollutes live analytics, comments, claps, and subscriber lists.

## Goal

Add an `env` column to every table so that each app instance only reads and writes data belonging to its own environment (`staging` or `live`).

---

## Section 1: Database Schema

### New column (all 7 tables)

```sql
env TEXT NOT NULL CHECK (env IN ('staging', 'live')) DEFAULT 'staging'
```

Tables receiving the column:
- `comments`
- `post_claps`
- `clap_votes`
- `subscribers`
- `post_views`
- `post_notifications`
- `admin_users`

### Backfill

All existing rows are set to `'staging'` (they are considered test data).

### Indexes

For tables that are queried by `post_slug`, replace or supplement the existing single-column index with a composite:

```sql
CREATE INDEX idx_comments_env_post_slug      ON comments(env, post_slug);
CREATE INDEX idx_post_claps_env_post_slug    ON post_claps(env, post_slug);
CREATE INDEX idx_clap_votes_env_post_slug    ON clap_votes(env, post_slug);
CREATE INDEX idx_post_views_env_post_slug    ON post_views(env, post_slug);
CREATE INDEX idx_post_notifications_env_slug ON post_notifications(env, post_slug);
```

`subscribers` and `admin_users` get a simple single-column index:

```sql
CREATE INDEX idx_subscribers_env  ON subscribers(env);
CREATE INDEX idx_admin_users_env  ON admin_users(env);
```

---

## Section 2: Environment Variable

### Variable

| Name      | Values            | Default    |
|-----------|-------------------|------------|
| `APP_ENV` | `staging`, `live` | `staging`  |

Added to:
- `apps/client/.env.example`
- `apps/admin/.env.example`
- `apps/client/src/env.d.ts` — `APP_ENV: string` in the runtime env type
- `apps/admin/src/env.d.ts` (or equivalent) — same

### Helper function

Added to `apps/client/src/lib/api.ts` and its admin equivalent:

```ts
export function getAppEnv(runtimeEnv: RuntimeEnv): 'staging' | 'live' {
  const val = runtimeEnv.APP_ENV ?? import.meta.env.APP_ENV;
  return val === 'live' ? 'live' : 'staging';
}
```

Defaults to `'staging'` when the var is absent or has an unexpected value — safe failure mode.

---

## Section 3: Query Filtering & Inserts

### Rule

Every Supabase query in both apps must:
- Append `.eq('env', appEnv)` to all SELECT/UPDATE/DELETE queries
- Include `env: appEnv` in all INSERT payloads

### Client app — files to update

| File | Operations |
|------|------------|
| `api/comments/[slug].ts` | GET (select), POST (insert) |
| `api/claps/[slug].ts` | GET (select post_claps + clap_votes), POST (upsert post_claps + insert clap_votes) |
| `api/views/[slug].ts` | GET (select), POST (upsert) |
| `api/newsletter.ts` | POST (insert subscriber) |

### Admin app — files to update

| File | Operations |
|------|------------|
| `api/comments/index.ts` | GET (list), POST (insert) |
| `api/comments/[id].ts` | GET (single), PATCH (update), DELETE |
| `api/claps/` | GET (list), PATCH (update count) |
| `api/subscribers/` | GET (list), DELETE |
| `api/posts/` | any slug-based queries |
| `api/notify-subscribers.ts` | GET subscribers |
| `api/purge-test-data.ts` | scoped to current env only — never cross-env |
| `api/admin-users/` | GET, POST, DELETE |
| `api/auth/` | login query filters by env |

---

## Section 4: TypeScript Types

`packages/db/src/types.ts` — all 7 table definitions updated:

- `Row`: `env: string`
- `Insert`: `env?: string` (optional so migration tooling can omit; app code always sets it)
- `Update`: `env?: string`

No new exported type aliases needed. Existing aliases (`CommentRow`, `PostClapRow`, `ClapVoteRow`, `SubscriberRow`, `PostViewRow`, `PostNotificationRow`, `AdminUserRow`) automatically include the new field.

---

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Implementation approach | Column + app-level filter | Transparent, consistent with existing code patterns |
| Admin behavior | Filters to current env only | Simplest — no UI complexity |
| Backfill value | `staging` | Existing data is considered test data |
| Missing/invalid `APP_ENV` | Default to `staging` | Safe failure — never contaminates live |
| `admin_users` included | Yes | Admin logins should be env-scoped too |
