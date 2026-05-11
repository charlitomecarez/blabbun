# Env Column (staging / live) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `env TEXT NOT NULL CHECK (env IN ('staging', 'live')) DEFAULT 'staging'` column to all 7 Supabase tables so that each deployed app instance only reads and writes data belonging to its own environment.

**Architecture:** A single SQL migration adds the column and indexes. A new `APP_ENV` env var (read at runtime) drives a `getAppEnv()` helper that returns `'staging' | 'live'`. Every Supabase query appends `.eq('env', appEnv)` and every INSERT includes `env: appEnv`.

**Tech Stack:** PostgreSQL (Supabase), TypeScript, Astro SSR, Cloudflare Workers runtime (`cloudflare:workers` env)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `supabase/migrations/20260511000001_add_env_column.sql` | Add env column + indexes to all 7 tables |
| Modify | `packages/db/src/types.ts` | Add `env` field to all table Row/Insert/Update types |
| Modify | `apps/client/src/lib/api.ts` | Add `getAppEnv()` helper |
| Modify | `apps/client/src/env.d.ts` | Add `APP_ENV` to `CloudflareEnv` |
| Modify | `apps/client/.env.example` | Document `APP_ENV` |
| Create | `apps/admin/src/lib/env.ts` | `getAppEnv()` helper for admin (mirrors client) |
| Modify | `apps/admin/src/env.d.ts` | Add `APP_ENV` to `CloudflareEnv` |
| Modify | `apps/admin/.env.example` | Document `APP_ENV` |
| Modify | `apps/client/src/pages/api/comments/[slug].ts` | Filter GET + tag POST by env |
| Modify | `apps/client/src/pages/api/claps/[slug].ts` | Filter GET + tag POST by env |
| Modify | `apps/client/src/pages/api/views/[slug].ts` | Filter GET + tag POST by env |
| Modify | `apps/client/src/pages/api/newsletter.ts` | Tag POST insert by env |
| Modify | `apps/admin/src/pages/api/comments/index.ts` | Filter GET + tag POST by env |
| Modify | `apps/admin/src/pages/api/comments/[id].ts` | Filter PATCH + DELETE by env |
| Modify | `apps/admin/src/pages/api/claps/index.ts` | Filter GET + tag POST by env |
| Modify | `apps/admin/src/pages/api/claps/[slug].ts` | Filter PUT + DELETE by env |
| Modify | `apps/admin/src/pages/api/subscribers/index.ts` | Filter GET + tag POST by env |
| Modify | `apps/admin/src/pages/api/admin-users/index.ts` | Filter GET + tag POST by env |
| Modify | `apps/admin/src/pages/api/admin-users/[id].ts` | Filter PATCH + DELETE by env |
| Modify | `apps/admin/src/pages/api/auth/login.ts` | Filter admin_users query by env |
| Modify | `apps/admin/src/pages/api/notify-subscribers.ts` | Filter subscribers by env |
| Modify | `apps/admin/src/pages/api/purge-test-data.ts` | Delete only current env's data |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260511000001_add_env_column.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Add env column to all tables
ALTER TABLE comments
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

ALTER TABLE post_claps
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

ALTER TABLE clap_votes
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

ALTER TABLE subscribers
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

ALTER TABLE post_views
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

ALTER TABLE post_notifications
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

ALTER TABLE admin_users
  ADD COLUMN env TEXT NOT NULL DEFAULT 'staging'
    CHECK (env IN ('staging', 'live'));

-- Backfill existing rows as staging
UPDATE comments          SET env = 'staging';
UPDATE post_claps        SET env = 'staging';
UPDATE clap_votes        SET env = 'staging';
UPDATE subscribers       SET env = 'staging';
UPDATE post_views        SET env = 'staging';
UPDATE post_notifications SET env = 'staging';
UPDATE admin_users       SET env = 'staging';

-- Composite indexes for slug-scoped tables
CREATE INDEX idx_comments_env_post_slug      ON comments(env, post_slug);
CREATE INDEX idx_post_claps_env_post_slug    ON post_claps(env, post_slug);
CREATE INDEX idx_clap_votes_env_post_slug    ON clap_votes(env, post_slug);
CREATE INDEX idx_post_views_env_post_slug    ON post_views(env, post_slug);
CREATE INDEX idx_post_notifications_env_slug ON post_notifications(env, post_slug);

