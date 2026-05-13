import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Blab Bun/);
});

test("homepage renders featured card in default view", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
});

test("homepage renders post titles", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".post-title").first()).toBeVisible();
});

test("homepage tag filter collapses grid to flat list", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
  // click first non-"all" tag filter button
  const tagBtn = page.locator("nav#tag-filters .tag-btn").filter({ hasText: /\// }).first();
  await tagBtn.click();
  await expect(page.locator(".featured-card")).not.toBeVisible();
  await expect(page.locator(".post-title").first()).toBeVisible();
});

test("homepage all filter restores grid", async ({ page }) => {
  await page.goto("/");
  const tagBtn = page.locator("nav#tag-filters .tag-btn").filter({ hasText: /\// }).first();
  await tagBtn.click();
  await page.getByRole("button", { name: /^all$/i }).click();
  await expect(page.locator(".featured-card")).toBeVisible();
});

test("homepage sort toggle collapses grid to flat list", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
  await page.getByRole("button", { name: /latest blab|oldest blab/i }).click();
  await expect(page.locator(".featured-card")).not.toBeVisible();
});
