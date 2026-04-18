# v2 Design Port — Design Spec

**Date:** 2026-04-19
**Branch:** `feat/v2-design`
**Source handoff:** `/handoff/` (colors_and_type_v2.css, kit.css, Primitives.jsx, Nav.jsx, Sections.jsx, README.md)

## Goal

Port the v2 design system into the live Astro portfolio. Replace the v1 Inter + tri-gradient look with a Geist + duotone violet→cyan aesthetic, add React primitives for motion (magnetic buttons, tilt cards, reveal-on-scroll, count-up stats), and ship a ⌘K command palette that searches the 12 MDX case studies. Scope covers the entire site: home page, `/projects` listing, and `/projects/[slug]` case-study pages.

## Non-goals

- Berkeley/Commit Mono license acquisition (Geist Mono is the placeholder; swap is a later drop-in).
- New case-study content or project cover images.
- Redesign of MDX prose typography beyond retuning for the new token scale.
- New deploy target or hosting change.
- Adding tests (no test framework is configured in this repo).

## Decisions locked

| # | Question | Decision |
|---|---|---|
| 1 | Scope | Full port — home, `/projects`, `[slug]`, plus MDX prose retune. |
| 2 | Interactivity stack | React islands for Button/Card/RevealWords/CountUpStat/CommandPalette. Hydration: `client:load` above fold, `client:visible` below, `client:idle` for palette. |
| 3 | Fonts | Swap to Geist Sans + Geist Mono via `@fontsource/geist-sans` (or `@fontsource-variable/geist` if the fixed-weight package is unavailable) + `@fontsource/geist-mono`. Drop Inter, Inter Tight, JetBrains Mono packages. |
| 4 | Command palette | Nav jumps + email copy + GitHub + LinkedIn + résumé download + all 12 MDX case studies (sourced via `import.meta.glob`). Résumé PDF ships as a placeholder until the real file is provided. |
| 5 | Brand / nav mark | Text wordmark only ("Joydip Dutta", Geist 600, tight tracking). No logo chip. |
| 6 | Token strategy | Hybrid in a single `src/styles/tokens.css`. `@theme { ... }` block for Tailwind-mapped tokens (colors, fonts, radii, tracking). `:root { ... }` block for raw CSS vars used by `pk-*` rules (shadows, motion curves, durations, grid, tints). |
| 7 | Migration path | Staged commits on `feat/v2-design` branch. Twelve-step sequence (see Commit plan). |

## Architecture

### File layout (after port)

```
src/
  layouts/
    Layout.astro                 # updated: Geist imports, tokens import, __BUILD_TIME__ read, palette mount
  styles/
    tokens.css                   # NEW — single source of truth for tokens (hybrid @theme + :root)
    global.css                   # trimmed — base resets, prose-content rules, scrollbar, gradient utilities
    kit.css                      # NEW — ported pk-* rules from handoff (dotted grid, radial glow, card/proj/nav/cmd chrome)
  components/
    react/
      Button.tsx                 # magnetic
      Card.tsx                   # tilt + interactive
      RevealWords.tsx            # staggered word reveal
      CountUpStat.tsx            # numeric count-up
      CommandPalette.tsx         # ⌘K dialog
      CopyEmailButton.tsx        # wraps Button with copied-state text
      useInView.ts
      usePrefersReducedMotion.ts
      types.ts                   # CmdItem, etc.
    ui/
      Nav.astro                  # wordmark, scroll state, palette trigger
      Footer.astro               # deploy stamp, duotone accent
      StatusPill.astro           # pulsing dot, text-only label
      Chip.astro / Chips.astro   # mono-font tag
      Eyebrow.astro              # numbered section label
    sections/
      Hero.astro, Services.astro, Work.astro, Process.astro, About.astro, Contact.astro
  pages/
    index.astro                  # composition only, sections change internally
    projects/
      index.astro                # reskinned chrome
      [slug].astro               # reskinned header, prose-content body
  content/projects/*.mdx         # UNTOUCHED
  env.d.ts                       # declares __BUILD_TIME__
public/
  favicon.svg                    # kept
  resume-joydip-dutta.pdf        # placeholder PDF shipped, real file to be provided
```

