# Portfolio Redesign — "Minimalist Dark" Visual System + Content Rewrite

**Date:** 2026-08-16
**Reference:** [Figma — Minimalist Dark Portfolio Web Design (Community)](https://www.figma.com/community/file/1575051369740712709/minimalist-dark-portfolio-web-design)
**Content source:** `~/Career-Master-Brain-AGY/CAREER_MASTER_BRAIN.md`

## Decisions (locked with Joydip)

1. **Adopt the reference's look, keep our content architecture** — all current sections
   (Hero, Services, Work, Process, About, Contact) survive; they are restyled and their copy
   is tightened. No section from the reference replaces a content-bearing section of ours.
2. **Palette: violet + metallic silver, cyan retired** — full commitment to the reference's
   monochrome violet identity. `#22d3ee` disappears from the accent system.
3. **All four signature components adopted:** circular tech-icon grid, marquee role ticker,
   tabbed project carousel, contact tile trio.
4. **Implementation approach: in-place evolution** — mutate `tokens.css` → `kit.css` →
   section components on the existing `pk-*` class system. No parallel v2 kit.
5. **Content: short and attractive** — every section keeps its message at roughly half the
   words; hero switches to the personal voice ("Hi, I'm Joydip"); all 12 project frontmatter
   descriptions rewritten impact-first from the Career Master Brain.

## Out of scope

- Light mode / theme toggle (site stays dark-only, `color-scheme: dark`).
- Newsletter signup (reference has one; we have no backend — YAGNI).
- Case study MDX **bodies** (only frontmatter `description` fields change).
- Copy rewrites beyond the homepage + project descriptions (SEO title/meta stay).
- Regenerating `og-image.png` — flagged as a follow-up task after the redesign ships
  (it still carries the old violet→cyan duotone).

---

## 1. Visual system (`src/styles/tokens.css`)

### Palette pivot

| Token                 | Before           | After                                                                                               |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| `--color-accent`      | `#7c5cff`        | `#7c5cff` (unchanged anchor)                                                                        |
| `--color-accent-from` | `#7c5cff`        | `#8b7cff`                                                                                           |
| `--color-accent-to`   | `#22d3ee` (cyan) | `#c4b5fd` (lavender)                                                                                |
| `--gradient-accent`   | violet→cyan      | white→lavender "silver-name" ramp: `linear-gradient(100deg, #fafafa 0%, #c4b5fd 60%, #8b7cff 100%)` |

New tokens:

- `--gradient-metal`: `linear-gradient(180deg, #eceef2 0%, #c8ccd6 55%, #9ca0ab 100%)` —
  metallic silver fill for primary pill CTAs (dark text on top: `#17171c`).
- `--gradient-ghost-heading`: low-contrast embossed fill for giant section headings —
  `linear-gradient(180deg, rgba(196,181,253,.32), rgba(124,92,255,.10))`.
- **Gradient scenes** (page atmosphere, replaces flat `#08080b` feel; body stays `--color-bg`
  underneath so text contrast is measured against near-black):
  - `--scene-hero`: `radial-gradient(900px 600px at 50% -10%, rgba(76,56,180,.55), transparent 70%)`
  - `--scene-glow`: `radial-gradient(1200px 800px at 50% 50%, rgba(96,66,220,.38), transparent 75%)`
    (behind the marquee band and the About section)
  - `--scene-contact`: same as glow at ~60% strength; footer sits on flat `#050507`.
- Radii: `--radius-xl: 24px`, new `--radius-2xl: 32px` (glass cards), pills use `999px`.
- Shadows: `--shadow-btn-primary*` retuned — drop the violet glow on the metallic button in
  favor of a soft neutral drop (`0 10px 30px -10px rgba(0,0,0,.6)`) plus a 1px light ring;
  card hover glow stays violet.
- Tint vars referencing cyan: none exist; `--tint-accent-*` stay violet — unchanged.

Contrast guard: `--color-fg-body` (`#d4d4d8`) prose must sit only on scene areas whose
local luminance stays near-black; scenes cap at the values above (verified visually at the
brightest point behind the marquee).

## 2. Core components (`src/styles/kit.css`)

- **`.pk-nav` → floating glass pill.** Detached from the top (`top: 16px`), centered,
  `max-width: 920px`, `border-radius: 999px`, translucent surface + `backdrop-filter: blur(16px)`,
  1px light border. Brand left, links centered, Search + "Start a project" right. `.scrolled`
  state keeps the pill, deepens the surface. Mobile toggle/menu keep behavior; the menu
  sheet adopts the glass surface.
- **`.pk-btn--primary` → metallic pill with icon cap.** Silver `--gradient-metal` fill, dark
  text, uppercase-ish tracking kept as-is, and a circular light disc on the right holding
  the icon (arrow, download, mail). Structure: `Button.tsx` renders
  `<span class="pk-btn__label">` + `<span class="pk-btn__cap"><svg/></span>`; magnetic
  behavior unchanged. `.pk-btn--ghost` stays a dark pill with a light border.
- **`.pk-card` → glass.** `rgba(255,255,255,.04)` fill, `backdrop-filter: blur(12px)`,
  `--radius-2xl`, inner top highlight (`--shadow-inset-hi` strengthened), border unchanged.
- **New `.pk-h2--ghost`.** The giant embossed section label (ABOUT / WORK / CONTACT):
  uppercase, `clamp(48px, 10vw, 96px)`, `gradient-fill` with `--gradient-ghost-heading`,
  centered, sits directly above the real `h2`/lede. The existing mono `Eyebrow` stays as a
  small sub-label above it (our editorial fingerprint, one per section).
- **Centered layout.** `.pk-section__inner` content blocks and headings center-align;
  grids stay grids. Hero, Process, Contact fully centered; Services/Work grids centered
  with centered headings.

## 3. New components

| Component             | Type                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Marquee.astro`       | static Astro                    | Infinite-scroll band after Hero: "✦ Product Engineering ✦ Backend Architecture ✦ AI & RAG Systems ✦ Fintech Platforms ✦ Technical Advisory". Pure CSS `@keyframes` translate, duplicated track `aria-hidden="true"`, paused under reduced-motion (global kill-switch covers it). Sits on the brighter violet band, ghosted text.                                                                                                                                                                                                         |
| `TechIconGrid.astro`  | static Astro                    | Circular tool badges in About: icon SVGs from the `simple-icons` npm package **inlined at build time** (devDependency, no client JS, no runtime fetch). Each badge: 56px dark circle, subtle ring, brand-colored glyph, `title` + visually-hidden label. ~16 icons: TypeScript, Go, Python, Node.js, Bun, React, Next.js, GraphQL, PostgreSQL, MongoDB, ClickHouse, Redis, Docker, Kubernetes, AWS, LangChain.                                                                                                                           |
| `ProjectCarousel.tsx` | React island (`client:visible`) | Work section: filter tabs + center-focus carousel. Receives serialized project data (id, title, description, techStack, image, category) as a prop from `Work.astro` — never Astro children. Tabs: **Featured / Fintech / AI & Data / SaaS Platforms**. Center card raised (image, title, one-liner, chips, link), side cards peek at reduced scale/opacity. Prev/next buttons + keyboard arrows + swipe; mobile degrades to horizontal snap-scroll list. Motion gated by `usePrefersReducedMotion`. "See all" ghost pill → `/projects`. |
| `ContactTiles.astro`  | static Astro                    | Trio inside the Contact glass card (see §5). Reuses `CopyEmailButton` island for the email tile.                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Content schema change (`src/content.config.ts`)

Add optional `category: z.enum(["fintech", "ai", "saas"])`. `Featured` tab = current
behavior (top 5 by `order`). Every MDX file gets a `category` assigned (see §6 table).

## 4. Section-by-section design

1. **Hero** — `--scene-hero` bloom behind; centered. Glass status chip → headline →
   role line → tagline → CTA row (metallic "Start a project" + ghost "See my work") →
   circular scroll-chevron (anchor to `#work`) → stat tiles row (4 dark tiles, CountUpStat
   islands kept). RevealWords keeps segment API; gradient lands on "Joydip".
