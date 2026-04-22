import { expect, test } from "@playwright/test";

test.describe("claps API", () => {
  const testSlug = `clap-post-${Date.now()}`;

  test("GET returns 0 for unknown slug", async ({ request }) => {
    const res = await request.get(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ count: 0 });
  });

  test("POST increments from 0 to 1", async ({ request }) => {
    const res = await request.post(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ count: 1 });
  });

  test("POST increments again to 2", async ({ request }) => {
    const res = await request.post(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ count: 2 });
  });

  test("GET returns current count", async ({ request }) => {
    const res = await request.get(`/api/claps/${testSlug}`);
    expect(res.status()).toBe(200);
    const { count } = await res.json();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
