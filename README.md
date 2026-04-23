# Blab Bun

Blab Bun is home—a bub, a spot, a place.

It’s a space for unfiltered thoughts, like a friend who starts talking and just keeps going.

Half ideas, half opinions, half things you probably wouldn’t say in a formal setting—but say anyway.

No polishing, no pretending, no “perfect take.” Just honest yapping about life, people, late-night thoughts, and whatever’s stuck in the mind.

If it sounds like a ramble, it probably belongs here.

Built with [Astro](https://astro.build) and [Svelte](https://svelte.dev) as a pnpm monorepo.

## Structure

```
blabbun/
├── apps/
│   ├── client/   # Public-facing blog (localhost:4321)
│   └── admin/    # Admin dashboard (localhost:4322)
└── packages/
    ├── ui/       # Shared Svelte components
    └── types/    # Shared TypeScript types
```

## Dev

```bash
pnpm install
pnpm dev          # Run all apps in parallel
pnpm dev:client   # Client only
pnpm dev:admin    # Admin only
```

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `pnpm dev`        | Start all apps in parallel       |
| `pnpm dev:client` | Start client at `localhost:4321` |
| `pnpm dev:admin`  | Start admin at `localhost:4322`  |
| `pnpm build`      | Build all apps                   |
| `pnpm lint`       | Lint all packages                |
| `pnpm format`     | Format all files with Prettier   |

## Navigation scripts

Run from any package to jump to another workspace:

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm cd:root`   | Jump to monorepo root    |
| `pnpm cd:client` | Jump to `apps/client`    |
| `pnpm cd:admin`  | Jump to `apps/admin`     |
| `pnpm cd:ui`     | Jump to `packages/ui`    |
| `pnpm cd:types`  | Jump to `packages/types` |

## Stack

- [Astro 6](https://astro.build) — static site framework
- [Svelte 5](https://svelte.dev) — interactive components
- [TypeScript](https://typescriptlang.org) — strict mode
- [Tailwind CSS 4](https://tailwindcss.com) — styling
- [Prettier](https://prettier.io) — formatting
- [ESLint](https://eslint.org) — linting
- [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) — pre-commit hooks
