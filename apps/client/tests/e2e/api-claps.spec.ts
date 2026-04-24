import { expect, test } from "@playwright/test";

// Serial so POST/toggle tests don't race across parallel workers
test.describe.serial("claps API", () => {
  // workerIndex makes slug unique per browser project
  const slug = `clap-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  test("GET returns count 0 and hasClapped false for unknown slug", async ({
    request,
  }) => {
    const res = await request.get(`/api/claps/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(0);
    expect(body.hasClapped).toBe(false);
  });

  test("POST adds a clap and returns hasClapped true", async ({ request }) => {
    const res = await request.post(`/api/claps/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThanOrEqual(1);
    expect(body.hasClapped).toBe(true);
  });

  test("POST again toggles clap off", async ({ request }) => {
    const res = await request.post(`/api/claps/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.hasClapped).toBe(false);
  });

  test("GET reflects updated state", async ({ request }) => {
    const res = await request.get(`/api/claps/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.count).toBe("number");
    expect(typeof body.hasClapped).toBe("boolean");
  });
});