**Deleted:** `src/components/ui/GradientButton.astro`, `src/components/ui/Card.astro` (superseded by React primitives).

**Trimmed:** `tailwind.config.mjs` reduced to content globs + any plugin hooks. Theme definition moves entirely to `@theme` in `tokens.css` per Tailwind v4 conventions.

### Token system

`src/styles/tokens.css` (single file, two sections):

```css
/* tokens.css — v2 design tokens */
@theme {
  /* Surfaces */
  --color-bg: #08080b;
  --color-surface: #0d0d11;
  --color-surface-raised: #13131a;
  --color-surface-deep: #0a0a0e;

  /* Foreground */
  --color-fg: #fafafa;
  --color-fg-muted: #a1a1aa;
  --color-fg-subtle: #52525b;
  --color-fg-faint: #27272a;

  /* Borders */
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-strong: rgba(255, 255, 255, 0.12);

  /* Accent (duotone) */
  --color-accent: #7c5cff;
  --color-accent-from: #7c5cff;
  --color-accent-to: #22d3ee;

  /* Fonts */
  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, monospace;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Letter spacing (utilities: tracking-tightest / tighter / tight) */
  --tracking-tightest: -0.045em;
  --tracking-tighter: -0.035em;
  --tracking-tight: -0.02em;
}

:root {
  color-scheme: dark;

  /* Tints */
  --tint-white-02: rgba(255, 255, 255, 0.02);
  --tint-white-04: rgba(255, 255, 255, 0.04);
  --tint-accent-08: rgba(124, 92, 255, 0.08);
  --tint-accent-30: rgba(124, 92, 255, 0.30);

  /* Shadows / elevation */
  --shadow-inset-hi: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --shadow-card-hover:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 24px 60px -24px rgba(124, 92, 255, 0.28);
  --shadow-btn-primary:
    0 0 0 1px rgba(255, 255, 255, 0.10),
    0 14px 40px -12px rgba(124, 92, 255, 0.55);
  --shadow-btn-primary-hover:
    0 0 0 1px rgba(255, 255, 255, 0.16),
    0 20px 48px -12px rgba(124, 92, 255, 0.75);

  /* Motion */
  --ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 180ms;
  --dur-base: 320ms;
  --dur-slow: 560ms;

  /* Grid texture */
  --grid-size: 24px;
  --grid-dot: rgba(255, 255, 255, 0.05);

  /* Max widths */
  --max-w-prose: 72ch;
  --max-w-page: 1280px;

  /* Gradients (convenience) */
  --gradient-accent: linear-gradient(100deg, var(--color-accent-from) 0%, var(--color-accent-to) 100%);
  --gradient-accent-soft: linear-gradient(100deg, rgba(124,92,255,.15) 0%, rgba(34,211,238,.15) 100%);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
  .pk-reveal, .pk-reveal-word {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

`global.css` keeps:
- `@import "tailwindcss";`
- `@import "./tokens.css";`
- `@import "./kit.css";`
- Font imports (moved here from handoff README's Layout.astro suggestion — keeps frontmatter clean)
- `prose-content` rules, updated: `li::marker` color → `var(--color-accent-from)`; `blockquote` border → `var(--color-accent-from)`; font-family tokens refreshed.
- `@utility gradient-text`, `@utility gradient-fill`, `@utility dotted-bg`, `@utility card-surface` (renamed or kept as utilities available to Astro components).
- Scrollbar + base body rules.

`kit.css` ports all `pk-*` rules from handoff `kit.css` verbatim, with paths fixed (remove `@import url("../../colors_and_type_v2.css")` — tokens already loaded).

### Build-time deploy stamp

`astro.config.mjs`:
```js
vite: {
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
}
```

`src/env.d.ts`: `declare const __BUILD_TIME__: string;`

`Footer.astro` reads `__BUILD_TIME__` and emits:
- SSR fallback text "recently deployed"
- Tiny inline script replaces it with "Nd ago" / "Nh ago" computed client-side from the embedded ISO string (avoids stale SSR text if build is old).

### Layout changes

`src/layouts/Layout.astro`:
- Frontmatter imports: `@fontsource/geist-sans/{400,500,600,700}.css`, `@fontsource/geist-mono/{400,500,600}.css`.
- Reads `getCollection("projects")` to build the `CmdItem[]` array for the palette.
- Body adds `class="pk-page"` wrapper for the dotted-grid fixed background.
- Mounts `<CommandPalette client:idle items={cmdItems} />` once, below `<Footer/>`.
- `<main class="pt-24">` padding kept; Nav overlay stays fixed.

## Components

### React primitives (`src/components/react/`)

**`Button.tsx`** — Magnetic button.
- Props: `{ variant?: "primary" | "ghost"; size?: "sm"; href?: string; onClick?: (e: MouseEvent) => void; children: ReactNode; className?: string }`.
- Mouse within 60px of center pulls element up to 4px toward cursor via `transform: translate(...)`. Resets on `mouseleave`.
- Renders `<a>` if `href` provided, else `<button>`. Appends `ArrowRight` icon after children.
- Disables magnetic behavior under `(pointer: coarse)` media query.
- Reduced-motion: skips the mousemove listener entirely.

**`Card.tsx`** — Interactive card with optional tilt.
- Props: `{ interactive?: boolean; tilt?: boolean; className?: string; children: ReactNode }`.
- If `tilt`, mouse position drives `perspective(900px) rotateX/rotateY` up to ±3deg.
- If not `tilt`, renders a plain div with `pk-card` class; no event listeners attached (no hydration cost beyond mount).
- Disables tilt under `(hover: none)` and reduced-motion.

**`RevealWords.tsx`** — Staggered word reveal.
- Props: `{ children: string; className?: string; as?: keyof JSX.IntrinsicElements }`.
- Splits `children` on spaces, wraps each word in `<span class="pk-reveal-word">`, toggles `.in` on intersect with 55ms stagger.
- Reduced-motion: applies `.in` immediately on mount, skips observer.

**`CountUpStat.tsx`** — Count-up number with suffix parsing.
- Props: `{ value: string; label: string }` (e.g., `"30k+"`, `"99.9%"`, `"3+"`).
- Parses leading number + suffix via regex `/([\d.]+)([a-z%+]*)/i`.
- 1.2s ease-out animation triggered on `useInView`.
- Reduced-motion: sets final value immediately on intersect.

**`CommandPalette.tsx`** — ⌘K overlay.
- Props: `{ items: CmdItem[] }` where `CmdItem = { id: string; label: string; meta: "NAV" | "ACTION" | "EXT" | "CASE STUDY"; href?: string; action?: "copy-email" }`.
- Internal state: `open`, `query`, `activeIndex`.
- Opens on ⌘K / Ctrl+K anywhere; closes on Esc or click-outside.
- Also listens on `window` for `pk:cmd-open` `CustomEvent` (dispatched from the Nav's "Search" button) — Astro → React handoff pattern.
- Search: lowercase substring match across `label` and (for case studies) `tags` field.
- Arrow keys move `activeIndex`; Enter runs; mouse hover sets active; click runs.
- Action handling:
  - `meta === "NAV"` → scroll to `#id` on same page, or navigate to `/#id` if on another page.
  - `action === "copy-email"` → `navigator.clipboard.writeText("joydip.dutta9943@gmail.com")`, show toast.
  - `href` external → `window.open(href, "_blank", "noopener")`.
  - `href` internal → dispatch Astro client-side nav.
