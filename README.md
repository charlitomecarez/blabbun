<div align="center">
  <img src="apps/client/assets/blabbun.png" alt="Blab Bun" width="96" />
  <h1>blab bun.</h1>
  <p>unfiltered takes & half-baked thoughts — probably should've kept to myself</p>
  <p>
    <a href="https://blabbun.com">blabbun.com</a> ·
    built with Astro + Svelte · deployed on Vercel
  </p>
</div>

---

A quiet corner of the internet where thoughts settle, drift, and take shape. No polishing, no pretending, no "perfect take." Half ideas, half opinions, half things you probably wouldn't say out loud — but say anyway.

If it sounds like a ramble, it probably belongs here.

## Structure

```
blabbun/
├── apps/
│   ├── client/        # Public-facing blog (Astro · localhost:4321)
│   └── admin/         # Admin dashboard (localhost:4322)
└── packages/
    ├── ui/            # Shared Svelte components + global styles
    ├── db/            # Database client & queries
    ├── types/         # Shared TypeScript types
    └── utils/         # Shared utilities
```

## Stack

| Layer      | Tech                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| Framework  | [Astro 6](https://astro.build)                                                                                        |
| Components | [Svelte 5](https://svelte.dev)                                                                                        |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com) + [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) |
| Content    | MDX via `@astrojs/mdx`                                                                                                |
| Deployment | [Vercel](https://vercel.com) (SSR adapter)                                                                            |
| Language   | TypeScript (strict)                                                                                                   |
| Monorepo   | pnpm workspaces                                                                                                       |
| Linting    | ESLint + prettier-plugin-astro/svelte/tailwindcss                                                                     |
| Git hooks  | Husky + lint-staged                                                                                                   |

## Dev

```bash
pnpm install
pnpm dev            # all apps in parallel
pnpm dev:client     # client only  →  localhost:4321
pnpm dev:admin      # admin only   →  localhost:4322
```

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `pnpm dev`        | Start all apps in parallel       |
| `pnpm dev:client` | Start client at `localhost:4321` |
| `pnpm dev:admin`  | Start admin at `localhost:4322`  |
| `pnpm build`      | Build all apps                   |
| `pnpm lint`       | Lint all packages                |
| `pnpm format`     | Format everything with Prettier  |

## Workspace navigation

Run from any package directory to jump to another:

| Command          | Destination      |
| ---------------- | ---------------- |
| `pnpm cd:root`   | Monorepo root    |
| `pnpm cd:client` | `apps/client`    |
| `pnpm cd:admin`  | `apps/admin`     |
| `pnpm cd:ui`     | `packages/ui`    |
| `pnpm cd:types`  | `packages/types` |
| `pnpm cd:utils`  | `packages/utils` |

## Content

Posts live in `apps/client/src/content/posts/` as `.mdx` files with the following frontmatter:

```yaml
---
title: "Post title"
description: "Short description"
pubDate: 2026-04-24
tags: ["RANTS"] # RANTS · TAKES · HALF-BAKED IDEAS · LIFE STUFF · CULTURE · EDITORIAL · TECHNICAL
draft: false
image: "https://..." # optional
imageSource: "Unsplash" # optional
imageSourceUrl: "https://..." # optional
---
```
