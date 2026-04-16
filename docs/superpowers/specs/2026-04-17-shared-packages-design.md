# Shared Packages Design

**Date:** 2026-04-17
**Status:** Approved

## Goal

Create two shared pnpm workspace packages — `@openblobs/ui` and `@openblobs/types` — consumed by both `apps/client` and `apps/admin`.

---

## Packages

### `@openblobs/ui`

Svelte UI components and shared global CSS. No build step — components are compiled by the consuming app's Vite/Astro pipeline.

**Location:** `packages/ui/`

**Contents:**

| File                                       | Description                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `src/components/buttons/Button.svelte`     | Base button, supports `primary` and `ghost` variants, renders as `<a>` or `<button>` |
| `src/components/buttons/BackButton.svelte` | Back navigation link with configurable `href` and `label`                            |
| `src/components/inputs/EmailInput.svelte`  | Newsletter email input (placeholder, not yet implemented)                            |
| `src/styles/global.css`                    | Tailwind base styles shared across apps                                              |

**`package.json` key fields:**

```json
{
  "name": "@openblobs/ui",
  "exports": {
    "./src/components/*": "./src/components/*",
    "./src/styles/*": "./src/styles/*"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

**Import pattern (in consuming apps):**

```ts
import Button from "@openblobs/ui/src/components/buttons/Button.svelte";
import BackButton from "@openblobs/ui/src/components/buttons/BackButton.svelte";
```

**CSS import (in consuming app layout):**

```astro
import "@openblobs/ui/src/styles/global.css";
```

---

### `@openblobs/types`

Pure TypeScript types shared across apps. No runtime code, no framework dependencies.

**Location:** `packages/types/`

**Contents:**

| File           | Description                                                                |
| -------------- | -------------------------------------------------------------------------- |
| `src/post.ts`  | `Post` interface extracted from `apps/client/src/content.config.ts` schema |
| `src/index.ts` | Barrel re-export of all types                                              |

**`Post` type:**

```ts
export interface Post {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  draft: boolean;
}
```

**Import pattern:**

```ts
import type { Post } from "@openblobs/types";
```

---

## Workspace wiring

### `pnpm-workspace.yaml` update

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Per-app `package.json` additions

Both `apps/client` and `apps/admin` declare the packages using the workspace protocol:

```json
"dependencies": {
  "@openblobs/ui": "workspace:*",
  "@openblobs/types": "workspace:*"
}
```

### `apps/client` — component imports updated

Existing component imports in `apps/client` pages and layouts updated to point to `@openblobs/ui` instead of `@/components/...`. The original files in `apps/client/src/components/` are deleted after moving.

`apps/client/src/styles/global.css` is deleted after moving to `packages/ui/src/styles/global.css`. The import in `apps/client/src/layouts/Layout.astro` is updated accordingly.

---

## What does NOT move

| Item                                               | Reason                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/client/src/components/layouts/Navbar.svelte` | Client-specific, placeholder only                                            |
| `apps/client/src/components/layouts/Footer.svelte` | Client-specific, placeholder only                                            |
| `apps/admin/src/layouts/Layout.astro`              | Admin-specific sidebar layout                                                |
| `apps/client/src/layouts/Layout.astro`             | Client-specific base layout                                                  |
| `apps/client/src/content.config.ts`                | Astro content collection config — must stay in the app that owns the content |

---

## Non-goals

- No build/compile step for packages (YAGNI — Vite handles it)
- No Storybook or component docs
- No versioning strategy beyond `workspace:*`
- No `@openblobs/config` package for shared tsconfig/tailwind config