- A11y: `role="dialog"`, `aria-modal="true"`, `aria-label="Command palette"`; focus trap via react-focus-lock-lite pattern or manual tab loop (manual — zero deps); restores focus to opener on close.

**`CopyEmailButton.tsx`** — Small wrapper around `Button` used by Contact section.
- Manages `copied` state, flips children text for 1.6s.
- Keeps `Button` itself stateless.

**Hooks:**
- `useInView({ threshold = 0.2, once = true })` — returns `[ref, inView]`.
- `usePrefersReducedMotion()` — returns boolean, subscribes to `matchMedia` change.

### Astro components (`src/components/ui/`)

**`StatusPill.astro`** — `<span class="pk-status">` with `<span class="pk-status__dot" aria-hidden="true"/>` and a slotted text label. `role="status"`.

**`Chip.astro` / `Chips.astro`** — `pk-chip` / `pk-chips` markup; `Chips` takes `items: string[]`.

**`Eyebrow.astro`** — `pk-eyebrow` markup with `n` and `label` props; gradient-text applied to `n`.

**`Nav.astro`** — Wordmark "Joydip Dutta" (Geist 600, `tracking-tight`), links (Work/Services/About/Contact), Search button (⌘K hint chip), primary "Start a project" `<Button client:load size="sm">` → scrolls to `#contact`. Scroll-state class via inline script, unchanged pattern. Search button dispatches `new CustomEvent("pk:cmd-open")` on click or ⌘K keydown.

