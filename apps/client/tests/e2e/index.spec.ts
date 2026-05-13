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
  // wait for component to hydrate
  await expect(page.locator(".featured-card")).toBeVisible();
  const tagBtn = page
    .locator("nav#tag-filters button.tag-btn")
    .filter({ hasText: /\// })
    .first();
  const count = await tagBtn.count();
  if (count === 0) return;
  await tagBtn.click();
  // flat list (#post-list) should appear; featured card should be gone
  await expect(page.locator("#post-list")).toBeVisible();
  await expect(page.locator(".featured-card")).not.toBeAttached();
});

test("homepage all filter restores grid", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
  const tagBtn = page
    .locator("nav#tag-filters button.tag-btn")
    .filter({ hasText: /\// })
    .first();
  const count = await tagBtn.count();
  if (count === 0) return;
  await tagBtn.click();
  await expect(page.locator("#post-list")).toBeVisible();
  await page.getByRole("button", { name: /^all$/i }).click();
  await expect(page.locator(".featured-card")).toBeVisible();
});

test("homepage sort toggle collapses grid to flat list", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".featured-card")).toBeVisible();
  // sort button has aria-label="Toggle sort order"
  await page.getByRole("button", { name: /toggle sort order/i }).click();
  // flat list replaces grid
  await expect(page.locator("#post-list")).toBeVisible();
  await expect(page.locator(".featured-card")).not.toBeAttached();
});
