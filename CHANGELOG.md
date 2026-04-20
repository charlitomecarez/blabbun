# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- CI/CD GitHub Actions workflows for `apps/client` (lint → test → deploy) and `apps/admin` (lint → deploy) targeting Vercel
- `apps/client/vercel.json` build configuration for Vercel CLI
- `@types/node` devDependency to `apps/client` to resolve TypeScript error in `playwright.config.ts`

### Changed

- Dev script at root now runs all apps in parallel via `pnpm --parallel -r dev`

## [0.1.0] - 2026-04-17

### Added

- pnpm workspace monorepo setup with `apps/client`, `apps/admin`, `packages/ui`, `packages/types`
- `@thelunan/types` shared package with `Post` type
- `@thelunan/ui` shared package with components and global styles
- `apps/client` — Astro blog with dynamic routing, MDX, Playwright e2e test setup
- `apps/admin` — Astro admin app on port 4322
- Both apps wired to `@thelunan/ui` and `@thelunan/types` workspace packages
- Vercel deployment config (`vercel.json`) for both apps
- ESLint, Prettier, Husky + lint-staged at workspace root