**`Footer.astro`** — `pk-footer` markup. Copyright, deploy-stamp span, links (GitHub/LinkedIn/Email). Deploy-age computed via inline script from `__BUILD_TIME__`.

### Home page sections (`src/components/sections/`)

**`Hero.astro`**
- `<section id="top" class="pk-section pk-hero">` with `<div class="radial-glow-v2">`.
- `<StatusPill>Available · Q2 2026 · 2 of 3 slots open</StatusPill>`.
- `<h1 class="pk-hero__title">` containing three `<RevealWords client:load>` spans (plain text + gradient-text middle span).
- Sub-paragraph, two `<Button client:load>` (primary + ghost).
- `<div class="pk-stats">` with four `<CountUpStat client:visible>`.

**`Services.astro`**
- `<Eyebrow n="01" label="What I build"/>`, `<h2 class="pk-h2">`, 2-col grid of four `<Card client:visible interactive tilt>`.
- Service data stays hard-coded in the component (same 4 items from handoff).

**`Work.astro`**
- Reads projects via `await getCollection("projects")`, sorts by `order`, splits into `featured` (with `image`) and `rest`.
- Top grid: 2-col `featured` as `<Card client:visible tilt>` with `pk-proj` inner markup.
- Bottom grid: 3-col `rest` as plain `<Card client:visible>` without images.
- All project cards navigate to `/projects/${slug}`.

**`Process.astro`**
- `<Eyebrow n="03" label="How I work"/>`, `<h2 class="pk-h2">`, 3 `<Card client:visible>` (no tilt).
- Three steps hard-coded (Discovery, Architecture, Build & ship) per handoff.

**`About.astro`**
- Zero islands. `<Eyebrow n="04" label="About"/>`, `<h2 class="pk-h2">`, two paragraphs, max-width 640px.

**`Contact.astro`**
- Centered, `radial-glow-v2` behind. `<Eyebrow n="05" label="Start a project"/>`, `<h2 class="pk-h2">` with "hard to build?" gradient-text, paragraph, `<CopyEmailButton client:load>`.

### Projects pages

**`src/pages/projects/index.astro`**
- Wrap in `.pk-page`, use `.pk-section__inner` for max-width.
- Header: v2 back-link (v2 token colors), `<Eyebrow n="—" label="Case studies"/>`, `<h1 class="pk-h2" style="max-width:100%">All projects.</h1>`, subtitle paragraph.
- Featured section: `<Eyebrow n="01" label="Featured"/>` or small divider row with mono label, 2-col grid of `<Card client:visible tilt>` wrapping `pk-proj` markup — image (16:9), title, description, `<Chips items={techStack.slice(0,4)}/>`, plus `+N more` overflow chip.
- Rest section: 3-col grid of `<Card client:visible>` with `pk-proj__body` only, `<Chips items={techStack.slice(0,3)}/>`.

