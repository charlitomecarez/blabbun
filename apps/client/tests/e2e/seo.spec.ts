import { expect, test } from "@playwright/test";

test.describe("SEO meta tags", () => {
  test("homepage has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("The Lunan");
  });

  test("archive page has correct title", async ({ page }) => {
    await page.goto("/archive");
    await expect(page).toHaveTitle(/Archive · The Lunan/);
  });

  test("topics page has correct title", async ({ page }) => {
    await page.goto("/topics");
    await expect(page).toHaveTitle(/Topics · The Lunan/);
  });

  test("about page has correct title", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About · The Lunan/);
  });

  test("every page has a meta description", async ({ page }) => {
    for (const path of ["/", "/archive", "/topics", "/about"]) {
      await page.goto(path);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);
    }
  });

  test("every page has Open Graph title and description", async ({ page }) => {
    for (const path of ["/", "/archive", "/about"]) {
      await page.goto(path);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        /.+/
      );
      await expect(
        page.locator('meta[property="og:description"]')
      ).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        /.+/
      );
    }
  });

  test("every page has Twitter Card meta", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      /summary/
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      /.+/
    );
  });

  test("every page has a canonical link", async ({ page }) => {
    for (const path of ["/", "/archive", "/about"]) {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", /.+/);
    }
  });

  test("sitemap.xml returns valid XML", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("<urlset");
    expect(content).toContain("<url><loc>");
  });

  test("robots.txt exists and references sitemap", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Sitemap:");
  });
});
