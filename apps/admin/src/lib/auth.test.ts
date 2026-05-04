import { describe, expect, it } from "vitest";

import { signToken, verifyToken } from "./auth";

const SECRET = "test-secret-that-is-at-least-32-chars!!";

describe("signToken + verifyToken", () => {
  it("round-trips a payload", async () => {
    const payload = { sub: "uuid-abc", email: "a@b.com", role: "admin" };
    const token = await signToken(payload, SECRET);
    const result = await verifyToken(token, SECRET);
    expect(result.sub).toBe(payload.sub);
    expect(result.email).toBe(payload.email);
    expect(result.role).toBe(payload.role);
  });

  it("rejects a token signed with the wrong secret", async () => {
    const token = await signToken(
      { sub: "id", email: "a@b.com", role: "admin" },
      SECRET
    );
    await expect(
      verifyToken(token, "wrong-secret-also-32-chars-long!!")
    ).rejects.toThrow();
  });

  it("rejects a malformed token string", async () => {
    await expect(verifyToken("not.a.valid.jwt", SECRET)).rejects.toThrow();
  });
});
