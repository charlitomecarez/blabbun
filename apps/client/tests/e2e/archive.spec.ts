import { expect, test } from "@playwright/test";

test("archive page renders heading", async ({ page }) => {
  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: "all posts" })).toBeVisible();
});

test("archive lists all posts by default", async ({ page }) => {
  await page.goto("/archive");
  // ArchiveList renders div.archive-title, not article h3
  const titles = page.locator(".archive-title");
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

test("tag filter shows only posts with that tag", async ({ page }) => {
  await page.goto("/archive");
  // Buttons render as "/ technical" (lowercase with slash)
  await page.getByRole("button", { name: /\/\s*technical/i }).click();
  const titles = page.locator(".archive-title");
  await expect(
    titles.filter({ hasText: "On Not Finishing Things" })
  ).toBeVisible();
  await expect(titles.filter({ hasText: "Hello World" })).not.toBeVisible();
});

test("all button restores full list", async ({ page }) => {
  await page.goto("/archive");
  await page.getByRole("button", { name: /\/\s*technical/i }).click();
  await expect(
    page.locator(".archive-title").filter({ hasText: "Hello World" })
  ).not.toBeVisible();
  await page.getByRole("button", { name: /^all$/i }).click();
  await expect(
    page.locator(".archive-title").filter({ hasText: "Hello World" })
  ).toBeVisible();
});

test("sort oldest-first puts oldest post first", async ({ page }) => {
  await page.goto("/archive");
  const titles = page.locator(".archive-title");
  // Default newest: Traffic in the PH is Apr 20
  await expect(titles.first()).toContainText("Traffic in the PH");
  await page.getByRole("combobox", { name: /sort/i }).selectOption("oldest");
  // Oldest: Why I Stopped Using Dark Mode is Apr 8
  await expect(titles.first()).toContainText("Why I Stopped Using Dark Mode");
});

test("sort back to newest-first works", async ({ page }) => {
  await page.goto("/archive");
  await page.getByRole("combobox", { name: /sort/i }).selectOption("oldest");
  await page.getByRole("combobox", { name: /sort/i }).selectOption("newest");
  await expect(page.locator(".archive-title").first()).toContainText(
    "Traffic in the PH"
  );
});

test("archive shows end marker when all posts fit in initial view", async ({
  page,
}) => {
  await page.goto("/archive");
  // With 5 posts < 10 initial items, end marker is immediately visible
  await expect(page.getByLabel("End of list")).toBeVisible();
});
