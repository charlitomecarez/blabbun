import { createHmac, timingSafeEqual } from "node:crypto";

function sign(email: string, secret: string): string {
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex");
}

export function verifyUnsubscribeToken(
  email: string,
  token: string,
  secret: string
): boolean {
  try {
    const expected = Buffer.from(sign(email, secret), "hex");
    const actual = Buffer.from(token, "hex");
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string, secret: string): string {
  const token = sign(email, secret);
  const params = new URLSearchParams({ email, token });
  return `https://blabbun.com/unsubscribe?${params}`;
}
