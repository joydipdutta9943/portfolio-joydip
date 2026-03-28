# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at localhost:4321
- `npm run build` — Production build to `./dist/`
- `npm run preview` — Serve production build locally
- `npm run format` — Format all files with Prettier

No test framework is configured.

## Architecture

Astro v6 static site with React v19 islands, Tailwind CSS v4 (via Vite plugin), and MDX content. Node.js >= 22.12.0 required.

**Content system:** Project case studies live in `src/content/projects/*.mdx`. The collection schema is defined in `src/content.config.ts` (fields: `title`, `description`, `techStack`, optional `order` and `image`). Pages are generated via `src/pages/projects/[slug].astro` using `getStaticPaths()` with the slug derived from the MDX filename.

**Layouts:** Single root layout at `src/layouts/Layout.astro` handles `<head>`, nav, footer, and SEO metadata (structured data, sitemap, robots.txt).

**Styling:** Tailwind v4 is loaded as a Vite plugin (not PostCSS). Custom design tokens (colors, fonts) are in `tailwind.config.mjs`. Global styles and MDX prose styling (`prose-content` class) are in `src/styles/global.css`. The design uses a dark theme with `background: #09090b`, `accent: #4ade80` (terminal green).

**Key integrations in `astro.config.mjs`:** MDX, React, sitemap generation. Shiki code highlighting uses `vitesse-dark` theme. Site URL is `https://sannin-coder.info`.

## Adding a Project Case Study

Create `src/content/projects/<slug>.mdx` with frontmatter matching the schema in `content.config.ts`. The page auto-generates at `/projects/<slug>`.

## Formatting

Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`. Double quotes, semicolons, trailing commas (es5), 100 char print width.
