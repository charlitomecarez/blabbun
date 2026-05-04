const OWNER = "charlitomecarez";
const REPO = "blabbun";
const POSTS_PATH = "apps/client/src/content/posts";
const API = "https://api.github.com";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "blabbun-admin",
  };
}

export interface GhFile {
  name: string;
  sha: string;
  download_url: string;
}

export async function listPostFiles(token: string): Promise<GhFile[]> {
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error(`GitHub list failed: ${res.status}`);
  const files = (await res.json()) as GhFile[];
  return files.filter((f) => f.name.endsWith(".mdx") || f.name.endsWith(".md"));
}

export async function getPostFile(
  token: string,
  slug: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}/${slug}.mdx`,
    { headers: headers(token) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub get failed: ${res.status}`);
  const file = (await res.json()) as { content: string; sha: string };
  const content = new TextDecoder().decode(
    Uint8Array.from(atob(file.content.replace(/\n/g, "")), (c) =>
      c.charCodeAt(0)
    )
  );
  return { content, sha: file.sha };
}

export async function upsertPostFile(
  token: string,
  slug: string,
  mdxContent: string,
  sha?: string
): Promise<void> {
  const body: Record<string, unknown> = {
    message: sha ? `update post: ${slug}` : `add post: ${slug}`,
    content: btoa(String.fromCharCode(...new TextEncoder().encode(mdxContent))),
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}/${slug}.mdx`,
    {
      method: "PUT",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    throw new Error(err.message ?? `GitHub upsert failed: ${res.status}`);
  }
}

export async function deletePostFile(
  token: string,
  slug: string,
  sha: string
): Promise<void> {
  const res = await fetch(
    `${API}/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}/${slug}.mdx`,
    {
      method: "DELETE",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({ message: `delete post: ${slug}`, sha }),
    }
  );
  if (!res.ok) throw new Error(`GitHub delete failed: ${res.status}`);
}
