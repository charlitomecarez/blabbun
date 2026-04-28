import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { getRuntimeEnv, getSupabaseClient, jsonResponse } from "@/lib/api";
import { getResendClient, newPostEmailHtml } from "@/lib/emails";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getRuntimeEnv(locals);
  const secret = env.CRON_SECRET ?? import.meta.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const supabase = getSupabaseClient(
    env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [allPosts, notifiedResult, subscribersResult] = await Promise.all([
    getCollection("posts"),
    supabase.from("post_notifications").select("post_slug"),
    supabase.from("subscribers").select("email"),
  ]);

  const today = new Date();
  const notifiedSlugs = new Set(
    notifiedResult.data?.map((r) => r.post_slug) ?? []
  );
  const subscribers = subscribersResult.data ?? [];

  // Pick only the single most-recently published unnotified post
  const post = allPosts
    .filter(
      (p) =>
        !p.data.draft &&
        new Date(p.data.pubDate) <= today &&
        !notifiedSlugs.has(p.id)
    )
    .sort(
      (a, b) =>
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
    )[0];

  if (!post || subscribers.length === 0) {
    return jsonResponse({ notified: 0, post: null });
  }

  const unsubscribeSecret =
    env.UNSUBSCRIBE_SECRET ?? import.meta.env.UNSUBSCRIBE_SECRET ?? "";
  const resend = getResendClient(
    env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY
  );
  const date = new Date(post.data.pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Each subscriber gets a personalized email with their own unsubscribe link
  const messages = subscribers.map((sub) => ({
    from: "onboarding@resend.dev",
    to: sub.email,
    subject: post.data.title,
    html: newPostEmailHtml(
      {
        title: post.data.title,
        slug: post.id,
        description: post.data.description,
        date,
        image: post.data.image,
      },
      sub.email,
      unsubscribeSecret
    ),
  }));

  for (let i = 0; i < messages.length; i += 100) {
    await resend.batch.send(messages.slice(i, i + 100));
  }

  await supabase
    .from("post_notifications")
    .insert({ post_slug: post.id })
    .throwOnError();

  return jsonResponse({
    notified: 1,
    post: post.data.title,
    subscribers: subscribers.length,
  });
};
