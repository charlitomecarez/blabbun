// apps/client/tests/e2e/topics.spec.ts
import { expect, test } from "@playwright/test";

test("topics index renders heading", async ({ page }) => {
  await page.goto("/topics");
  await expect(page.getByRole("heading", { name: "Topics" })).toBeVisible();
});

test("topics index lists all tags", async ({ page }) => {
  await page.goto("/topics");
  // All 3 tags from the demo posts must appear
  await expect(page.getByText(/opinion/i).first()).toBeVisible();
  await expect(page.getByText(/personal/i).first()).toBeVisible();
  await expect(page.getByText(/meta/i).first()).toBeVisible();
});

test("topics index links to topic detail page", async ({ page }) => {
  await page.goto("/topics");
  await page
    .getByRole("link", { name: /opinion/i })
    .first()
    .click();
  await expect(page).toHaveURL("/topics/opinion");
});

test("topic detail renders heading and filtered posts", async ({ page }) => {
  await page.goto("/topics/opinion");
  await expect(page.getByRole("heading", { name: /opinion/i })).toBeVisible();
  const titles = page.locator("article h3");
  // Both opinion posts must be visible
  await expect(
    titles.filter({ hasText: "The Tabs vs. Spaces Thing" })
  ).toBeVisible();
  await expect(
    titles.filter({ hasText: "Why I Stopped Using Dark Mode" })
  ).toBeVisible();
  // Personal post must NOT appear
  await expect(
    titles.filter({ hasText: "On Not Finishing Things" })
  ).not.toBeVisible();
});

test("topic detail has no filter pills", async ({ page }) => {
  await page.goto("/topics/opinion");
  // The "All" pill only exists on the archive page, not on locked topic pages
  await expect(page.getByRole("button", { name: /^all$/i })).not.toBeVisible();
});

test("topic detail back link goes to /topics", async ({ page }) => {
  await page.goto("/topics/opinion");
  await page.getByRole("link", { name: /← topics/i }).click();
  await expect(page).toHaveURL("/topics");
});

test("topic detail sort oldest-first works", async ({ page }) => {
  await page.goto("/topics/opinion");
  const titles = page.locator("article h3");
  // Default newest first: tabs post is Apr 19
  await expect(titles.first()).toContainText("The Tabs vs. Spaces Thing");
  await page.getByRole("combobox", { name: /sort/i }).selectOption("oldest");
  // Oldest: dark mode post is Apr 8
  await expect(titles.first()).toContainText("Why I Stopped Using Dark Mode");
});
