# v2 Design Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the v2 design system from `handoff/` into the live Astro portfolio — full site scope (home, `/projects`, `/projects/[slug]`) — with Geist fonts, duotone violet→cyan accent, React islands for motion, a ⌘K command palette that searches the 12 MDX case studies, and a build-time deploy stamp.

**Architecture:** Single feature branch `feat/v2-design` with 12 atomic commits. Each commit lands a working slice (tokens, then kit, then primitives, then sections) so `npm run dev` stays green between steps. Tailwind v4 CSS-first `@theme` hybrid with raw `:root` CSS vars. React islands mounted via Astro hydration directives (`client:load`/`client:visible`/`client:idle`).

**Tech Stack:** Astro v6, React v19, TypeScript, Tailwind CSS v4 (via Vite plugin), MDX content collections, `@fontsource/geist-sans` + `@fontsource/geist-mono`.

**Spec reference:** `docs/superpowers/specs/2026-04-19-v2-design-port-design.md`

**Verification model:** No test framework in this repo. Per-task verification runs `npm run build` (static output smokes compile errors) + visual check in `npm run dev`. Types are checked via `npx astro check` where relevant.

---

## Prerequisites

### P1. Create and switch to feature branch

- [ ] **Step 1: Confirm clean working tree**

Run: `git status`
Expected: `nothing to commit, working tree clean` (spec was already committed on master).

- [ ] **Step 2: Create and check out branch**

Run: `git switch -c feat/v2-design`
Expected: `Switched to a new branch 'feat/v2-design'`

- [ ] **Step 3: Verify dev server boots against current master**

Run: `npm run dev` in the background, curl `http://localhost:4321/`, then stop the server.

```bash
npm run dev &
sleep 4
curl -sI http://localhost:4321/ | head -1
kill %1
```

Expected: `HTTP/1.1 200 OK` (confirms starting point is working).

---

## Task 1: Swap font packages

**Files:**

- Modify: `package.json` (dependencies section)
- Verify: `package-lock.json` updates

### Step 1.1: Remove old font packages

- [ ] Run: `npm uninstall @fontsource/inter @fontsource/inter-tight @fontsource/jetbrains-mono`

Expected: three packages removed, `package-lock.json` updated, no errors.

### Step 1.2: Install Geist font packages

- [ ] Run: `npm install @fontsource/geist-sans @fontsource/geist-mono`

Expected: both packages added (`@fontsource/geist-sans` ~5.2.x, `@fontsource/geist-mono` ~5.2.x), no peer-dep warnings.

### Step 1.3: Confirm package list

- [ ] Run: `node -e "const p=require('./package.json');console.log(Object.keys(p.dependencies).filter(k=>k.includes('fontsource')))"`

Expected output:

```
[ '@fontsource/geist-mono', '@fontsource/geist-sans' ]
```

### Step 1.4: Confirm site still builds

Note: CSS in `src/styles/global.css` still imports Inter/JetBrains — that will error briefly. Skip build verification here; the next task reconciles. Proceed to commit after checking that nothing OTHER than the missing @import errors breaks.

- [ ] Run: `ls node_modules/@fontsource/geist-sans/400.css node_modules/@fontsource/geist-mono/400.css`

Expected: both files exist.

### Step 1.5: Commit

- [ ] Run:

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(deps): swap Inter/JetBrains for Geist fonts

Drops @fontsource/inter, @fontsource/inter-tight, @fontsource/jetbrains-mono.
Adds @fontsource/geist-sans and @fontsource/geist-mono. CSS import sites
get updated in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: single commit, two files changed.

---

## Task 2: Introduce v2 token system (tokens.css + global.css trim + tailwind.config.mjs reduction)

**Files:**

- Create: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `tailwind.config.mjs`

### Step 2.1: Create tokens.css

- [ ] Create `src/styles/tokens.css` with this exact content:

```css
/* ==========================================================================
   v2 Design Tokens
   - @theme block: Tailwind v4 utility-generating tokens (colors, fonts, radii,
     tracking). Name --color-* / --font-* / --radius-* / --tracking-* produce
     utilities like bg-bg, text-fg-muted, font-mono, rounded-lg, tracking-tighter.
   - :root block: raw CSS vars used by pk-* rules in kit.css and inline styles.
     Not exposed as utilities.
   - Berkeley/Commit Mono swap flagged below — drop .woff2 into public/fonts/
     and replace --font-mono to complete.
   ========================================================================== */

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
  /* FLAG: Swap to Berkeley Mono / Commit Mono when licensed */
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* Letter spacing (utilities: tracking-tightest/tighter/tight) */
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
  --tint-accent-30: rgba(124, 92, 255, 0.3);

  /* Shadows / elevation */
  --shadow-inset-hi: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --shadow-card-hover:
    0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px -24px rgba(124, 92, 255, 0.28);
  --shadow-btn-primary:
    0 0 0 1px rgba(255, 255, 255, 0.1), 0 14px 40px -12px rgba(124, 92, 255, 0.55);
  --shadow-btn-primary-hover:
    0 0 0 1px rgba(255, 255, 255, 0.16), 0 20px 48px -12px rgba(124, 92, 255, 0.75);

  /* Motion — Apple/Linear easing */
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
  --gradient-accent: linear-gradient(
    100deg,
    var(--color-accent-from) 0%,
    var(--color-accent-to) 100%
  );
  --gradient-accent-soft: linear-gradient(
    100deg,
    rgba(124, 92, 255, 0.15) 0%,
    rgba(34, 211, 238, 0.15) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .pk-reveal,
  .pk-reveal-word {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### Step 2.2: Replace global.css

- [ ] Replace `src/styles/global.css` entirely with:

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./kit.css";

@import "@fontsource/geist-sans/400.css";
@import "@fontsource/geist-sans/500.css";
@import "@fontsource/geist-sans/600.css";
@import "@fontsource/geist-sans/700.css";
@import "@fontsource/geist-mono/400.css";
@import "@fontsource/geist-mono/500.css";
@import "@fontsource/geist-mono/600.css";

@utility gradient-text {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@utility gradient-fill {
  background: var(--gradient-accent);
}

@utility dotted-bg {
  background-image: radial-gradient(var(--grid-dot) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
}

@utility card-surface {
  background: linear-gradient(
    180deg,
    var(--color-surface) 0%,
    color-mix(in srgb, var(--color-surface) 86%, black) 100%
  );
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-inset-hi);
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-bg text-fg-muted min-h-screen font-sans antialiased;
    font-feature-settings: "ss01", "ss02", "cv11";
  }

  ::selection {
    background: var(--color-accent-from);
    color: var(--color-fg);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply text-fg font-display font-semibold tracking-tighter;
  }

  code,
  pre,
  kbd,
  samp {
    @apply font-mono;
  }

  a {
    @apply focus-visible:ring-accent focus-visible:ring-offset-bg transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
  }

  /* Prose / MDX body — retuned to v2 tokens */
  .prose-content {
    @apply text-fg-muted max-w-[72ch] text-base leading-relaxed;
  }

  .prose-content h2 {
    @apply font-display text-fg mt-16 mb-6 text-3xl font-semibold tracking-tighter md:text-4xl;
  }

  .prose-content h3 {
    @apply font-display text-fg mt-10 mb-4 text-xl font-semibold tracking-tight md:text-2xl;
  }

  .prose-content p {
    @apply mb-6;
  }

  .prose-content strong {
    @apply text-fg font-semibold;
  }

  .prose-content ul {
    @apply mb-8 ml-6 list-outside list-disc space-y-3;
  }

  .prose-content li::marker {
    color: var(--color-accent-from);
  }

  .prose-content li strong {
    @apply text-fg;
  }

  .prose-content pre {
    @apply border-border my-8 overflow-x-auto rounded-xl border p-5 font-mono text-xs md:text-sm;
    background: var(--color-surface-deep);
  }

  .prose-content code {
    @apply border-border text-fg rounded-md border bg-white/[0.02] px-1.5 py-0.5 font-mono text-[0.85em];
  }

  .prose-content pre code {
    @apply border-0 bg-transparent px-0 text-inherit;
  }

  .prose-content blockquote {
    @apply text-fg-muted my-8 rounded-r-lg border-l-2 p-5 pl-6 text-base leading-relaxed not-italic;
    border-left-color: var(--color-accent-from);
    background: var(--tint-accent-08);
  }

  .prose-content blockquote p {
    @apply mb-0;
  }

  .prose-content table {
    @apply my-8 w-full border-collapse overflow-hidden rounded-lg text-sm;
  }

  .prose-content thead {
    @apply border-border border-b;
    background: var(--color-surface);
  }

  .prose-content th {
    @apply text-fg-subtle px-4 py-3 text-left font-mono text-[11px] font-semibold tracking-wider uppercase;
  }

  .prose-content td {
    @apply border-border text-fg-muted border-b px-4 py-3;
  }

  .prose-content tbody tr {
    @apply transition-colors;
  }

  .prose-content tbody tr:hover {
    background: var(--tint-white-02);
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-fg-faint);
  transition: background 200ms var(--ease);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-fg-subtle);
}
```

### Step 2.3: Trim tailwind.config.mjs