-- Simple indexes for non-slug tables
CREATE INDEX idx_subscribers_env  ON subscribers(env);
CREATE INDEX idx_admin_users_env  ON admin_users(env);
```

- [ ] **Step 2: Apply migration to local Supabase**

```bash
npx supabase db push
```

Expected: migration applies cleanly with no errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260511000001_add_env_column.sql
git commit -m "feat: add env column to all tables with staging backfill"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `packages/db/src/types.ts`

- [ ] **Step 1: Add `env` to all 7 table Row/Insert/Update types**

Open `packages/db/src/types.ts`. For each table, add the `env` field as shown below.

For `comments`:
```typescript
Row: {
  anon_name: string | null;
  body: string;
  created_at: string;
  env: string;          // ← add
  id: string;
  parent_id: string | null;
  post_slug: string;
};
Insert: {
  anon_name?: string | null;
  body: string;
  created_at?: string;
  env?: string;         // ← add (optional; DB default is 'staging')
  id?: string;
  parent_id?: string | null;
  post_slug: string;
};
Update: {
  anon_name?: string | null;
  body?: string;
  created_at?: string;
  env?: string;         // ← add
  id?: string;
  parent_id?: string | null;
  post_slug?: string;
};
```

For `clap_votes`:
```typescript
Row: {
  created_at: string;
  env: string;          // ← add
  ip_hash: string;
  post_slug: string;
};
Insert: {
  created_at?: string;
  env?: string;         // ← add
  ip_hash: string;
  post_slug: string;
};
Update: {
  created_at?: string;
  env?: string;         // ← add
  ip_hash?: string;
  post_slug?: string;
};
```

For `post_claps`:
```typescript
Row: {
  count: number;
  created_at: string;
  env: string;          // ← add
  post_slug: string;
};
Insert: {
  count?: number;
  created_at?: string;
  env?: string;         // ← add
  post_slug: string;
};
Update: {
  count?: number;
  created_at?: string;
  env?: string;         // ← add
  post_slug?: string;
};
```

For `subscribers`:
```typescript
Row: {
  email: string;
  env: string;          // ← add
  id: string;
  subscribed_at: string;
};
Insert: {
  email: string;
  env?: string;         // ← add
  id?: string;
  subscribed_at?: string;
};
Update: {
  email?: string;
  env?: string;         // ← add
  id?: string;
  subscribed_at?: string;
};
```

For `post_views`:
```typescript
Row: {
  count: number;
  env: string;          // ← add
  post_slug: string;
};
Insert: {
  count?: number;
  env?: string;         // ← add
  post_slug: string;
};
Update: {
  count?: number;
  env?: string;         // ← add
  post_slug?: string;
};
```

For `post_notifications`:
```typescript
Row: {
  env: string;          // ← add
  notified_at: string;
  post_slug: string;
};
Insert: {
  env?: string;         // ← add
  notified_at?: string;
  post_slug: string;
};
Update: {
  env?: string;         // ← add
  notified_at?: string;
  post_slug?: string;
};
```

For `admin_users`:
```typescript
Row: {
  created_at: string;
  email: string;
  env: string;          // ← add
  id: string;
  password_hash: string;
  role: string;
};
Insert: {
  created_at?: string;
  email: string;
  env?: string;         // ← add
  id?: string;
  password_hash: string;
  role?: string;
};
Update: {
  created_at?: string;
  email?: string;
  env?: string;         // ← add
  id?: string;
  password_hash?: string;
  role?: string;
};
```

- [ ] **Step 2: Verify types compile**

```bash
cd packages/db && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/types.ts
git commit -m "feat: add env field to all DB type definitions"
```

---

## Task 3: Env Helpers + Config

**Files:**
- Modify: `apps/client/src/lib/api.ts`
- Modify: `apps/client/src/env.d.ts`
- Modify: `apps/client/.env.example`
- Create: `apps/admin/src/lib/env.ts`
- Modify: `apps/admin/src/env.d.ts`
- Modify: `apps/admin/.env.example`

- [ ] **Step 1: Add `getAppEnv()` to client lib/api.ts**

Add the following function at the end of `apps/client/src/lib/api.ts`:

```typescript
export function getAppEnv(runtimeEnv: RuntimeEnv): 'staging' | 'live' {
  const val = runtimeEnv.APP_ENV ?? import.meta.env.APP_ENV;
  return val === 'live' ? 'live' : 'staging';
}
```

- [ ] **Step 2: Add APP_ENV to client env.d.ts**

`apps/client/src/env.d.ts` currently only has `/// <reference types="@cloudflare/workers-types" />`.

