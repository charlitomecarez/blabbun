import { expect, test } from "@playwright/test";

test.describe("admin claps", () => {
  test("renders claps page with create form", async ({ page }) => {
    await page.goto("/claps");
    await expect(
      page.getByRole("heading", { name: /post claps/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder("post-slug")).toBeVisible();
  });

  test("shows total stats", async ({ page }) => {
    await page.goto("/claps");
    await expect(page.getByText(/posts/)).toBeVisible();
    await expect(page.getByText(/total claps/)).toBeVisible();
  });

  test("adds a new clap entry", async ({ page }) => {
    await page.goto("/claps");
    const slug = `admin-clap-${Date.now()}`;
    await page.getByPlaceholder("post-slug").fill(slug);
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.waitForURL("/claps");
    await expect(page.getByText(`/${slug}`)).toBeVisible();
  });

  test("edit button shows inline number input", async ({ page }) => {
    await page.goto("/claps");
    const editBtns = page.getByRole("button", { name: /^edit$/i });
    if ((await editBtns.count()) === 0) test.skip();
    await editBtns.first().click();
    await expect(
      page.locator("input.edit-input[type='number']").first()
    ).toBeVisible();
  });

  test("cancel restores original count", async ({ page }) => {
    await page.goto("/claps");
    const editBtns = page.getByRole("button", { name: /^edit$/i });
    if ((await editBtns.count()) === 0) test.skip();
    const row = editBtns.first().locator("xpath=../../../..");
    const original = await row.locator(".count-text").textContent();
    await editBtns.first().click();
    await page
      .getByRole("button", { name: /^cancel$/i })
      .first()
      .click();
    await expect(row.locator(".count-text")).toHaveText(original ?? "0");
  });
});
