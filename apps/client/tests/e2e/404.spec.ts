import { expect, test } from "@playwright/test";

test.describe("404 page", () => {
  test("returns 404 status for unknown route", async ({ page }) => {
    const res = await page.goto("/this-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
  });

  test("renders the 404 page content", async ({ page }) => {
    await page.goto("/this-does-not-exist-xyz");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText(/doesn't exist/i)).toBeVisible();
  });

  test("has a link back home", async ({ page }) => {
    await page.goto("/this-does-not-exist-xyz");
    await page.getByRole("link", { name: /go home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("has a link to the archive", async ({ page }) => {
    await page.goto("/this-does-not-exist-xyz");
    await expect(
      page.getByRole("link", { name: /browse all posts/i })
    ).toBeVisible();
  });
});