Replace the entire file with:

```typescript
/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  APP_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  RESEND_API_KEY: string;
  UNSUBSCRIBE_SECRET: string;
  CRON_SECRET: string;
}
```

- [ ] **Step 3: Add APP_ENV to client .env.example**

Add after the first line in `apps/client/.env.example`:

```
# Environment tag — controls which dataset this instance reads/writes
APP_ENV=staging
```

- [ ] **Step 4: Create admin env helper**

Create `apps/admin/src/lib/env.ts`:

```typescript
export function getAppEnv(): 'staging' | 'live' {
  // env is the cloudflare:workers runtime binding resolved at call site
  // Import it here so admin API routes can call getAppEnv() without boilerplate
  const { env } = require('cloudflare:workers') as {
    env: Record<string, string | undefined>;
  };
  const val = env.APP_ENV ?? import.meta.env.APP_ENV;
  return val === 'live' ? 'live' : 'staging';
}
```

Wait — `require` is not available in ESM. Use a different approach. The admin files already import `env` from `cloudflare:workers` at the top level. So instead, export the helper as a function that receives the env:

```typescript
export function getAppEnv(runtimeEnv: Record<string, string | undefined>): 'staging' | 'live' {
  const val = runtimeEnv.APP_ENV ?? import.meta.env.APP_ENV;
  return val === 'live' ? 'live' : 'staging';
}
```

- [ ] **Step 5: Add APP_ENV to admin env.d.ts**

`apps/admin/src/env.d.ts` currently declares `CloudflareEnv` with `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Add `APP_ENV`:

```typescript
/// <reference types="@cloudflare/workers-types" />

