# Freelance Portfolio Redesign — Design Spec

**Date:** 2026-04-13
**Status:** Approved, awaiting implementation plan
**Repository:** `portfolio-joydip` (Astro v6 + React v19 + Tailwind v4)

## Goal

Reposition the existing personal portfolio as a freelance product-engineering studio targeting funded startups, while retaining the portfolio's case-study credibility. The current site frames Joydip as an employee seeking full-time work ("Open to Work," SDE title, terminal aesthetic). The new site frames him as a freelance engineer clients hire to build production systems.

## Positioning

| | |
|---|---|
| **Role on the site** | Freelance product engineer (not employee) |
| **What he sells** | Full-stack product builds: MVPs, SaaS, backends, AI features |
| **Target client** | Funded startups (seed / Series A) |
| **Proof strategy** | Case-study depth + quantified metrics (no testimonials or client logos yet) |
| **Conversion path** | Email only — `mailto:` with pre-filled subject |
| **Visual direction** | Linear / Vercel / Raycast — dark, glassy, gradient-heavy. Terminal identity dropped. |

## Information Architecture

Single long home page. Case studies stay at `/projects/<slug>`. The standalone `/experience` route is removed — its content folds into an About section on the home page.

```
/                      — single-page home (hero, services, work, process, about, contact)
/projects              — (existing) full project index
/projects/<slug>       — (existing) case study pages, restyled
```

Navigation uses anchor links to jump between sections on the home page, not routes.

## Visual System

### Palette

- **Background:** `#0a0a0f` (near-black with faint blue undertone)
- **Surfaces:** layered `#0f0f14` → `#15151d`, with `1px` borders at `rgba(255,255,255,0.06)`
- **Accent gradient (signature):** `#7c5cff → #3b82f6 → #06b6d4` (violet → blue → cyan). Used sparingly on: hero headline phrase, primary CTA, active nav, section index numbers.
- **Text:** `#fafafa` primary, `#a1a1aa` secondary, `#52525b` tertiary. No pure white.
- **Ambient glow:** one large blurred radial gradient (violet→blue, ~30% opacity, `filter: blur(120px)`) anchored behind the hero. A second, smaller glow behind the contact section. Nowhere else.

The current `#4ade80` terminal-green accent is fully removed.

### Typography

- **Display (headlines):** Inter Tight, `font-weight: 600`, `letter-spacing: -0.04em`, `line-height: 1.02`. Hero headline at `clamp(3rem, 8vw, 6rem)`.
- **Body:** Inter, 16px base, `line-height: 1.6`, `#a1a1aa`.
- **Mono:** JetBrains Mono, used **only** for: code blocks in case studies, tech-stack chips, and hero stat numerals. Not in headlines, not in nav.

### Component Language

- **Cards:** `border-radius: 12px`, `1px` hairline borders, inner highlight on top edge (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)`). On hover: border brightens to `rgba(255,255,255,0.12)`, faint gradient wash appears behind content.
- **Buttons:**
  - Primary: gradient-filled with subtle glow
  - Secondary: ghost with hairline border
- **Dividers:** thin gradient lines (`transparent → rgba(255,255,255,0.08) → transparent`).
- **Motion:** fade-in + 8px rise on scroll-into-view, 400ms, `cubic-bezier(0.16, 1, 0.3, 1)`. No parallax, no scroll-jacking.
- **Navigation:** transparent at top, compacts on scroll with `backdrop-blur-xl` frosted glass and hairline bottom border.

### Dropped from Current Site

- All terminal motifs: `>_` prompts, `[01] // Featured_Operations` section labels, `System.Status: ONLINE` footer indicator, `jd.init()_` logo, `Execute /projects/list.sh` link.
- `#4ade80` green accent everywhere.
- `bg-dot-pattern` background.
- "Open to Work" badge.

### Retained

- Dark theme.
- Mono font used sparingly for tech chips and stat numerals.
- Fade-in + slide-up section entry animation (already in `index.astro`).
- Astro `ClientRouter` page transitions.

## Page Layout

