# Admin Auth & Admin Users — Design Spec

**Date:** 2026-05-04
**Status:** Approved

## Overview

Add a login wall to the admin app and a full CRUD "Admin Users" page. All admin routes are protected by a JWT verified in Astro middleware. Admin users are stored in Supabase. No new infrastructure beyond a `JWT_SECRET` env var.

---

## 1. Database

### New table: `admin_users`

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- Migration file: `supabase/migrations/20260504000000_add_admin_users.sql`
- Seed: inserts default admin `admin@blabbun.com` with a pre-computed bcrypt hash of `pass1234` (cost 10, `$2b$` format) hardcoded directly in the migration SQL. No `pgcrypto` extension needed.
- No sessions table — JWT is stateless.

---

## 2. Auth Flow

### Environment

| Var | Where | Purpose |
|-----|-------|---------|
| `JWT_SECRET` | Cloudflare Worker env + local `.env` | Signs and verifies JWTs |

### Login — `POST /api/auth/login`

1. Read `email` + `password` from JSON body.
2. Query `admin_users` by email.
3. Verify password with bcrypt (`bcryptjs` — pure JS, works in Workers).
4. On success: sign a JWT `{ sub: id, email, role, exp: now+8h }` with `JWT_SECRET`.
5. Set cookie `bb_admin_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`.
6. Return `{ ok: true }` — client redirects to `/`.

On failure: return `{ error: "invalid credentials" }` with status 401.

### Logout — `POST /api/auth/logout`

Clears `bb_admin_token` cookie (sets Max-Age=0), returns redirect to `/login`.

### Login Page — `GET /login`

- Simple centered form: email input, password input, submit button.
- Matches admin design system (same font, colors, border radius).
- Shows an inline error message on failed login (no page reload — JS fetch).
- If already authenticated, redirects to `/`.

### Middleware — `src/middleware.ts`

Runs on every request via Astro's `defineMiddleware`.

**Pass-through paths:** `/login`, `/api/auth/login`, `/api/auth/logout`

**All other paths:**
1. Read `bb_admin_token` cookie.
2. Verify JWT with `JWT_SECRET`. If missing or invalid → redirect to `/login`.
3. If valid: set `locals.admin = { id, email, role }`, call `next()`.

JWT library: `jose` (Web Crypto API, Cloudflare-compatible).

---

## 3. Admin Users Page

### Nav

New sidebar entry **"admin users"** added to the nav array in `Layout.astro`, linking to `/admin-users`.

Logout button added to the sidebar bottom (below theme toggle): a `<form method="POST" action="/api/auth/logout">` button styled consistently with the theme toggle.

### Page — `/admin-users`

Lists all rows from `admin_users` ordered by `created_at` ascending.

Columns: email, role, created date, actions.

**Create (top of page)**

Inline form:
- Email input (required)
- Password input (required, type=password)
- Role select: `admin` (only option for now)
- "add admin" button

POSTs to `POST /api/admin-users` → hashes password with bcrypt → inserts row → page reload.

**Edit (per row)**

Inline edit mode for **email** and **role** only.

Separate "reset password" action: clicking it reveals a password input + "save" button inline. PATCH to `/api/admin-users/[id]` with `{ password }`.

PATCH to `/api/admin-users/[id]` with `{ email?, role? }` for email/role edits.

**Delete (per row)**

Delete button per row. Two guards enforced server-side:
- Cannot delete yourself (`locals.admin.id === row.id` → 403).
- Cannot delete the last admin (count check → 403 if only 1 remains).

DELETE to `/api/admin-users/[id]`.

---

## 4. API Routes

| Method | Path | Action |
|--------|------|--------|
| `POST` | `/api/auth/login` | Validate credentials, set JWT cookie |
| `POST` | `/api/auth/logout` | Clear cookie, redirect to /login |
| `GET` | `/api/admin-users` | List all admin users |
| `POST` | `/api/admin-users` | Create admin user |
| `PATCH` | `/api/admin-users/[id]` | Update email, role, or password |
| `DELETE` | `/api/admin-users/[id]` | Delete admin user |

All `/api/admin-users/*` routes are protected by middleware (same JWT check).

---

## 5. Dependencies

- `bcryptjs` — pure-JS bcrypt, works in Cloudflare Workers. Added to `apps/admin`.
- `jose` — Web Crypto JWT library, Cloudflare-compatible. Added to `apps/admin`.

No other new packages.

---

## 6. File Changes

```
apps/admin/
  src/
    middleware.ts                       ← new
    pages/
      login.astro                       ← new
      admin-users.astro                 ← new
      api/
        auth/
          login.ts                      ← new
          logout.ts                     ← new
        admin-users/
          index.ts                      ← new
          [id].ts                       ← new
  layouts/
    Layout.astro                        ← add "admin users" nav + logout button
  src/
    env.d.ts                            ← add JWT_SECRET to Cloudflare env types
supabase/
  migrations/
    20260504000000_add_admin_users.sql  ← new
```
