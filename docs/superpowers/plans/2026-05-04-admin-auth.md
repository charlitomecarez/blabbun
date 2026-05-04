# Admin Auth & Admin Users — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a JWT-based login wall to the admin app and a full CRUD "Admin Users" page backed by a Supabase `admin_users` table.

**Architecture:** Astro middleware (`src/middleware.ts`) verifies a JWT on every non-public request. The JWT is stored as an `httpOnly` cookie. Auth helpers (`src/lib/auth.ts`) wrap `jose` for sign/verify. `bcryptjs` handles password hashing. Admin users live in a new Supabase `admin_users` table.

**Tech Stack:** Astro 6 (SSR, Cloudflare adapter), `jose` (JWT via Web Crypto), `bcryptjs` (password hashing, cost 8 for Cloudflare CPU budget), Vitest (unit tests for auth helpers)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/db/src/types.ts` | Add `admin_users` table type + `AdminUserRow` export |
| Modify | `apps/admin/src/env.d.ts` | Add `App.Locals` interface for `locals.admin` |
| Create | `supabase/migrations/20260504000000_add_admin_users.sql` | Table DDL + default admin seed |
| Create | `apps/admin/src/lib/auth.ts` | `signToken` / `verifyToken` JWT helpers |
| Create | `apps/admin/src/lib/auth.test.ts` | Vitest unit tests for auth helpers |
| Create | `apps/admin/vitest.config.ts` | Vitest config |
| Create | `apps/admin/src/middleware.ts` | Protect all routes except `/login` + `/api/auth/*` |
| Create | `apps/admin/src/pages/login.astro` | Login form page |
| Create | `apps/admin/src/pages/api/auth/login.ts` | `POST`: verify credentials → set JWT cookie |
| Create | `apps/admin/src/pages/api/auth/logout.ts` | `POST`: clear cookie → redirect to `/login` |
| Create | `apps/admin/src/pages/admin-users.astro` | Admin Users CRUD page |
| Create | `apps/admin/src/pages/api/admin-users/index.ts` | `GET` (list) + `POST` (create) |
| Create | `apps/admin/src/pages/api/admin-users/[id].ts` | `PATCH` (update email/role/password) + `DELETE` |
| Modify | `apps/admin/src/layouts/Layout.astro` | Add "admin users" nav link + logout button |

---

### Task 1: Install dependencies + update types

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/src/env.d.ts`
- Modify: `packages/db/src/types.ts`

- [ ] **Step 1: Install runtime and dev deps**

Run from the repo root:
```bash
pnpm --filter @blabbun/admin add bcryptjs jose
pnpm --filter @blabbun/admin add -D @types/bcryptjs vitest
```

Expected: `bcryptjs`, `jose` appear in `dependencies`; `@types/bcryptjs`, `vitest` in `devDependencies` inside `apps/admin/package.json`.

- [ ] **Step 2: Add `App.Locals` to env.d.ts**

Replace all contents of `apps/admin/src/env.d.ts`:
```ts
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
```

- [ ] **Step 3: Add `admin_users` to the shared DB types**

In `packages/db/src/types.ts`, add the `admin_users` table inside the `Tables` object (after `post_notifications`), before the closing `};` of Tables:

```ts
      admin_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
```

Then append this export at the bottom of `packages/db/src/types.ts`:
```ts
export type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
```

- [ ] **Step 4: Re-export AdminUserRow from the db package index**

In `packages/db/src/index.ts`, add `AdminUserRow` to the existing type export block:

```ts
export type {
  AdminUserRow,
  ClapVoteRow,
  CommentRow,
  Database,
  PostClapRow,
  PostNotificationRow,
  SubscriberRow,
} from "./types.js";
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/package.json apps/admin/src/env.d.ts packages/db/src/types.ts packages/db/src/index.ts pnpm-lock.yaml
git commit -m "chore(admin): install bcryptjs, jose, vitest; add Locals and AdminUserRow types"
```

---

### Task 2: Database migration

**Files:**
- Create: `supabase/migrations/20260504000000_add_admin_users.sql`

- [ ] **Step 1: Create the table DDL**

Create `supabase/migrations/20260504000000_add_admin_users.sql`:
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 2: Generate the bcrypt hash and append the seed**

Run from `apps/admin/` (bcryptjs must be installed from Task 1):
```bash
cd apps/admin && node --input-type=module -e "
import bcrypt from 'bcryptjs';
import { appendFileSync } from 'fs';
import { resolve } from 'path';

const hash = await bcrypt.hash('pass1234', 8);
const file = resolve('../../supabase/migrations/20260504000000_add_admin_users.sql');
appendFileSync(file, \`
INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@blabbun.com', '\${hash}', 'admin');
\`);
console.log('Seed written. Hash:', hash);
"
```

Expected output: `Seed written. Hash: $2b$08$...`

Verify the file ends with the INSERT statement containing the hash.

- [ ] **Step 3: Apply the migration**

Run via Supabase CLI or paste into Supabase dashboard → SQL editor:
```bash
# If using Supabase CLI:
supabase db push
# Or: supabase migration up
```

Verify in the Supabase dashboard: the `admin_users` table exists with one row where `email = 'admin@blabbun.com'`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260504000000_add_admin_users.sql
git commit -m "feat(db): add admin_users table with default admin seed"
```

---

### Task 3: Auth utilities + tests

**Files:**
- Create: `apps/admin/vitest.config.ts`
- Create: `apps/admin/src/lib/auth.test.ts`
- Create: `apps/admin/src/lib/auth.ts`

- [ ] **Step 1: Create vitest config**

Create `apps/admin/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 2: Write the failing tests**

Create `apps/admin/src/lib/auth.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { signToken, verifyToken } from "./auth";

const SECRET = "test-secret-that-is-at-least-32-chars!!";

describe("signToken + verifyToken", () => {
  it("round-trips a payload", async () => {
    const payload = { sub: "uuid-abc", email: "a@b.com", role: "admin" };
    const token = await signToken(payload, SECRET);
    const result = await verifyToken(token, SECRET);
    expect(result.sub).toBe(payload.sub);
    expect(result.email).toBe(payload.email);
    expect(result.role).toBe(payload.role);
  });

  it("rejects a token signed with the wrong secret", async () => {
    const token = await signToken(
      { sub: "id", email: "a@b.com", role: "admin" },
      SECRET
    );
    await expect(
      verifyToken(token, "wrong-secret-also-32-chars-long!!")
    ).rejects.toThrow();
  });

  it("rejects a malformed token string", async () => {
    await expect(verifyToken("not.a.valid.jwt", SECRET)).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run tests — confirm they fail**

```bash
cd apps/admin && pnpm vitest run
```

Expected: fails with `Cannot find module './auth'`.

- [ ] **Step 4: Implement auth.ts**

Create `apps/admin/src/lib/auth.ts`:
```ts
import { SignJWT, jwtVerify } from "jose";

export interface AdminPayload {
  sub: string;
  email: string;
  role: string;
}

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: AdminPayload,
  secret: string
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(key(secret));
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<AdminPayload> {
  const { payload } = await jwtVerify(token, key(secret));
  return {
    sub: payload.sub as string,
    email: payload["email"] as string,
    role: payload["role"] as string,
  };
}
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
cd apps/admin && pnpm vitest run
```

Expected:
```
✓ src/lib/auth.test.ts (3 tests)
Test Files  1 passed
Tests       3 passed
```

- [ ] **Step 6: Add test script to package.json**

In `apps/admin/package.json`, change the existing `"test"` script from `"playwright test"` to:
```json
"test": "vitest run",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

Also rename the existing `"test:ui"` key to `"test:e2e:ui"` (same value, `"playwright test --ui"`).

- [ ] **Step 7: Commit**

```bash
git add apps/admin/src/lib/auth.ts apps/admin/src/lib/auth.test.ts apps/admin/vitest.config.ts apps/admin/package.json
git commit -m "feat(admin): add JWT auth utilities with vitest tests"
```

---

### Task 4: Login API route

**Files:**
- Create: `apps/admin/src/pages/api/auth/login.ts`

- [ ] **Step 1: Create the login route**

Create `apps/admin/src/pages/api/auth/login.ts`:
```ts
import bcrypt from "bcryptjs";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { createSupabaseClient } from "@blabbun/db";

import { signToken } from "@/lib/auth";

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password)
    return json({ error: "email and password are required" }, 400);

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const jwtSecret =
    runtimeEnv.JWT_SECRET ??
    (import.meta.env.JWT_SECRET as string | undefined);

  if (!jwtSecret) return json({ error: "server misconfigured" }, 500);

  const supabase = createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: user } = await supabase
    .from("admin_users")
    .select("id, email, role, password_hash")
    .eq("email", email)
    .single();

  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return json({ error: "invalid credentials" }, 401);

  const token = await signToken(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `bb_admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`,
    },
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/pages/api/auth/login.ts
git commit -m "feat(admin): add POST /api/auth/login"
```

---

### Task 5: Logout API route

**Files:**
- Create: `apps/admin/src/pages/api/auth/logout.ts`

- [ ] **Step 1: Create the logout route**

Create `apps/admin/src/pages/api/auth/logout.ts`:
```ts
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
      "Set-Cookie":
        "bb_admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    },
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/src/pages/api/auth/logout.ts
git commit -m "feat(admin): add POST /api/auth/logout"
```

---

### Task 6: Middleware

**Files:**
- Create: `apps/admin/src/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `apps/admin/src/middleware.ts`:
```ts
import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

import { verifyToken } from "@/lib/auth";

const PUBLIC = new Set(["/login", "/api/auth/login", "/api/auth/logout"]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (PUBLIC.has(pathname)) return next();

  const token = context.cookies.get("bb_admin_token")?.value;
  if (!token) return context.redirect("/login");

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const jwtSecret =
    runtimeEnv.JWT_SECRET ??
    (import.meta.env.JWT_SECRET as string | undefined);
  if (!jwtSecret) return context.redirect("/login");

  try {
    const payload = await verifyToken(token, jwtSecret);
    context.locals.admin = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch {
    return context.redirect("/login");
  }
});
```

- [ ] **Step 2: Add JWT_SECRET to local env**

Create or append to `apps/admin/.env`:
```
JWT_SECRET=dev-secret-change-this-in-production-min32chars
```

Also add `JWT_SECRET` as a variable in the Cloudflare dashboard:
Workers & Pages → your admin project → Settings → Variables and Secrets → Add variable.
Use a random 32+ character string for production.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/middleware.ts
git commit -m "feat(admin): add auth middleware — redirects unauthenticated requests to /login"
```

---

### Task 7: Login page

**Files:**
- Create: `apps/admin/src/pages/login.astro`

- [ ] **Step 1: Create the login page**

Create `apps/admin/src/pages/login.astro`:
```astro
---
import { env } from "cloudflare:workers";

import { verifyToken } from "@/lib/auth";

const runtimeEnv = env as unknown as Record<string, string | undefined>;
const jwtSecret =
  runtimeEnv.JWT_SECRET ??
  (import.meta.env.JWT_SECRET as string | undefined);
const token = Astro.cookies.get("bb_admin_token")?.value;

if (token && jwtSecret) {
  try {
    await verifyToken(token, jwtSecret);
    return Astro.redirect("/");
  } catch {
    // invalid token — fall through to show login
  }
}
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>login — blabbun admin</title>
    <link rel="icon" type="image/png" href="/blabbun.png" />
    <script is:inline>
      document.documentElement.classList.add(
        localStorage.getItem("bb-theme") === "dark" ? "dark-init" : ""
      );
    </script>
  </head>
  <body
    class="light"
    style="min-height:100vh;display:flex;align-items:center;justify-content:center"
  >
    <script is:inline>
      document.body.className = localStorage.getItem("bb-theme") || "light";
    </script>

    <div style="width:100%;max-width:340px;padding:0 16px">
      <!-- Logo -->
      <div style="text-align:center;margin-bottom:32px">
        <img
          src="/blabbun.png"
          alt="blab bun"
          width="32"
          height="32"
          style="width:32px;height:32px;object-fit:contain;margin-bottom:12px"
        />
        <div style="font-size:0.82rem;font-weight:600;color:var(--text)">
          admin<span style="color:var(--accent)">.</span>
        </div>
      </div>

      <!-- Form -->
      <form id="login-form" style="display:flex;flex-direction:column;gap:10px">
        <input
          id="email"
          type="email"
          name="email"
          placeholder="email"
          required
          autocomplete="email"
          style="padding:9px 12px;font-size:0.82rem;font-family:inherit;background:var(--bg2);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none;width:100%;box-sizing:border-box"
        />
        <input
          id="password"
          type="password"
          name="password"
          placeholder="password"
          required
          autocomplete="current-password"
          style="padding:9px 12px;font-size:0.82rem;font-family:inherit;background:var(--bg2);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none;width:100%;box-sizing:border-box"
        />

        <div
          id="error-msg"
          style="display:none;font-size:0.72rem;color:#e05c5c;padding:6px 10px;background:rgba(224,92,92,0.08);border-radius:3px;border:1px solid rgba(224,92,92,0.2)"
        >
        </div>

        <button
          id="submit-btn"
          type="submit"
          style="padding:9px;font-size:0.8rem;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:3px;cursor:pointer;font-weight:500;transition:opacity 0.15s"
        >
          sign in
        </button>
      </form>
    </div>

    <script>
      const form = document.getElementById("login-form") as HTMLFormElement;
      const errorMsg = document.getElementById("error-msg") as HTMLElement;
      const submitBtn = document.getElementById(
        "submit-btn"
      ) as HTMLButtonElement;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.6";
        submitBtn.textContent = "signing in…";

        const email = (document.getElementById("email") as HTMLInputElement)
          .value;
        const password = (
          document.getElementById("password") as HTMLInputElement
        ).value;

        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (res.ok) {
            window.location.href = "/";
          } else {
            const data = await res.json();
            errorMsg.textContent = data.error ?? "login failed";
            errorMsg.style.display = "block";
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.style.opacity = "1";
          submitBtn.textContent = "sign in";
        }
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Smoke-test the login flow**

Start the admin dev server: `pnpm dev:admin`

1. Visit `http://localhost:4322` — should redirect to `/login`
2. Submit wrong credentials — should show "invalid credentials" inline (no page reload)
3. Submit `admin@blabbun.com` / `pass1234` — should redirect to `/`
4. Visit `http://localhost:4322/login` while logged in — should redirect to `/`

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/login.astro
git commit -m "feat(admin): add login page"
```

---

### Task 8: Update Layout — nav link + logout button

**Files:**
- Modify: `apps/admin/src/layouts/Layout.astro:11-17` (nav array)
- Modify: `apps/admin/src/layouts/Layout.astro:100-113` (sidebar bottom)

- [ ] **Step 1: Add "admin users" to the nav array**

In `apps/admin/src/layouts/Layout.astro`, replace the `nav` array:

```ts
const nav = [
  { label: "dashboard", href: "/" },
  { label: "posts", href: "/posts" },
  { label: "comments", href: "/comments" },
  { label: "subscribers", href: "/subscribers" },
  { label: "post claps", href: "/claps" },
  { label: "admin users", href: "/admin-users" },
];
```

- [ ] **Step 2: Add logout button below theme toggle**

Replace the sidebar bottom section:

Old:
```astro
      <!-- Theme toggle at bottom -->
      <div style="margin-top:auto;padding:0 10px">
        <button
          id="theme-btn"
          style="
            width:100%;background:none;border:1px solid var(--border);border-radius:3px;
            padding:6px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;
            font-family:inherit;letter-spacing:0.04em;text-align:left;
          "
        >
          ◑ toggle theme
        </button>
      </div>
```

New:
```astro
      <!-- Theme toggle + logout at bottom -->
      <div style="margin-top:auto;padding:0 10px;display:flex;flex-direction:column;gap:6px">
        <button
          id="theme-btn"
          style="
            width:100%;background:none;border:1px solid var(--border);border-radius:3px;
            padding:6px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;
            font-family:inherit;letter-spacing:0.04em;text-align:left;
          "
        >
          ◑ toggle theme
        </button>
        <form method="POST" action="/api/auth/logout">
          <button
            type="submit"
            style="
              width:100%;background:none;border:1px solid var(--border);border-radius:3px;
              padding:6px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;
              font-family:inherit;letter-spacing:0.04em;text-align:left;
              transition:border-color 0.1s,color 0.1s;
            "
            onmouseenter="this.style.borderColor='#e05c5c';this.style.color='#e05c5c'"
            onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--muted)'"
          >
            ← log out
          </button>
        </form>
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/layouts/Layout.astro
git commit -m "feat(admin): add admin users nav link and logout button to sidebar"
```

---

### Task 9: Admin Users API routes

**Files:**
- Create: `apps/admin/src/pages/api/admin-users/index.ts`
- Create: `apps/admin/src/pages/api/admin-users/[id].ts`

- [ ] **Step 1: Create the collection route (GET + POST)**

Create `apps/admin/src/pages/api/admin-users/index.ts`:
```ts
import bcrypt from "bcryptjs";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { createSupabaseClient } from "@blabbun/db";

export const prerender = false;

function getClient() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async () => {
  const { data, error } = await getClient()
    .from("admin_users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json(data);
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = typeof body?.role === "string" ? body.role.trim() : "admin";

  if (!email || !password)
    return json({ error: "email and password are required" }, 400);

  const password_hash = await bcrypt.hash(password, 8);
  const { data, error } = await getClient()
    .from("admin_users")
    .insert({ email, password_hash, role })
    .select("id, email, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505") return json({ error: "email already exists" }, 409);
    return json({ error: error.message }, 500);
  }
  return json(data, 201);
};
```

- [ ] **Step 2: Create the record route (PATCH + DELETE)**

Create `apps/admin/src/pages/api/admin-users/[id].ts`:
```ts
import bcrypt from "bcryptjs";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { createSupabaseClient } from "@blabbun/db";

export const prerender = false;

function getClient() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
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
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, string> = {};
  if (typeof body.email === "string" && body.email.trim())
    updates.email = body.email.trim().toLowerCase();
  if (typeof body.role === "string" && body.role.trim())
    updates.role = body.role.trim();
  if (typeof body.password === "string" && body.password)
    updates.password_hash = await bcrypt.hash(body.password, 8);

  if (Object.keys(updates).length === 0)
    return json({ error: "no valid fields to update" }, 400);

  const { data, error } = await getClient()
    .from("admin_users")
    .update(updates)
    .eq("id", id!)
    .select("id, email, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505") return json({ error: "email already exists" }, 409);
    return json({ error: error.message }, 500);
  }
  return json(data);
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { id } = params;

  if (locals.admin?.id === id)
    return json({ error: "cannot delete your own account" }, 403);

  const supabase = getClient();

  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) <= 1)
    return json({ error: "cannot delete the last admin" }, 403);

  const { error } = await supabase.from("admin_users").delete().eq("id", id!);
  if (error) return json({ error: error.message }, 500);
  return json({ success: true });
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/api/admin-users/
git commit -m "feat(admin): add admin-users API routes (GET, POST, PATCH, DELETE)"
```

---

### Task 10: Admin Users page

**Files:**
- Create: `apps/admin/src/pages/admin-users.astro`

- [ ] **Step 1: Create the admin users page**

Create `apps/admin/src/pages/admin-users.astro`:
```astro
---
import { createSupabaseClient, type AdminUserRow } from "@blabbun/db";
import { env } from "cloudflare:workers";

import Layout from "../layouts/Layout.astro";

const runtimeEnv = env as unknown as Record<string, string | undefined>;
const supabase = createSupabaseClient(
  runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
  runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: admins } = await supabase
  .from("admin_users")
  .select("id, email, role, created_at")
  .order("created_at", { ascending: true });

const currentAdminId = Astro.locals.admin?.id ?? "";
---

<Layout title="admin users">
  <!-- Create form -->
  <div
    style="border:1px solid var(--border);border-radius:4px;padding:16px;margin-bottom:24px;background:var(--bg2)"
  >
    <div
      style="font-size:0.68rem;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px"
    >
      new admin
    </div>
    <form id="create-form" style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input
          name="email"
          type="email"
          placeholder="email"
          required
          style="flex:1;min-width:160px;padding:7px 10px;font-size:0.78rem;font-family:inherit;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none"
        />
        <input
          name="password"
          type="password"
          placeholder="password"
          required
          style="flex:1;min-width:140px;padding:7px 10px;font-size:0.78rem;font-family:inherit;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none"
        />
        <select
          name="role"
          style="padding:7px 10px;font-size:0.78rem;font-family:inherit;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none"
        >
          <option value="admin">admin</option>
        </select>
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button
          type="submit"
          style="padding:6px 14px;font-size:0.75rem;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:3px;cursor:pointer"
          >add admin</button
        >
      </div>
    </form>
  </div>

  <!-- Count -->
  <span style="font-size:0.72rem;color:var(--muted)">
    {admins?.length ?? 0} admin{(admins?.length ?? 0) !== 1 ? "s" : ""}
  </span>

  {
    !admins?.length ? (
      <p style="font-size:0.8rem;color:var(--muted);padding:32px 0;border-top:1px solid var(--divider);margin-top:12px">
        no admins found.
      </p>
    ) : (
      <div
        id="admin-list"
        data-current-id={currentAdminId}
        style="margin-top:12px;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:4px;overflow:hidden"
      >
        {(admins as AdminUserRow[]).map((a) => (
          <div
            data-id={a.id}
            style="padding:14px 16px;border-bottom:1px solid var(--divider);background:var(--bg)"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
              <!-- Display mode -->
              <div class="display-mode" style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <span style="font-size:0.8rem;font-weight:500;color:var(--text)">
                    {a.email}
                  </span>
                  <span style="font-size:0.64rem;padding:2px 7px;border-radius:2px;background:var(--accent-soft);color:var(--accent);font-weight:500;letter-spacing:0.04em">
                    {a.role}
                  </span>
                  {a.id === currentAdminId && (
                    <span style="font-size:0.64rem;color:var(--muted2)">(you)</span>
                  )}
                </div>
                <div style="font-size:0.66rem;color:var(--muted2);margin-top:3px">
                  added{" "}
                  {new Date(a.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              <!-- Edit mode -->
              <div class="edit-mode" style="display:none;flex:1;min-width:200px;flex-direction:column;gap:6px">
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <input
                    class="edit-email"
                    type="email"
                    value={a.email}
                    style="flex:1;min-width:140px;padding:5px 8px;font-size:0.76rem;font-family:inherit;background:var(--bg2);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none"
                  />
                  <select
                    class="edit-role"
                    style="padding:5px 8px;font-size:0.76rem;font-family:inherit;background:var(--bg2);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none"
                  >
                    <option value="admin" selected={a.role === "admin"}>admin</option>
                  </select>
                </div>
                <div style="display:flex;gap:6px">
                  <button
                    class="save-edit-btn"
                    onclick={`saveAdmin('${a.id}', this)`}
                    style="padding:4px 12px;font-size:0.72rem;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:3px;cursor:pointer"
                  >save</button>
                  <button
                    onclick={`cancelEdit('${a.id}')`}
                    style="padding:4px 12px;font-size:0.72rem;font-family:inherit;background:none;border:1px solid var(--border);border-radius:3px;color:var(--muted);cursor:pointer"
                  >cancel</button>
                </div>
              </div>

              <!-- Reset password mode -->
              <div class="pw-mode" style="display:none;flex:1;min-width:200px;flex-direction:column;gap:6px">
                <input
                  class="pw-input"
                  type="password"
                  placeholder="new password"
                  style="flex:1;padding:5px 8px;font-size:0.76rem;font-family:inherit;background:var(--bg2);border:1px solid var(--border);border-radius:3px;color:var(--text);outline:none"
                />
                <div style="display:flex;gap:6px">
                  <button
                    class="save-pw-btn"
                    onclick={`savePassword('${a.id}', this)`}
                    style="padding:4px 12px;font-size:0.72rem;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:3px;cursor:pointer"
                  >save password</button>
                  <button
                    onclick={`cancelPw('${a.id}')`}
                    style="padding:4px 12px;font-size:0.72rem;font-family:inherit;background:none;border:1px solid var(--border);border-radius:3px;color:var(--muted);cursor:pointer"
                  >cancel</button>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="action-btns" style="display:flex;gap:6px;flex-shrink:0">
                <button
                  onclick={`startEdit('${a.id}')`}
                  style="background:none;border:1px solid var(--border);border-radius:3px;padding:4px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;font-family:inherit;transition:border-color 0.1s,color 0.1s"
                  onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
                  onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--muted)'"
                >edit</button>
                <button
                  onclick={`startPw('${a.id}')`}
                  style="background:none;border:1px solid var(--border);border-radius:3px;padding:4px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;font-family:inherit;transition:border-color 0.1s,color 0.1s"
                  onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
                  onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--muted)'"
                >pw</button>
                {a.id !== currentAdminId && (
                  <button
                    onclick={`deleteAdmin('${a.id}')`}
                    style="background:none;border:1px solid var(--border);border-radius:3px;padding:4px 10px;font-size:0.68rem;color:var(--muted);cursor:pointer;font-family:inherit;transition:border-color 0.1s,color 0.1s"
                    onmouseenter="this.style.borderColor='#e05c5c';this.style.color='#e05c5c'"
                    onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--muted)'"
                  >delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
</Layout>

<script>
  function getRow(id: string) {
    return document.querySelector<HTMLElement>(`[data-id="${id}"]`);
  }

  function showMode(id: string, mode: "display" | "edit" | "pw") {
    const row = getRow(id);
    if (!row) return;
    (row.querySelector(".display-mode") as HTMLElement).style.display =
      mode === "display" ? "block" : "none";
    (row.querySelector(".edit-mode") as HTMLElement).style.display =
      mode === "edit" ? "flex" : "none";
    (row.querySelector(".pw-mode") as HTMLElement).style.display =
      mode === "pw" ? "flex" : "none";
    (row.querySelector(".action-btns") as HTMLElement).style.display =
      mode === "display" ? "flex" : "none";
  }

  function startEdit(id: string) { showMode(id, "edit"); }
  function cancelEdit(id: string) { showMode(id, "display"); }
  function startPw(id: string) { showMode(id, "pw"); }
  function cancelPw(id: string) { showMode(id, "display"); }

  async function saveAdmin(id: string, btn: HTMLButtonElement) {
    const row = getRow(id);
    const email = row?.querySelector<HTMLInputElement>(".edit-email")?.value.trim();
    const role = row?.querySelector<HTMLSelectElement>(".edit-role")?.value;
    if (!email) return;

    btn.textContent = "saving…";
    btn.disabled = true;

    const res = await fetch(`/api/admin-users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    if (res.ok) {
      location.reload();
    } else {
      const data = await res.json();
      alert(data.error ?? "failed to save");
      btn.textContent = "save";
      btn.disabled = false;
    }
  }

  async function savePassword(id: string, btn: HTMLButtonElement) {
    const row = getRow(id);
    const password = row?.querySelector<HTMLInputElement>(".pw-input")?.value;
    if (!password) return;

    btn.textContent = "saving…";
    btn.disabled = true;

    const res = await fetch(`/api/admin-users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      cancelPw(id);
      alert("password updated");
    } else {
      const data = await res.json();
      alert(data.error ?? "failed to save");
      btn.textContent = "save password";
      btn.disabled = false;
    }
  }

  async function deleteAdmin(id: string) {
    if (!confirm("delete this admin?")) return;
    const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
    if (res.ok) {
      getRow(id)?.remove();
    } else {
      const data = await res.json();
      alert(data.error ?? "failed to delete");
    }
  }

  document.getElementById("create-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      form.reset();
      location.reload();
    } else {
      const j = await res.json();
      alert(j.error ?? "failed to create");
    }
  });

  Object.assign(window, {
    startEdit, cancelEdit,
    startPw, cancelPw,
    saveAdmin, savePassword, deleteAdmin,
  });
</script>
```

- [ ] **Step 2: Smoke-test the Admin Users page**

With `pnpm dev:admin` running:
1. Navigate to `http://localhost:4322/admin-users` — default admin row should be visible
2. Create a second admin via the form — should appear in the list
3. Edit the second admin's email — should reload with updated email
4. Click "pw" on the second admin → enter a new password → save — should show "password updated"
5. Delete the second admin — should be removed from the list
6. Try to delete yourself (the last remaining admin) — should show "cannot delete your own account"
7. Create another admin, then try deleting the default one — should show "cannot delete the last admin" only when one remains

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/pages/admin-users.astro
git commit -m "feat(admin): add admin users CRUD page"
```