**`src/pages/projects/[slug].astro`**
- Wrap in `.pk-page` + `.pk-section__inner` (max-width retuned from 5xl to a tighter 1024-1100px for reading comfort).
- Back-link v2.
- Header: `<h1 class="pk-h2">` with v2 tracking. Subtitle paragraph. `<Chips items={techStack}/>` (all tags — detail page).
- Hero image: 16:9 aspect, `pk-proj__img` treatment (border + bottom gradient overlay).
- Divider row kept (already on-brand).
- `<article class="prose-content">` with `<Content/>`. Prose rules already retuned in global.css.

### Command palette items

Assembled in `Layout.astro` frontmatter:
```ts
const projects = await getCollection("projects");
const cmdItems: CmdItem[] = [
  { id: "nav-work",     label: "Jump to — Selected work",  meta: "NAV",   href: "#work" },
  { id: "nav-services", label: "Jump to — Services",       meta: "NAV",   href: "#services" },
  { id: "nav-about",    label: "Jump to — About",          meta: "NAV",   href: "#about" },
  { id: "nav-contact",  label: "Jump to — Contact",        meta: "NAV",   href: "#contact" },
  { id: "copy-email",   label: "Copy email address",       meta: "ACTION", action: "copy-email" },
  { id: "resume",       label: "Download résumé (PDF)",    meta: "ACTION", href: "/resume-joydip-dutta.pdf" },
  { id: "github",       label: "Open GitHub profile",      meta: "EXT",    href: "https://github.com/joydipdutta9943" },
  { id: "linkedin",     label: "Open LinkedIn profile",    meta: "EXT",    href: "https://www.linkedin.com/in/joydip-dutta-569428141/" },
  ...projects
    .sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
    .map((p) => ({
      id: `case-${p.id}`,
      label: `Case study — ${p.data.title}`,
      meta: "CASE STUDY" as const,
      href: `/projects/${p.id}`,
      tags: p.data.techStack,
    })),
];
```

Serialized as JSON into island props.

## Data flow

- **Build time:** `astro.config.mjs` injects `__BUILD_TIME__`. Layout reads project collection. Nothing else is dynamic.
- **Hydration:** Astro emits static HTML with island placeholders; React mounts on `client:load` (Hero buttons, reveal) / `client:visible` (below-fold cards, count-ups) / `client:idle` (palette).
- **Runtime events:** Nav search button → `CustomEvent("pk:cmd-open")` on `window` → palette subscribes and toggles open state. ⌘K keypress also opens directly. Escape / click-outside closes.
- **Client-side nav:** Astro's `<ClientRouter/>` handles `/projects` and `[slug]` navigation. Palette uses `astro:page-load` event when navigating internally.

## Accessibility

- `prefers-reduced-motion` honored at three layers: CSS global kill-switch, JS component guards, palette enter/exit transitions.
- Focus management: palette traps focus, restores on close. All buttons retain focus-visible ring (`--color-accent-from`).
- ARIA: palette `role="dialog" aria-modal="true"`, status pill `role="status"`, status dot `aria-hidden="true"`.
- Color contrast: body text (`--color-fg-muted`) on `--color-bg` clears WCAG AA for 14px+ text. Subtle text (`--color-fg-subtle`) limited to large display-type-adjacent or mono labels.
- Keyboard: tab order sane, palette fully keyboard-driven, no keyboard trap outside palette.

## Error handling

