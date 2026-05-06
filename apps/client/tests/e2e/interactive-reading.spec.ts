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

// ─── MidScrollReaction ────────────────────────────────────────
test.describe("MidScrollReaction", () => {
  test("is not visible on initial load", async ({ page }) => {
    await page.goto(POST);
    await expect(page.getByTestId("mid-scroll-reaction")).not.toBeVisible();
  });

  test("appears after scrolling past 50%", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.documentElement;
      window.scrollTo({ top: el.scrollHeight });
    });
    await expect(page.getByTestId("mid-scroll-reaction")).toBeVisible({
      timeout: 2000,
    });
  });

  test("dismisses when × is clicked", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight })
    );
    const prompt = page.getByTestId("mid-scroll-reaction");
    await expect(prompt).toBeVisible({ timeout: 2000 });
    await prompt
      .getByRole("button", { name: "Dismiss reaction prompt" })
      .click();
    await expect(prompt).not.toBeVisible();
  });

  test("dismisses and saves to localStorage when emoji picked", async ({
    page,
  }) => {
    await page.goto(POST);
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight })
    );
    const prompt = page.getByTestId("mid-scroll-reaction");
    await expect(prompt).toBeVisible({ timeout: 2000 });
    await prompt.getByRole("button", { name: "React with fire" }).click();
    await expect(prompt).not.toBeVisible();
    const stored = await page.evaluate(() =>
      localStorage.getItem("bb-reaction-mine-welcome-to-blab-bun")
    );
    expect(stored).toBe("fire");
  });
});
