import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: cloudflare({ imagesBindingName: false }),

  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [
        "@blabbun/utils",
        "@blabbun/db",
        "@blabbun/types",
        "@blabbun/ui",
      ],
    },
  },

  devToolbar: { enabled: false },
  security: { checkOrigin: false },

  compressHTML: true,
});
