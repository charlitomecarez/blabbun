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

// ─── CheckpointDividers ───────────────────────────────────────
test.describe("CheckpointDividers", () => {
  test("injects one divider before each h2", async ({ page }) => {
    await page.goto(POST);
    // welcome-to-blab-bun has 4 h2s → 4 dividers
    await expect(
      page.locator("[data-testid='checkpoint-divider']")
    ).toHaveCount(4);
  });

  test("dividers start hidden and become visible after scrolling", async ({
    page,
  }) => {
    await page.goto(POST);
    await page.waitForLoadState("networkidle");
    const dividers = page.locator("[data-testid='checkpoint-divider']");
    // Last divider is off-screen on load — should start hidden
    await expect(dividers.last()).toHaveCSS("opacity", "0");
    // Scroll the last divider into view
    await dividers.last().scrollIntoViewIfNeeded();
    await expect(dividers.last()).toHaveCSS("opacity", "1", {
      timeout: 3000,
    });
  });

  test("displays Caveat-font checkpoint messages", async ({ page }) => {
    await page.goto(POST);
    const firstMessage = page
      .locator("[data-testid='checkpoint-divider'] .checkpoint-message")
      .first();
    await expect(firstMessage).toHaveText("✶ still here? respect. ✶");
  });
});

// ─── QuotePopover ─────────────────────────────────────────────
test.describe("QuotePopover", () => {
  test("does not appear for selections under 10 chars", async ({ page }) => {
    await page.goto(POST);
    // Select a very short piece of text
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el) return;
      const range = document.createRange();
      range.setStart(el.firstChild!, 0);
      range.setEnd(el.firstChild!, 5);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
    });
    await expect(page.getByTestId("quote-popover")).not.toBeVisible();
  });

  test("appears when selecting sufficient text inside article", async ({
    page,
  }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el || !el.firstChild) return;
      const text = el.firstChild.textContent ?? "";
      const range = document.createRange();
      range.setStart(el.firstChild, 0);
      range.setEnd(el.firstChild, Math.min(60, text.length));
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      // Trigger selectionchange
      document.dispatchEvent(new Event("selectionchange"));
    });
    await expect(page.getByTestId("quote-popover")).toBeVisible({
      timeout: 1000,
    });
  });

  test("save quote button stores quote in localStorage", async ({ page }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el || !el.firstChild) return;
      const text = el.firstChild.textContent ?? "";
      const range = document.createRange();
      range.setStart(el.firstChild, 0);
      range.setEnd(el.firstChild, Math.min(60, text.length));
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    });
    const popover = page.getByTestId("quote-popover");
    await expect(popover).toBeVisible({ timeout: 1000 });
    await popover.getByRole("button", { name: /save quote/ }).click();
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem("bb-quotes");
      return raw ? JSON.parse(raw) : [];
    });
    expect(stored.length).toBe(1);
    expect(stored[0].slug).toBe("welcome-to-blab-bun");
  });

  test("Escape closes popover without triggering history.back", async ({
    page,
  }) => {
    await page.goto(POST);
    await page.evaluate(() => {
      const el = document.querySelector(".post-content p");
      if (!el || !el.firstChild) return;
      const text = el.firstChild.textContent ?? "";
      const range = document.createRange();
      range.setStart(el.firstChild, 0);
      range.setEnd(el.firstChild, Math.min(60, text.length));
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
    });
    await expect(page.getByTestId("quote-popover")).toBeVisible({
      timeout: 1000,
    });
    await page.keyboard.press("Escape");
    // Popover closes
    await expect(page.getByTestId("quote-popover")).not.toBeVisible();
    // Page did not navigate back (still on the post)
    expect(page.url()).toContain("welcome-to-blab-bun");
  });
});
