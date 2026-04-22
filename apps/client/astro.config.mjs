// @ts-check
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://thelunan.com",
  integrations: [svelte(), mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});