2. **Marquee** — full-bleed band, brighter violet scene, ghosted 28–36px text.
3. **Services** — Eyebrow + `SERVICES` ghost heading + centered h2. Same 2×2 grid of glass
   cards (tilt kept), one-line pitches, chips.
4. **Work** — Eyebrow + `WORK` ghost heading + h2 "Production systems, not demos." +
   ProjectCarousel. `/projects` page keeps its static grid.
5. **Process** — Eyebrow + `PROCESS` ghost heading; 3 glass step tiles, centered.
6. **About** — Eyebrow + `ABOUT` ghost heading. Glass intro card (short bio + metallic
   "Download resume" pill w/ download cap icon) → TechIconGrid (replaces the four chip-list
   cards) → experience timeline (restyled rows, dates already correct).
7. **Contact** — Eyebrow + `CONTACT` ghost heading inside `--scene-contact`; one large
   glass card: lede + tile trio (Get in touch / Project inquiry / Availability), each tile
   with circular icon and a metallic pill CTA (Send email = CopyEmailButton behavior;
   Contact = mailto with subject; LinkedIn = profile link). Social icon row moves into the
   footer only.
8. **Footer** — flat `#050507` band: monogram + copyright + build stamp (kept) left;
   link columns (GitHub, LinkedIn, Email, Resume) right. No newsletter.
9. **Subpages** — inherit nav/footer/tokens automatically. Light pass: `/projects` cards →
   glass; `[slug]` hero + `.prose-content` accents (blockquote duotone, links, chips) shift
   from cyan to lavender. JSON-LD, breadcrumbs, palette wiring untouched.

## 5. Content rewrite (homepage)

Voice: personal, confident, short. Every claim traceable to the Career Master Brain.