- [ ] Replace `tailwind.config.mjs` entirely with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
};
```

Rationale: Tailwind v4 sources the theme from `@theme` in CSS; the config file stays only for content globs.

### Step 2.4: Create stub kit.css so imports resolve

- [ ] Create `src/styles/kit.css` with:

```css
/* v2 UI kit — ported in Task 3 */
```

This is a one-line stub so the `@import "./kit.css"` in `global.css` doesn't 404 during the build verification below. Task 3 replaces the content.

### Step 2.5: Verify build

- [ ] Run: `npm run build`

Expected: Build succeeds. The site compiles against new tokens. Warnings about unused utilities (`text-muted`, `text-foreground`, `bg-background`) from section files are expected — those sections are rewritten in tasks 6–9.

Failure mode: If build fails with "unknown utility `bg-bg`" or similar, verify that `@theme { --color-bg: ... }` is inside the `@theme` block and the `global.css` `@import` order is tailwindcss → tokens.css → kit.css.

### Step 2.6: Smoke visual check

- [ ] Run: `npm run dev` in background, open the root URL, verify the page still loads (will look broken — old sections use `text-muted` etc. which still resolves via their old mapping because we haven't removed the legacy utilities). Kill the dev server.

```bash
npm run dev &
sleep 4
curl -sI http://localhost:4321/ | head -1
kill %1
```

Expected: `HTTP/1.1 200 OK`.

Note: sections will look visually wrong in the browser (fonts switched, colors shifted slightly). That's expected — sections get rewritten later. We only verify that the build pipeline is intact.

### Step 2.7: Commit

- [ ] Run:

```bash
git add src/styles/tokens.css src/styles/global.css src/styles/kit.css tailwind.config.mjs
git commit -m "$(cat <<'EOF'
feat(tokens): introduce v2 token system with hybrid @theme + :root

Adds src/styles/tokens.css as the single source of truth. @theme block
drives Tailwind v4 utilities (bg-bg, text-fg-muted, font-mono, tracking-tighter,
rounded-lg). :root block carries raw CSS vars for pk-* kit rules (shadows,
motion curves, grid, tints, gradients). Includes reduced-motion kill-switch.

Trims tailwind.config.mjs to content globs only — theme comes from CSS.
Replaces global.css with v2-aligned base rules, retuned prose-content,
scrollbar. Creates stub kit.css for subsequent task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Port pk-\* kit styles to kit.css

**Files:**

- Modify: `src/styles/kit.css` (replace stub)

### Step 3.1: Write full kit.css

- [ ] Replace `src/styles/kit.css` with the following (ported from `handoff/kit.css`, with var references retuned to `--color-*` and the stale `@import url("../../colors_and_type_v2.css")` removed):

```css
/* ==========================================================================
   v2 UI Kit — pk-* classes used by React primitives and Astro shells.
   Tokens come from tokens.css (loaded in global.css before this file).
   ========================================================================== */

/* Page wrapper: dotted-grid fixed background masked to hero area */
.pk-page {
  position: relative;
  isolation: isolate;
  background: var(--color-bg);
}
.pk-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: radial-gradient(var(--grid-dot) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 85%);
}

/* ---------- Nav ---------- */
.pk-nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  transition: all 0.3s var(--ease);
}
.pk-nav.scrolled {
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  background: rgba(8, 8, 11, 0.72);
  border-bottom: 1px solid var(--color-border);
}
.pk-nav__inner {
  max-width: var(--max-w-page);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
}
.pk-nav__brand {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-fg);
  letter-spacing: var(--tracking-tight);
}
.pk-nav__links {
  display: flex;
  gap: 32px;
}
.pk-nav__link {
  font-size: 14px;
  color: var(--color-fg-muted);
  transition: color 0.2s var(--ease);
}
.pk-nav__link:hover {
  color: var(--color-fg);
}
.pk-nav__right {
  display: flex;
  align-items: center;
  gap: 12px;
}
@media (max-width: 767px) {
  .pk-nav__links {
    display: none;
  }
}

/* Command key hint */
.pk-cmdk {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--color-border);
  background: var(--tint-white-02);
  border-radius: 8px;
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-fg-muted);
  cursor: pointer;
  transition: all 0.2s var(--ease);
}
.pk-cmdk:hover {
  border-color: var(--color-border-strong);
  color: var(--color-fg);
}
.pk-cmdk kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-fg);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 5px;
}

/* ---------- Buttons (magnetic) ---------- */
.pk-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-md);
  padding: 13px 22px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.32s var(--ease);
  cursor: pointer;
  border: none;
  white-space: nowrap;
  letter-spacing: var(--tracking-tight);
  will-change: transform;
}
.pk-btn--primary {
  color: #fff;
  background: var(--gradient-accent);
  box-shadow: var(--shadow-btn-primary);
}
.pk-btn--primary:hover {
  filter: brightness(1.08);
  box-shadow: var(--shadow-btn-primary-hover);
}
.pk-btn--ghost {
  color: var(--color-fg);
  border: 1px solid var(--color-border);
  background: transparent;
}
.pk-btn--ghost:hover {
  border-color: var(--color-border-strong);
  background: var(--tint-white-02);
}
.pk-btn--sm {
  padding: 8px 14px;
  font-size: 12.5px;
}
.pk-btn__arrow {
  width: 15px;
  height: 15px;
  transition: transform 0.3s var(--ease);
}
.pk-btn:hover .pk-btn__arrow {
  transform: translateX(3px);
}

/* ---------- Status pill ---------- */
.pk-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.025);
  border-radius: 9999px;
  padding: 6px 14px 6px 10px;
  font-size: 12.5px;
  color: var(--color-fg-muted);
  backdrop-filter: blur(8px);
  letter-spacing: var(--tracking-tight);
}
.pk-status__dot {
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pk-pulse 2s var(--ease) infinite;
}
@keyframes pk-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* ---------- Section + eyebrow ---------- */
.pk-section {
  padding: 96px 24px;
  scroll-margin-top: 96px;
  position: relative;
}
.pk-section__inner {
  max-width: var(--max-w-page);
  margin: 0 auto;
  position: relative;
}
.pk-eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 14px;
}
.pk-eyebrow__n {
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.pk-eyebrow__s {
  color: var(--color-fg-subtle);
  margin-left: 10px;
}
.pk-h2 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(40px, 3vw + 18px, 56px);
  line-height: 1.02;
  letter-spacing: var(--tracking-tighter);
  color: var(--color-fg);
  max-width: 620px;
  margin: 0 0 72px;
}

/* ---------- Card ---------- */
.pk-card {
  background: linear-gradient(
    180deg,
    var(--color-surface) 0%,
    color-mix(in srgb, var(--color-surface) 86%, black) 100%
  );
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-inset-hi);
  border-radius: var(--radius-lg);
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.5s var(--ease),
    border-color 0.3s var(--ease),
    box-shadow 0.3s var(--ease);
}
.pk-card--interactive {
  transform-style: preserve-3d;
}
.pk-card--interactive:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-card-hover), var(--shadow-inset-hi);
}
.pk-card__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--tint-white-02);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-fg);
  margin-bottom: 18px;
}
.pk-card__icon svg {
  width: 20px;
  height: 20px;
}
.pk-card__title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  color: var(--color-fg);
  margin: 0 0 10px;
  letter-spacing: var(--tracking-tight);
}
.pk-card__body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-fg-muted);
  margin: 0 0 20px;
}

/* ---------- Chips ---------- */
.pk-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pk-chip {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-fg-muted);
  background: var(--tint-white-02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
}

/* ---------- Hero ---------- */
.pk-hero {
  min-height: 88vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.pk-hero__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(52px, 5.5vw + 16px, 88px);
  line-height: 0.98;
  letter-spacing: var(--tracking-tightest);
  color: var(--color-fg);
  margin: 28px 0 24px;
  max-width: 980px;
}
.pk-hero__sub {
  font-size: 19px;
  line-height: 1.55;
  color: var(--color-fg-muted);
  max-width: 620px;
  margin: 0 0 44px;
  letter-spacing: var(--tracking-tight);
}
.pk-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 72px;
}

.pk-stats {
  max-width: 760px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-border);
  overflow: hidden;
}
.pk-stats__cell {
  background: var(--color-bg);
  padding: 22px;
}
.pk-stats__v {
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 500;
  color: var(--color-fg);
  line-height: 1;
  letter-spacing: -0.02em;
}
.pk-stats__l {
  font-size: 11px;
  color: var(--color-fg-subtle);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 10px;
  display: block;
}
@media (max-width: 767px) {
  .pk-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ---------- Grids ---------- */
.pk-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.pk-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 767px) {
  .pk-grid-2,
  .pk-grid-3 {
    grid-template-columns: 1fr;
  }
}

/* ---------- Project card ---------- */
.pk-proj {
  display: block;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    180deg,
    var(--color-surface),
    color-mix(in srgb, var(--color-surface) 86%, black)
  );
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-inset-hi);
  transition:
    border-color 0.3s var(--ease),
    box-shadow 0.3s var(--ease),
    transform 0.5s var(--ease);
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
}
.pk-proj:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-card-hover);
}
.pk-proj__img {
  aspect-ratio: 16/9;
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}
.pk-proj__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: all 0.55s var(--ease);
}
.pk-proj:hover .pk-proj__img img {
  opacity: 1;
  transform: scale(1.04);
}
.pk-proj__img::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 8, 11, 0.6), transparent 60%);
  pointer-events: none;
}
.pk-proj__body {
  padding: 22px 24px;
}
.pk-proj__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-fg);
  margin: 0 0 8px;
  letter-spacing: var(--tracking-tight);
}
.pk-proj__desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-fg-muted);
  margin: 0 0 18px;
}

/* ---------- Radial glow (v2 duotone) ---------- */
.radial-glow-v2 {
  position: absolute;
  pointer-events: none;
  width: 1000px;
  height: 1000px;
  border-radius: 9999px;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--color-accent-from) 22%, transparent),
    color-mix(in srgb, var(--color-accent-to) 10%, transparent) 45%,
    transparent 72%
  );
  filter: blur(140px);
}

/* ---------- Reveal animation ---------- */
.pk-reveal {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.6s var(--ease-out),
    transform 0.6s var(--ease-out);
}
.pk-reveal.in {
  opacity: 1;
  transform: none;
}
.pk-reveal-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.5s var(--ease-out),
    transform 0.5s var(--ease-out);
}
.pk-reveal-word.in {
  opacity: 1;
  transform: none;
}

/* ---------- Process ---------- */
.pk-step__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pk-step__n {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 600;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.pk-step__dur {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-fg-subtle);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

/* ---------- Footer ---------- */
.pk-footer {
  border-top: 1px solid var(--color-border);
  margin-top: 96px;
}
.pk-footer__inner {
  max-width: var(--max-w-page);
  margin: 0 auto;
  padding: 36px 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.pk-footer__copy {
  font-size: 12px;
  color: var(--color-fg-subtle);
  font-family: var(--font-mono);
}
.pk-footer__links {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: var(--color-fg-muted);
}
.pk-footer__links a:hover {
  color: var(--color-fg);
}
.pk-footer__deploy {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-fg-subtle);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.pk-footer__deploy::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22c55e;
}

/* ---------- Command palette ---------- */
.pk-cmd-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(8, 8, 11, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 18vh;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s var(--ease);
}
.pk-cmd-overlay.open {
  opacity: 1;
  pointer-events: auto;
}
.pk-cmd {
  width: min(560px, 92vw);
  background: linear-gradient(180deg, var(--color-surface), var(--color-surface-deep));
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow:
    0 40px 80px -20px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: translateY(-6px) scale(0.98);
  transition: transform 0.24s var(--ease-out);
}
.pk-cmd-overlay.open .pk-cmd {
  transform: none;
}
.pk-cmd__input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-fg);
  font-family: var(--font-sans);
  font-size: 15px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
  outline: none;
  letter-spacing: var(--tracking-tight);
}
.pk-cmd__input::placeholder {
  color: var(--color-fg-subtle);
}
.pk-cmd__list {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}
.pk-cmd__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-fg-muted);
  transition: background 0.15s var(--ease);
}
.pk-cmd__item[data-active="true"],
.pk-cmd__item:hover {
  background: var(--tint-white-04);
  color: var(--color-fg);
}
.pk-cmd__icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--tint-white-02);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-fg-muted);
  flex: 0 0 auto;
}
.pk-cmd__icon svg {
  width: 14px;
  height: 14px;
}
.pk-cmd__meta {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-fg-subtle);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
```

