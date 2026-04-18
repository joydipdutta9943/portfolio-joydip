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

**Layouts:** Single root layout at `src/layouts/Layout.astro` handles `<head>`, nav, footer, SEO metadata (structured data, sitemap, robots.txt), and mounts the `CommandPalette` React island. Layout also builds the `CmdItem[]` array consumed by the palette from the projects collection + static nav/action entries.

**Styling:** Tailwind v4 is loaded as a Vite plugin (not PostCSS). Design tokens are in `src/styles/tokens.css` — a hybrid `@theme { ... }` block (Tailwind-mapped colors/fonts/radii/tracking) plus a `:root { ... }` block (raw CSS vars for shadows, motion curves, grid, tints, gradients). `src/styles/kit.css` carries the `pk-*` component styles (nav, buttons, cards, command palette, etc.). Global base rules, MDX `prose-content` styling, and `@utility` definitions (`gradient-text`, `gradient-fill`, `dotted-bg`, `card-surface`) live in `src/styles/global.css`. The design uses a dark theme with `--color-bg: #08080b` and a duotone violet→cyan accent (`#7c5cff` → `#22d3ee`).

**Fonts:** Geist Sans (display + body) and Geist Mono (code + labels) loaded via `@fontsource/geist-sans` and `@fontsource/geist-mono`. Berkeley/Commit Mono is a future swap — drop the `.woff2` into `public/fonts/` and update `--font-mono` in `tokens.css` when the license is acquired.

**React islands:** Located in `src/components/react/`. Button (magnetic), Card (tilt), RevealWords, CountUpStat, CopyEmailButton, CommandPalette. Hydration: `client:load` above the fold, `client:visible` below, `client:idle` for the palette. Pure-static UI primitives (StatusPill, Chip, Chips, Eyebrow) stay as Astro components in `src/components/ui/`. All motion is gated by `usePrefersReducedMotion` + the global CSS reduce-motion kill-switch in `tokens.css`.

**Command palette:** `⌘K` / `Ctrl+K` opens; the Nav "Search" button dispatches a `pk:cmd-open` `CustomEvent` the palette listens for. Items = static nav jumps + copy-email + résumé + GitHub + LinkedIn + one entry per case study (sourced via `getCollection("projects")`). Substring match across `label` + `techStack` tags.

**Build stamp:** `astro.config.mjs` defines `__BUILD_TIME__` via Vite's `define`. The footer shows a live "deployed Nd ago" indicator computed client-side from the embedded ISO string.

**Key integrations in `astro.config.mjs`:** MDX, React, sitemap generation. Shiki code highlighting uses `vitesse-dark` theme. Site URL is `https://sannin-coder.info`.

## Adding a Project Case Study

Create `src/content/projects/<slug>.mdx` with frontmatter matching the schema in `content.config.ts`. The page auto-generates at `/projects/<slug>` and an entry auto-appears in the command palette.

## Formatting

Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`. Double quotes, semicolons, trailing commas (es5), 100 char print width.
