// apps/client/tests/e2e/archive.spec.ts
import { expect, test } from "@playwright/test";

test("archive page renders heading and post count", async ({ page }) => {
  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: "Archive" })).toBeVisible();
  await expect(page.getByText(/\d+ posts/)).toBeVisible();
});

test("archive lists all posts by default", async ({ page }) => {
  await page.goto("/archive");
  const titles = page.locator("article h3");
  await expect(
    titles.filter({
      hasText: "The Tabs vs. Spaces Thing Is Not About Tabs or Spaces",
    })
  ).toBeVisible();
  await expect(
    titles.filter({ hasText: "On Not Finishing Things" })
  ).toBeVisible();
  await expect(
    titles.filter({ hasText: "Why I Stopped Using Dark Mode" })
  ).toBeVisible();
  await expect(titles.filter({ hasText: "Hello World" })).toBeVisible();
});

test("tag filter hides posts from other tags", async ({ page }) => {
  await page.goto("/archive");
  // Click the "personal" tag pill — only "On Not Finishing Things" has this tag
  await page.getByRole("button", { name: /personal/i }).click();
  const titles = page.locator("article h3");
  await expect(
    titles.filter({ hasText: "On Not Finishing Things" })
  ).toBeVisible();
  await expect(titles.filter({ hasText: "Hello World" })).not.toBeVisible();
});

test("all pill restores full list", async ({ page }) => {
  await page.goto("/archive");
  await page.getByRole("button", { name: /personal/i }).click();
  const titles = page.locator("article h3");
  await expect(titles.filter({ hasText: "Hello World" })).not.toBeVisible();
  await page.getByRole("button", { name: /all/i }).click();
  await expect(titles.filter({ hasText: "Hello World" })).toBeVisible();
});

test("sort oldest-first reverses the list", async ({ page }) => {
  await page.goto("/archive");
  const titles = page.locator("article h3");
  // Default: newest first — first title should be the most recent post
  await expect(titles.first()).toContainText("The Tabs vs. Spaces Thing");
  // Switch to oldest first
  await page.getByRole("combobox", { name: /sort/i }).selectOption("oldest");
  // Apr 8 is the earliest pubDate across the 4 demo posts
  await expect(titles.first()).toContainText("Why I Stopped Using Dark Mode");
  // ArchiveList <select> must have aria-label="Sort"
});
