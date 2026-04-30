import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blabbun.com",

  output: "static",
  adapter: cloudflare(),

  devToolbar: { enabled: false },
  security: { checkOrigin: false },

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
    ssr: {
      noExternal: [
        "@blabbun/utils",
        "@blabbun/db",
        "@blabbun/types",
        "@blabbun/ui",
      ],
    },
  },

  compressHTML: true,
});
