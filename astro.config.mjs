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
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  },
  server: {
    host: true,
  },
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "vitesse-dark",
      wrap: true,
    },
  },
});
