# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start all apps (client: :4321, admin: :4322)
pnpm dev:client       # Client only
pnpm dev:admin        # Admin only

# Build & lint
pnpm build            # Build all apps
pnpm lint             # Lint all packages
pnpm format           # Format with Prettier

# Testing (run from app directory)
cd apps/client && pnpm test       # Run Playwright e2e tests (headless)
cd apps/client && pnpm test:ui    # Playwright UI mode

# Navigation shortcuts
pnpm cd:client        # cd into apps/client
pnpm cd:admin         # cd into apps/admin
```

## Architecture

Pnpm monorepo with two Astro SSR apps deployed to Vercel, sharing packages for DB access, UI components, types, and utilities.

```
apps/
  client/   # Public blog (Astro + Svelte + MDX)
  admin/    # Admin dashboard (Astro + Svelte)
packages/
  ui/       # Shared Svelte component library
  db/       # Supabase client + TypeScript row types
  types/    # Shared Post interface (frontmatter contract)
  utils/    # Date helpers
supabase/   # SQL migrations
```

### Client App

- **Pages:** `src/pages/` — `index`, `[slug]`, `topics/[tag]`, `saved`, `archive`, `404`
- **API routes:** `src/pages/api/` — `comments/[slug].ts`, `claps/[slug].ts`, `newsletter.ts`, `keep-alive.ts`
- **Content:** MDX posts in `src/content/posts/`; frontmatter validated via Zod schema in `content.config.ts` against the `Post` interface in `packages/types`
- **Dynamic pages** use `export const prerender = false`

### Admin App

- Dashboard shows aggregate stats (comments, claps, subscribers)
- Pages: `/comments`, `/claps`, `/subscribers` — CRUD tables
- All API routes use the Supabase service role key

### Packages

- **`@blabbun/db`** — exports `createClient(url, key)` wrapping `@supabase/supabase-js`; `types.ts` defines `CommentRow`, `PostClapRow`, `ClapVoteRow`, `SubscriberRow`
- **`@blabbun/ui`** — Svelte 5 components; each component folder has a barrel `index.ts`
- **`@blabbun/types`** — `Post` interface; frontmatter schema must stay in sync with this

## Stack

| Layer      | Tech                                     |
| ---------- | ---------------------------------------- |
| Framework  | Astro 6 (SSR)                            |
| Components | Svelte 5 (runes: `$props()`, `$state()`) |
| Styling    | Tailwind CSS 4 + Typography plugin       |
| Database   | Supabase (PostgreSQL)                    |
| Testing    | Playwright (Chromium, Firefox, WebKit)   |
| Deploy     | Vercel                                   |

## Database

Four tables managed via `supabase/migrations/`:

- `comments` — nested via self-referential `parent_id`
- `post_claps` — aggregate clap count per post
- `clap_votes` — per-IP vote dedup (stores SHA256 of client IP)
- `subscribers` — newsletter emails

**Required env vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Key Conventions

- **Imports:** Use the `@/*` alias (maps to `src/`). ESLint enforces sorted imports via `eslint-plugin-simple-import-sort`.
- **Pre-commit:** Husky runs `lint-staged` (ESLint + Prettier) — don't bypass with `--no-verify`.
- **Svelte components** use Svelte 5 runes syntax exclusively.
- **Admin API routes** always use service role key; client API routes use anon key or IP-hashed logic.
- **Parallel data fetching:** Use `Promise.all` for read-heavy operations (see dashboard stats pattern).
