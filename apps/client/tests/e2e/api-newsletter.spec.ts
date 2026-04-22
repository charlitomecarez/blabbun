import { expect, test } from "@playwright/test";

test.describe("newsletter API", () => {
  test("POST subscribes new email", async ({ request }) => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request.post("/api/newsletter", {
      data: { email },
    });
    expect(res.status()).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty("id");
    expect(json.email).toBe(email);
  });

  test("POST rejects empty email", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "" },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  test("POST rejects invalid email", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "not-an-email" },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  test("POST prevents duplicate subscriptions", async ({ request }) => {
    const email = `duplicate-${Date.now()}@example.com`;

    const res1 = await request.post("/api/newsletter", {
      data: { email },
    });
    expect(res1.status()).toBe(201);

    const res2 = await request.post("/api/newsletter", {
      data: { email },
    });
    expect(res2.status()).toBe(409);
    const json = await res2.json();
    expect(json).toHaveProperty("error");
  });
});
