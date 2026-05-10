import { createSupabaseClient } from "@blabbun/db";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

function getClient() {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return createSupabaseClient(
    runtimeEnv.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    runtimeEnv.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const DELETE: APIRoute = async () => {
  const supabase = getClient();

  const [comments, clapVotes, postClaps, subscribers] = await Promise.all([
    supabase
      .from("comments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"),
    supabase.from("clap_votes").delete().neq("post_slug", ""),
    supabase.from("post_claps").delete().neq("post_slug", ""),
    supabase
      .from("subscribers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"),
  ]);

  const errors = [comments, clapVotes, postClaps, subscribers]
    .map((r) => r.error?.message)
    .filter(Boolean);

  if (errors.length > 0) return json({ error: errors.join("; ") }, 500);

  return json({ ok: true });
};
