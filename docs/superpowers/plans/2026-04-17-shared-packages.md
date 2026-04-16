# Shared Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `packages/ui` (Svelte components + CSS) and `packages/types` (TypeScript types) as pnpm workspace packages consumed by both `apps/client` and `apps/admin`.

**Architecture:** No-build packages — components are compiled by the consuming app's Vite/Astro pipeline, types are resolved directly from source `.ts` files. pnpm workspace symlinks make them available as `@openblobs/ui` and `@openblobs/types` in both apps.

**Tech Stack:** pnpm workspaces, Svelte 5, TypeScript, Astro 6, Tailwind CSS 4

---

## File Map

```
packages/
├── types/
│   ├── package.json             new — @openblobs/types manifest
│   ├── tsconfig.json            new — TS config for IDE support
│   └── src/
│       ├── post.ts              new — Post interface
│       └── index.ts             new — barrel export
└── ui/
    ├── package.json             new — @openblobs/ui manifest
    ├── tsconfig.json            new — TS config for IDE support
    ├── svelte.config.js         new — Svelte preprocessor for IDE support
    └── src/
        ├── components/
        │   ├── buttons/
        │   │   ├── Button.svelte      moved from apps/client/src/components/buttons/
        │   │   └── BackButton.svelte  moved from apps/client/src/components/buttons/
        │   └── inputs/
        │       └── EmailInput.svelte  moved from apps/client/src/components/inputs/
        └── styles/
            └── global.css             moved from apps/client/src/styles/

pnpm-workspace.yaml              modified — add "packages/*"

apps/client/
├── package.json                 modified — add @openblobs/ui + @openblobs/types deps
├── src/
│   ├── layouts/Layout.astro     modified — update global.css import path
│   └── pages/[slug].astro       modified — update BackButton import path
│   (src/components/buttons/, src/components/inputs/, src/styles/ deleted)

apps/admin/
└── package.json                 modified — add @openblobs/ui + @openblobs/types deps
```

---

## Task 1: Create `@openblobs/types` package

**Files:**

- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/post.ts`
- Create: `packages/types/src/index.ts`
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: Update `pnpm-workspace.yaml` to include packages**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Create `packages/types/package.json`**

```json
{
  "name": "@openblobs/types",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- [ ] **Step 3: Create `packages/types/tsconfig.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 4: Create `packages/types/src/post.ts`**

Extracted from `apps/client/src/content.config.ts` schema. This is the canonical shape of a blog post — used by any app that reads or writes post data.

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

- [ ] **Step 5: Create `packages/types/src/index.ts`**

```ts
export type { Post } from "./post.ts";
```

- [ ] **Step 6: Run install to register the new package**

```bash
pnpm install
```

Expected: no errors. `node_modules/@openblobs/types` symlink created.

- [ ] **Step 7: Verify the symlink resolves**

```bash
ls node_modules/@openblobs/
```

Expected output: `types`

- [ ] **Step 8: Commit**

```bash
git add packages/types pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat: add @openblobs/types package"
```

---

## Task 2: Scaffold `@openblobs/ui` package

**Files:**

- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/svelte.config.js`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@openblobs/ui",
  "private": true,
  "type": "module",
  "version": "0.0.1",
  "exports": {
    "./src/*": "./src/*"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `packages/ui/svelte.config.js`**

Needed so the Svelte VS Code extension processes `.svelte` files in this package correctly.

```js
import { vitePreprocess } from "@astrojs/svelte";

export default {
  preprocess: vitePreprocess(),
};
```

- [ ] **Step 4: Run install**

```bash
pnpm install
```

Expected: `node_modules/@openblobs/ui` symlink created.

- [ ] **Step 5: Verify both symlinks exist**

```bash
ls node_modules/@openblobs/
```

Expected output: `types  ui`

- [ ] **Step 6: Commit**

```bash
git add packages/ui pnpm-lock.yaml
git commit -m "feat: scaffold @openblobs/ui package"
```

---

## Task 3: Move components and CSS into `@openblobs/ui`

Move files using `git mv` to preserve history. Do not update imports yet — that happens in Task 4.

**Files:**

- Move: `apps/client/src/components/buttons/` → `packages/ui/src/components/buttons/`
- Move: `apps/client/src/components/inputs/` → `packages/ui/src/components/inputs/`
- Move: `apps/client/src/styles/global.css` → `packages/ui/src/styles/global.css`

- [ ] **Step 1: Create destination directories**

```bash
mkdir -p packages/ui/src/components/buttons
mkdir -p packages/ui/src/components/inputs
mkdir -p packages/ui/src/styles
```

- [ ] **Step 2: Move component files**

```bash
git mv apps/client/src/components/buttons/Button.svelte packages/ui/src/components/buttons/Button.svelte
git mv apps/client/src/components/buttons/BackButton.svelte packages/ui/src/components/buttons/BackButton.svelte
git mv apps/client/src/components/inputs/EmailInput.svelte packages/ui/src/components/inputs/EmailInput.svelte
```

- [ ] **Step 3: Move global CSS**

```bash
git mv apps/client/src/styles/global.css packages/ui/src/styles/global.css
```

- [ ] **Step 4: Remove now-empty directories**

```bash
rmdir apps/client/src/components/buttons
rmdir apps/client/src/components/inputs
rmdir apps/client/src/styles
```

- [ ] **Step 5: Commit the moves before touching imports**

```bash
git add -A
git commit -m "chore: move components and styles into @openblobs/ui"
```

---

## Task 4: Update `apps/client` to consume `@openblobs/ui` and `@openblobs/types`

**Files:**

- Modify: `apps/client/package.json`
- Modify: `apps/client/src/layouts/Layout.astro`
- Modify: `apps/client/src/pages/[slug].astro`

- [ ] **Step 1: Add workspace deps to `apps/client/package.json`**

In the `"dependencies"` block, add:

```json
"@openblobs/types": "workspace:*",
"@openblobs/ui": "workspace:*"
```

Full `dependencies` block becomes:

```json
"dependencies": {
  "@astrojs/mdx": "^5.0.3",
  "@astrojs/svelte": "^8.0.5",
  "@openblobs/types": "workspace:*",
  "@openblobs/ui": "workspace:*",
  "@tailwindcss/vite": "^4.2.2",
  "astro": "^6.1.6",
  "svelte": "^5.55.4",
  "tailwindcss": "^4.2.2",
  "typescript": "^5.9.3"
}
```

- [ ] **Step 2: Run install**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 3: Update `apps/client/src/layouts/Layout.astro`**

Change the global CSS import from the old local path to the shared package:

```astro
---
import "@openblobs/ui/src/styles/global.css";
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />
    <title>charlidev</title>
  </head>
  <body class="bg-white text-gray-900 antialiased">
    <div class="mx-auto max-w-2xl px-4 py-16">
      <slot />
    </div>
  </body>
</html>
```

- [ ] **Step 4: Update `apps/client/src/pages/[slug].astro`**

Change the BackButton import from the old local path to the shared package:

```astro
---
import { getCollection, render } from "astro:content";

import BackButton from "@openblobs/ui/src/components/buttons/BackButton.svelte";
import Layout from "@/layouts/Layout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<Layout>
  <article>
    <div class="mb-8"><BackButton /></div>
    <h1 class="mb-2 text-3xl font-bold tracking-tight">{post.data.title}</h1>
    <time
      datetime={post.data.pubDate.toISOString()}
      class="mb-10 block text-sm text-gray-400"
    >
      {
        post.data.pubDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    </time>
    <div class="prose prose-gray max-w-none">
      <Content />
    </div>
  </article>
</Layout>
```

- [ ] **Step 5: Build `apps/client` to verify**

```bash
pnpm --filter @openblobs/client build
```

Expected output ends with:

```
[build] ✓ Completed in Xs.
[build] 2 page(s) built in Xs.
[build] Complete!
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire apps/client to @openblobs/ui and @openblobs/types"
```

---

## Task 5: Wire `apps/admin` to shared packages

**Files:**

- Modify: `apps/admin/package.json`

- [ ] **Step 1: Add workspace deps to `apps/admin/package.json`**

In the `"dependencies"` block, add:

```json
"@openblobs/types": "workspace:*",
"@openblobs/ui": "workspace:*"
```

Full `dependencies` block becomes:

```json
"dependencies": {
  "@astrojs/svelte": "^8.0.5",
  "@openblobs/types": "workspace:*",
  "@openblobs/ui": "workspace:*",
  "@tailwindcss/vite": "^4.2.2",
  "astro": "^6.1.6",
  "svelte": "^5.55.4",
  "tailwindcss": "^4.2.2",
  "typescript": "^5.9.3"
}
```

- [ ] **Step 2: Run install**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 3: Build `apps/admin` to verify**

```bash
pnpm --filter @openblobs/admin build
```

Expected output ends with:

```
[build] ✓ Completed in Xs.
[build] 1 page(s) built in Xs.
[build] Complete!
```

- [ ] **Step 4: Verify both apps build together**

```bash
pnpm build
```

Expected: both apps build with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire apps/admin to @openblobs/ui and @openblobs/types"
```
