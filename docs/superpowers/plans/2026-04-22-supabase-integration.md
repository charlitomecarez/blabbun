# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mock/localStorage data in Comments, Claps, and Newsletter with real Supabase persistence; add server-side API routes; add admin views for comments and subscribers.

**Architecture:** A new `@blabbun/db` package provides the typed Supabase client. Both apps switch to `@astrojs/vercel` for SSR/hybrid rendering so the service role key never reaches the browser. Svelte components call Astro API routes; the API routes call Supabase with the service role key.

**Tech Stack:** Astro 6, Svelte 5, `@supabase/supabase-js` v2, `@astrojs/vercel`, pnpm workspaces, Playwright (e2e tests)

---

### Task 1: Create `packages/db` — shared Supabase client + types

**Files:**

- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/types.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/index.ts`
- Modify: `apps/client/package.json`
- Modify: `apps/admin/package.json`

- [ ] **Step 1: Create `packages/db/package.json`**

```json
{
  "name": "@blabbun/db",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0"
  }
}
```

- [ ] **Step 2: Create `packages/db/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 3: Create `packages/db/src/types.ts`**

```typescript
export interface CommentRow {
  id: string;
  post_slug: string;
  body: string;
  created_at: string;
  parent_id: string | null;
}

export interface PostClapRow {
  post_slug: string;
  count: number;
}

export interface SubscriberRow {
  id: string;
  email: string;
  subscribed_at: string;
}

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CommentRow>;
      };
      post_claps: {
        Row: PostClapRow;
        Insert: { post_slug: string; count?: number };
        Update: { count?: number };
      };
      subscribers: {
        Row: SubscriberRow;
        Insert: Omit<SubscriberRow, "id" | "subscribed_at"> & {
          id?: string;
          subscribed_at?: string;
        };
        Update: Partial<SubscriberRow>;
      };
    };
  };
}
```

- [ ] **Step 4: Create `packages/db/src/client.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.js";

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key);
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
```

- [ ] **Step 5: Create `packages/db/src/index.ts`**

```typescript
export { createSupabaseClient } from "./client.js";
export type { SupabaseClient } from "./client.js";
export type {
  Database,
  CommentRow,
  PostClapRow,
  SubscriberRow,
} from "./types.js";
```

- [ ] **Step 6: Add `@blabbun/db` to `apps/client/package.json`**

In the `"dependencies"` object, add:

```json
"@blabbun/db": "workspace:*"
```

- [ ] **Step 7: Add `@blabbun/db` to `apps/admin/package.json`**

In the `"dependencies"` object, add:

```json
"@blabbun/db": "workspace:*"
```

- [ ] **Step 8: Install the workspace**

Run from repo root:

```bash
pnpm install
```

Expected: no errors; `@blabbun/db` appears in lockfile.

- [ ] **Step 9: Commit**

```bash
git add packages/db apps/client/package.json apps/admin/package.json pnpm-lock.yaml
git commit -m "feat: add @blabbun/db package with typed Supabase client"
```

---

### Task 2: Enable hybrid rendering in `apps/client`

**Files:**

- Modify: `apps/client/astro.config.mjs`
- Modify: `apps/client/package.json`
- Create: `apps/client/.env.example`

- [ ] **Step 1: Install `@astrojs/vercel` in client**

```bash
pnpm --filter @blabbun/client add @astrojs/vercel
```

Expected: `@astrojs/vercel` appears in `apps/client/package.json` dependencies.

- [ ] **Step 2: Update `apps/client/astro.config.mjs`**

Replace the entire file with:

```javascript
// @ts-check
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blabbun.com",
  output: "hybrid",
  adapter: vercel(),
  integrations: [svelte(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `apps/client/.env.example`**

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 4: Verify `.env` is in `.gitignore`**

Run:

```bash
grep -n "\.env" /path/to/.gitignore || echo "MISSING — add .env"
```

If missing, add `.env` to the root `.gitignore`.

- [ ] **Step 5: Verify build still passes**

```bash
pnpm --filter @blabbun/client build
```

Expected: build completes with no TypeScript errors. (Without real env vars, API routes won't work at runtime, but the build itself should succeed.)

- [ ] **Step 6: Commit**

```bash
git add apps/client/astro.config.mjs apps/client/package.json apps/client/.env.example pnpm-lock.yaml
git commit -m "feat: enable hybrid rendering in client app via @astrojs/vercel"
```

---

### Task 3: Enable SSR in `apps/admin`

**Files:**

- Modify: `apps/admin/astro.config.mjs`
- Modify: `apps/admin/package.json`
- Create: `apps/admin/.env.example`

- [ ] **Step 1: Install `@astrojs/vercel` in admin**

```bash
pnpm --filter @blabbun/admin add @astrojs/vercel
```

- [ ] **Step 2: Update `apps/admin/astro.config.mjs`**

Replace the entire file with:

```javascript
// @ts-check
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `apps/admin/.env.example`**

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

- [ ] **Step 4: Verify admin build passes**

```bash
pnpm --filter @blabbun/admin build
```

Expected: build completes; `apps/admin/dist/` is generated.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/astro.config.mjs apps/admin/package.json apps/admin/.env.example pnpm-lock.yaml
git commit -m "feat: enable SSR in admin app via @astrojs/vercel"
```

---

### Task 4: Database schema

**Files:**

- Create: `supabase/migrations/20260422000000_initial_schema.sql`

> **NOTE:** Run this SQL in the Supabase project's SQL editor (dashboard → SQL Editor → New query). No migration runner is configured yet.

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260422000000_initial_schema.sql`:

```sql
-- Anonymous blog comments with nested replies
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  body TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_slug ON comments(post_slug);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Per-post aggregate clap counter
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

- [ ] **Step 2: Run the migration in Supabase**

Open your Supabase project dashboard → SQL Editor → paste the contents of the migration file → Run.

Expected: three tables created with no errors.

- [ ] **Step 3: Commit the migration file**

```bash
git add supabase/
git commit -m "feat: add initial Supabase schema (comments, post_claps, subscribers)"
```

---

### Task 5: Comments API routes

**Files:**

- Create: `apps/client/src/pages/api/comments/[slug].ts`
- Create: `apps/client/tests/e2e/api-comments.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/client/tests/e2e/api-comments.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";

test.describe("comments API", () => {
  const testSlug = `test-post-${Date.now()}`;

  test("GET returns empty array for unknown slug", async ({ request }) => {
    const res = await request.get(`/api/comments/${testSlug}-unknown`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("POST creates a top-level comment", async ({ request }) => {
    const res = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "Playwright test comment" },
    });
    expect(res.status()).toBe(201);
    const comment = await res.json();
    expect(comment.body).toBe("Playwright test comment");
    expect(comment.post_slug).toBe(testSlug);
    expect(comment.parent_id).toBeNull();
    expect(typeof comment.id).toBe("string");
  });

  test("POST creates a reply with parent_id", async ({ request }) => {
    const parentRes = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "Parent comment" },
    });
    const parent = await parentRes.json();

    const replyRes = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "Reply to parent", parent_id: parent.id },
    });
    expect(replyRes.status()).toBe(201);
    const reply = await replyRes.json();
    expect(reply.parent_id).toBe(parent.id);
  });

  test("GET returns the tree with nested replies", async ({ request }) => {
    const res = await request.get(`/api/comments/${testSlug}`);
    const tree = await res.json();
    const withReplies = tree.find(
      (c: { body: string; replies: unknown[] }) => c.body === "Parent comment"
    );
    expect(withReplies).toBeDefined();
    expect(withReplies.replies.length).toBeGreaterThan(0);
  });

  test("POST 400 when body is empty", async ({ request }) => {
    const res = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "   " },
    });
    expect(res.status()).toBe(400);
    const err = await res.json();
    expect(err.error).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails with 404**

```bash
cd apps/client && pnpm test -- api-comments --reporter=line
```

Expected: all 5 tests fail — endpoint does not exist yet.

- [ ] **Step 3: Create `apps/client/src/pages/api/comments/[slug].ts`**