- **Status chip:** `Open to select side projects`
- **H1:** `Hi, I'm Joydip` (gradient on "Joydip")
- **Role line:** `Product Engineer · Backend, AI & Fintech`
- **Tagline:** `~ I build backends, SaaS platforms & AI systems that hold up in production ~`
- **CTAs:** `Start a project` / `See my work`
- **Stats:** `3+ Years shipping` · `30k+ Users served` · `99.9% Uptime SLA` · `12+ Projects shipped`
- **Services h2:** `What I build.` — card pitches:
  - Product Engineering: `Full SaaS builds from zero — backend, APIs, auth, payments. 4–12 week engagements.`
  - Backend Architecture: `Microservices, event systems, scale-ready foundations — greenfield or review.`
  - AI & RAG Systems: `LLM features that work on real data — vector search, agents, retrieval pipelines.`
  - Technical Advisory: `Architecture reviews, hire-a-senior-for-a-week. Async, fixed scope.`
- **Work h2:** `Production systems, not demos.` (kept — already the strongest line on the site)
- **Process h2:** `Predictable. No surprises.` — steps:
  - Discovery · 1 week: `We pin down the product, the constraints, and the bar. If it's not a fit, I'll say so.`
  - Architecture · 1–2 weeks: `Data model, API contract, infra plan — approved before any production code.`
  - Build & ship · 4–12 weeks: `Weekly demos, continuous deploys. Your repo, your conventions, your code.`
- **About card** (2 short paragraphs replacing 3 long ones):
  - `Product engineer with 3+ years shipping fintech, AI, and SaaS systems — currently building WealthTech at Gunpowder Innovations. TypeScript and Go for most things, Python when the ML demands it.`
  - `I work async, keep scope honest, and don't chase frameworks.`
- **Contact:** h2 `Have something hard to build?` (kept) — lede:
  `I take a couple of side projects at a time. Funded startups, real products, scoped under ~3 months. I reply within 24 hours.` — tiles:
  - **Get in touch** — `joydip.dutta9943@gmail.com` — `Send email`
  - **Project inquiry** — `Have a brief? Send scope and timeline.` — `Contact me`
  - **Availability** — `Async-friendly · IST · remote` — `LinkedIn`

## 6. Project descriptions (frontmatter `description` + new `category`)

| File                       | Category | New description                                                                                                             |
| -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| gunpowder-fintech-backend  | fintech  | Multi-tenant WealthTech engine on Bun + serverless Postgres — advisor report prep cut from 2 hours to 30 seconds.           |
| unified-ai-agent           | ai       | Multi-modal RAG platform hitting 85% retrieval accuracy across PDFs, scans, and images for 1,000+ concurrent users.         |
| levo-microservices         | saas     | Polyglot TypeScript + Go monorepo behind a high-speed website builder — millions of daily pageviews analyzed in ClickHouse. |
| smartcue-service           | ai       | AI demo engine with ElevenLabs voiceovers and server-side video rendering — enterprise demo production time cut 80%.        |
| faas-automation            | fintech  | Fund management SaaS automating NAV allocations and investor statements — form turnaround from 3 days to 10 minutes.        |
| dyrect-backend             | saas     | Multi-tenant QR product-registration platform that lifted post-sales customer registrations 45%.                            |
| crooze-gamified-fitness    | saas     | Cycling gamification backend with real-time Redis leaderboards — daily engagement up 35%.                                   |
| agrieasy-digital-ecosystem | saas     | Tri-schema GraphQL backend serving 30k+ farmers and buyers at 99.9% uptime — down to SMS on feature phones.                 |
| teamify-service            | saas     | Event marketplace backend with durable Hatchet workflows and Stripe Connect payouts — zero double-bookings at peak.         |
| touchbase-service          | saas     | Real-estate CRM syncing Outlook mail and meetings via Microsoft Graph — contractor response times up 40%.                   |
| agnibina-model-school      | saas     | SEO-first school portal streamlining parent communication with CBSE-compliant publishing.                                   |
| ecommerce-recommendation   | ai       | Predictive recommendation engine driving sales through personalized, collaborative product filtering.                       |

Command palette, `/projects` listing, and carousel all read these fields — one edit, three
surfaces.

## 7. Build order

1. Tokens (palette pivot, scenes, metal/ghost gradients, radii) — site reskins globally.
2. Kit core (nav pill, metallic button, glass card, ghost heading, centering).
3. Marquee + Hero (new copy + layout).
4. Services + Process (restyle + copy).
5. Schema `category` + 12 MDX frontmatter edits.
6. ProjectCarousel + Work section.
7. About (intro card, TechIconGrid, timeline restyle).
8. Contact (tile trio) + Footer.
9. Subpage pass (`/projects`, `[slug]` prose accents).
10. Sweep: grep for `22d3ee` / `cyan` leftovers; reduced-motion + keyboard pass; mobile pass.

## 8. Verification

- `npm run build` clean; visual pass at 390px / 768px / 1440px via Playwright screenshots.
- Reduced-motion: marquee and carousel static, reveals instant (existing kill-switch).
- Carousel keyboard-operable (tabs are buttons w/ `aria-selected`, arrows focusable).
- Lighthouse spot-check: LCP stays text-based in hero; no new client JS beyond the
  carousel island; simple-icons SVGs inlined at build.
- Grep gate: no `22d3ee`, no `--color-accent-to: #22d3ee` references anywhere in `src/`.
