import { expect, test } from "@playwright/test";

test.describe("admin dashboard", () => {
  test("loads and shows dashboard heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
  });

  test("shows stat cards for comments, subscribers, claps", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText(/comments/i)).toBeVisible();
    await expect(page.getByText(/subscribers/i)).toBeVisible();
    await expect(page.getByText(/total claps/i)).toBeVisible();
  });

  test("sidebar has navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /comments/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /subscribers/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /post claps/i })).toBeVisible();
  });

  test("clicking comments nav goes to comments page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^comments$/i }).click();
    await expect(page).toHaveURL("/comments");
    await expect(
      page.getByRole("heading", { name: /comments/i })
    ).toBeVisible();
  });

  test("clicking subscribers nav goes to subscribers page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^subscribers$/i }).click();
    await expect(page).toHaveURL("/subscribers");
    await expect(
      page.getByRole("heading", { name: /subscribers/i })
    ).toBeVisible();
  });

  test("clicking post claps nav goes to claps page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^post claps$/i }).click();
    await expect(page).toHaveURL("/claps");
    await expect(
      page.getByRole("heading", { name: /post claps/i })
    ).toBeVisible();
  });

  test("theme toggle switches dark/light mode", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveClass(/light/);
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(page.locator("body")).toHaveClass(/dark/);
    await page.getByRole("button", { name: /toggle theme/i }).click();
    await expect(page.locator("body")).toHaveClass(/light/);
  });
});