### Step 3.2: Verify build

- [ ] Run: `npm run build`

Expected: Build succeeds. No new CSS warnings. `pk-*` classes aren't used in any component yet — they're just resident in the stylesheet.

### Step 3.3: Commit

- [ ] Run:

```bash
git add src/styles/kit.css
git commit -m "$(cat <<'EOF'
feat(kit): port pk-* v2 kit styles

Full port of handoff/kit.css retuned to use --color-* tokens from tokens.css.
Classes resident but unused in this commit — React primitives and Astro
shells consume them in subsequent tasks. Covers page wrapper, nav, buttons,
cards, chips, hero, stats, project card, radial glow, reveal, process step,
footer, and command palette chrome.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add v2 React primitives + Astro UI components

**Files:**

- Create: `src/components/react/useInView.ts`
- Create: `src/components/react/usePrefersReducedMotion.ts`
- Create: `src/components/react/types.ts`
- Create: `src/components/react/Button.tsx`
- Create: `src/components/react/Card.tsx`
- Create: `src/components/react/RevealWords.tsx`
- Create: `src/components/react/CountUpStat.tsx`
- Create: `src/components/react/CopyEmailButton.tsx`
- Create: `src/components/ui/StatusPill.astro`
- Create: `src/components/ui/Chip.astro`
- Create: `src/components/ui/Chips.astro`
- Create: `src/components/ui/Eyebrow.astro`

### Step 4.1: Create `src/components/react/` directory structure

- [ ] Create the directory:

```bash
mkdir -p src/components/react
```

### Step 4.2: `src/components/react/types.ts`

- [ ] Create with content:

```ts
export type CmdItem =
  | { id: string; label: string; meta: "NAV"; href: string }
  | { id: string; label: string; meta: "ACTION"; action: "copy-email" }
  | { id: string; label: string; meta: "ACTION"; href: string }
  | { id: string; label: string; meta: "EXT"; href: string }
  | { id: string; label: string; meta: "CASE STUDY"; href: string; tags: string[] };
```

### Step 4.3: `src/components/react/usePrefersReducedMotion.ts`

- [ ] Create with content:

```ts
import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
```

### Step 4.4: `src/components/react/useInView.ts`

- [ ] Create with content:

```ts
import { useEffect, useRef, useState } from "react";

type Opts = { threshold?: number; once?: boolean };

export function useInView<T extends Element = HTMLDivElement>(opts: Opts = {}) {
  const { threshold = 0.2, once = true } = opts;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold, once]);

  return [ref, inView] as const;
}
```

### Step 4.5: `src/components/react/Button.tsx`

- [ ] Create with content:

```tsx
import { useRef, type ReactNode, type MouseEvent } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  variant?: "primary" | "ghost";
  size?: "sm";
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
};

const ArrowRight = () => (
  <svg
    className="pk-btn__arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function Button({
  variant = "primary",
  size,
  href,
  onClick,
  children,
  className = "",
  external,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const max = 60;
    if (dist < max && dist > 0) {
      const f = (1 - dist / max) * 4;
      el.style.transform = `translate(${(dx / dist) * f}px, ${(dy / dist) * f}px)`;
    } else {
      el.style.transform = "";
    }
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const classes = [
    "pk-btn",
    variant === "primary" ? "pk-btn--primary" : "pk-btn--ghost",
    size === "sm" ? "pk-btn--sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {children}
      <ArrowRight />
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={classes}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={classes}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
```

### Step 4.6: `src/components/react/Card.tsx`

- [ ] Create with content:

```tsx
import { useRef, type ReactNode, type MouseEvent } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  interactive?: boolean;
  tilt?: boolean;
  className?: string;
  children: ReactNode;
  as?: "div" | "a";
  href?: string;
};

export default function Card({
  interactive = false,
  tilt = false,
  className = "",
  children,
  as = "div",
  href,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (!tilt || reduced) return;
    if (window.matchMedia?.("(hover: none)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 3}deg) rotateX(${-py * 3}deg)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const classes = ["pk-card", interactive ? "pk-card--interactive" : "", className]
    .filter(Boolean)
    .join(" ");

  if (as === "a" && href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={classes}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={classes}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
```

### Step 4.7: `src/components/react/RevealWords.tsx`

- [ ] Create with content:

```tsx
import { useInView } from "./useInView";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  children: string;
  className?: string;
  delayOffset?: number;
};

export default function RevealWords({ children, className = "", delayOffset = 0 }: Props) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.2, once: true });
  const reduced = usePrefersReducedMotion();
  const words = String(children).split(" ");
  const visible = reduced ? true : inView;

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className={`pk-reveal-word ${visible ? "in" : ""}`}
          style={{ transitionDelay: `${delayOffset + i * 55}ms` }}
        >
          {w}
          {i < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </span>
  );
}
```

### Step 4.8: `src/components/react/CountUpStat.tsx`

- [ ] Create with content:

```tsx
import { useEffect, useState } from "react";
import { useInView } from "./useInView";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = { value: string; label: string };

export default function CountUpStat({ value, label }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3, once: true });
  const reduced = usePrefersReducedMotion();
  const match = String(value).match(/([\d.]+)([a-z%+]*)/i);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const [n, setN] = useState<number>(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(target);
      return;
    }
    const dur = 1200;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduced]);

  const disp = target % 1 === 0 ? Math.round(n) : n.toFixed(1);

  return (
    <div ref={ref} className="pk-stats__cell">
      <div className="pk-stats__v">
        {disp}
        {suffix}
      </div>
      <span className="pk-stats__l">{label}</span>
    </div>
  );
}
```

### Step 4.9: `src/components/react/CopyEmailButton.tsx`

- [ ] Create with content:

```tsx
import { useState } from "react";
import Button from "./Button";

const EMAIL = "joydip.dutta9943@gmail.com";

export default function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  const onClick = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // Fallback: open mailto
        window.location.href = `mailto:${EMAIL}`;
      });
  };

  return <Button onClick={onClick}>{copied ? "Copied to clipboard ✓" : EMAIL}</Button>;
}
```

### Step 4.10: Astro `StatusPill.astro`

- [ ] Create `src/components/ui/StatusPill.astro`:

```astro
---
interface Props {
  class?: string;
}
const { class: className = "" } = Astro.props;
---

<span role="status" class:list={["pk-status", className]}>
  <span class="pk-status__dot" aria-hidden="true"></span>
  <slot />
</span>
```

### Step 4.11: Astro `Chip.astro`

- [ ] Create `src/components/ui/Chip.astro`:

```astro
---
interface Props {
  class?: string;
}
const { class: className = "" } = Astro.props;
---

<span class:list={["pk-chip", className]}><slot /></span>
```

### Step 4.12: Astro `Chips.astro`

- [ ] Create `src/components/ui/Chips.astro`:

```astro
---
interface Props {
  items: string[];
  max?: number;
  class?: string;
}
const { items, max, class: className = "" } = Astro.props;
const shown = typeof max === "number" ? items.slice(0, max) : items;
const overflow = typeof max === "number" && items.length > max ? items.length - max : 0;
---

<div class:list={["pk-chips", className]}>
  {shown.map((item) => <span class="pk-chip">{item}</span>)}
  {
    overflow > 0 && (
      <span class="pk-chip" style="opacity:.7">
        +{overflow} more
      </span>
    )
  }
</div>
```

### Step 4.13: Astro `Eyebrow.astro`

- [ ] Create `src/components/ui/Eyebrow.astro`:

```astro
---
interface Props {
  n: string;
  label: string;
  class?: string;
}
const { n, label, class: className = "" } = Astro.props;
---

<div class:list={["pk-eyebrow", className]}>
  <span class="pk-eyebrow__n">{n}</span>
  <span class="pk-eyebrow__s">— {label}</span>
