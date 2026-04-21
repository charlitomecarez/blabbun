import { expect, test } from "@playwright/test";

test.describe("scroll-to-top button", () => {
  test("is hidden on initial load", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveCSS("opacity", "0");
  });

  test("is not keyboard-focusable when hidden", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveAttribute("tabindex", "-1");
  });

  test("appears after scrolling 300px", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveCSS("opacity", "1", { timeout: 1000 });
  });

  test("is keyboard-focusable when visible", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveAttribute("tabindex", "0", { timeout: 1000 });
  });

  test("scrolls page to top when clicked", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 400 }));
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toHaveCSS("opacity", "1", { timeout: 1000 });
    await button.click();
    await page.waitForFunction(() => window.scrollY === 0);
  });
});
