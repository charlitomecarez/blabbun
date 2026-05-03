import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
      "Set-Cookie":
        "bb_admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    },
  });
};