</div>
```

### Step 4.14: Build verification

- [ ] Run: `npm run build`

Expected: Build succeeds. Components exist but are unused — no runtime errors. React-specific warnings like "island has no matching hydration" won't occur since nothing imports them yet.

- [ ] Run: `npx astro check` (if available)

Expected: no TypeScript errors in the new `.tsx` files.

If `astro check` is not installed, skip — the production build catches type errors via Vite.

### Step 4.15: Commit

- [ ] Run:

```bash
git add src/components/react src/components/ui/StatusPill.astro src/components/ui/Chip.astro src/components/ui/Chips.astro src/components/ui/Eyebrow.astro
git commit -m "$(cat <<'EOF'
feat(ui): add v2 React primitives and static Astro chips

React islands (src/components/react/):
- Button (magnetic, 60px pull radius, disabled on coarse pointer / reduced motion)
- Card (optional tilt, ±3deg perspective, disabled on hover:none / reduced motion)
- RevealWords (staggered word reveal, 55ms/word)
- CountUpStat (eased count-up with suffix parsing)
- CopyEmailButton (wraps Button with copied-state flip)
- useInView, usePrefersReducedMotion hooks
- CmdItem type

Astro primitives (src/components/ui/):
- StatusPill (pulsing dot + text)
- Chip / Chips (with optional max + overflow indicator)
- Eyebrow (numbered section label)

No sections wired yet — pure additions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Update Layout + Nav + build stamp

**Files:**

- Modify: `astro.config.mjs`
- Create: `src/env.d.ts` (new — repo doesn't have one yet)
- Modify: `src/layouts/Layout.astro`
- Modify: `src/components/ui/Nav.astro`
- Modify: `src/components/ui/Footer.astro`

### Step 5.1: Add `__BUILD_TIME__` define to Astro config

- [ ] Modify `astro.config.mjs` to include vite.define:

Replace the current `vite: { ... }` block so the full file reads:

```js
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
```

### Step 5.2: Create `src/env.d.ts`

- [ ] Create `src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
declare const __BUILD_TIME__: string;
```

### Step 5.3: Update `Nav.astro` to wordmark + palette trigger

- [ ] Replace `src/components/ui/Nav.astro` entirely with:

```astro
---
import Button from "../react/Button";
---

<nav id="site-nav" class="pk-nav">
  <div class="pk-nav__inner">
    <a href="/" class="pk-nav__brand">Joydip Dutta</a>

    <div class="pk-nav__links">
      <a href="/#work" class="pk-nav__link">Work</a>
      <a href="/#services" class="pk-nav__link">Services</a>
      <a href="/#about" class="pk-nav__link">About</a>
      <a href="/#contact" class="pk-nav__link">Contact</a>
    </div>

    <div class="pk-nav__right">
      <button id="nav-cmdk" class="pk-cmdk" type="button" aria-label="Open command palette">
        Search <kbd>⌘K</kbd>
      </button>
      <Button client:load size="sm" href="/#contact">Start a project</Button>
    </div>
  </div>
</nav>

<script is:inline>
  (function () {
    const nav = document.getElementById("site-nav");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("astro:page-load", onScroll);

    const cmdBtn = document.getElementById("nav-cmdk");
    if (cmdBtn) {
      cmdBtn.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("pk:cmd-open"));
      });
    }
  })();
</script>
```

### Step 5.4: Update `Footer.astro` with deploy stamp

- [ ] Replace `src/components/ui/Footer.astro` entirely with:

```astro
---
const year = new Date().getFullYear();
const buildIso = __BUILD_TIME__;
---

<footer class="pk-footer">
  <div class="pk-footer__inner">
    <span class="pk-footer__copy">© {year} Joydip Dutta</span>

    <span class="pk-footer__deploy" data-build-iso={buildIso}>
      <span data-deploy-age>recently deployed</span>
    </span>

    <div class="pk-footer__links">
      <a href="https://github.com/joydipdutta9943" target="_blank" rel="noopener noreferrer"
        >GitHub</a
      >
      <a
        href="https://www.linkedin.com/in/joydip-dutta-569428141/"
        target="_blank"
        rel="noopener noreferrer">LinkedIn</a
      >
      <a href="mailto:joydip.dutta9943@gmail.com">Email</a>
    </div>
  </div>
</footer>

<script is:inline>
  (function () {
    const el = document.querySelector("[data-build-iso]");
    if (!el) return;
    const iso = el.getAttribute("data-build-iso");
    const age = document.querySelector("[data-deploy-age]");
    if (!iso || !age) return;
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const h = diff / (1000 * 60 * 60);
      const d = h / 24;
      let text = "recently deployed";
      if (h < 1) text = "deployed just now";
      else if (h < 24) text = `deployed ${Math.floor(h)}h ago`;
      else if (d < 30) text = `deployed ${Math.floor(d)}d ago`;
      else text = `deployed ${Math.floor(d / 30)}mo ago`;
      age.textContent = text;
    } catch {
      // keep fallback
    }
  })();
</script>
```

### Step 5.5: Update `Layout.astro`

- [ ] Replace `src/layouts/Layout.astro` entirely with:

```astro
---
import { ClientRouter } from "astro:transitions";
import "../styles/global.css";
import Nav from "../components/ui/Nav.astro";
import Footer from "../components/ui/Footer.astro";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = "Freelance product engineer building production backends, SaaS platforms, and AI systems for funded startups.",
  ogImage,
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);

const metaDescription =
  description.length > 155 ? description.slice(0, 152).trimEnd() + "…" : description;

const resolvedOgImage = ogImage
  ? new URL(ogImage.replace(/^\//, ""), Astro.site).href
  : `${Astro.site}og-image.png`;
---

<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={metaDescription} />
    <meta name="author" content="Joydip Dutta" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#08080b" />
    <meta name="generator" content={Astro.generator} />

    <title>{title}</title>
    <link rel="canonical" href={canonicalURL.href} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL.href} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:image" content={resolvedOgImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Joydip Dutta" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={metaDescription} />
    <meta name="twitter:image" content={resolvedOgImage} />

    <script
      type="application/ld+json"
      set:html={JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Joydip Dutta",
        url: "https://sannin-coder.info",
        jobTitle: "Freelance Software Engineer",
        description:
          "Freelance product engineer building backends, SaaS platforms, and AI systems for funded startups.",
        email: "joydip.dutta9943@gmail.com",
        knowsAbout: [
          "TypeScript",
          "Go",
          "Node.js",
          "PostgreSQL",
          "MongoDB",
          "AWS",
          "LangChain",
          "RAG systems",
          "Microservices",
          "SaaS architecture",
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: "Freelance Product Engineer",
          occupationalCategory: "15-1252.00",
          skills: "Full-stack engineering, backend architecture, AI integration",
        },
        sameAs: [
          "https://github.com/joydipdutta9943",
          "https://www.linkedin.com/in/joydip-dutta-569428141/",
        ],
      })}
    />

    <ClientRouter />
  </head>
  <body class="pk-page">
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
    <!-- CommandPalette mount point — populated in Task 8 -->
  </body>
</html>
```

Note: The `<main class="pt-24">` top padding is gone — the nav is `position: fixed` with `padding: 18px 24px` and `88vh` hero handles its own spacing. Section pages (`/projects`) add their own top padding in their components.

### Step 5.6: Verify build + dev

- [ ] Run: `npm run build`

Expected: Build succeeds. Warnings about `radial-glow`, `card-surface`, `gradient-fill`, `gradient-text`, `text-muted`, `text-foreground`, `bg-background` etc. from section components are expected — sections are rewritten in tasks 6–9.

- [ ] Run a 4-second smoke in dev:

```bash
npm run dev &
sleep 4
curl -sI http://localhost:4321/ | head -1
kill %1
```

Expected: `HTTP/1.1 200 OK`. Home page will look visually broken (sections still use v1 tokens/classes) but nav + footer render in v2 aesthetic.

### Step 5.7: Commit

- [ ] Run:

```bash
git add astro.config.mjs src/env.d.ts src/layouts/Layout.astro src/components/ui/Nav.astro src/components/ui/Footer.astro
git commit -m "$(cat <<'EOF'
feat(layout): wordmark nav, deploy-stamp footer, __BUILD_TIME__ wiring

Layout.astro: drop pt-24 main padding, wrap body in .pk-page for the fixed
dotted-grid background. Theme-color updated to v2 bg #08080b. Palette mount
comment placeholder for Task 8.

Nav.astro: wordmark brand, ⌘K search button that dispatches pk:cmd-open
CustomEvent, ghost-state scroll class, React Button for primary CTA.

Footer.astro: pk-footer chrome with deploy-age span computed client-side
from __BUILD_TIME__ (SSR fallback "recently deployed").

astro.config.mjs: vite.define __BUILD_TIME__ as ISO string.
src/env.d.ts: declare the global.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Port Hero + Contact sections

**Files:**

- Modify: `src/components/sections/Hero.astro`
- Modify: `src/components/sections/Contact.astro`

### Step 6.1: Rewrite `Hero.astro`

- [ ] Replace `src/components/sections/Hero.astro` entirely with:

```astro
---
import Button from "../react/Button";
import RevealWords from "../react/RevealWords";
import CountUpStat from "../react/CountUpStat";
import StatusPill from "../ui/StatusPill.astro";

const stats = [
  { value: "3+", label: "yrs shipping" },
  { value: "30k+", label: "users served" },
  { value: "99.9%", label: "uptime SLA" },
  { value: "12+", label: "projects shipped" },
];
---

<section id="top" class="pk-section pk-hero" style="padding: 0 24px;">
  <div class="radial-glow-v2" style="top: -220px; left: 50%; transform: translateX(-50%);"></div>

  <div class="pk-section__inner" style="padding: 140px 0 96px;">
    <StatusPill>Available · Q2 2026 · 2 of 3 slots open</StatusPill>

    <h1 class="pk-hero__title">
      <RevealWords client:load>Senior engineer shipping</RevealWords>{" "}
      <span class="gradient-text">
        <RevealWords client:load delayOffset={180}>production systems</RevealWords>
      </span>{" "}
      <RevealWords client:load delayOffset={360}>for funded startups.</RevealWords>
    </h1>

    <p class="pk-hero__sub">
      I ship backends, SaaS platforms, and AI features that hold up in production. Previously built
      a fintech wealth platform serving 30k users and a RAG system on unstructured data for
      enterprise search.
    </p>

    <div class="pk-hero__actions">
      <Button client:load href="/#contact">Start a project</Button>
      <Button client:load variant="ghost" href="/#work">See case studies</Button>
    </div>

    <div class="pk-stats">
      {stats.map((s) => <CountUpStat client:visible value={s.value} label={s.label} />)}
    </div>
  </div>
</section>
```

### Step 6.2: Rewrite `Contact.astro`

- [ ] Replace `src/components/sections/Contact.astro` entirely with:

```astro
---
import Eyebrow from "../ui/Eyebrow.astro";
import CopyEmailButton from "../react/CopyEmailButton";
---

<section id="contact" class="pk-section" style="text-align: center;">
  <div class="radial-glow-v2" style="top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>

  <div class="pk-section__inner" style="max-width: 720px;">
    <Eyebrow n="05" label="Start a project" />

    <h2
      class="pk-h2"
      style="max-width: 100%; margin: 0 auto 24px; font-size: clamp(40px, 3vw + 20px, 64px);"
    >
      Have something <span class="gradient-text">hard to build?</span>
    </h2>

    <p
      style="color: var(--color-fg-muted); font-size: 18px; line-height: 1.55; max-width: 560px; margin: 0 auto 40px;"
    >
      I take a small number of engagements at a time. Best fit: funded startup, real product in
      production or about to be, four-plus weeks of work. Send me what you're building and I'll
      reply within 24 hours.
    </p>

    <CopyEmailButton client:load />

    <div
      style="margin-top: 32px; display: flex; justify-content: center; gap: 24px; color: var(--color-fg-muted); font-size: 12px;"
    >
      <a
        href="https://github.com/joydipdutta9943"
        target="_blank"
        rel="noopener noreferrer"
        style="transition: color .2s var(--ease);"
      >
        GitHub
      </a>
      <span style="color: var(--color-fg-subtle);">·</span>
      <a
        href="https://www.linkedin.com/in/joydip-dutta-569428141/"
        target="_blank"
        rel="noopener noreferrer"
        style="transition: color .2s var(--ease);"
      >
        LinkedIn
      </a>
    </div>
  </div>
</section>
```

### Step 6.3: Verify build

- [ ] Run: `npm run build`

Expected: Build succeeds. Hero/Contact should compile without errors.

### Step 6.4: Visual smoke

- [ ] Run `npm run dev &`, wait 4s, open `http://localhost:4321/` in a browser. Verify:
  - Hero: Geist font, duotone glow at top, status pill pulsing green, title reveals staggered, stats count up on scroll-in.
  - Contact: glow behind, copy-email button flips to "Copied to clipboard ✓" for 1.6s on click.
  - Middle sections (Services/Work/Process/About) still look v1 — expected, fixed in Task 7.

Kill dev server when done.

### Step 6.5: Commit

- [ ] Run:

```bash
git add src/components/sections/Hero.astro src/components/sections/Contact.astro
git commit -m "$(cat <<'EOF'
feat(home): port Hero + Contact to v2

Hero: pk-hero shell with radial-glow-v2, StatusPill, three staggered
RevealWords spans (middle one gradient-text), magnetic Buttons, four
CountUpStat cells.

Contact: pk-section centered with radial glow, Eyebrow label, gradient
accent in heading, CopyEmailButton (flips to "Copied ✓" on click).

Middle sections remain v1 — ported in next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Port Services, Work, Process, About sections

**Files:**

- Modify: `src/components/sections/Services.astro`
- Modify: `src/components/sections/Work.astro`
- Modify: `src/components/sections/Process.astro`
- Modify: `src/components/sections/About.astro`

### Step 7.1: Rewrite `Services.astro`

- [ ] Replace `src/components/sections/Services.astro` entirely with:

```astro
---
import Card from "../react/Card";
import Chips from "../ui/Chips.astro";
import Eyebrow from "../ui/Eyebrow.astro";

const services = [
  {
    title: "Product Engineering",
    pitch:
      "Full SaaS builds from zero. Backend, API, database, auth, payments, integrations — the whole backend and as much frontend as you need. 4–12 week engagements.",
    tags: ["TypeScript / Go", "Postgres / Mongo", "AWS"],
    iconPaths: ["M12 2 4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6l-8-4z", "M9 12l2 2 4-4"],
  },
  {
    title: "Backend Architecture",
    pitch:
      "Microservices, event systems, scale-ready foundations. Reviews of what you have, or greenfield designs for what you're about to build.",
    tags: ["Fiber", "BullMQ", "ClickHouse"],
    iconPaths: ["M4 6h16", "M4 12h16", "M4 18h16", "M8 6v12", "M16 6v12"],
  },
  {
    title: "AI & RAG Systems",
    pitch:
      "LLM features that work on real data, not demos. Vector search, agentic workflows, retrieval pipelines wired into your existing product.",
    tags: ["LangChain", "Gemini / OpenAI", "pgvector / Atlas"],
    iconPaths: [
      "M12 2v4",
      "M12 18v4",
      "M2 12h4",
      "M18 12h4",
      "M4.93 4.93l2.83 2.83",
      "M16.24 16.24l2.83 2.83",
      "M4.93 19.07l2.83-2.83",
      "M16.24 7.76l2.83-2.83",
    ],
  },
  {
    title: "Technical Advisory",
    pitch:
      "Code review, architecture review, hire-a-senior-for-a-week. Async over calls, paid by the day, fixed scope.",
    tags: ["async", "paid", "fixed scope"],
    iconPaths: [
      "M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5z",
    ],
  },
];
---

<section id="services" class="pk-section">
  <div class="pk-section__inner">
    <Eyebrow n="01" label="What I build" />
    <h2 class="pk-h2">
      Work I take on for <span class="gradient-text">funded teams</span>.
    </h2>

    <div class="pk-grid-2">
      {
        services.map((s) => (
          <Card client:visible interactive tilt>
            <div class="pk-card__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                {s.iconPaths.map((d) => (
                  <path d={d} />
                ))}
              </svg>
            </div>
            <h3 class="pk-card__title">{s.title}</h3>
            <p class="pk-card__body">{s.pitch}</p>
            <Chips items={s.tags} />
          </Card>
        ))
      }
    </div>
  </div>