declare namespace App {
  interface Locals {
    admin?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

interface CloudflareEnv {
  APP_ENV: string;
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}
```

- [ ] **Step 6: Add APP_ENV to admin .env.example**

Add after the first line in `apps/admin/.env.example`:

```
# Environment tag — controls which dataset this instance reads/writes
APP_ENV=staging
```

- [ ] **Step 7: Verify client compiles**

```bash
cd apps/client && npx astro check
```

Expected: no type errors.

- [ ] **Step 8: Commit**

```bash
git add apps/client/src/lib/api.ts apps/client/src/env.d.ts apps/client/.env.example \
        apps/admin/src/lib/env.ts apps/admin/src/env.d.ts apps/admin/.env.example
git commit -m "feat: add getAppEnv() helper and APP_ENV config to both apps"
```

---

## Task 4: Client API Routes

**Files:**
- Modify: `apps/client/src/pages/api/comments/[slug].ts`
- Modify: `apps/client/src/pages/api/claps/[slug].ts`
- Modify: `apps/client/src/pages/api/views/[slug].ts`
- Modify: `apps/client/src/pages/api/newsletter.ts`

- [ ] **Step 1: Update comments/[slug].ts**

Replace the entire file:

```typescript
import type { APIRoute } from "astro";

import { getAppEnv, getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("env", appEnv)
    .eq("post_slug", slug!)
    .order("created_at", { ascending: true });

  if (error) return jsonResponse({ error: error.message }, 500);

  const rows = data ?? [];
  const topLevel = rows.filter((r) => r.parent_id === null);
  const nested = topLevel.map((comment) => ({
    ...comment,
    replies: rows.filter((r) => r.parent_id === comment.id),
  }));

  return jsonResponse(nested);
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let body: { body?: string; parent_id?: string; anon_name?: string };
  try {
    body = (await request.json()) as {
      body?: string;
      parent_id?: string;
      anon_name?: string;
    };
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (!body.body?.trim()) {
    return jsonResponse({ error: "Comment body is required" }, 400);
  }

  const insert = {
    env: appEnv,
    post_slug: slug!,
    body: body.body.trim(),
    parent_id: body.parent_id ?? null,
    anon_name: body.anon_name ?? null,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(insert)
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse(data, 201);
};
```

- [ ] **Step 2: Update claps/[slug].ts**

The file is longer — locate these two query blocks and update:

In GET, add `.eq("env", appEnv)` to both parallel queries:

```typescript
export const GET: APIRoute = async ({ params, request, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  // ... (getSupabaseClient call unchanged) ...
  const hash = await hashIp(request);

  const [clapsResult, voteResult] = await Promise.all([
    supabase
      .from("post_claps")
      .select("count")
      .eq("env", appEnv)
      .eq("post_slug", slug!)
      .maybeSingle(),
    supabase
      .from("clap_votes")
      .select("ip_hash")
      .eq("env", appEnv)
      .eq("post_slug", slug!)
      .eq("ip_hash", hash)
      .maybeSingle(),
  ]);
  // ... rest unchanged ...
};
```

In POST, add `env: appEnv` to both upsert payloads. Read the full file first to get the exact upsert calls, then add `env: appEnv` as the first key in each object:

```typescript
// post_claps upsert — add env:
await supabase
  .from("post_claps")
  .upsert({ env: appEnv, post_slug: slug!, count: newCount });

// clap_votes insert — add env:
await supabase
  .from("clap_votes")
  .insert({ env: appEnv, post_slug: slug!, ip_hash: hash });
```

Also add `getAppEnv` to the import from `@/lib/api` and call `const appEnv = getAppEnv(runtimeEnv);` at the top of both GET and POST handlers.

- [ ] **Step 3: Update views/[slug].ts**

Replace the entire file:

```typescript
import type { APIRoute } from "astro";

import { getAppEnv, getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("post_views")
    .select("count")
    .eq("env", appEnv)
    .eq("post_slug", slug!)
    .maybeSingle();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ count: data?.count ?? 0 });
};

export const POST: APIRoute = async ({ params, locals }) => {
  const { slug } = params;
  const runtimeEnv = getRuntimeEnv(locals);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase
    .from("post_views")
    .select("count")
    .eq("env", appEnv)
    .eq("post_slug", slug!)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;

  const { error } = await supabase
    .from("post_views")
    .upsert({ env: appEnv, post_slug: slug!, count: newCount });

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ count: newCount });
};
```

- [ ] **Step 4: Update newsletter.ts**

Find the `supabase.from("subscribers").insert(...)` call and add `env: appEnv`:

```typescript
// At the top of the POST handler, after getting the supabase client:
const runtimeEnv = getRuntimeEnv(locals);
const appEnv = getAppEnv(runtimeEnv);

// Then on the insert call:
const { data, error } = await supabase
  .from("subscribers")
  .insert({ env: appEnv, email })
  .select()
  .single();
```

Also add `getAppEnv` to the import from `@/lib/api`.

- [ ] **Step 5: Run client type check**

```bash
cd apps/client && npx astro check
```

Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/pages/api/comments/ \
        apps/client/src/pages/api/claps/ \
        apps/client/src/pages/api/views/ \
        apps/client/src/pages/api/newsletter.ts
git commit -m "feat: filter client API queries and inserts by APP_ENV"
```

---

## Task 5: Admin API Routes — Comments, Claps, Subscribers

**Files:**
- Modify: `apps/admin/src/pages/api/comments/index.ts`
- Modify: `apps/admin/src/pages/api/comments/[id].ts`
- Modify: `apps/admin/src/pages/api/claps/index.ts`
- Modify: `apps/admin/src/pages/api/claps/[slug].ts`
- Modify: `apps/admin/src/pages/api/subscribers/index.ts`

The pattern for all admin files is:
1. Add `import { getAppEnv } from "@/lib/env";` at the top.
2. In each handler: `const appEnv = getAppEnv(env as unknown as Record<string, string | undefined>);`
3. Append `.eq("env", appEnv)` to every SELECT / UPDATE / DELETE query.
4. Add `env: appEnv` to every INSERT / upsert payload.

- [ ] **Step 1: Update comments/index.ts**

```typescript
import { getAppEnv } from "@/lib/env";
import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async () => {
  const appEnv = getAppEnv(runtimeEnv);
  const { data, error } = await getClient()
    .from("comments")
    .select("*")
    .eq("env", appEnv)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  const appEnv = getAppEnv(runtimeEnv);
  const { post_slug, body, anon_name, parent_id } = (await request.json()) as {
    post_slug?: string;
    body?: string;
    anon_name?: string;
    parent_id?: string;
  };
  if (!post_slug?.trim() || !body?.trim())
    return json({ error: "post_slug and body are required" }, 400);

  const { data, error } = await getClient()
    .from("comments")
    .insert({ env: appEnv, post_slug: post_slug.trim(), body: body.trim(), anon_name: anon_name ?? null, parent_id: parent_id ?? null })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
```

- [ ] **Step 2: Update comments/[id].ts**

Add import and env filter to both PATCH and DELETE. PATCH needs `.eq("env", appEnv)` before `.eq("id", id!)`. DELETE needs `.eq("env", appEnv)` before `.eq("id", id!)`.

```typescript
import { getAppEnv } from "@/lib/env";
import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const appEnv = getAppEnv(runtimeEnv);
  const payload = (await request.json()) as { body?: string };
  const body = payload.body?.trim();
  if (!body) return json({ error: "body is required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("env", appEnv)
    .eq("id", id!)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("env", appEnv)
    .eq("id", id!);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
```

- [ ] **Step 3: Update claps/index.ts**

Read the full `apps/admin/src/pages/api/claps/index.ts`. Add `import { getAppEnv } from "@/lib/env";` at the top. Add `const runtimeEnv = env as unknown as Record<string, string | undefined>;` at module level (same pattern as other admin files). Call `const appEnv = getAppEnv(runtimeEnv);` at the top of each handler. Append `.eq("env", appEnv)` to the GET query. Add `env: appEnv` to the POST insert payload.

- [ ] **Step 4: Update claps/[slug].ts**

```typescript
import { getAppEnv } from "@/lib/env";
import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const PUT: APIRoute = async ({ params, request }) => {
  const slug = decodeURIComponent(params.slug!);
  const appEnv = getAppEnv(runtimeEnv);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const count = typeof body.count === "number" ? body.count : 0;

  const supabase = getClient();
  const { error } = await supabase
    .from("post_claps")
    .update({ count })
    .eq("env", appEnv)
    .eq("post_slug", slug);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};

export const DELETE: APIRoute = async ({ params }) => {
  const slug = decodeURIComponent(params.slug!);
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getClient();

  const { error } = await supabase
    .from("post_claps")
    .delete()
    .eq("env", appEnv)
    .eq("post_slug", slug);

  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
```

- [ ] **Step 5: Update subscribers/index.ts**

```typescript
import { getAppEnv } from "@/lib/env";
import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async () => {
  const appEnv = getAppEnv(runtimeEnv);
  const { data, error } = await getClient()
    .from("subscribers")
    .select("*")
    .eq("env", appEnv)
    .order("subscribed_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  const appEnv = getAppEnv(runtimeEnv);
  const { email } = (await request.json()) as { email?: string };
  if (!email?.trim()) return json({ error: "email is required" }, 400);

  const supabase = getClient();
  const { data, error } = await supabase
    .from("subscribers")
    .insert({ env: appEnv, email: email.trim() })
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);
  return json(data, 201);
};
```

- [ ] **Step 6: Run admin type check**

```bash
cd apps/admin && npx astro check
```

Expected: no type errors.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/pages/api/comments/ \
        apps/admin/src/pages/api/claps/ \
        apps/admin/src/pages/api/subscribers/
git commit -m "feat: filter admin comments/claps/subscribers queries by APP_ENV"
```

---

## Task 6: Admin API Routes — Auth, Admin Users, Notify, Purge

**Files:**
- Modify: `apps/admin/src/pages/api/admin-users/index.ts`
- Modify: `apps/admin/src/pages/api/admin-users/[id].ts`
- Modify: `apps/admin/src/pages/api/auth/login.ts`
- Modify: `apps/admin/src/pages/api/notify-subscribers.ts`
- Modify: `apps/admin/src/pages/api/purge-test-data.ts`

- [ ] **Step 1: Update admin-users/index.ts**

Add `import { getAppEnv } from "@/lib/env";`. In GET: add `.eq("env", appEnv)` before `.order(...)`. In POST: add `env: appEnv` to the `.insert({ email, password_hash, role })` call.

```typescript
// GET handler:
export const GET: APIRoute = async () => {
  const appEnv = getAppEnv(runtimeEnv);
  const { data, error } = await getClient()
    .from("admin_users")
    .select("id, email, role, created_at")
    .eq("env", appEnv)
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

// POST handler insert — add env:
const { data, error } = await getClient()
  .from("admin_users")
  .insert({ env: appEnv, email, password_hash, role })
  .select("id, email, role, created_at")
  .single();
```

- [ ] **Step 2: Update admin-users/[id].ts**

Add `import { getAppEnv } from "@/lib/env";`. The `runtimeEnv` variable at the top of that file doesn't exist yet — add it as done in other files. Then in PATCH and DELETE, add `.eq("env", appEnv)` before `.eq("id", id!)`.

The count guard in DELETE also needs env filter:

```typescript
const { count } = await supabase
  .from("admin_users")
  .select("id", { count: "exact", head: true })
  .eq("env", appEnv);
```

- [ ] **Step 3: Update auth/login.ts**

Find the `supabase.from("admin_users").select(...)` query and add `.eq("env", appEnv)`:

```typescript
const appEnv = getAppEnv(runtimeEnv);

const { data: user } = await supabase
  .from("admin_users")
  .select("id, email, role, password_hash")
  .eq("env", appEnv)
  .eq("email", email)
  .maybeSingle();
```

Add `import { getAppEnv } from "@/lib/env";` at the top. The `runtimeEnv` binding already exists in that file as a local variable — use it.

- [ ] **Step 4: Update notify-subscribers.ts**

Find the subscribers query and add `.eq("env", appEnv)`:

```typescript
const appEnv = getAppEnv(runtimeEnv);

const { data: subscribers, error } = await supabase
  .from("subscribers")
  .select("email")
  .eq("env", appEnv);
```

Add `import { getAppEnv } from "@/lib/env";` and set up `runtimeEnv` the same way as other admin files.

- [ ] **Step 5: Update purge-test-data.ts**

Replace the entire file so every delete is scoped to the current env:

```typescript
import { getAppEnv } from "@/lib/env";
import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const runtimeEnv = env as unknown as Record<string, string | undefined>;

function getClient() {
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const DELETE: APIRoute = async () => {
  const appEnv = getAppEnv(runtimeEnv);
  const supabase = getClient();

  const [comments, clapVotes, postClaps, postViews, subscribers] =
    await Promise.all([
      supabase
        .from("comments")
        .delete()
        .eq("env", appEnv)
        .neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("clap_votes").delete().eq("env", appEnv).neq("post_slug", ""),
      supabase.from("post_claps").delete().eq("env", appEnv).neq("post_slug", ""),
      supabase.from("post_views").delete().eq("env", appEnv).neq("post_slug", ""),
      supabase
        .from("subscribers")
        .delete()
        .eq("env", appEnv)
        .neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);

  const errors = [comments, clapVotes, postClaps, postViews, subscribers]
    .map((r) => r.error?.message)
    .filter(Boolean);

  if (errors.length > 0) return json({ error: errors.join("; ") }, 500);

  return json({ ok: true });
};
```

- [ ] **Step 6: Run admin type check**

```bash
cd apps/admin && npx astro check
```

Expected: no type errors.

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/pages/api/admin-users/ \
        apps/admin/src/pages/api/auth/ \
        apps/admin/src/pages/api/notify-subscribers.ts \
        apps/admin/src/pages/api/purge-test-data.ts
git commit -m "feat: filter admin-users/auth/notify/purge by APP_ENV"
```

---

## Task 7: Full Build Verification

- [ ] **Step 1: Build both apps**

```bash
pnpm build
```

Expected: both apps build successfully with no TypeScript or Astro errors.

- [ ] **Step 2: Run client e2e tests (optional — requires dev server + real DB)**

If a local Supabase instance is running with the migration applied:

```bash
cd apps/client && pnpm test
```

Expected: all existing tests pass (they insert with `env` now set from `APP_ENV`, which defaults to `'staging'`, so data is correctly isolated).

- [ ] **Step 3: Final commit if any stray changes**

```bash
git status
# If clean, nothing to do. If there are stray formatting changes from lint-staged:
git add -A
git commit -m "chore: post-build formatting fixes"
```

---

## Deployment Checklist

Before deploying to production, do these in order:

1. **Apply migration to remote Supabase:** `npx supabase db push --linked`
2. **Set `APP_ENV=live`** in Cloudflare Workers secrets for the **production** (live) deployments of both client and admin.
3. **Set `APP_ENV=staging`** (or leave unset, defaults to `staging`) for preview/staging deployments.
4. **Verify:** hit a live API route and confirm returned rows have `env: "live"`.
