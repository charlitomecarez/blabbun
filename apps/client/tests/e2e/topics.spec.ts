import { expect, test } from "@playwright/test";

test("topics index renders heading", async ({ page }) => {
  await page.goto("/topics");
  await expect(page.getByRole("heading", { name: /topics/i })).toBeVisible();
});

test("topics index lists actual tags", async ({ page }) => {
  await page.goto("/topics");
  await expect(page.locator('[data-testid="topic-link-rants"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="topic-link-technical"]')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="topic-link-editorial"]')
  ).toBeVisible();
});

test("topics index shows post counts per topic", async ({ page }) => {
  await page.goto("/topics");
  // Each topic link has a count span — check at least one exists
  await expect(
    page.locator('[data-testid="topic-link-rants"]').getByText(/\d+ post/)
  ).toBeVisible();
});

test("clicking a topic goes to its detail page", async ({ page }) => {
  await page.goto("/topics");
  await page.locator('[data-testid="topic-link-rants"]').click();
  await expect(page).toHaveURL("/topics/rants");
});

test("topic detail renders filtered posts", async ({ page }) => {
  await page.goto("/topics/rants");
  const titles = page.locator(".archive-title");
  await expect(titles.filter({ hasText: "Hello World" })).toBeVisible();
  await expect(titles.filter({ hasText: "Traffic in the PH" })).toBeVisible();
  await expect(
    titles.filter({ hasText: "On Not Finishing Things" })
  ).not.toBeVisible();
});

test("topic detail back link goes to /topics", async ({ page }) => {
  await page.goto("/topics/rants");
  await page
    .getByRole("link", { name: /topics/i })
    .first()
    .click();
  await expect(page).toHaveURL("/topics");
});

test("topic detail sort oldest-first works", async ({ page }) => {
  await page.goto("/topics/rants");
  const titles = page.locator(".archive-title");
  // Default newest: Traffic in the PH (Apr 20)
  await expect(titles.first()).toContainText("Traffic in the PH");
  await page.getByRole("combobox", { name: /sort/i }).selectOption("oldest");
  // Oldest RANTS post: Hello World (Apr 15)
  await expect(titles.first()).toContainText("Hello World");
});
