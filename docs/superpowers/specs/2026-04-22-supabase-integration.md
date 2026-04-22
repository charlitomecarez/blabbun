# Supabase Integration Spec

## Overview

Replace all mock/localStorage data in the client app with Supabase-backed persistence. Add a shared `@thelunan/db` package for the typed Supabase client. Add server-side Astro API routes for all data mutation. Add basic admin views for comment moderation and subscriber management.

## Goals

- Anonymous comments (with replies) on posts are persisted in Supabase
- Post clap counts are persisted in Supabase; per-device "did I clap" state stays in localStorage
- Newsletter subscriptions are stored in Supabase with server-side email validation
- Admin app shows a comment list (with delete) and subscriber list

## Non-Goals

- User authentication / accounts
- Email confirmation for newsletter subscribers
- Rate limiting (deferred to infrastructure layer)
- Spam filtering for comments

## Architecture

### Shared package: `@thelunan/db`

A new `packages/db` workspace package exports:

- `createSupabaseClient(url, key)` — typed Supabase client factory
- TypeScript interfaces for every DB table row/insert/update shape

Both `apps/client` and `apps/admin` add `@thelunan/db` as a workspace dependency.

### Server-side API routes (`apps/client`)

The client app switches to Astro hybrid rendering (static pages + server API routes) via `@astrojs/vercel`. All Supabase credentials stay server-side — the Supabase service role key is never sent to the browser.

API routes live at `apps/client/src/pages/api/`:

| Route                       | Methods   | Purpose                           |
| --------------------------- | --------- | --------------------------------- |
| `/api/comments/[slug]`      | GET, POST | Fetch and create comments/replies |
| `/api/claps/[slug]`         | GET, POST | Fetch and increment clap count    |
| `/api/newsletter`           | POST      | Subscribe an email address        |
| `/api/admin/delete-comment` | POST      | Delete a comment (admin only)     |

### Updated Svelte components

| Component              | Change                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `Comments.svelte`      | Replace mock array with `fetch` calls to `/api/comments/[slug]`                                       |
| `ClapShare.svelte`     | Replace localStorage seed with `fetch` to `/api/claps/[slug]`; keep localStorage for "clapped" toggle |
| `NewsletterBar.svelte` | Replace no-op submit with `fetch` to `/api/newsletter`                                                |

### Admin SSR pages (`apps/admin`)

The admin app switches to Astro SSR via `@astrojs/vercel` (`output: "server"`). New pages:

- `apps/admin/src/pages/comments.astro` — lists all comments (newest first), delete button per row
- `apps/admin/src/pages/subscribers.astro` — lists all email subscribers

---

## Database Schema

```sql
-- Anonymous comments with nested replies
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  body TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comments_post_slug ON comments(post_slug);

-- Per-post aggregate clap count
CREATE TABLE post_claps (
  post_slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- Newsletter subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## API Contract

### `GET /api/comments/[slug]`

Returns a comment tree (top-level comments with nested replies), ordered newest-first at the top level, oldest-first within replies.

**Response 200:**

```json
[
  {
    "id": "uuid",
    "post_slug": "hello-world",
    "body": "Great post!",
    "parent_id": null,
    "created_at": "2026-04-22T10:00:00Z",
    "replies": [
      {
        "id": "uuid",
        "post_slug": "hello-world",
        "body": "Agreed!",
        "parent_id": "parent-uuid",
        "created_at": "2026-04-22T11:00:00Z"
      }
    ]
  }
]
```

### `POST /api/comments/[slug]`

Creates a comment or a reply.

**Request body:**

```json
{ "body": "Comment text", "parent_id": "optional-uuid-or-omit" }
```

**Response 201:** the created comment row (no `replies` array).

**Response 400:** `{ "error": "Comment body is required" }`

### `GET /api/claps/[slug]`

**Response 200:** `{ "count": 42 }`

### `POST /api/claps/[slug]`

Increments the clap count by 1 (upserts the row if it doesn't exist).

**Response 200:** `{ "count": 43 }`

### `POST /api/newsletter`

**Request body:** `{ "email": "user@example.com" }`

Upserts on the unique `email` column — re-submitting an existing email is idempotent (200, no error).

**Response 200:** `{ "success": true }`

**Response 400:** `{ "error": "Invalid email address" }`

### `POST /api/admin/delete-comment`

**Request body (form-encoded):** `id=<uuid>`

Deletes the comment. Cascades to its replies.

**Response 303:** Redirect to `/comments`

---

## Environment Variables

```
# Required for both apps
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The service role key bypasses RLS. It is only read by server-side Astro code and never sent to the browser.

---

## Types

The existing `Comment` and `Reply` interfaces in `apps/client/src/components/post/types.ts` use `createdAt` (camelCase). After migration, update them to use `created_at` (snake_case) to match Supabase row shapes directly, and update the one reference in `CommentItem.svelte`.