</section>
```

### Step 7.2: Rewrite `Work.astro`

- [ ] Replace `src/components/sections/Work.astro` entirely with:

```astro
---
import { getCollection } from "astro:content";
import Card from "../react/Card";
import Chips from "../ui/Chips.astro";
import Eyebrow from "../ui/Eyebrow.astro";

const allProjects = await getCollection("projects");
const sorted = allProjects.sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
const featured = sorted.filter((p) => p.data.image).slice(0, 2);
const smaller = sorted.filter((p) => !p.data.image).slice(0, 3);
---

<section id="work" class="pk-section">
  <div class="pk-section__inner">
    <Eyebrow n="02" label="Selected work" />
    <h2 class="pk-h2">Production systems, not demos.</h2>

    <div class="pk-grid-2">
      {
        featured.map((p) => (
          <a href={`/projects/${p.id}`} class="pk-proj" data-astro-prefetch>
            <div class="pk-proj__img">
              <img src={p.data.image} alt={p.data.title} />
            </div>
            <div class="pk-proj__body">
              <h3 class="pk-proj__title">{p.data.title}</h3>
              <p class="pk-proj__desc">{p.data.description}</p>
              <Chips items={p.data.techStack} max={4} />
            </div>
          </a>
        ))
      }
    </div>

    <div class="pk-grid-3" style="margin-top: 16px;">
      {
        smaller.map((p) => (
          <a href={`/projects/${p.id}`} class="pk-proj" data-astro-prefetch>
            <div class="pk-proj__body">
              <h3 class="pk-proj__title" style="font-size: 16px;">
                {p.data.title}
              </h3>
              <p class="pk-proj__desc">{p.data.description}</p>
              <Chips items={p.data.techStack} max={3} />
            </div>
          </a>
        ))
      }
    </div>

    <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
      <a
        href="/projects"
        class="pk-nav__link"
        style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: .12em;"
        data-astro-prefetch
      >
        View all {sorted.length} projects →
      </a>
    </div>
  </div>
</section>
```

Note: `pk-proj` already has hover transforms in kit.css; we wrap the anchors directly instead of using `<Card tilt>` for the featured items to keep the `<a>` semantic without extra wrappers. If tilt is desired on these anchors, that can be added later by converting `pk-proj` to accept a React Card wrapper — deferred as it's a polish item, not a bug.

### Step 7.3: Rewrite `Process.astro`

- [ ] Replace `src/components/sections/Process.astro` entirely with:

```astro
---
import Card from "../react/Card";
import Eyebrow from "../ui/Eyebrow.astro";

const steps = [
  {
    n: "01",
    dur: "1 week",
    title: "Discovery",
    body: "We pin down the product, the constraints, and the bar. I scope the build, flag the risky parts, and tell you what's hard. If it's not a fit, I'll say so.",
  },
  {
    n: "02",
    dur: "1–2 weeks",
    title: "Architecture",
    body: "Data model, API contract, infra plan. You review and approve before a line of production code is written. Surprises get expensive later.",
  },
  {
    n: "03",
    dur: "4–12 weeks",
    title: "Build & ship",
    body: "Weekly demos, continuous deploys, your team owns the code from day one. I work in your repo, your branch conventions, your review process.",
  },
];
---

