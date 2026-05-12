# Post Views Admin Page — Design Spec

**Date:** 2026-05-12

## Summary

Add a "post views" page to the admin app with full CRUD over the `post_views` Supabase table. The page mirrors the existing `claps.astro` pattern but shows rows for both environments in one table, distinguished by an env badge.

## Schema

`post_views` table (composite PK: `env`, `post_slug`):

| Column     | Type    | Notes                        |
|------------|---------|------------------------------|
| env        | TEXT    | `'staging'` or `'live'`      |
| post_slug  | TEXT    | URL slug for the post        |
| count      | INTEGER | View count, default 0        |

No `created_at` column — differs from `post_claps`.

## Files

| File | Action |
|------|--------|
| `apps/admin/src/pages/views.astro` | Create |
| `apps/admin/src/pages/api/views/index.ts` | Create |
| `apps/admin/src/pages/api/views/[slug].ts` | Create |
| `apps/admin/src/layouts/Layout.astro` | Update nav |

## Page: `views.astro`

- Server-fetches all rows from `post_views` ordered by `count DESC` (no env filter).
- Renders a summary line: `N posts · X total views`.
- **Create form:** fields for `post_slug` (text, required), `count` (number, default 0), `env` (select: `staging` / `live`).
- **Table columns:** env badge · post slug (linked to `https://blabbun.com/<slug>`) · count (inline-editable) · actions.
- **Env badge:** small pill — muted style for `staging`, accent style for `live`.
- **Inline edit:** clicking "edit" reveals a number input for count; "save" / "cancel" buttons replace action buttons. Both `count` and `env` are sent on save (env is read-only during edit — slug+env identify the row).
- **Delete:** per-row delete button with confirm dialog.
- **Bulk select + delete:** checkbox column, bulk bar appears when ≥1 row selected.
- **Pagination:** client-side, `PAGE_SIZE = 20`, same logic as `claps.astro`.

## API Routes

### `POST /api/views`

Body: `{ post_slug: string, count?: number, env?: 'staging' | 'live' }`

- Validates `post_slug` is non-empty.
- Defaults `count` to `0`, `env` to `'staging'` if omitted.
- Inserts into `post_views`; returns `201` with the created row.
- Returns `400` for missing slug, `500` on DB error.

### `PUT /api/views/[slug]`

Body: `{ count: number, env: 'staging' | 'live' }`

- Updates `count` where `post_slug = slug AND env = env`.
- Returns `200 { success: true }` or `500` on error.

### `DELETE /api/views/[slug]`

Query param: `?env=staging|live`

- Deletes row where `post_slug = slug AND env = env`.
- Returns `200 { success: true }` or `500` on error.
- Bulk delete: client calls this endpoint once per selected row in parallel.

## Nav

Add to the `nav` array in `apps/admin/src/layouts/Layout.astro`:

```js
{ label: "post views", href: "/views" }
```

Position: after `"post claps"`, before `"admin users"`.

## Patterns to Follow

- Supabase client instantiated via `createSupabaseClient` with service role key (same as all other admin pages).
- `env` from `cloudflare:workers` runtime, accessed via `import { env } from 'cloudflare:workers'`.
- `json()` helper inline in API files (same pattern as `claps/index.ts`).
- Inline `<script>` in `.astro` for all client interaction (no Svelte components).
- Styling via CSS custom properties (`var(--bg)`, `var(--accent)`, etc.) — no Tailwind in admin.
