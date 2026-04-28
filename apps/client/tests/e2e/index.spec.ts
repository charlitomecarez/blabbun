import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Blab Bun/);
});

test("homepage renders post list", async ({ page }) => {
  await page.goto("/");
  // FeedItem renders h3.feed-title
  await expect(page.locator(".feed-title").first()).toBeVisible();
});

test("homepage shows end marker when all posts are visible", async ({
  page,
}) => {
  await page.goto("/");
  // With 5 posts < 10 initial items, all are rendered and end marker shows
  await expect(page.getByLabel("End of list")).toBeVisible();
});

test("homepage tag filter hides non-matching posts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /\/\s*technical/i }).click();
  // "Hello World" is RANTS tag — should be hidden
  await expect(
    page.locator(".feed-title").filter({ hasText: "Hello World" })
  ).not.toBeVisible();
});

test("homepage tag filter all button restores posts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /\/\s*technical/i }).click();
  await page.getByRole("button", { name: /^all$/i }).click();
  await expect(
    page.locator(".feed-title").filter({ hasText: "Hello World" })
  ).toBeVisible();
});