Max width `max-w-5xl` for most sections, `max-w-6xl` for the work grid. Sections separated by `py-32` on desktop, no hard dividers.

### Navigation (sticky, compacts on scroll)

- **Left:** wordmark "Joydip Dutta" in display sans.
- **Center/right:** anchor links — `Work · Services · About · Contact`.
- **Far right:** primary CTA button "Start a project" (mailto).
- **Scroll state:** `backdrop-blur-xl`, `bg-black/60`, hairline bottom border.

### Hero

Full viewport (min `80vh`), centered content, radial gradient glow behind.

- Small pill badge at top: `Available for new projects · Q2 2026`
- Headline (two lines, one gradient phrase):
  > Senior engineer building **production systems** for funded startups.
- Subhead (one sentence, 18px): what he actually builds — backends, SaaS, AI features.
- Two buttons: primary gradient "Start a project" (mailto), secondary ghost "See case studies" (anchors to work).
- Stat strip: 4 cells, mono numerals — `3+ yrs` · `30k+ users served` · `99.9% uptime` · `12+ shipped`. Hairline separators between cells.

### Services

Section heading: `01 — What I build` (index number in gradient, heading in display sans).

Four service cards in a 2×2 grid. Each card has a monoline icon, service name (20px semibold), one-sentence pitch (14px zinc-400), and 3-4 small mono tags.

1. **Product Engineering** — Full SaaS builds from zero. Backend, API, DB, auth, integrations. 4-12 week engagements.
   · TypeScript / Go · Postgres / Mongo · AWS
2. **Backend Architecture** — Microservices, event systems, scale-ready foundations.
   · Fiber · BullMQ · ClickHouse
3. **AI & RAG Systems** — LLM features that work on real data, not demos. Vector search, agentic workflows, retrieval pipelines.
   · LangChain · Gemini / OpenAI · pgvector / Atlas
4. **Technical Advisory** — Code review, architecture review, hire-a-senior-for-a-week.
   · async · paid

### Selected Work

Section heading: `02 — Selected work`.

Bento-style asymmetric grid:
- Two featured cards (`col-span-2`) — Unified Multi-Modal AI Agent, Gunpowder Fintech Backend — with larger images and more copy.
- Below: 3-column strip of 3 smaller cards (Dyrect, Levo, Crooze or similar — pick three strongest).

Each card: image (rounded, subtle inner border), project name, one-line outcome, 2-3 tech chips.

Below the grid: text link "View all 12 projects →" to `/projects`.

**Copy rewrite:** The current bento descriptions are feature-listy ("Enterprise wealth management platform with investment accounts, KYC, and direct debits"). Rewrite each as a single outcome sentence ("Shipped a wealth platform serving 30k users").

### Process

Section heading: `03 — How I work`.

Horizontal 3-step strip. Each step is a card with step number in gradient, title, one paragraph. Purpose: reduce risk-of-hiring-a-freelancer, not be a full service page.

1. **Discovery (1 week)** — Understand the product, the constraints, the bar. Scope the build.
2. **Architecture (1–2 weeks)** — Data model, API contract, infra plan. Client approves before code.
3. **Build & ship (4–12 weeks)** — Weekly demos, continuous deploys, client owns the code from day one.

### About

Section heading: `04 — About`.

Two-column layout.

- **Left:** prose bio in 3 short paragraphs. Covers who he is, kind of work shipped (30k users, fintech, AI), what he cares about. Not a resume-bullet list.
- **Right:** compact "Stack" panel — the same 4 tech-category cards (Languages & Frameworks, Databases & Storage, Infrastructure & Security, AI & Search) restyled to the new visual language. Below the stack panel: "Previously at" — a short text list of past roles pulled from the old `/experience` page.

### Contact

Section heading: `05 — Start a project`.

Full-width panel with large radial gradient glow (matching hero). Centered content:
- Display headline: "Have something hard to build?"
- Paragraph stating fit criteria (funded startup, real product, 4+ week engagement).
- Primary gradient button: `mailto:joydip.dutta9943@gmail.com?subject=New project — [your company]`
- Small secondary links: GitHub · LinkedIn · Email

### Footer