```typescript
import type { APIRoute } from "astro";
import { createSupabaseClient } from "@blabbun/db";
import type { CommentRow } from "@blabbun/db";

export const prerender = false;

function getClient() {
  return createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const supabase = getClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_slug", slug!)
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);

  const rows = data ?? [];
  const topLevel = rows.filter((c) => c.parent_id === null);
  const replies = rows.filter((c) => c.parent_id !== null);

  const tree = topLevel.map((comment) => ({
    ...comment,
    replies: replies
      .filter((r) => r.parent_id === comment.id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
  }));

  return json(tree);
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;
  const body = (await request.json()) as { body?: string; parent_id?: string };

  if (!body.body?.trim()) {
    return json({ error: "Comment body is required" }, 400);
  }

  const insert: Partial<CommentRow> = {
    post_slug: slug!,
    body: body.body.trim(),
    parent_id: body.parent_id ?? null,
  };

  const supabase = getClient();
  const { data, error } = await supabase
    .from("comments")
    .insert(insert)
    .select()
    .single();

  if (error) return json({ error: error.message }, 500);

  return json(data, 201);
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/client && pnpm test -- api-comments --reporter=line
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/pages/api/comments apps/client/tests/e2e/api-comments.spec.ts
git commit -m "feat: add comments API route (GET + POST)"
```

---

### Task 6: Update `Comments.svelte` and local types

**Files:**

- Modify: `apps/client/src/components/post/types.ts`
- Modify: `apps/client/src/components/post/CommentItem.svelte`
- Modify: `apps/client/src/components/post/Comments.svelte`

- [ ] **Step 1: Update `apps/client/src/components/post/types.ts`**

Replace the file with:

```typescript
export interface Reply {
  id: string;
  body: string;
  created_at: string;
  parent_id: string;
}

export interface Comment {
  id: string;
  body: string;
  created_at: string;
  parent_id: null;
  replies: Reply[];
}
```

- [ ] **Step 2: Update `CommentItem.svelte` — rename `createdAt` → `created_at`**

In `apps/client/src/components/post/CommentItem.svelte`, replace both `comment.createdAt` references with `comment.created_at` and both `reply.createdAt` references with `reply.created_at`:

Line 38 — change:

```svelte
<span class="font-manrope text-[11px] text-[rgba(41,48,45,0.4)]"
  >{relativeTime(comment.createdAt)}</span
>
```

To:

```svelte
<span class="font-manrope text-[11px] text-[rgba(41,48,45,0.4)]"
  >{relativeTime(comment.created_at)}</span
>
```

Line 69 — change:

```svelte
<span class="font-manrope text-[11px] text-[rgba(41,48,45,0.4)]"
  >{relativeTime(reply.createdAt)}</span
>
```

To:

```svelte
<span class="font-manrope text-[11px] text-[rgba(41,48,45,0.4)]"
  >{relativeTime(reply.created_at)}</span
>
```

- [ ] **Step 3: Replace `Comments.svelte` with the API-backed version**

Replace `apps/client/src/components/post/Comments.svelte` with:

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import type { Comment } from "./types";
  import CommentItem from "./CommentItem.svelte";

  interface Props {
    postSlug: string;
  }

  const { postSlug }: Props = $props();

  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const COMMENTS_PER_PAGE = 5;
  let visibleCount = $state(COMMENTS_PER_PAGE);

  const visibleComments = $derived(comments.slice(0, visibleCount));
  const hasMore = $derived(visibleCount < comments.length);

  let activeReplyId = $state<string | null>(null);
  let newCommentBody = $state("");
  let submitting = $state(false);

  onMount(async () => {
    try {
      const res = await fetch(`/api/comments/${postSlug}`);
      if (!res.ok) throw new Error("Failed to load comments");
      comments = await res.json();
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      loading = false;
    }
  });

  async function addComment() {
    if (!newCommentBody.trim() || submitting) return;
    submitting = true;
    try {
      const res = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newCommentBody.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const created = await res.json();
      comments = [{ ...created, replies: [] }, ...comments];
      newCommentBody = "";
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      submitting = false;
    }
  }

  async function addReply(commentId: string, body: string) {
    try {
      const res = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parent_id: commentId }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      const created = await res.json();
      comments = comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, created] } : c
      );
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error";
    }
    activeReplyId = null;
  }

  function handleReplyToggle(id: string | null) {
    activeReplyId = id;
  }

  function loadMore() {
    visibleCount += COMMENTS_PER_PAGE;
  }
</script>

