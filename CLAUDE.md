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

**Content system:** Project case studies live in `src/content/projects/*.mdx`. The collection schema is defined in `src/content.config.ts` (fields: `title`, `description`, `techStack`, optional `order`, `image`, `publishedDate`, `updatedDate`, and optional `category: "fintech" | "ai" | "saas"` which drives the Work carousel's filter tabs). Pages are generated via `src/pages/projects/[slug].astro` using `getStaticPaths()` with the slug derived from the MDX filename. `publishedDate`/`updatedDate` (when present) flow into the per-page `TechArticle` JSON-LD. Frontmatter `description` strings are impact-led one-liners sourced from the career master brain — they surface in the Work carousel, `/projects` listing, and command palette.

**MDX case study conventions:** Case study bodies do NOT include code snippets — the prose describes engineering decisions. The opening `> blockquote` on each page renders as a gradient-accented lead quote (see `.prose-content blockquote` in `global.css`), so frame it as a one-liner tagline for the project.

**Layouts:** Single root layout at `src/layouts/Layout.astro` handles `<head>`, nav, footer, SEO metadata, and mounts the `CommandPalette` React island. Layout emits up to four JSON-LD blocks per page: `Person` + `WebSite` always, `BreadcrumbList` when the optional `breadcrumbs` prop is passed (`/projects` and `[slug]` do this), and `TechArticle` when the optional `article` prop is passed (`[slug]` only). `og:type` flips to `"article"` when `article` is present. Layout also builds the `CmdItem[]` array consumed by the palette from the projects collection + static nav/action entries.

**Styling:** Tailwind v4 is loaded as a Vite plugin (not PostCSS). Design tokens are in `src/styles/tokens.css` — a hybrid `@theme { ... }` block (Tailwind-mapped colors/fonts/radii/tracking) plus a `:root { ... }` block (raw CSS vars for shadows, motion curves, tints, gradients, and the radial `--scene-*` gradients). `src/styles/kit.css` carries the `pk-*` component styles (nav, buttons, cards, command palette, etc.); `src/styles/carousel.css` carries the Work-section ProjectCarousel styles. Global base rules, MDX `prose-content` styling, and `@utility` definitions (`gradient-text`, `gradient-fill`, `card-surface`) live in `src/styles/global.css`. The design follows the "Minimalist Dark" reference: near-black base (`--color-bg: #08080b`) with violet→lavender accents (`#8b7cff` → `#c4b5fd`), radial gradient scene layers per section (`.pk-scene-layer--{hero,glow,contact}`), glass surfaces (`rgba(255,255,255,.04)` + backdrop-blur), a floating pill nav, metallic silver primary CTAs (`--gradient-metal`, dark `--color-metal-ink` text, circular `.pk-btn__cap` icon disc), and giant ghosted section headings (`.pk-h2-ghost` inside `.pk-sechead`, always `aria-hidden`). Cyan is retired — nothing in `src/` may reference `#22d3ee`. Prose body uses `--color-fg-body` (`#d4d4d8`) for comfortable reading; reserve `--color-fg-muted` for secondary UI (nav, footer, metadata). Chip variants: `pk-chip--lg` only (the category-tinted variants were removed with the About redesign).

**Fonts:** Geist Sans (display + body) and Geist Mono (code + labels) loaded via `@fontsource/geist-sans` and `@fontsource/geist-mono`. Berkeley/Commit Mono is a future swap — drop the `.woff2` into `public/fonts/` and update `--font-mono` in `tokens.css` when the license is acquired.

**React islands:** Located in `src/components/react/`. Button (magnetic; `icon` prop: `"arrow" | "download" | "mail"` rendered in the metallic cap), Card (tilt), RevealWords, CountUpStat, CopyEmailButton (`label` prop overrides the visible text; announces copies via a `role="status"` region), ProjectCarousel (Work section: filter tabs + center-focus stage on desktop, snap-scroll on mobile — both layouts are server-rendered and gated by CSS media queries at 767px, so never branch layout on JS-derived viewport state), CommandPalette. `RevealWords` accepts either a `text` prop (single segment) or `segments[]` (each segment may carry its own `className` — used in the Hero so `gradient-text` lands directly on per-word inline-block spans); do NOT pass children text across the Astro→React boundary — `children` serializes as a structured object and breaks `String(children)`. Hydration: `client:load` above the fold, `client:visible` below, `client:idle` for the palette. Pure-static UI primitives (StatusPill, Chip, Chips, Eyebrow, SocialIcon, TechIconGrid) stay as Astro components in `src/components/ui/`. `TechIconGrid` inlines brand SVGs from the `simple-icons` devDependency at build time (no client JS); a luminance guard swaps dark brand marks (Bun, Next.js) to a light neutral. The `Marquee` band (`src/components/sections/Marquee.astro`) is pure CSS animation, duplicated track, `aria-hidden`. All motion is gated by `usePrefersReducedMotion` + the global CSS reduce-motion kill-switch in `tokens.css`.

**Command palette:** `⌘K` / `Ctrl+K` opens; the Nav "Search" button dispatches a `pk:cmd-open` `CustomEvent` the palette listens for (Astro→React bridge — avoids threading React state across the island boundary). Items = static nav jumps + copy-email + resume (served from `/public/resume-joydip-dutta.pdf`) + GitHub + LinkedIn + one entry per case study (sourced via `getCollection("projects")`). Substring match across `label` + `techStack` tags.

**Build stamp:** `astro.config.mjs` defines `__BUILD_TIME__` via Vite's `define`. The footer shows a live "deployed Nd ago" indicator computed client-side from the embedded ISO string.

**Key integrations in `astro.config.mjs`:** MDX, React, sitemap generation. Shiki code highlighting uses `vitesse-dark` theme. Site URL is `https://sannin-coder.info`.

**Images:** Below-fold `<img>` tags carry `loading="lazy"` and `decoding="async"` (Work section, `/projects` listing). The `[slug]` case-study hero image stays eager — it's the typical LCP candidate. Plain `<img>` is used throughout; Astro's `<Image>` is not wired up. `alt` text follows the pattern `"<title> — case study cover"`.

## Adding a Project Case Study

Create `src/content/projects/<slug>.mdx` with frontmatter matching the schema in `content.config.ts`. The page auto-generates at `/projects/<slug>` and an entry auto-appears in the command palette.

## Formatting

Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`. Double quotes, semicolons, trailing commas (es5), 100 char print width.