Three columns: copyright · nav anchors · social links. No "System.Status: ONLINE" indicator.

## Copy Direction

### Voice

Short sentences. Technical but not jargony. Confident, not performative. Every claim specific enough that a weaker engineer couldn't honestly make it.

### The Three Rules

1. **Name concrete nouns, not adjectives.** "Postgres with pgvector, 40M rows" beats "scalable data layer."
2. **Quantify everything possible.** Users, uptime, latency, throughput, headcount replaced.
3. **Banned words:** "passionate," "solutions," "journey," "ecosystem," "cutting-edge." Not once.

### Hero Copy

> Senior engineer building **production systems** for funded startups.
>
> I ship backends, SaaS platforms, and AI features that hold up in production. Previously built a fintech wealth platform serving 30k users and a RAG system on unstructured data for enterprise search.
>
> [ Start a project ]  [ See case studies ]

### Contact Copy

> **Have something hard to build?**
>
> I take a small number of engagements at a time. Best fit: funded startup, real product in production or about to be, four-plus weeks of work. Send me what you're building and I'll reply within 24 hours.
>
> [ joydip.dutta9943@gmail.com ]

### Existing Content

- **Case study MDX files** (`src/content/projects/*.mdx`) — no rewrites. Render as-is inside new visual shell.
- **Bento grid descriptions on home** — rewrite as outcome sentences (see Selected Work above).
- **Section labels** — replace all terminal-flavored labels with clean text (e.g., `02 — Selected work`).

## Technical Approach

### Files Modified

- `src/layouts/Layout.astro` — new nav (anchor-based, sticky, frosted-on-scroll), new footer, updated SEO metadata ("Joydip Dutta — Freelance Product Engineer"), updated JSON-LD with `jobTitle: "Freelance Software Engineer"`.
- `src/pages/index.astro` — full rewrite. Becomes a ~20-line composition of new section components.
- `src/styles/global.css` — add CSS variables for new palette, gradient utilities, radial-glow helper, font-face imports.
- `tailwind.config.mjs` — update theme tokens (gradient stops, neutral scale, font families).
- `src/pages/projects/[slug].astro` — restyle prose container (typography, code blocks) to match new visual system. No structural changes.
- `src/content/projects/*.mdx` — untouched.

### Files Removed

- `src/pages/experience.astro` — content folds into About section on home.

### New Files

```
src/components/sections/Hero.astro
src/components/sections/Services.astro
src/components/sections/Work.astro
src/components/sections/Process.astro
src/components/sections/About.astro
src/components/sections/Contact.astro
src/components/ui/Nav.astro
src/components/ui/Footer.astro
src/components/ui/GradientButton.astro
src/components/ui/Card.astro
```

Each section component is self-contained, takes no props, and can be edited in isolation. `index.astro` imports and composes them.

### Fonts

Self-hosted via `@fontsource/inter`, `@fontsource/inter-tight`, `@fontsource/jetbrains-mono`. Added to `package.json`, imported in `global.css`. No Google Fonts CDN.

### Animations

Reuse existing `animate-in fade-in slide-in-from-bottom-4` Tailwind pattern plus a small intersection-observer script for scroll-in fades. No animation library. Astro `ClientRouter` stays enabled.

### What Is NOT Built

- No CMS, contact form, analytics SDK, dark/light toggle, i18n, testimonial component, or blog.
- No new React islands. Entire site renders as static Astro. The current site doesn't use React either.

### Risks

- **Radial-gradient glow** on hero and contact must be GPU-composited (`will-change: transform`, `pointer-events: none`) or it causes repaint on scroll.
- **Max-width change** (`max-w-4xl` → `max-w-5xl`) means existing case-study prose containers may need line-length re-tuning.
- **`/experience` route removal** surfaces in `sitemap.xml` — regenerate on build. Inbound links, if any, will 404.

## Out of Scope

- Testimonials, client logos, case-study rewrites, pricing page, blog, analytics, contact form, i18n, light mode, animation library, new React islands, CMS.

## Open Questions

None at spec time. All clarifying questions resolved during brainstorming.