<div
  class="mx-auto max-w-[760px] border-t-2 border-[#c5f7d0] px-4 pt-10 pb-12 md:px-8"
>
  <p
    class="font-manrope mb-6 text-[11px] font-bold tracking-[0.2em] text-[rgba(41,48,45,0.5)] uppercase"
  >
    {#if loading}
      Loading comments…
    {:else}
      {comments.length} Comment{comments.length === 1 ? "" : "s"}
    {/if}
  </p>

  {#if error}
    <p class="font-manrope mb-4 text-[14px] text-red-500">{error}</p>
  {/if}

  {#if !loading && comments.length > 0}
    <div class="space-y-6">
      {#each visibleComments as comment, i (comment.id)}
        <div>
          <CommentItem
            {comment}
            {activeReplyId}
            onReplyToggle={handleReplyToggle}
            onReplySubmit={addReply}
          />
          {#if i < visibleComments.length - 1}
            <div class="mt-6 border-t border-[rgba(197,247,208,0.4)]"></div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if hasMore}
    <div class="mt-6 flex justify-center">
      <button
        type="button"
        onclick={loadMore}
        class="font-manrope cursor-pointer rounded-full border border-[#c5f7d0] bg-transparent px-5 py-2 text-[13px] font-bold text-[#386547] transition-colors hover:bg-[#ebf3ed]"
      >
        Load more ({comments.length - visibleCount} remaining)
      </button>
    </div>
  {/if}

  <!-- Leave a comment form -->
  <div class="mt-8 border-t border-[rgba(197,247,208,0.4)] pt-6">
    <p
      class="font-manrope mb-3 text-[11px] font-bold tracking-[0.12em] text-[rgba(41,48,45,0.5)] uppercase"
    >
      Leave a comment
    </p>
    <textarea
      bind:value={newCommentBody}
      placeholder="What's on your mind?"
      aria-label="Comment text"
      rows="4"
      class="font-manrope w-full resize-none rounded-[8px] border-[1.5px] border-[rgba(197,247,208,0.8)] bg-white px-3.5 py-3 text-[15px] text-[#29302d] placeholder-[rgba(41,48,45,0.35)] outline-none focus:border-[#386547]"
    ></textarea>
    <div class="mt-2.5">
      <button
        type="button"
        onclick={addComment}
        disabled={!newCommentBody.trim() || submitting}
        class="font-manrope cursor-pointer rounded-full bg-[#386547] px-5 py-2 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Posting…" : "Post comment"}
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Run TypeScript check**

```bash
pnpm --filter @blabbun/client exec astro check
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/components/post/
git commit -m "feat: connect Comments component to Supabase via API route"
```

---

### Task 7: Claps API route

**Files:**

- Create: `apps/client/src/pages/api/claps/[slug].ts`
- Create: `apps/client/tests/e2e/api-claps.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/client/tests/e2e/api-claps.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";

test.describe("claps API", () => {
  const testSlug = `clap-post-${Date.now()}`;

  test("GET returns 0 for unknown slug", async ({ request }) => {
    const res = await request.get(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ count: 0 });
  });

  test("POST increments from 0 to 1", async ({ request }) => {
    const res = await request.post(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ count: 1 });
  });

  test("POST increments again to 2", async ({ request }) => {
    const res = await request.post(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ count: 2 });
  });

  test("GET returns current count", async ({ request }) => {
    const res = await request.get(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    const { count } = await res.json();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails with 404**

```bash
cd apps/client && pnpm test -- api-claps --reporter=line
```

Expected: all 4 tests fail.

- [ ] **Step 3: Create `apps/client/src/pages/api/claps/[slug].ts`**

```typescript
import type { APIRoute } from "astro";
import { createSupabaseClient } from "@blabbun/db";

export const prerender = false;

function getClient() {
  return createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  const supabase = getClient();

  const { data, error } = await supabase
    .from("post_claps")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);

  return json({ count: data?.count ?? 0 });
};

export const POST: APIRoute = async ({ params }) => {
  const { slug } = params;
  const supabase = getClient();

  const { data: existing } = await supabase
    .from("post_claps")
    .select("count")
    .eq("post_slug", slug!)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;

  const { data, error } = await supabase
    .from("post_claps")
    .upsert({ post_slug: slug!, count: newCount })
    .select("count")
    .single();

  if (error) return json({ error: error.message }, 500);

  return json({ count: data.count });
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/client && pnpm test -- api-claps --reporter=line
```

Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/pages/api/claps apps/client/tests/e2e/api-claps.spec.ts
git commit -m "feat: add claps API route (GET + POST)"
```

---

### Task 8: Update `ClapShare.svelte`

**Files:**

- Modify: `apps/client/src/components/post/ClapShare.svelte`

- [ ] **Step 1: Replace `ClapShare.svelte` with the API-backed version**

Replace `apps/client/src/components/post/ClapShare.svelte` with:

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    postSlug: string;
    postUrl: string;
    postTitle: string;
  }

  const { postSlug, postUrl, postTitle }: Props = $props();

  // svelte-ignore state_referenced_locally
  const storageKey = `clap_${postSlug}`;

  let count = $state(0);
  let clapped = $state(false);
  let animating = $state(false);
  let copied = $state(false);
  let clapTimer: ReturnType<typeof setTimeout> | undefined;
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(async () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { clapped: boolean };
        clapped = parsed.clapped;
      }
    } catch {
      // localStorage unavailable — ignore
    }

    try {
      const res = await fetch(`/api/claps/${postSlug}`);
      if (res.ok) {
        const data = await res.json();
        count = data.count;
      }
    } catch {
      // network unavailable — show 0
    }

    return () => {
      clearTimeout(clapTimer);
      clearTimeout(copyTimer);
    };
  });

  async function handleClap() {
    const nowClapped = !clapped;
    clapped = nowClapped;
    animating = true;
    clearTimeout(clapTimer);
    clapTimer = setTimeout(() => (animating = false), 200);

    try {
      localStorage.setItem(storageKey, JSON.stringify({ clapped: nowClapped }));
    } catch {
      // ignore
    }

    if (nowClapped) {
      try {
        const res = await fetch(`/api/claps/${postSlug}`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          count = data.count;
        }
      } catch {
        // optimistic UI — keep local increment
        count += 1;
      }
    } else {
      count = Math.max(0, count - 1);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 2000);
    } catch {
      // clipboard not available
    }
  }

  const fbUrl = $derived(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
  );
  const xUrl = $derived(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`
  );
</script>

<div
  class="mx-auto max-w-[760px] border-t-2 border-[#c5f7d0] px-4 pt-10 pb-12 text-center md:px-8"
>
  <!-- Clap button -->
  <button
    type="button"
    onclick={handleClap}
    aria-pressed={clapped}
    aria-label={clapped ? "Remove clap" : "Clap for this post"}
    class="font-manrope mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-none px-6 py-3 text-[15px] font-bold text-[#386547] transition-transform duration-150"
    class:bg-[#c5f7d0]={clapped}
    class:bg-[#ebf3ed]={!clapped}
    class:scale-[1.15]={animating}
    class:scale-100={!animating}
  >
    <span style="font-size:20px;" aria-hidden="true">👏</span>
    <span>Clap · {count}</span>
  </button>

  <!-- Share label -->
  <p
    class="font-manrope mb-3 text-[11px] font-bold tracking-[0.12em] text-[rgba(41,48,45,0.4)] uppercase"
  >
    Share this post
  </p>

  <!-- Share icons -->
  <div class="flex items-center justify-center gap-3">
    <!-- Facebook -->
    <a
      href={fbUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on Facebook"
      class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#ebf3ed] text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
        />
      </svg>
    </a>

    <!-- X / Twitter -->
    <a
      href={xUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on X"
      class="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#ebf3ed] text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    </a>

    <!-- Copy Link -->
    <button
      type="button"
      onclick={copyLink}
      aria-label="Copy link"
      class="font-manrope flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-full border-none bg-[#ebf3ed] px-4 text-[12px] font-bold text-[#386547] transition-colors hover:bg-[#c5f7d0]"
    >
      {#if copied}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg
        >
        Copied!
      {:else}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
          ><path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          /><path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          /></svg
        >
        Copy link
      {/if}
    </button>
  </div>
</div>
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm --filter @blabbun/client exec astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/post/ClapShare.svelte
git commit -m "feat: connect ClapShare to Supabase via API route"
```

---

### Task 9: Newsletter API route

**Files:**

- Create: `apps/client/src/pages/api/newsletter.ts`
- Create: `apps/client/tests/e2e/api-newsletter.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/client/tests/e2e/api-newsletter.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";

test.describe("newsletter API", () => {
  const testEmail = `playwright-${Date.now()}@example.com`;

  test("POST subscribes a valid email", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: testEmail },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  test("POST is idempotent — re-subscribing same email returns 200", async ({
    request,
  }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: testEmail },
    });
    expect(res.status()).toBe(200);
  });

  test("POST 400 for empty email", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "" },
    });
    expect(res.status()).toBe(400);
    const err = await res.json();
    expect(err.error).toBeTruthy();
  });

  test("POST 400 for invalid email format", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "not-an-email" },
    });
    expect(res.status()).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails with 404**

```bash
cd apps/client && pnpm test -- api-newsletter --reporter=line
```

Expected: all 4 tests fail.

- [ ] **Step 3: Create `apps/client/src/pages/api/newsletter.ts`**

```typescript
import type { APIRoute } from "astro";
import { createSupabaseClient } from "@blabbun/db";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: "Invalid email address" }, 400);
  }

  const supabase = createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase
    .from("subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) return json({ error: error.message }, 500);

  return json({ success: true });
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/client && pnpm test -- api-newsletter --reporter=line
```

Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/pages/api/newsletter.ts apps/client/tests/e2e/api-newsletter.spec.ts
git commit -m "feat: add newsletter subscribe API route"
```

---

### Task 10: Update `NewsletterBar.svelte`

**Files:**

- Modify: `apps/client/src/components/home/NewsletterBar.svelte`

- [ ] **Step 1: Replace `NewsletterBar.svelte` with the API-backed version**

Replace `apps/client/src/components/home/NewsletterBar.svelte` with:

```svelte
<script lang="ts">
  import { EmailInput } from "@blabbun/ui/components/inputs";

  let email = $state("");
  let submitted = $state(false);
  let submitting = $state(false);
  let errorMsg = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    submitting = true;
    errorMsg = null;

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        errorMsg = data.error ?? "Something went wrong. Please try again.";
      } else {
        submitted = true;
      }
    } catch {
      errorMsg = "Network error. Please try again.";
    } finally {
      submitting = false;
    }
  }
</script>

<section class="border-y border-[rgba(197,247,208,0.4)] bg-[#ebf3ed]">
  <div
    class="mx-auto grid max-w-[1200px] grid-cols-1 gap-10
           px-4 py-14 md:grid-cols-2 md:gap-16 md:px-8 md:py-16"
  >
    <!-- Col 1: description -->
    <div class="flex flex-col justify-center gap-4">
      <span
        class="font-manrope text-[11px] font-bold tracking-[0.2em]
               text-[rgba(41,48,45,0.4)] uppercase"
      >
        Newsletter
      </span>
      <h2
        class="font-space-grotesk text-[26px] leading-[1.15] font-bold
               tracking-[-0.04em] text-[#29302d] sm:text-[30px] md:text-[34px]"
      >
        Stay in the room.
      </h2>
      <p
        class="font-manrope max-w-[400px] text-[15px] leading-[1.7]
               text-[rgba(41,48,45,0.6)]"
      >
        No strict structure, no fixed niche — just whatever's currently
        occupying space in the head, straight to your inbox.
      </p>
    </div>

    <!-- Col 2: form or confirmation -->
    <div class="flex flex-col justify-center">
      {#if submitted}
        <div class="flex flex-col gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center
                   rounded-full bg-[#c5f7d0]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 9l4.5 4.5L15 5"
                stroke="#386547"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p
            class="font-space-grotesk text-[18px] font-bold
                   tracking-[-0.03em] text-[#29302d]"
          >
            You're in.
          </p>
          <p class="font-manrope text-[14px] text-[rgba(41,48,45,0.55)]">
            Thoughts will find their way to you when there's something worth
            saying.
          </p>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="flex flex-col gap-4">
          <label
            for="newsletter-email"
            class="font-manrope text-[13px] font-medium text-[rgba(41,48,45,0.55)]"
          >
            Your email address
          </label>

          <div
            class="flex items-stretch overflow-hidden rounded-[10px]
                   border border-[rgba(56,101,71,0.2)] bg-white
                   transition-all focus-within:border-[#386547]
                   focus-within:ring-2 focus-within:ring-[rgba(197,247,208,0.5)]"
          >
            <div class="flex-1 px-1">
              <EmailInput
                bind:value={email}
                placeholder="you@example.com"
                required
                class="w-full px-3 py-3 text-[15px] tracking-normal
                       normal-case placeholder:tracking-normal
                       placeholder:text-[rgba(41,48,45,0.5)] placeholder:normal-case"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              class="font-manrope m-1.5 shrink-0 rounded-[7px] bg-[#386547] px-5
                     py-2.5 text-[13px] font-bold text-[#ccffd8]
                     transition-colors hover:bg-[#2d5a3d] disabled:opacity-60"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </div>

          {#if errorMsg}
            <p class="font-manrope text-[13px] text-red-600">{errorMsg}</p>
          {/if}

          <p class="font-manrope text-[12px] text-[rgba(41,48,45,0.4)]">
            No spam. Unsubscribe any time.
          </p>
        </form>
      {/if}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm --filter @blabbun/client exec astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/client/src/components/home/NewsletterBar.svelte
git commit -m "feat: connect NewsletterBar to Supabase via API route"
```

---

### Task 11: Admin delete-comment API route

**Files:**

- Create: `apps/admin/src/pages/api/admin/delete-comment.ts`

- [ ] **Step 1: Create `apps/admin/src/pages/api/admin/delete-comment.ts`**

```typescript
import type { APIRoute } from "astro";
import { createSupabaseClient } from "@blabbun/db";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const id = form.get("id")?.toString();

  if (!id) return redirect("/comments?error=missing-id");

  const supabase = createSupabaseClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error)
    return redirect(`/comments?error=${encodeURIComponent(error.message)}`);

  return redirect("/comments");
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/pages/api/
git commit -m "feat: add admin delete-comment API route"
```

---

### Task 12: Admin comments page

**Files:**

- Modify: `apps/admin/src/pages/index.astro`
- Create: `apps/admin/src/pages/comments.astro`

- [ ] **Step 1: Update admin `index.astro` with navigation links**

Replace `apps/admin/src/pages/index.astro` with:

```astro
---
import Layout from "@/layouts/Layout.astro";
---

<Layout title="Dashboard">
  <h1 class="mb-4 text-2xl font-bold">Dashboard</h1>
  <nav class="flex gap-4">
    <a href="/comments" class="text-blue-600 underline hover:text-blue-800"
      >Comments</a
    >
    <a href="/subscribers" class="text-blue-600 underline hover:text-blue-800"
      >Subscribers</a
    >
  </nav>
</Layout>
```

- [ ] **Step 2: Create `apps/admin/src/pages/comments.astro`**

```astro
---
import { createSupabaseClient } from "@blabbun/db";
import type { CommentRow } from "@blabbun/db";
import Layout from "@/layouts/Layout.astro";

const supabase = createSupabaseClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("comments")
  .select("*")
  .order("created_at", { ascending: false });

const comments: CommentRow[] = data ?? [];
const urlError = Astro.url.searchParams.get("error");
---

<Layout title="Comments">
  <div class="mx-auto max-w-4xl p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Comments ({comments.length})</h1>
      <a href="/" class="text-sm text-gray-500 hover:underline">← Dashboard</a>
    </div>

    {
      urlError && (
        <p class="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
          Error: {urlError}
        </p>
      )
    }

    {
      error && (
        <p class="text-red-600">Failed to load comments: {error.message}</p>
      )
    }

    {
      comments.length === 0 && !error && (
        <p class="text-gray-500">No comments yet.</p>
      )
    }

    <div class="space-y-3">
      {
        comments.map((comment) => (
          <div class="flex items-start justify-between gap-4 rounded border border-gray-200 p-4">
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2 text-xs text-gray-400">
                <span class="font-mono">{comment.post_slug}</span>
                {comment.parent_id && (
                  <span class="rounded bg-yellow-100 px-1 text-yellow-700">
                    reply
                  </span>
                )}
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p class="text-sm text-gray-800">{comment.body}</p>
            </div>
            <form
              method="post"
              action="/api/admin/delete-comment"
              class="shrink-0"
            >
              <input type="hidden" name="id" value={comment.id} />
              <button
                type="submit"
                class="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                onclick="return confirm('Delete this comment?')"
              >
                Delete
              </button>
            </form>
          </div>
        ))
      }
    </div>
  </div>
</Layout>
```

- [ ] **Step 3: Run TypeScript check for admin**

```bash
pnpm --filter @blabbun/admin exec astro check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/pages/
git commit -m "feat: add admin comments page with delete action"
```

---

### Task 13: Admin subscribers page

**Files:**

- Create: `apps/admin/src/pages/subscribers.astro`

- [ ] **Step 1: Create `apps/admin/src/pages/subscribers.astro`**

```astro
---
import { createSupabaseClient } from "@blabbun/db";
import type { SubscriberRow } from "@blabbun/db";
import Layout from "@/layouts/Layout.astro";

const supabase = createSupabaseClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("subscribers")
  .select("*")
  .order("subscribed_at", { ascending: false });

const subscribers: SubscriberRow[] = data ?? [];
---

<Layout title="Subscribers">
  <div class="mx-auto max-w-2xl p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Subscribers ({subscribers.length})</h1>
      <a href="/" class="text-sm text-gray-500 hover:underline">← Dashboard</a>
    </div>

    {
      error && (
        <p class="text-red-600">Failed to load subscribers: {error.message}</p>
      )
    }

    {
      subscribers.length === 0 && !error && (
        <p class="text-gray-500">No subscribers yet.</p>
      )
    }

    <div class="overflow-hidden rounded border border-gray-200">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left font-medium text-gray-600">Email</th>
            <th class="px-4 py-2 text-left font-medium text-gray-600">
              Subscribed
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {
            subscribers.map((s) => (
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-2 text-gray-800">{s.email}</td>
                <td class="px-4 py-2 text-gray-400">
                  {new Date(s.subscribed_at).toLocaleString()}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  </div>
</Layout>
```

- [ ] **Step 2: Run TypeScript check for admin**

```bash
pnpm --filter @blabbun/admin exec astro check
```

Expected: 0 errors.

- [ ] **Step 3: Build both apps to confirm end-to-end**

```bash
pnpm build
```

Expected: both `apps/client` and `apps/admin` build with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/pages/subscribers.astro
git commit -m "feat: add admin subscribers page"
```

---

## Self-Review

### Spec coverage

| Spec requirement                                                 | Implemented in |
| ---------------------------------------------------------------- | -------------- |
| `@blabbun/db` package with typed Supabase client                 | Task 1         |
| Hybrid rendering via `@astrojs/vercel` in client                 | Task 2         |
| SSR via `@astrojs/vercel` in admin                               | Task 3         |
| Database schema (comments, post_claps, subscribers)              | Task 4         |
| `GET /api/comments/[slug]` returning comment tree                | Task 5         |
| `POST /api/comments/[slug]` creating comment/reply               | Task 5         |
| Comments.svelte uses real API, shows loading/error               | Task 6         |
| Comment/Reply types updated to snake_case                        | Task 6         |
| `GET /api/claps/[slug]` returning count                          | Task 7         |
| `POST /api/claps/[slug]` incrementing count                      | Task 7         |
| ClapShare.svelte fetches real count, posts on clap               | Task 8         |
| `POST /api/newsletter` with email validation + idempotent upsert | Task 9         |
| NewsletterBar.svelte posts to API, shows errors                  | Task 10        |
| Admin delete-comment endpoint                                    | Task 11        |
| Admin comments page with delete                                  | Task 12        |
| Admin subscribers page                                           | Task 13        |

### Placeholder scan

No TBD, TODO, or placeholder stubs found.

### Type consistency

- `CommentRow` defined in Task 1 (`packages/db/src/types.ts`) and imported in Tasks 5, 12
- `SubscriberRow` defined in Task 1 and imported in Task 13
- `Comment` interface in `types.ts` (Task 6) uses `created_at` consistently with `CommentRow`; `CommentItem.svelte` updated to match
- `createSupabaseClient` defined in Task 1 and used in Tasks 5, 7, 9, 11, 12, 13 — signature unchanged across all uses
