import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://sannin-coder.info",
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
    },
  },
  server: {
    host: true, // Listen on all local networks (0.0.0.0)
  },
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "vitesse-dark",
      wrap: true,
    },
  },
});