Minimal by construction — this is a static site:
- Missing résumé PDF: placeholder PDF ships, palette entry works. User replaces file later.
- Clipboard API unavailable (old browsers): `navigator.clipboard?.writeText` with fallback "Copy failed" toast.
- IntersectionObserver unavailable: guard with `if (!("IntersectionObserver" in window))` — set `inView = true` immediately so content is visible.
- Font load failure: `font-family` chain falls back to `ui-sans-serif`, `system-ui`, `ui-monospace`. FOUT over FOIT.

## Testing

No test framework in the project. Verification is manual:
- `npm run dev` — smoke check each section.
- Playwright is already a dependency — use it ad-hoc for keyboard-nav verification of the palette if desired (single script, not committed).
- Visual check in Chrome + Safari (touch-capable) for reduced-motion and `(hover: none)` fallbacks.
- `npm run build` — ensure Astro compiles without type or bundling errors.

## Commit plan

| # | Commit | Notes |
|---|---|---|
| 1 | `chore(deps): swap Inter/JetBrains for Geist` | package.json only. Deleted: `@fontsource/inter`, `@fontsource/inter-tight`, `@fontsource/jetbrains-mono`. Added: `@fontsource/geist-sans` (or variable fallback) + `@fontsource/geist-mono`. |
| 2 | `feat(tokens): introduce v2 token system + @theme hybrid` | `src/styles/tokens.css`, trim `global.css`, reduce `tailwind.config.mjs`. |
| 3 | `feat(kit): port pk-* kit styles` | `src/styles/kit.css`; import from `global.css`. |
| 4 | `feat(ui): add v2 React primitives` | Button, Card, RevealWords, CountUpStat, CopyEmailButton, hooks; StatusPill/Chip/Eyebrow as Astro. |
| 5 | `feat(layout): update Layout + Nav shell + __BUILD_TIME__` | Layout imports Geist, dotted-page wrapper, palette mount, build stamp wiring. Nav to wordmark + ⌘K trigger. |
| 6 | `feat(home): port Hero + Contact` | Above-fold sections first for preview. |
| 7 | `feat(home): port Services, Work, Process, About` | Work reads from `getCollection`. |
| 8 | `feat(palette): ship ⌘K command palette` | CommandPalette.tsx, item assembly in Layout, Nav event wiring. |
| 9 | `feat(projects): reskin /projects and [slug] to v2` | Listing + slug chrome, prose-content token refresh. |
| 10 | `chore: delete GradientButton, old Card, unused tokens` | Cleanup pass. |
| 11 | `feat(a11y): reduced-motion guards + palette dialog semantics` | Final a11y polish. |
| 12 | `chore: resume placeholder + CLAUDE.md stack notes` | Housekeeping + update CLAUDE.md to reflect v2 stack. |

After step 12, merge `feat/v2-design` → `master`.

## Open items (deferred, non-blocking)

- Berkeley / Commit Mono license — swap `.woff2` into `public/fonts/` and update `@font-face` + `tokens.css` font family.
- Real résumé PDF — replace `public/resume-joydip-dutta.pdf` placeholder.
- SEO audit — tokens/typography don't affect structured data; revisit if OG image or meta copy changes.

## Risks

- **Geist font package name** — `@fontsource/geist-sans` may not exist under that exact name; fallback to `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`. Verify in step 1 before committing.
- **Tilt cards on touch devices** — disabled via `(hover: none)` media query + `usePrefersReducedMotion` guard. No functional degradation — cards still render and click.
- **`import.meta.glob` JSON serialization** — palette props cross the island boundary as JSON; only plain data (strings, arrays) passes, no MDX modules. Already handled by pre-mapping in Layout frontmatter.
- **Two radial-glow layers stacking (Hero + Contact)** — each is in a separate section with its own stacking context. Verify no visual bleed during the Hero→Contact preview in step 6.
- **Build stamp drift** — `new Date().toISOString()` at `astro.config.mjs` evaluation time; for static deploys this is deterministic per build. If the host redeploys without rebuild, stamp is stale — acceptable for a static portfolio.
