import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

import { verifyToken } from "@/lib/auth";

const PUBLIC = new Set(["/login", "/api/auth/login", "/api/auth/logout"]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (PUBLIC.has(pathname)) return next();

  const token = context.cookies.get("bb_admin_token")?.value;
  if (!token) return context.redirect("/login");

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const jwtSecret =
    runtimeEnv.JWT_SECRET ?? (import.meta.env.JWT_SECRET as string | undefined);
  if (!jwtSecret) return context.redirect("/login");

  try {
    const payload = await verifyToken(token, jwtSecret);
    context.locals.admin = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch {
    return context.redirect("/login");
  }
});