<section id="process" class="pk-section">
  <div class="pk-section__inner">
    <Eyebrow n="03" label="How I work" />
    <h2 class="pk-h2">Predictable process. No surprises.</h2>

    <div class="pk-grid-3">
      {
        steps.map((s) => (
          <Card client:visible>
            <div class="pk-step__head">
              <span class="pk-step__n">{s.n}</span>
              <span class="pk-step__dur">{s.dur}</span>
            </div>
            <h3 class="pk-card__title" style="font-size: 17px;">
              {s.title}
            </h3>
            <p class="pk-card__body" style="margin: 0;">
              {s.body}
            </p>
          </Card>
        ))
      }
    </div>
  </div>
</section>
```

### Step 7.4: Rewrite `About.astro`

- [ ] Replace `src/components/sections/About.astro` entirely with:

```astro
---
import Card from "../react/Card";
import Chips from "../ui/Chips.astro";
import Eyebrow from "../ui/Eyebrow.astro";

const stacks = [
  {
    heading: "Languages & Frameworks",
    items: [
      "TypeScript",
      "Go (Fiber)",
      "Bun",
      "Python",
      "Node.js",
      "GraphQL",
      "React",
      "Next.js",
      "Astro",
    ],
  },
  {
    heading: "Databases & Storage",
    items: [
      "PostgreSQL",
      "MongoDB",
      "ClickHouse",
      "Redis",
      "DynamoDB",
      "Prisma",
      "Drizzle",
      "AWS S3",
    ],
  },
  {
    heading: "Infrastructure & Security",
    items: ["Docker", "Kubernetes", "BullMQ", "AWS (SQS, SES)", "AES-256-GCM", "HMAC"],
  },
  {
    heading: "AI & Search",
    items: ["LangChain", "Google Gemini", "OpenAI", "pgvector", "MongoDB Atlas Vector", "RAG"],
  },
];

const previouslyAt = [
  {
    role: "Software Development Engineer",
    company: "Gunpowder Innovations",
    location: "London, UK · Remote",
    years: "Jan 2026 — Present",
  },
  {
    role: "Software Development Engineer",
    company: "The Internet Folks",
    location: "Bhopal, IN · Remote",
    years: "Jan 2023 — Dec 2025",
  },
  {
    role: "Software Development Intern",
    company: "AUM Capital Market",
    location: "Kolkata, IN",
    years: "Jun 2022 — Aug 2022",
  },
];
---

<section id="about" class="pk-section">
  <div class="pk-section__inner">
    <Eyebrow n="04" label="About" />
    <h2 class="pk-h2">Hi, I'm Joydip.</h2>

    <div
      style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: start;"
      class="pk-about-grid"
    >
      <div
        style="display: flex; flex-direction: column; gap: 20px; max-width: 640px; font-size: 17px; line-height: 1.6; color: var(--color-fg-muted);"
      >
        <p style="margin: 0;">
          I'm a senior engineer who takes on full-stack product builds for funded startups. My work
          sits at the boundary of backend systems and product — the parts that decide whether
          something actually ships and holds up in production.
        </p>
        <p style="margin: 0;">
          Over the last three-plus years I've built a fintech wealth platform serving 30k users, a
          multi-modal RAG system doing natural-language search over unstructured enterprise data,
          and a handful of polyglot microservice backends. I write TypeScript and Go for most
          things, Python when the ML work demands it.
        </p>
        <p style="margin: 0;">
          I work async, keep scope honest, and don't chase frameworks. If you're a funded startup
          with something real to build, the contact section is below.
        </p>

        <div style="margin-top: 24px;">
          <div
            style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: var(--color-fg-subtle); margin-bottom: 16px;"
          >
            Previously at
          </div>
          <ul
            style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;"
          >
            {
              previouslyAt.map((r) => (
                <li style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 16px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; font-size: 15px;">
                  <div>
                    <span style="color: var(--color-fg);">{r.role}</span>
                    <span style="color: var(--color-fg-muted);"> · {r.company}</span>
                    <span style="color: var(--color-fg-subtle); display: block; font-size: 12px; margin-top: 2px;">
                      {r.location}
                    </span>
                  </div>
                  <span style="color: var(--color-fg-subtle); font-family: var(--font-mono); font-size: 11px;">
                    {r.years}
                  </span>
                </li>
              ))
            }
          </ul>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        {
          stacks.map((stack) => (
            <Card client:visible>
              <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: var(--color-fg-subtle); margin-bottom: 12px;">
                {stack.heading}
              </div>
              <Chips items={stack.items} />
            </Card>
          ))
        }
      </div>
    </div>
  </div>
</section>

<style>
  @media (max-width: 767px) {
    .pk-about-grid {
      grid-template-columns: 1fr !important;
    }
  }
