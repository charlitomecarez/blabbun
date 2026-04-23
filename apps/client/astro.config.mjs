// @ts-check
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blabbun.com",
  output: "server",
  adapter: vercel(),
  devToolbar: { enabled: false },
  integrations: [svelte(), mdx()],
  image: {
    domains: ["images.unsplash.com"],
    remotePatterns: [{ protocol: "https" }],
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
    },
  },
  compressHTML: true,
});
