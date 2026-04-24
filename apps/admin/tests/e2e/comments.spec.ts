import { expect, test } from "@playwright/test";

test.describe("admin comments", () => {
  test("renders comments page with create form", async ({ page }) => {
    await page.goto("/comments");
    await expect(
      page.getByRole("heading", { name: /comments/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder("post-slug")).toBeVisible();
    await expect(page.getByPlaceholder("comment body")).toBeVisible();
  });

  test("create form requires post_slug and body", async ({ page }) => {
    await page.goto("/comments");
    await page.getByRole("button", { name: /add comment/i }).click();
    // HTML5 validation prevents submit — form stays on page
    await expect(page).toHaveURL("/comments");
  });

  test("creates a comment and shows it in the list", async ({ page }) => {
    await page.goto("/comments");
    const slug = `admin-test-${Date.now()}`;
    await page.getByPlaceholder("post-slug").fill(slug);
    await page.getByPlaceholder("comment body").fill("admin test comment");
    await page.getByRole("button", { name: /add comment/i }).click();
    await page.waitForURL("/comments");
    await expect(page.getByText("admin test comment")).toBeVisible();
  });

  test("edit button shows inline textarea", async ({ page }) => {
    await page.goto("/comments");
    const editBtns = page.getByRole("button", { name: /^edit$/i });
    const count = await editBtns.count();
    if (count === 0) test.skip();
    await editBtns.first().click();
    await expect(page.locator("textarea.edit-input").first()).toBeVisible();
  });

  test("cancel restores original text", async ({ page }) => {
    await page.goto("/comments");
    const editBtns = page.getByRole("button", { name: /^edit$/i });
    if ((await editBtns.count()) === 0) test.skip();
    const row = editBtns.first().locator("../..");
    const original = await row.locator(".body-text").textContent();
    await editBtns.first().click();
    await page
      .getByRole("button", { name: /^cancel$/i })
      .first()
      .click();
    await expect(row.locator(".body-text")).toHaveText(original ?? "");
  });
});