</style>
```

### Step 7.5: Verify build

- [ ] Run: `npm run build`

Expected: succeeds. Warnings about unused `card-surface`, `radial-glow` etc. from `/projects/*` pages still expected (they're in Task 9).

### Step 7.6: Visual smoke

- [ ] Run `npm run dev &`, wait 4s, open home page. Confirm:
  - Services: 2-col grid, 4 cards, each tilts on mouse hover.
  - Work: 2-col featured with images, 3-col smaller cards below, "View all 12 projects →" link on right.
  - Process: 3-col, no tilt, stats appear, each card has gradient index and duration label.
  - About: 2-col grid with bio + experience list + 4 stack cards stacked vertically; collapses to 1-col on mobile.

Kill dev server.

### Step 7.7: Commit

- [ ] Run:

```bash
git add src/components/sections/Services.astro src/components/sections/Work.astro src/components/sections/Process.astro src/components/sections/About.astro
git commit -m "$(cat <<'EOF'
feat(home): port Services, Work, Process, About to v2

Services: 2-col tilted Cards with pk-card__icon + pk-card__title + Chips.
Work: reads from getCollection("projects"), 2-col featured (image +
pk-proj__body), 3-col smaller cards, "View all N projects" footer link.
Process: 3-col non-tilt Cards with pk-step__head (gradient index + mono duration).
About: two-column layout preserving stack cards + experience list, collapses
to single column on mobile via inline media query. All content preserved
from v1 (stacks, previouslyAt, pitch copy).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Ship ⌘K command palette

**Files:**

- Create: `src/components/react/CommandPalette.tsx`
- Modify: `src/layouts/Layout.astro` (add items source + mount)

### Step 8.1: Create `CommandPalette.tsx`

- [ ] Create `src/components/react/CommandPalette.tsx`:

```tsx
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { CmdItem } from "./types";

type Props = { items: CmdItem[] };

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const EMAIL = "joydip.dutta9943@gmail.com";

function itemMatches(item: CmdItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.meta === "CASE STUDY" && item.tags) {
    return item.tags.some((t) => t.toLowerCase().includes(q));
  }
  return false;
}

export default function CommandPalette({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openerRef = useRef<Element | null>(null);

  const filtered = items.filter((it) => itemMatches(it, query));

  useEffect(() => {
    const onOpen = () => {
      openerRef.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener("pk:cmd-open", onOpen);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openerRef.current = document.activeElement;
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pk:cmd-open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (openerRef.current && "focus" in openerRef.current) {
        (openerRef.current as HTMLElement).focus();
      }
    }
  }, [open]);

  const close = () => setOpen(false);

  const run = (item: CmdItem) => {
    close();
    if (item.meta === "NAV") {
      const href = item.href;
      if (href.startsWith("#") || href.startsWith("/#")) {
        const id = href.replace(/^.*#/, "");
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = href;
        }
      } else {
        window.location.href = href;
      }
      return;
    }
    if (item.meta === "ACTION" && "action" in item && item.action === "copy-email") {
      navigator.clipboard?.writeText(EMAIL);
      return;
    }
    if ("href" in item && item.href) {
      if (item.meta === "EXT") {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.href;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    } else if (e.key === "Tab") {
      // Trap focus inside dialog — single focusable (input) so just cancel default movement
      e.preventDefault();
    }
  };

  return (
    <div className={`pk-cmd-overlay ${open ? "open" : ""}`} onClick={close} aria-hidden={!open}>
      <div
        className="pk-cmd"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          className="pk-cmd__input"
          placeholder="Search — actions, pages, case studies…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          aria-label="Search commands"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="pk-cmd__list" role="listbox">
          {filtered.length === 0 && (
            <div
              className="pk-cmd__item"
              style={{ color: "var(--color-fg-subtle)" }}
              aria-disabled="true"
            >
              No results
            </div>
          )}
          {filtered.map((it, i) => (
            <div
              key={it.id}
              className="pk-cmd__item"
              data-active={i === active}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(it)}
            >
              <div className="pk-cmd__icon">
                <ArrowIcon />
              </div>
              <span>{it.label}</span>
              <span className="pk-cmd__meta">{it.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 8.2: Wire items + mount in `Layout.astro`

- [ ] Modify `src/layouts/Layout.astro`. Replace the file entirely with:

```astro
---
import { ClientRouter } from "astro:transitions";
import { getCollection } from "astro:content";
import "../styles/global.css";
import Nav from "../components/ui/Nav.astro";
import Footer from "../components/ui/Footer.astro";
import CommandPalette from "../components/react/CommandPalette";
import type { CmdItem } from "../components/react/types";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = "Freelance product engineer building production backends, SaaS platforms, and AI systems for funded startups.",
  ogImage,
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);

const metaDescription =
  description.length > 155 ? description.slice(0, 152).trimEnd() + "…" : description;

const resolvedOgImage = ogImage
  ? new URL(ogImage.replace(/^\//, ""), Astro.site).href
  : `${Astro.site}og-image.png`;

const projects = await getCollection("projects");
const sortedProjects = projects.sort((a, b) => (a.data.order || 99) - (b.data.order || 99));

const cmdItems: CmdItem[] = [
  { id: "nav-work", label: "Jump to — Selected work", meta: "NAV", href: "/#work" },
  { id: "nav-services", label: "Jump to — Services", meta: "NAV", href: "/#services" },
  { id: "nav-about", label: "Jump to — About", meta: "NAV", href: "/#about" },
  { id: "nav-contact", label: "Jump to — Contact", meta: "NAV", href: "/#contact" },
  { id: "copy-email", label: "Copy email address", meta: "ACTION", action: "copy-email" },
  {
    id: "resume",
    label: "Download résumé (PDF)",
    meta: "ACTION",
    href: "/resume-joydip-dutta.pdf",
  },
  {
    id: "github",
    label: "Open GitHub profile",
    meta: "EXT",
    href: "https://github.com/joydipdutta9943",
  },
  {
    id: "linkedin",
    label: "Open LinkedIn profile",
    meta: "EXT",
    href: "https://www.linkedin.com/in/joydip-dutta-569428141/",
  },
  ...sortedProjects.map((p) => ({
    id: `case-${p.id}`,
    label: `Case study — ${p.data.title}`,
    meta: "CASE STUDY" as const,
    href: `/projects/${p.id}`,
    tags: p.data.techStack,
  })),
];
---

<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={metaDescription} />
    <meta name="author" content="Joydip Dutta" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#08080b" />
    <meta name="generator" content={Astro.generator} />

    <title>{title}</title>
    <link rel="canonical" href={canonicalURL.href} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL.href} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={metaDescription} />
    <meta property="og:image" content={resolvedOgImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Joydip Dutta" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={metaDescription} />
    <meta name="twitter:image" content={resolvedOgImage} />

    <script
      type="application/ld+json"
      set:html={JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Joydip Dutta",
        url: "https://sannin-coder.info",
        jobTitle: "Freelance Software Engineer",
        description:
          "Freelance product engineer building backends, SaaS platforms, and AI systems for funded startups.",
        email: "joydip.dutta9943@gmail.com",
        knowsAbout: [
          "TypeScript",
          "Go",
          "Node.js",
          "PostgreSQL",
          "MongoDB",
          "AWS",
          "LangChain",
          "RAG systems",
          "Microservices",
          "SaaS architecture",
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: "Freelance Product Engineer",
          occupationalCategory: "15-1252.00",
          skills: "Full-stack engineering, backend architecture, AI integration",
        },
        sameAs: [
          "https://github.com/joydipdutta9943",
          "https://www.linkedin.com/in/joydip-dutta-569428141/",
        ],
      })}
    />

    <ClientRouter />
  </head>
  <body class="pk-page">
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
    <CommandPalette client:idle items={cmdItems} />
  </body>
</html>
```

### Step 8.3: Verify build

- [ ] Run: `npm run build`

Expected: success. Palette island emits its own chunk.

### Step 8.4: Smoke test the palette

- [ ] `npm run dev &`, wait 4s, open home.
  - Press `⌘K` (or Ctrl+K) → palette opens, input focused.
  - Type "unified" → filters to the Unified Multi-Modal AI Agent case study.
  - Press ↓, ↓, Enter → navigates somewhere (or runs action).
  - Press Esc → closes.
  - Click "Search ⌘K" in nav → opens palette.
  - Click "Copy email address" entry → closes palette; paste in a text editor confirms the email was copied.
  - Click outside palette → closes.
  - Re-open, press Enter with "No results" → nothing happens, no error.

Kill dev.

### Step 8.5: Commit

- [ ] Run:

```bash
git add src/components/react/CommandPalette.tsx src/layouts/Layout.astro
git commit -m "$(cat <<'EOF'
feat(palette): ship ⌘K command palette with MDX case study search

CommandPalette.tsx: client:idle island, listens for pk:cmd-open CustomEvent
and ⌘K/Ctrl+K globally. role="dialog" aria-modal="true", focus input on
open, restore opener focus on close, arrow/Enter/Esc keyboard nav.
Substring match across label + techStack tags for case studies.

Layout.astro: builds cmdItems array from getCollection("projects") + static
entries (nav jumps, email copy, résumé, GitHub, LinkedIn). Mount palette
once below Footer.

Résumé link points to /resume-joydip-dutta.pdf — placeholder PDF added in
Task 12.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Reskin `/projects` and `[slug]` pages

**Files:**

- Modify: `src/pages/projects/index.astro`
- Modify: `src/pages/projects/[slug].astro`

### Step 9.1: Rewrite `/projects/index.astro`

- [ ] Replace `src/pages/projects/index.astro` entirely with:

```astro
---
import { getCollection } from "astro:content";
import Layout from "../../layouts/Layout.astro";
import Chips from "../../components/ui/Chips.astro";
import Eyebrow from "../../components/ui/Eyebrow.astro";

const projects = await getCollection("projects");
const sortedProjects = projects.sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
const featured = sortedProjects.filter((p) => p.data.image);
const rest = sortedProjects.filter((p) => !p.data.image);
---

<Layout
  title="Projects | Joydip Dutta — Freelance Product Engineer"
  description="Case studies and projects — fintech backends, AI agents, microservices, and full-stack applications."
>
  <section class="pk-section" style="padding-top: 140px;">
    <div class="pk-section__inner">
      <a
        href="/"
        class="pk-nav__link"
        style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 48px; font-size: 13px;"
      >
        <svg
          style="width: 14px; height: 14px;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        Home
      </a>

      <Eyebrow n="—" label="Case studies" />
      <h1 class="pk-h2" style="max-width: 100%;">All projects.</h1>
      <p
        style="max-width: 560px; color: var(--color-fg-muted); font-size: 17px; line-height: 1.6; margin: -48px 0 64px;"
      >
        Case studies from production systems — fintech, AI, microservices, and full-stack SaaS
        builds.
      </p>

      {
        featured.length > 0 && (
          <div style="margin-bottom: 64px;">
            <div style="margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
              <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: var(--color-fg-subtle);">
                Featured
              </span>
            </div>
            <div class="pk-grid-2">
              {featured.map((p) => (
                <a href={`/projects/${p.id}`} class="pk-proj" data-astro-prefetch>
                  <div class="pk-proj__img">
                    <img src={p.data.image} alt={p.data.title} />
                  </div>
                  <div class="pk-proj__body">
                    <h2 class="pk-proj__title">{p.data.title}</h2>
                    <p class="pk-proj__desc">{p.data.description}</p>
                    <Chips items={p.data.techStack} max={4} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      }

      {
        rest.length > 0 && (
          <div>
            <div style="margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
              <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: var(--color-fg-subtle);">
                More projects
              </span>
            </div>
            <div class="pk-grid-3">
              {rest.map((p) => (
                <a href={`/projects/${p.id}`} class="pk-proj" data-astro-prefetch>
                  <div class="pk-proj__body">
                    <h2 class="pk-proj__title" style="font-size: 16px;">
                      {p.data.title}
                    </h2>
                    <p class="pk-proj__desc">{p.data.description}</p>
                    <Chips items={p.data.techStack} max={3} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
      }
    </div>
  </section>
</Layout>
```

### Step 9.2: Rewrite `/projects/[slug].astro`

- [ ] Replace `src/pages/projects/[slug].astro` entirely with:

```astro
---
import { getCollection, render } from "astro:content";
import Layout from "../../layouts/Layout.astro";
import Chips from "../../components/ui/Chips.astro";

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<Layout
  title={`${project.data.title} | Joydip Dutta`}
  description={project.data.description}
  ogImage={project.data.image}
>
  <section class="pk-section" style="padding-top: 140px;">
    <div class="pk-section__inner" style="max-width: 1024px;">
      <a
        href="/projects"
        class="pk-nav__link"
        style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 48px; font-size: 13px;"
      >
        <svg
          style="width: 14px; height: 14px;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        All projects
      </a>

      <h1
        class="pk-h2"
        style="max-width: 100%; font-size: clamp(36px, 4vw + 12px, 64px); margin-bottom: 24px;"
      >
        {project.data.title}
      </h1>

      <p
        style="max-width: 680px; color: var(--color-fg-muted); font-size: 18px; line-height: 1.55; margin: 0 0 32px;"
      >
        {project.data.description}
      </p>

      <Chips items={project.data.techStack} />

      {
        project.data.image && (
          <div
            class="pk-proj__img"
            style="margin: 48px 0; border-radius: var(--radius-lg); border: 1px solid var(--color-border);"
          >
            <img src={project.data.image} alt={project.data.title} />
          </div>
        )
      }

      <div
        style="margin: 48px 0; height: 1px; background: linear-gradient(to right, transparent, var(--color-border), transparent);"
      >
      </div>

      <article class="prose-content" style="max-width: 72ch; margin: 0 auto;">
        <Content />
      </article>
    </div>
  </section>
</Layout>
```

### Step 9.3: Verify build

- [ ] Run: `npm run build`

Expected: all 12 case-study pages generate, plus the listing page. No v1 utility warnings now (all consumers removed).

### Step 9.4: Visual smoke

- [ ] `npm run dev &`, wait 4s:
  - `http://localhost:4321/projects` — listing with Featured grid + More projects grid.
  - Click through a featured project (e.g., `/projects/unified-ai-agent`) — header, description, chips, hero image (16:9 with gradient overlay), divider, MDX body renders in prose-content style.
  - Back link returns to `/projects`.
  - Nav stays v2 across all pages.

Kill dev.

### Step 9.5: Commit

- [ ] Run:

```bash
git add src/pages/projects/index.astro src/pages/projects/[slug].astro
git commit -m "$(cat <<'EOF'
feat(projects): reskin /projects listing and [slug] detail pages to v2

/projects: pk-section chrome, Eyebrow + pk-h2 header, Featured section
(pk-grid-2 of pk-proj cards with images) + More projects section (pk-grid-3
without images). Chips component (max=4/3, overflow chip).

/projects/[slug]: wider section with 1024px max-width for readability,
pk-h2-style title, description paragraph, Chips for full techStack, 16:9
hero image with pk-proj__img treatment, gradient-border divider, prose-content
article retuned to 72ch reading width.

All content preserved from v1. MDX prose rules updated in Task 2 (tokens).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Cleanup — delete unused components

**Files:**

- Delete: `src/components/ui/GradientButton.astro`
- Delete: `src/components/ui/Card.astro`

### Step 10.1: Confirm no remaining references

- [ ] Run:

```bash
grep -rn "GradientButton" src/ astro.config.mjs || true
grep -rn "from \"../ui/Card" src/components/sections/ || true
grep -rn "from \"../components/ui/Card" src/pages/ || true
```

Expected: no output (no references remain).

If grep returns anything, fix that call-site first — something slipped through in tasks 6–9. Re-run grep until clean.

### Step 10.2: Delete the files

- [ ] Run:

```bash
rm src/components/ui/GradientButton.astro
rm src/components/ui/Card.astro
```

### Step 10.3: Verify build

- [ ] Run: `npm run build`

Expected: success. No broken imports.

### Step 10.4: Commit

- [ ] Run:

```bash
git add -u src/components/ui/
git commit -m "$(cat <<'EOF'
chore: delete GradientButton.astro and old Card.astro

Both superseded by v2 React primitives (Button.tsx, Card.tsx). All call
sites migrated in tasks 6-9.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Accessibility polish pass

**Files:**

- Modify: `src/components/react/CommandPalette.tsx` (focus trap refinement)
- Modify: `src/components/react/Button.tsx` (focus-visible ring)
- Verify: reduced-motion CSS guard already in `tokens.css`

### Step 11.1: Harden palette focus trap

- [ ] Open `src/components/react/CommandPalette.tsx` and replace the `onKeyDown` handler to capture Tab properly (the previous version disabled Tab entirely; refine it to cycle within the palette, which only has the input as focusable — so Tab just stays on input):

Locate the `onKeyDown` function and replace only that function with:

```tsx
const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive((a) => Math.min(filtered.length - 1, a + 1));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive((a) => Math.max(0, a - 1));
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (filtered[active]) run(filtered[active]);
  } else if (e.key === "Tab") {
    // Only one focusable element (input). Keep focus on input.
    e.preventDefault();
    inputRef.current?.focus();
  }
};
```

The change: Tab now explicitly returns focus to the input instead of just cancelling the event.

### Step 11.2: Add focus-visible ring to pk-btn

- [ ] Append to `src/styles/kit.css` (at end of the Buttons section):

Find:

```css
.pk-btn__arrow {
  width: 15px;
  height: 15px;
  transition: transform 0.3s var(--ease);
}
.pk-btn:hover .pk-btn__arrow {
  transform: translateX(3px);
}
```

After that block, add:

```css
.pk-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.pk-cmdk:focus-visible,
.pk-nav__link:focus-visible,
.pk-nav__brand:focus-visible,
.pk-proj:focus-visible,
.pk-footer__links a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

.pk-cmd__input:focus-visible {
  outline: none;
  box-shadow: inset 0 -2px 0 var(--color-accent);
}
```

### Step 11.3: Palette — announce results count

- [ ] In `CommandPalette.tsx`, just inside the `.pk-cmd__list` div, immediately before the filtered.map, add an `aria-live` region for screen readers:

Locate:

```tsx
<div className="pk-cmd__list" role="listbox">
  {filtered.length === 0 && (
```

Replace with:

```tsx
<div className="pk-cmd__list" role="listbox">
  <span className="sr-only" aria-live="polite">
    {filtered.length === 0
      ? "No results"
      : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
  </span>
  {filtered.length === 0 && (
```

- [ ] Add `.sr-only` utility at the end of `src/styles/kit.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Step 11.4: Verify build + a11y smoke

- [ ] Run: `npm run build`

Expected: success.

- [ ] `npm run dev &`, test keyboard-only navigation:
  - Tab through page — every interactive element shows a visible focus ring (duotone accent outline).
  - ⌘K to open palette. Tab stays on input. Arrow keys move active row. Esc returns focus to the "Search ⌘K" button.
  - Open system "Reduce motion" preference (macOS: System Settings → Accessibility → Display → Reduce motion). Reload home page. Confirm: no count-up animation (stats show final values immediately), no reveal-word stagger (text appears instantly), no magnetic pull, no card tilt.

Kill dev.

### Step 11.5: Commit

- [ ] Run:

```bash
git add src/components/react/CommandPalette.tsx src/styles/kit.css
git commit -m "$(cat <<'EOF'
feat(a11y): palette focus trap, focus-visible rings, aria-live results

CommandPalette: Tab now explicitly returns focus to input (single focusable
element). Adds sr-only aria-live region announcing result count on query
change.

kit.css: visible focus rings on pk-btn, pk-cmdk, pk-nav__link, pk-nav__brand,
pk-proj, footer links, and pk-cmd__input. Adds .sr-only utility.

Reduced-motion: already guarded at three layers (global CSS kill-switch in
tokens.css, JS component guards via usePrefersReducedMotion, palette
transitions respect .01ms reduction).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Résumé placeholder, CLAUDE.md refresh, merge

**Files:**

- Create: `public/resume-joydip-dutta.pdf` (placeholder)
- Modify: `CLAUDE.md`

### Step 12.1: Generate a placeholder PDF

- [ ] The file must exist so the palette action works without a 404. Create a tiny valid PDF:

Run:

```bash
cat > public/resume-joydip-dutta.pdf <<'EOF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
72 720 Td
(Résumé - Joydip Dutta) Tj
0 -32 Td
/F1 14 Tf
(Placeholder. Full résumé coming soon.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000109 00000 n
0000000215 00000 n
0000000391 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
462
%%EOF
EOF
```

### Step 12.2: Verify PDF loads

- [ ] Run:

```bash
file public/resume-joydip-dutta.pdf
```

Expected: `public/resume-joydip-dutta.pdf: PDF document, version 1.4`

- [ ] Run `npm run dev &`, wait 4s, curl the PDF:

```bash
curl -sI http://localhost:4321/resume-joydip-dutta.pdf | head -3
```

Expected: `HTTP/1.1 200 OK`, `Content-Type: application/pdf`.

Kill dev.

### Step 12.3: Update `CLAUDE.md`

- [ ] Replace `CLAUDE.md` entirely with:

```markdown
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
```

### Step 12.4: Format all changes

- [ ] Run: `npm run format`

Expected: Prettier tidies the new Astro/React files.

### Step 12.5: Final build + smoke

- [ ] Run: `npm run build`

Expected: success, all pages generate.

- [ ] `npm run dev &`, 4s, open `/`, `/projects`, `/projects/unified-ai-agent`. Confirm all three render correctly.

- [ ] Test palette → "Download résumé (PDF)" entry. Page opens `resume-joydip-dutta.pdf` (placeholder).

Kill dev.

### Step 12.6: Commit

- [ ] Run:

```bash
git add public/resume-joydip-dutta.pdf CLAUDE.md
git add -A  # pick up any prettier formatting changes
git commit -m "$(cat <<'EOF'
chore: resume placeholder PDF, CLAUDE.md stack refresh, format

Ships public/resume-joydip-dutta.pdf as a minimal valid PDF so the palette
"Download résumé" action works. Replace with the real PDF when ready —
schema unchanged, just swap the file.

CLAUDE.md: updated architecture notes for v2 stack (tokens hybrid, kit.css,
React primitives inventory, command palette, __BUILD_TIME__, Geist fonts,
Berkeley Mono flag). Commands and formatting sections unchanged.

Runs prettier to tidy new files.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Step 12.7: Merge into master

- [ ] Confirm branch commits:

```bash
git log --oneline master..HEAD
```

Expected: 12 commits from Task 1 through Task 12.

- [ ] Merge:

```bash
git switch master
git merge --no-ff feat/v2-design -m "Merge feat/v2-design: v2 design system port"
```

Expected: merge succeeds (no conflicts since we branched from master and did all work here).

- [ ] Optional: delete the branch locally:

```bash
git branch -d feat/v2-design
```

### Step 12.8: Final production verify

- [ ] Run: `npm run build && npm run preview &`
- [ ] Wait 3s, curl `/`, `/projects`, `/projects/unified-ai-agent` and each should return 200 with the v2 markup.
- [ ] Kill the preview server.

---

## Self-Review Notes

1. **Spec coverage:**
   - Full scope (home + /projects + [slug]) — Tasks 5–9 ✓
   - React islands (Button/Card/RevealWords/CountUpStat/CommandPalette) — Task 4, Task 8 ✓
   - Geist fonts swap — Task 1 ✓
   - Command palette with MDX case studies + résumé — Task 8, Task 12 ✓
   - Text wordmark (no logo chip) — Task 5 ✓
   - Hybrid tokens (`@theme` + `:root`) — Task 2 ✓
   - Staged commits on `feat/v2-design` — Prereq + all tasks ✓
   - Build stamp `__BUILD_TIME__` — Task 5 ✓
   - Reduced-motion at three layers — Tasks 2, 4, 11 ✓
   - `/projects` + `[slug]` reskin — Task 9 ✓
   - Content preserved (About stacks, experience list, Services copy, Work "view all" link) — verified in Task 7 ✓

2. **No placeholders** — every step has code or exact commands. PDF generation uses an actual valid PDF byte sequence rather than a TODO.

3. **Type consistency** — `CmdItem` type is defined in Task 4.2, referenced consistently in Task 8.1 (CommandPalette) and Task 8.2 (Layout items array). `filtered` / `active` state names consistent across Task 8 and Task 11 refinement.

4. **Scope check** — single branch, single feature, 12 commits. Not over-scoped.

## Open items (deferred, owner: Joydip)

- Provide real résumé PDF — drop into `public/resume-joydip-dutta.pdf` to replace the placeholder.
- Berkeley/Commit Mono license — when acquired, add `.woff2` files to `public/fonts/`, add an `@font-face` in `tokens.css`, and swap `--font-mono` string.
