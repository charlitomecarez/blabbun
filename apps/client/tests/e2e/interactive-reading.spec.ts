import { expect, test } from "@playwright/test";

const POST = "/welcome-to-blab-bun";

// ─── ReadingDots ──────────────────────────────────────────────
test.describe("ReadingDots", () => {
  test("renders dots for each h2 on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(POST);
    const dots = page.locator(".reading-dots .dot");
    // welcome-to-blab-bun has 4 h2s
    await expect(dots).toHaveCount(4);
  });

  test("is hidden on narrow viewports", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto(POST);
    await expect(page.locator(".reading-dots")).toHaveCSS("display", "none");
  });

  test("first dot is active on load", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(POST);
    await expect(page.locator(".reading-dots .dot.active")).toHaveCount(1);
  });
});
