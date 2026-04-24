import { expect, test } from "@playwright/test";

// Serial: each test builds on state created by previous tests
test.describe.serial("comments API", () => {
  const testSlug = `test-post-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  test("GET returns empty array for unknown slug", async ({ request }) => {
    const res = await request.get(`/api/comments/${testSlug}-unknown`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("POST creates a top-level comment", async ({ request }) => {
    const res = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "Playwright test comment" },
    });
    expect(res.status()).toBe(201);
    const comment = await res.json();
    expect(comment.body).toBe("Playwright test comment");
    expect(comment.post_slug).toBe(testSlug);
    expect(comment.parent_id).toBeNull();
    expect(typeof comment.id).toBe("string");
  });

  test("POST creates a reply with parent_id", async ({ request }) => {
    const parentRes = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "Parent comment" },
    });
    expect(parentRes.status()).toBe(201);
    const parent = await parentRes.json();

    const replyRes = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "Reply to parent", parent_id: parent.id },
    });
    expect(replyRes.status()).toBe(201);
    const reply = await replyRes.json();
    expect(reply.parent_id).toBe(parent.id);
  });

  test("GET returns the tree with nested replies", async ({ request }) => {
    const res = await request.get(`/api/comments/${testSlug}`);
    expect(res.status()).toBe(200);
    const tree = await res.json();
    const withReplies = tree.find(
      (c: { body: string; replies: unknown[] }) => c.body === "Parent comment"
    );
    expect(withReplies).toBeDefined();
    expect(withReplies.replies.length).toBeGreaterThan(0);
  });

  test("POST 400 when body is empty", async ({ request }) => {
    const res = await request.post(`/api/comments/${testSlug}`, {
      data: { body: "   " },
    });
    expect(res.status()).toBe(400);
    const err = await res.json();
    expect(err.error).toBeTruthy();
  });
});
