# Monorepo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single Astro blog into a pnpm workspace monorepo with `apps/client` (existing blog) and `apps/admin` (new basic Astro admin panel).

**Architecture:** pnpm workspaces with two Astro apps under `apps/`. Shared tooling (prettier, eslint, husky, lint-staged) lives at the repo root. Each app is self-contained with its own `package.json`, `astro.config.mjs`, `tsconfig.json`, and `src/`. No shared `packages/` yet — YAGNI.

**Tech Stack:** pnpm workspaces, Astro 6, Svelte 5, Tailwind CSS 4, TypeScript, Playwright, Husky, lint-staged

---

## File Map

```
openblobs/                          ← repo root (tooling only)
├── apps/
│   ├── client/                     ← current blog (migrated here)
│   │   ├── src/
│   │   ├── public/
│   │   ├── tests/
│   │   ├── astro.config.mjs
│   │   ├── svelte.config.js
│   │   ├── tsconfig.json
│   │   ├── playwright.config.ts
│   │   └── package.json
│   └── admin/                      ← new basic admin app
│       ├── src/
│       │   ├── layouts/Layout.astro
│       │   └── pages/index.astro
│       ├── astro.config.mjs
│       ├── tsconfig.json
│       └── package.json
├── .husky/
├── .prettierrc
├── .prettierignore
├── eslint.config.js
├── package.json                    ← workspace root (tooling deps + scripts)
└── pnpm-workspace.yaml
```

**Files created:** `pnpm-workspace.yaml`, `apps/client/package.json`, `apps/admin/package.json`, `apps/admin/astro.config.mjs`, `apps/admin/tsconfig.json`, `apps/admin/src/layouts/Layout.astro`, `apps/admin/src/pages/index.astro`

**Files moved** (via `git mv`): `src/` → `apps/client/src/`, `public/` → `apps/client/public/`, `tests/` → `apps/client/tests/`, `astro.config.mjs` → `apps/client/astro.config.mjs`, `svelte.config.js` → `apps/client/svelte.config.js`, `tsconfig.json` → `apps/client/tsconfig.json`, `playwright.config.ts` → `apps/client/playwright.config.ts`, `CHANGELOG.md` → `apps/client/CHANGELOG.md`, `docs/` → `apps/client/docs/`

**Files modified:** root `package.json` (strip app deps, keep tooling, add workspace scripts), `.prettierignore`, `.gitignore`

---

## Task 1: Create pnpm workspace root

**Files:**

