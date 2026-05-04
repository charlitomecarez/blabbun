import { jwtVerify, SignJWT } from "jose";

export interface AdminPayload {
  sub: string;
  email: string;
  role: string;
}

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: AdminPayload,
  secret: string
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(key(secret));
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<AdminPayload> {
  const { payload } = await jwtVerify(token, key(secret));
  return {
    sub: payload.sub as string,
    email: payload["email"] as string,
    role: payload["role"] as string,
  };
}
