# openblobs

A personal blog where I write about whatever's on my mind — rants, opinions, and my arguably somethings to blab about.

Built with [Astro](https://astro.build) and [Svelte](https://svelte.dev).

## Dev

```bash
pnpm install
pnpm dev
```

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `pnpm dev`      | Start dev server at `localhost:4321` |
| `pnpm build`    | Build for production                 |
| `pnpm preview`  | Preview production build             |
| `pnpm format`   | Format all files with Prettier       |
| `pnpm lint`     | Lint with ESLint                     |
| `pnpm lint:fix` | Auto-fix lint issues                 |
| `pnpm test`     | Run e2e tests with Playwright        |
| `pnpm test:ui`  | Open Playwright UI                   |

## Stack

- [Astro 6](https://astro.build) — static site framework
- [Svelte 5](https://svelte.dev) — interactive components
- [TypeScript](https://typescriptlang.org) — strict mode
- [Prettier](https://prettier.io) — formatting
- [ESLint](https://eslint.org) — linting
- [Playwright](https://playwright.dev) — e2e testing
- [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) — pre-commit hooks
