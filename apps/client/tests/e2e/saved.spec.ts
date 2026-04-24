import { expect, test } from "@playwright/test";

test.describe("saved page", () => {
  test("renders with no bookmarks initially", async ({ page }) => {
    await page.goto("/saved");
    await expect(page.getByText(/0 posts bookmarked/i)).toBeVisible();
    await expect(page.getByText(/nothing saved yet/i)).toBeVisible();
  });

  test("shows post title after bookmarking", async ({ page }) => {
    // Seed a bookmark directly in localStorage
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("bb-bookmark-hello-world", "1");
    });
    await page.goto("/saved");
    await expect(page.getByText(/1 post bookmarked/i)).toBeVisible();
    // Title resolved from search.json
    await expect(page.getByText("Hello World")).toBeVisible();
  });

  test("remove button deletes the bookmark", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("bb-bookmark-hello-world", "1");
    });
    await page.goto("/saved");
    await page.getByRole("button", { name: /remove/i }).click();
    await expect(page.getByText(/0 posts bookmarked/i)).toBeVisible();
  });

  test("back link returns to homepage", async ({ page }) => {
    await page.goto("/saved");
    await page.getByRole("link", { name: /back/i }).click();
    await expect(page).toHaveURL("/");
  });
});