- Create: `pnpm-workspace.yaml`
- Modify: `package.json` (root)
- Modify: `.prettierignore`
- Modify: `.gitignore`

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
```

- [ ] **Step 2: Replace root `package.json`**

Strip all app-specific deps. Keep only tooling that applies repo-wide.

```json
{
  "name": "openblobs",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev:client": "pnpm --filter @openblobs/client dev",
    "dev:admin": "pnpm --filter @openblobs/admin dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,mjs}": ["eslint --fix", "prettier --write"],
    "*.astro": ["prettier --write"],
    "*.svelte": ["prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  },
  "packageManager": "pnpm@10.19.0+sha512.c9fc7236e92adf5c8af42fd5bf1612df99c2ceb62f27047032f4720b33f8eacdde311865e91c411f2774f618d82f320808ecb51718bfa82c060c4ba7c76a32b8",
  "devDependencies": {
    "eslint": "^10.2.0",
    "eslint-plugin-astro": "^1.7.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-simple-import-sort": "^13.0.0",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0",
    "prettier": "^3.8.2",
    "prettier-plugin-astro": "^0.14.1",
    "prettier-plugin-svelte": "^3.5.1",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "typescript-eslint": "^8.58.2"
  }
}
```

- [ ] **Step 3: Update `.prettierignore`**

Add workspace-aware ignore paths:

```
dist/
.astro/
node_modules/
pnpm-lock.yaml
apps/*/dist/
apps/*/.astro/
```

- [ ] **Step 4: Update `.gitignore`**

Add workspace build output paths after existing entries:

```
apps/*/dist/
apps/*/.astro/
apps/*/node_modules/
```

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json .prettierignore .gitignore
git commit -m "chore: scaffold pnpm workspace root"
```

---

## Task 2: Migrate client app into apps/client

**Files:**

- Create: `apps/client/package.json`
- Move: all current app files into `apps/client/`

- [ ] **Step 1: Create the `apps/client/` directory and move app files**

```bash
mkdir -p apps/client
git mv src apps/client/src
git mv public apps/client/public
git mv tests apps/client/tests
git mv astro.config.mjs apps/client/astro.config.mjs
git mv svelte.config.js apps/client/svelte.config.js
git mv tsconfig.json apps/client/tsconfig.json
git mv playwright.config.ts apps/client/playwright.config.ts
git mv CHANGELOG.md apps/client/CHANGELOG.md
git mv docs apps/client/docs
```

- [ ] **Step 2: Create `apps/client/package.json`**

```json
{
  "name": "@openblobs/client",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "dependencies": {
    "@astrojs/mdx": "^5.0.3",
    "@astrojs/svelte": "^8.0.5",
    "@tailwindcss/vite": "^4.2.2",
    "astro": "^6.1.6",
    "svelte": "^5.55.4",
    "tailwindcss": "^4.2.2",
    "typescript": "^5.9.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1",
    "@tailwindcss/typography": "^0.5.19",
    "knip": "^6.4.1"
  }
}
```

- [ ] **Step 3: Run install to resolve workspace deps**

```bash
pnpm install
```

Expected: Lock file updates. No errors.

- [ ] **Step 4: Verify client dev server starts**

```bash
pnpm --filter @openblobs/client dev
```

Expected: Astro dev server running at `http://localhost:4321`

- [ ] **Step 5: Run existing e2e tests**

```bash
pnpm --filter @openblobs/client test
```

Expected: All Playwright tests pass (3 browsers).

- [ ] **Step 6: Commit**

```bash
git add apps/client
git commit -m "chore: migrate client app into apps/client workspace"
```

---

## Task 3: Create admin app

**Files:**

- Create: `apps/admin/package.json`
- Create: `apps/admin/astro.config.mjs`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/src/layouts/Layout.astro`
- Create: `apps/admin/src/pages/index.astro`

- [ ] **Step 1: Create `apps/admin/package.json`**

```json
{
  "name": "@openblobs/admin",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev --port 4322",
    "build": "astro build",
    "preview": "astro preview --port 4322",
    "astro": "astro",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "@astrojs/svelte": "^8.0.5",
    "@tailwindcss/vite": "^4.2.2",
    "astro": "^6.1.6",
    "svelte": "^5.55.4",
    "tailwindcss": "^4.2.2",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Create `apps/admin/astro.config.mjs`**

```js
// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `apps/admin/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: Create `apps/admin/src/layouts/Layout.astro`**

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — openblobs admin</title>
  </head>
  <body class="min-h-screen bg-gray-950 text-gray-100">
    <div class="flex min-h-screen">
      <aside class="w-56 border-r border-gray-800 px-4 py-6">
        <p
          class="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase"
        >
          openblobs
        </p>
        <nav class="flex flex-col gap-1">
          <a
            href="/"
            class="rounded px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            Dashboard
          </a>
          <a
            href="/posts"
            class="rounded px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            Posts
          </a>
        </nav>
      </aside>
      <main class="flex-1 px-8 py-6">
        <slot />
      </main>
    </div>
  </body>
</html>
```

- [ ] **Step 5: Create `apps/admin/src/pages/index.astro`**

```astro
---
import Layout from "@/layouts/Layout.astro";
---

<Layout title="Dashboard">
  <h1 class="mb-2 text-2xl font-bold">Dashboard</h1>
  <p class="text-gray-400">Admin panel coming soon.</p>
</Layout>
```

- [ ] **Step 6: Run install and verify admin dev server**

```bash
pnpm install
pnpm --filter @openblobs/admin dev
```

Expected: Astro dev server running at `http://localhost:4322`

- [ ] **Step 7: Commit**

```bash
git add apps/admin
git commit -m "feat: add basic admin app at apps/admin (port 4322)"
```

---

## Task 4: Final wiring and smoke test

**Files:**

- Verify: root `package.json` scripts work
- Verify: husky pre-commit still runs

- [ ] **Step 1: Verify root shorthand scripts**

```bash
pnpm dev:client   # should start client on :4321
pnpm dev:admin    # should start admin on :4322
```

- [ ] **Step 2: Verify lint runs across all apps**

```bash
pnpm lint
```

Expected: ESLint runs for both apps, no errors.

- [ ] **Step 3: Verify husky pre-commit hook still fires**

Make a trivial edit to any file, stage it, and commit. The hook should run `lint-staged` and format/lint staged files.

```bash
git add .
git commit -m "chore: finalize monorepo setup"
```

Expected: pre-commit hook runs without errors, commit succeeds.
