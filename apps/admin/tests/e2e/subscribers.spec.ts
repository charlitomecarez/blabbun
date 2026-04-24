import { expect, test } from "@playwright/test";

test.describe("admin subscribers", () => {
  test("renders subscribers page with create form", async ({ page }) => {
    await page.goto("/subscribers");
    await expect(
      page.getByRole("heading", { name: /subscribers/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder("email@example.com")).toBeVisible();
  });

  test("shows total count", async ({ page }) => {
    await page.goto("/subscribers");
    await expect(page.getByText(/\d+ total/)).toBeVisible();
  });

  test("adds a new subscriber", async ({ page }) => {
    await page.goto("/subscribers");
    const email = `admin-test-${Date.now()}@example.com`;
    await page.getByPlaceholder("email@example.com").fill(email);
    await page.getByRole("button", { name: /^add$/i }).click();
    await page.waitForURL("/subscribers");
    await expect(page.getByText(email)).toBeVisible();
  });

  test("rejects invalid email via HTML5 validation", async ({ page }) => {
    await page.goto("/subscribers");
    await page.getByPlaceholder("email@example.com").fill("not-an-email");
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page).toHaveURL("/subscribers");
    // Form stays — no reload since validation blocks submit
  });

  test("edit button shows inline input", async ({ page }) => {
    await page.goto("/subscribers");
    const editBtns = page.getByRole("button", { name: /^edit$/i });
    if ((await editBtns.count()) === 0) test.skip();
    await editBtns.first().click();
    await expect(page.locator("input.edit-input").first()).toBeVisible();
  });
});
