import { expect, test } from "@playwright/test";

// aria-hidden="true" hides the button from getByRole when invisible — use attribute selector
const btn = (page: import("@playwright/test").Page) =>
  page.locator('button[aria-label="Scroll to top"]');

test.describe("scroll-to-top button", () => {
  test("is invisible on initial load", async ({ page }) => {
    await page.goto("/");
    await expect(btn(page)).toHaveCSS("opacity", "0");
  });

  test("is not keyboard-focusable when hidden", async ({ page }) => {
    await page.goto("/");
    await expect(btn(page)).toHaveAttribute("tabindex", "-1");
  });

  test("appears after scrolling 400px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    await expect(btn(page)).toHaveCSS("opacity", "1", { timeout: 2000 });
  });

  test("is keyboard-focusable when visible", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    await expect(btn(page)).toHaveAttribute("tabindex", "0", { timeout: 2000 });
  });

  test("scrolls back to top when clicked", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    await expect(btn(page)).toHaveCSS("opacity", "1", { timeout: 2000 });
    await btn(page).click();
    await page.waitForFunction(() => window.scrollY === 0);
  });
});
