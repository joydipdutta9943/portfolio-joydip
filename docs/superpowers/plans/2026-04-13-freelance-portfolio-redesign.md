# Freelance Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the existing personal portfolio as a freelance product-engineering studio for funded startups, replacing the terminal aesthetic with a Linear/Vercel/Raycast-style dark glassy gradient visual system and restructuring the home page as a single-scroll services-first pitch.

**Architecture:** Astro v6 static site with Tailwind v4 (Vite plugin). No React islands added. New reusable section and UI components under `src/components/sections/` and `src/components/ui/`. Layout wrapper updated with new nav/footer and SEO metadata. Case study MDX files untouched; their render container gets a light restyle. `/experience` route removed — content folds into the new About section.

**Tech Stack:** Astro 6, Tailwind CSS v4, @fontsource (Inter, Inter Tight, JetBrains Mono), Astro `ClientRouter`, @astrojs/sitemap.

**Spec:** `docs/superpowers/specs/2026-04-13-freelance-portfolio-redesign-design.md`

**Testing:** No test framework exists in this repo. Each task's verification uses `npm run build` (must succeed with zero errors) and, where visual, `npm run dev` with a browser check on `http://localhost:4321`. Treat a clean build as the green bar.

---

## File Map

**New files:**
```
src/components/ui/Card.astro
src/components/ui/GradientButton.astro
src/components/ui/Nav.astro
src/components/ui/Footer.astro
src/components/sections/Hero.astro
src/components/sections/Services.astro
src/components/sections/Work.astro
src/components/sections/Process.astro
src/components/sections/About.astro
src/components/sections/Contact.astro
```

**Modified files:**
```
package.json                       — add @fontsource packages
src/styles/global.css              — new palette via @theme, new utilities, case-study prose restyle
tailwind.config.mjs                — keep in sync with @theme tokens
src/layouts/Layout.astro           — use new Nav/Footer, new SEO metadata, remove terminal motifs
src/pages/index.astro              — full rewrite composing new section components
src/pages/projects/[slug].astro    — (no structural change; inherits new prose styles)
```

**Deleted files:**
```
src/pages/experience.astro
```

---

## Task 1: Install font packages

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install @fontsource packages**

Run:
```bash
cd /home/joydip/portfolio-joydip && npm install @fontsource/inter @fontsource/inter-tight @fontsource/jetbrains-mono
```

Expected: three packages added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify build still passes**

Run:
```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @fontsource packages for Inter, Inter Tight, JetBrains Mono"
```

---

## Task 2: Add new design tokens to global.css

Replace the `@theme` block and `@layer base` color references so the rest of the plan has new colors, fonts, and gradient utilities to reach for. Keep `.prose-content` styles for now (those get updated in Task 17).

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace the top of `src/styles/global.css`**

Replace everything from the top of the file through the end of the `@utility bg-dot-pattern { ... }` block with:

```css
@import "tailwindcss";

@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource-variable/inter-tight";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";

@theme {
  --color-background: #0a0a0f;
  --color-surface: #0f0f14;
  --color-surface-raised: #15151d;
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-strong: rgba(255, 255, 255, 0.12);

  --color-foreground: #fafafa;
  --color-muted: #a1a1aa;
  --color-subtle: #52525b;

  --color-accent-from: #7c5cff;
  --color-accent-via: #3b82f6;
  --color-accent-to: #06b6d4;

  --font-display: "Inter Tight Variable", "Inter Tight", "Inter", sans-serif;
  --font-sans: "Inter", "Helvetica Neue", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}

@utility gradient-text {
  background: linear-gradient(
    90deg,
    var(--color-accent-from),
    var(--color-accent-via),
    var(--color-accent-to)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@utility gradient-fill {
  background: linear-gradient(
    90deg,
    var(--color-accent-from),
    var(--color-accent-via),
    var(--color-accent-to)
  );
}

@utility radial-glow {
  position: absolute;
  pointer-events: none;
  width: 900px;
  height: 900px;
  border-radius: 9999px;
  background: radial-gradient(
    circle at center,
    rgba(124, 92, 255, 0.18),
    rgba(59, 130, 246, 0.08) 40%,
    transparent 70%
  );
  filter: blur(120px);
  will-change: transform;
}

@utility card-surface {
  background: linear-gradient(180deg, #0f0f14 0%, #0c0c11 100%);
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
```

**Note:** `@fontsource-variable/inter-tight` is the variable-font package name used by modern @fontsource. If npm fails on that import, fall back to adding `@fontsource/inter-tight` in Task 1 and importing `@fontsource/inter-tight/600.css` here.

- [ ] **Step 2: Replace the `@layer base` body rule**

In the same file, find:

```css
  body {
    @apply bg-background text-muted selection:bg-accent selection:text-background min-h-screen font-sans antialiased;
  }
```

Replace with:

```css
  body {
    @apply bg-background text-muted selection:bg-accent-from selection:text-foreground min-h-screen font-sans antialiased;
    font-feature-settings: "cv11", "ss01", "ss03";
  }
```

Find:

```css
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply text-foreground font-sans font-bold tracking-tight;
  }
```

Replace with:

```css
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply text-foreground font-display font-semibold;
    letter-spacing: -0.03em;
  }
```

Find:

```css
  a {
    @apply focus-visible:ring-accent focus-visible:ring-offset-background transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
  }
```

Replace with:

```css
  a {
    @apply focus-visible:ring-accent-from focus-visible:ring-offset-background transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
  }
```

- [ ] **Step 3: Run build — this will fail because Layout.astro still references `bg-dot-pattern`**

Run:
```bash
npm run build
```

Expected: build fails. That is expected at this step — Layout.astro (updated in Task 9) still uses the old `bg-dot-pattern` utility that was just removed, and `index.astro` may reference the removed `accent` color token. Proceed to Step 4 to stage the intermediate fix.

- [ ] **Step 4: Add a temporary legacy `accent` alias so the old pages still build**

Add this inside the `@theme { ... }` block in `src/styles/global.css` (after `--color-accent-to`):

```css
  /* LEGACY — remove after Task 16 when index.astro is rewritten */
  --color-accent: #7c5cff;
```

Also add `bg-dot-pattern` back as a passthrough so Layout.astro still builds (it will be removed in Task 9):

```css
@utility bg-dot-pattern {
  background-image: none;
}
```

- [ ] **Step 5: Build again — must pass now**

Run:
```bash
npm run build
```

Expected: clean build. Pages look wrong (transitional state), but the site compiles.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): add new design tokens and gradient utilities"
```

---

## Task 3: Update `tailwind.config.mjs` to match new tokens

Tailwind v4 reads tokens from `@theme` in CSS, but this repo still has a `tailwind.config.mjs`. Keep it in sync so nothing references stale values.

**Files:**
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Replace the entire contents of `tailwind.config.mjs` with:**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#0f0f14",
        "surface-raised": "#15151d",
        foreground: "#fafafa",
        muted: "#a1a1aa",
        subtle: "#52525b",
        "accent-from": "#7c5cff",
        "accent-via": "#3b82f6",
        "accent-to": "#06b6d4",
      },
      fontFamily: {
        display: ['"Inter Tight Variable"', '"Inter Tight"', "Inter", "sans-serif"],
        sans: ["Inter", '"Helvetica Neue"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Build to verify**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.mjs
git commit -m "chore(tailwind): sync config with new design tokens"
```

---

## Task 4: Create `Card` UI primitive

A shared surface component used by services, work, process, about, and contact sections. Hairline border, inner top highlight, subtle hover lift.

**Files:**
- Create: `src/components/ui/Card.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
interface Props {
  class?: string;
  as?: "div" | "a" | "article";
  href?: string;
  interactive?: boolean;
}

const { class: className = "", as = "div", href, interactive = false } = Astro.props;
const Tag = as;
---

<Tag
  href={href}
  class:list={[
    "card-surface relative overflow-hidden rounded-xl p-6 transition-all duration-300",
    interactive &&
      "hover:border-border-strong hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_40px_-20px_rgba(124,92,255,0.25)]",
    className,
  ]}
>
  {interactive && (
    <div
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style="background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 92, 255, 0.06), transparent 40%);"
    />
  )}
  <div class="relative z-10">
    <slot />
  </div>
</Tag>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build. (Component not imported anywhere yet — Astro still validates syntax.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Card.astro
git commit -m "feat(ui): add Card surface primitive"
```

---

## Task 5: Create `GradientButton` UI primitive

Primary CTA with the signature gradient fill and subtle glow. Also supports a `variant="ghost"` for the secondary button style.

**Files:**
- Create: `src/components/ui/GradientButton.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
interface Props {
  href: string;
  variant?: "primary" | "ghost";
  external?: boolean;
  class?: string;
}

const { href, variant = "primary", external = false, class: className = "" } = Astro.props;
---

<a
  href={href}
  target={external ? "_blank" : undefined}
  rel={external ? "noopener noreferrer" : undefined}
  class:list={[
    "group relative inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium text-sm transition-all duration-300",
    variant === "primary" && [
      "gradient-fill text-white",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(124,92,255,0.6)]",
      "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_15px_40px_-10px_rgba(124,92,255,0.8)]",
      "hover:brightness-110",
    ],
    variant === "ghost" && [
      "border border-border text-foreground",
      "hover:border-border-strong hover:bg-white/[0.02]",
    ],
    className,
  ]}
>
  <slot />
  <svg
    class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
</a>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/GradientButton.astro
git commit -m "feat(ui): add GradientButton primitive with primary and ghost variants"
```

---

## Task 6: Create `Nav` component

Sticky top navigation with anchor links. Transparent at page top, compacts with frosted-glass background on scroll.

**Files:**
- Create: `src/components/ui/Nav.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
import GradientButton from "./GradientButton.astro";
---

<nav
  id="site-nav"
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
>
  <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
    <a
      href="/"
      class="font-display text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
    >
      Joydip Dutta
    </a>

    <div class="hidden items-center gap-8 md:flex">
      <a href="/#work" class="text-sm text-muted transition-colors hover:text-foreground">Work</a>
      <a href="/#services" class="text-sm text-muted transition-colors hover:text-foreground">Services</a>
      <a href="/#about" class="text-sm text-muted transition-colors hover:text-foreground">About</a>
      <a href="/#contact" class="text-sm text-muted transition-colors hover:text-foreground">Contact</a>
    </div>

    <GradientButton
      href="mailto:joydip.dutta9943@gmail.com?subject=New%20project%20—%20%5Byour%20company%5D"
      class="!px-4 !py-2 !text-xs"
    >
      Start a project
    </GradientButton>
  </div>
</nav>

<script is:inline>
  (function () {
    const nav = document.getElementById("site-nav");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 24) {
        nav.classList.add("nav-scrolled");
      } else {
        nav.classList.remove("nav-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("astro:page-load", onScroll);
  })();
</script>

<style>
  #site-nav.nav-scrolled {
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    background: rgba(10, 10, 15, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
</style>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Nav.astro
git commit -m "feat(ui): add Nav with sticky frosted-on-scroll behavior"
```

---

## Task 7: Create `Footer` component

Stripped-down footer. Three columns: copyright, nav anchors, social links. No "System.Status: ONLINE" indicator.

**Files:**
- Create: `src/components/ui/Footer.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
const year = new Date().getFullYear();
---

<footer class="mt-32 border-t border-border">
  <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
    <div class="text-xs text-subtle">
      © {year} Joydip Dutta. All rights reserved.
    </div>

    <nav class="flex gap-6 text-xs text-muted">
      <a href="/#work" class="transition-colors hover:text-foreground">Work</a>
      <a href="/#services" class="transition-colors hover:text-foreground">Services</a>
      <a href="/#about" class="transition-colors hover:text-foreground">About</a>
      <a href="/#contact" class="transition-colors hover:text-foreground">Contact</a>
    </nav>

    <div class="flex gap-5 text-xs text-muted">
      <a
        href="https://github.com/joydipdutta9943"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors hover:text-foreground"
      >
        GitHub
      </a>
      <a
        href="https://www.linkedin.com/in/joydip-dutta-569428141/"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors hover:text-foreground"
      >
        LinkedIn
      </a>
      <a
        href="mailto:joydip.dutta9943@gmail.com"
        class="transition-colors hover:text-foreground"
      >
        Email
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Footer.astro
git commit -m "feat(ui): add minimal Footer component"
```

---

## Task 8: Update `Layout.astro` to use new Nav/Footer

This swaps the current terminal-themed header/footer for the new components, updates SEO metadata to "Freelance Product Engineer" framing, and removes the `bg-dot-pattern` background. After this task, all pages (home, experience, projects) share the new chrome — existing section content still looks terminal-y but will be rewritten downstream.

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Replace the entire contents of `src/layouts/Layout.astro` with:**

```astro
---
import { ClientRouter } from "astro:transitions";
import "../styles/global.css";
import Nav from "../components/ui/Nav.astro";
import Footer from "../components/ui/Footer.astro";

interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = "Freelance product engineer building production backends, SaaS platforms, and AI systems for funded startups.",
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const siteTitle = "Joydip Dutta — Freelance Product Engineer";
const ogTitle = title === siteTitle ? title : `${title} | Joydip Dutta`;
---

<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>

    <link rel="canonical" href={canonicalURL.href} />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL.href} />
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content="https://sannin-coder.info/og-image.png" />
    <meta property="og:site_name" content="Joydip Dutta" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={ogTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content="https://sannin-coder.info/og-image.png" />

    <meta name="author" content="Joydip Dutta" />
    <meta name="robots" content="index, follow" />

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
        sameAs: [
          "https://github.com/joydipdutta9943",
          "https://www.linkedin.com/in/joydip-dutta-569428141/",
        ],
      })}
    />

    <ClientRouter />
  </head>
  <body class="bg-background antialiased">
    <Nav />
    <main class="pt-24">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build. `index.astro` will look half-broken (new chrome wrapped around old terminal content) but it compiles.

- [ ] **Step 3: Spot-check in browser**

Run:
```bash
npm run dev
```

Open `http://localhost:4321`. Verify:
- New sticky nav at top with "Joydip Dutta", anchor links, "Start a project" gradient button.
- New footer at bottom with three columns.
- No `bg-dot-pattern` background.
- Old hero content from `index.astro` still visible in the middle.

Stop dev server (Ctrl-C).

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat(layout): swap terminal header/footer for new Nav/Footer and freelance SEO"
```

---

## Task 9: Create `Hero` section component

**Files:**
- Create: `src/components/sections/Hero.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
import GradientButton from "../ui/GradientButton.astro";

const stats = [
  { value: "3+", label: "yrs shipping" },
  { value: "30k+", label: "users served" },
  { value: "99.9%", label: "uptime SLA" },
  { value: "12+", label: "projects shipped" },
];
---

<section class="relative flex min-h-[85vh] items-center overflow-hidden px-6">
  <div class="radial-glow absolute -top-40 left-1/2 -translate-x-1/2"></div>

  <div class="relative mx-auto w-full max-w-5xl">
    <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-xs text-muted backdrop-blur-sm">
      <span class="relative flex h-1.5 w-1.5">
        <span class="gradient-fill absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
        <span class="gradient-fill relative inline-flex h-1.5 w-1.5 rounded-full"></span>
      </span>
      Available for new projects · Q2 2026
    </div>

    <h1
      class="font-display text-foreground mb-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl lg:text-7xl"
    >
      Senior engineer building
      <span class="gradient-text">production systems</span>
      for funded startups.
    </h1>

    <p class="mb-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
      I ship backends, SaaS platforms, and AI features that hold up in production.
      Previously built a fintech wealth platform serving 30k users and a RAG system
      on unstructured data for enterprise search.
    </p>

    <div class="mb-16 flex flex-wrap items-center gap-3">
      <GradientButton
        href="mailto:joydip.dutta9943@gmail.com?subject=New%20project%20—%20%5Byour%20company%5D"
      >
        Start a project
      </GradientButton>
      <GradientButton href="#work" variant="ghost">
        See case studies
      </GradientButton>
    </div>

    <div class="grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
      {stats.map((stat) => (
        <div class="bg-background px-5 py-5">
          <div class="font-mono text-2xl font-medium text-foreground md:text-3xl">
            {stat.value}
          </div>
          <div class="mt-1 text-[11px] uppercase tracking-wider text-subtle">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.astro
git commit -m "feat(sections): add Hero with pill badge, gradient headline, stat strip"
```

---

## Task 10: Create `Services` section component

**Files:**
- Create: `src/components/sections/Services.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
import Card from "../ui/Card.astro";

const services = [
  {
    title: "Product Engineering",
    pitch:
      "Full SaaS builds from zero. Backend, API, database, auth, payments, integrations — the whole backend and as much frontend as you need. 4–12 week engagements.",
    tags: ["TypeScript / Go", "Postgres / Mongo", "AWS"],
    iconPath:
      "M12 2 4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6l-8-4z M9 12l2 2 4-4",
  },
  {
    title: "Backend Architecture",
    pitch:
      "Microservices, event systems, scale-ready foundations. Reviews of what you have, or greenfield designs for what you're about to build.",
    tags: ["Fiber", "BullMQ", "ClickHouse"],
    iconPath:
      "M4 6h16 M4 12h16 M4 18h16 M8 6v12 M16 6v12",
  },
  {
    title: "AI & RAG Systems",
    pitch:
      "LLM features that work on real data, not demos. Vector search, agentic workflows, retrieval pipelines wired into your existing product.",
    tags: ["LangChain", "Gemini / OpenAI", "pgvector / Atlas"],
    iconPath:
      "M12 2v4 M12 18v4 M2 12h4 M18 12h4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83 M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  },
  {
    title: "Technical Advisory",
    pitch:
      "Code review, architecture review, hire-a-senior-for-a-week. Async over calls, paid by the day, fixed scope.",
    tags: ["async", "paid", "fixed scope"],
    iconPath:
      "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
];
---

<section id="services" class="scroll-mt-24 px-6 py-32">
  <div class="mx-auto max-w-5xl">
    <div class="mb-16">
      <div class="mb-3 font-mono text-xs uppercase tracking-widest">
        <span class="gradient-text">01</span>
        <span class="ml-2 text-subtle">— What I build</span>
      </div>
      <h2 class="font-display max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
        Work I take on for <span class="gradient-text">funded teams</span>.
      </h2>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      {services.map((service) => (
        <Card interactive class="group">
          <div class="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white/[0.02]">
            <svg
              class="h-5 w-5 text-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d={service.iconPath}></path>
            </svg>
          </div>
          <h3 class="mb-3 text-xl font-semibold text-foreground">{service.title}</h3>
          <p class="mb-5 text-sm leading-relaxed text-muted">{service.pitch}</p>
          <div class="flex flex-wrap gap-1.5">
            {service.tags.map((tag) => (
              <span class="rounded-md border border-border bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-muted">
                {tag}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Services.astro
git commit -m "feat(sections): add Services with 2x2 card grid"
```

---

## Task 11: Create `Work` section component (bento grid)

Two featured cards at top (col-span-2 on md), three smaller cards below. Pulls the project routes that already exist at `/projects/<slug>`.

**Files:**
- Create: `src/components/sections/Work.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
const featured = [
  {
    slug: "unified-ai-agent",
    title: "Unified Multi-Modal AI Agent",
    outcome: "Shipped a production RAG system for complex natural-language queries over unstructured enterprise data.",
    image: "/images/unified-ai-agent.png",
    tags: ["LangChain", "Gemini", "Vector search"],
  },
  {
    slug: "gunpowder-fintech-backend",
    title: "Gunpowder Fintech Backend",
    outcome: "Built a wealth management platform serving 30k users with investment accounts, KYC, and direct debits.",
    image: "/images/gunpowder-fintech-backend.png",
    tags: ["TypeScript", "Prisma", "BullMQ"],
  },
];

const smaller = [
  {
    slug: "dyrect-backend",
    title: "Dyrect",
    outcome: "Direct-to-customer platform backend with automated workflows.",
    tags: ["Node.js", "MongoDB"],
  },
  {
    slug: "levo-microservices",
    title: "Levo",
    outcome: "Polyglot microservices architecture for a production SaaS.",
    tags: ["Go", "Fiber", "Postgres"],
  },
  {
    slug: "crooze-gamified-fitness",
    title: "Crooze",
    outcome: "Gamified fitness backend with real-time events and leaderboards.",
    tags: ["Node.js", "Redis"],
  },
];
---

<section id="work" class="scroll-mt-24 px-6 py-32">
  <div class="mx-auto max-w-6xl">
    <div class="mb-16">
      <div class="mb-3 font-mono text-xs uppercase tracking-widest">
        <span class="gradient-text">02</span>
        <span class="ml-2 text-subtle">— Selected work</span>
      </div>
      <h2 class="font-display max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
        Production systems, not demos.
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      {featured.map((p) => (
        <a
          href={`/projects/${p.slug}`}
          class="card-surface group relative block overflow-hidden rounded-xl transition-all duration-300 hover:border-border-strong"
        >
          <div class="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-surface-raised">
            <img
              src={p.image}
              alt={p.title}
              class="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
          </div>
          <div class="p-6">
            <h3 class="mb-2 text-lg font-semibold text-foreground">{p.title}</h3>
            <p class="mb-5 text-sm leading-relaxed text-muted">{p.outcome}</p>
            <div class="flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <span class="rounded-md border border-border bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      {smaller.map((p) => (
        <a
          href={`/projects/${p.slug}`}
          class="card-surface group block rounded-xl p-6 transition-all duration-300 hover:border-border-strong"
        >
          <h3 class="mb-2 text-base font-semibold text-foreground">{p.title}</h3>
          <p class="mb-4 text-sm leading-relaxed text-muted">{p.outcome}</p>
          <div class="flex flex-wrap gap-1.5">
            {p.tags.map((tag) => (
              <span class="rounded-md border border-border bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-muted">
                {tag}
              </span>
            ))}
          </div>
        </a>
      ))}
    </div>

    <div class="mt-10 flex justify-end">
      <a
        href="/projects"
        class="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        View all 12 projects
        <svg
          class="h-4 w-4 transition-transform group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify the referenced project slugs exist**

Run:
```bash
ls src/content/projects/
```

Expected output includes: `unified-ai-agent.mdx`, `gunpowder-fintech-backend.mdx`, `dyrect-backend.mdx`, `levo-microservices.mdx`, `crooze-gamified-fitness.mdx`.

If any file is missing, open `src/content/projects/` and substitute one of the other existing slugs into the `smaller` array (keep the array length at 3).

- [ ] **Step 3: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Work.astro
git commit -m "feat(sections): add Work bento grid with 2 featured + 3 smaller cards"
```

---

## Task 12: Create `Process` section component

**Files:**
- Create: `src/components/sections/Process.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
import Card from "../ui/Card.astro";

const steps = [
  {
    index: "01",
    duration: "1 week",
    title: "Discovery",
    body: "We pin down the product, the constraints, and the bar. I scope the build, flag the risky parts, and tell you what's hard. If it's not a fit, I'll say so.",
  },
  {
    index: "02",
    duration: "1–2 weeks",
    title: "Architecture",
    body: "Data model, API contract, infra plan. You review and approve before a line of production code is written. Surprises get expensive later.",
  },
  {
    index: "03",
    duration: "4–12 weeks",
    title: "Build & ship",
    body: "Weekly demos, continuous deploys, your team owns the code from day one. I work in your repo, your branch conventions, your review process.",
  },
];
---

<section id="process" class="scroll-mt-24 px-6 py-32">
  <div class="mx-auto max-w-5xl">
    <div class="mb-16">
      <div class="mb-3 font-mono text-xs uppercase tracking-widest">
        <span class="gradient-text">03</span>
        <span class="ml-2 text-subtle">— How I work</span>
      </div>
      <h2 class="font-display max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
        Predictable process. No surprises.
      </h2>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      {steps.map((step) => (
        <Card>
          <div class="mb-4 flex items-baseline justify-between">
            <span class="gradient-text font-mono text-2xl font-semibold">{step.index}</span>
            <span class="font-mono text-[11px] uppercase tracking-widest text-subtle">
              {step.duration}
            </span>
          </div>
          <h3 class="mb-3 text-lg font-semibold text-foreground">{step.title}</h3>
          <p class="text-sm leading-relaxed text-muted">{step.body}</p>
        </Card>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Process.astro
git commit -m "feat(sections): add Process 3-step card strip"
```

---

## Task 13: Create `About` section component

Two-column layout: bio + stack panel. Folds the old `/experience` content (3 roles at Gunpowder Innovations, The Internet Folks, AUM Capital) into this section.

**Files:**
- Create: `src/components/sections/About.astro`

- [ ] **Step 1: Create `src/components/sections/About.astro` with this exact content**

```astro
---
import Card from "../ui/Card.astro";

const stacks = [
  {
    heading: "Languages & Frameworks",
    items: ["TypeScript", "Go (Fiber)", "Bun", "Python", "Node.js", "GraphQL", "React", "Next.js", "Astro"],
  },
  {
    heading: "Databases & Storage",
    items: ["PostgreSQL", "MongoDB", "ClickHouse", "Redis", "DynamoDB", "Prisma", "Drizzle", "AWS S3"],
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

<section id="about" class="scroll-mt-24 px-6 py-32">
  <div class="mx-auto max-w-5xl">
    <div class="mb-16">
      <div class="mb-3 font-mono text-xs uppercase tracking-widest">
        <span class="gradient-text">04</span>
        <span class="ml-2 text-subtle">— About</span>
      </div>
      <h2 class="font-display max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-5xl">
        Hi, I'm Joydip.
      </h2>
    </div>

    <div class="grid gap-12 md:grid-cols-[1.2fr_1fr]">
      <div class="space-y-5 text-base leading-relaxed text-muted">
        <p>
          I'm a senior engineer who takes on full-stack product builds for funded startups.
          My work sits at the boundary of backend systems and product — the parts that decide
          whether something actually ships and holds up in production.
        </p>
        <p>
          Over the last three-plus years I've built a fintech wealth platform serving 30k users,
          a multi-modal RAG system doing natural-language search over unstructured enterprise
          data, and a handful of polyglot microservice backends. I write TypeScript and Go for
          most things, Python when the ML work demands it.
        </p>
        <p>
          I work async, keep scope honest, and don't chase frameworks. If you're a funded startup
          with something real to build, the contact form is below.
        </p>

        <div class="!mt-10">
          <div class="mb-4 font-mono text-[11px] uppercase tracking-widest text-subtle">
            Previously at
          </div>
          <ul class="space-y-3">
            {previouslyAt.map((r) => (
              <li class="flex flex-col gap-1 border-b border-border pb-3 md:flex-row md:items-baseline md:justify-between md:gap-4">
                <div>
                  <span class="text-foreground">{r.role}</span>
                  <span class="text-muted"> · {r.company}</span>
                  <span class="block text-xs text-subtle md:inline md:ml-2">{r.location}</span>
                </div>
                <span class="font-mono text-[11px] text-subtle">{r.years}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div class="space-y-4">
        {stacks.map((stack) => (
          <Card class="!p-5">
            <div class="mb-3 font-mono text-[11px] uppercase tracking-widest text-subtle">
              {stack.heading}
            </div>
            <div class="flex flex-wrap gap-1.5">
              {stack.items.map((item) => (
                <span class="rounded-md border border-border bg-white/[0.02] px-2 py-1 font-mono text-[11px] text-muted">
                  {item}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/About.astro
git commit -m "feat(sections): add About with bio, previously-at, stack panel"
```

---

## Task 14: Create `Contact` section component

**Files:**
- Create: `src/components/sections/Contact.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
import GradientButton from "../ui/GradientButton.astro";
---

<section id="contact" class="scroll-mt-24 relative overflow-hidden px-6 py-32">
  <div class="radial-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

  <div class="relative mx-auto max-w-3xl text-center">
    <div class="mb-3 font-mono text-xs uppercase tracking-widest">
      <span class="gradient-text">05</span>
      <span class="ml-2 text-subtle">— Start a project</span>
    </div>

    <h2 class="font-display mb-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
      Have something <span class="gradient-text">hard to build?</span>
    </h2>

    <p class="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted md:text-lg">
      I take a small number of engagements at a time. Best fit: funded startup, real
      product in production or about to be, four-plus weeks of work. Send me what
      you're building and I'll reply within 24 hours.
    </p>

    <div class="mb-8 flex justify-center">
      <GradientButton
        href="mailto:joydip.dutta9943@gmail.com?subject=New%20project%20—%20%5Byour%20company%5D"
      >
        joydip.dutta9943@gmail.com
      </GradientButton>
    </div>

    <div class="flex items-center justify-center gap-6 text-xs text-muted">
      <a
        href="https://github.com/joydipdutta9943"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors hover:text-foreground"
      >
        GitHub
      </a>
      <span class="text-subtle">·</span>
      <a
        href="https://www.linkedin.com/in/joydip-dutta-569428141/"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors hover:text-foreground"
      >
        LinkedIn
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Contact.astro
git commit -m "feat(sections): add Contact with radial glow and primary CTA"
```

---

## Task 15: Rewrite `index.astro` to compose the new sections

This is the visual flip — the home page becomes a single-scroll composition of the new section components. After this task, the home page looks completely new.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the entire contents of `src/pages/index.astro` with:**

```astro
---
import Layout from "../layouts/Layout.astro";
import Hero from "../components/sections/Hero.astro";
import Services from "../components/sections/Services.astro";
import Work from "../components/sections/Work.astro";
import Process from "../components/sections/Process.astro";
import About from "../components/sections/About.astro";
import Contact from "../components/sections/Contact.astro";
---

<Layout
  title="Joydip Dutta — Freelance Product Engineer"
  description="Freelance product engineer building production backends, SaaS platforms, and AI systems for funded startups."
>
  <Hero />
  <Services />
  <Work />
  <Process />
  <About />
  <Contact />
</Layout>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Browser check**

Run:
```bash
npm run dev
```

Open `http://localhost:4321`. Verify:
- Hero has the pill badge, gradient headline, stat strip, and radial glow behind it.
- Nav sits on top of hero, becomes frosted when you scroll past ~24px.
- Services grid shows 4 cards in 2×2.
- Work grid shows 2 featured + 3 smaller, all linking to `/projects/<slug>`.
- Process shows 3 steps.
- About shows two columns: bio + stack panel.
- Contact has its own radial glow and the CTA button.
- Footer is minimal, 3 columns.
- No leftover terminal motifs (`>`, `[01] //`, `Execute`, `jd.init()_`, `System.Status`).
- No green `#4ade80` anywhere.

Stop dev server (Ctrl-C).

- [ ] **Step 4: Remove the legacy `--color-accent` token from Task 2**

Open `src/styles/global.css` and delete the two legacy lines added in Task 2 Step 4:

```css
  /* LEGACY — remove after Task 16 when index.astro is rewritten */
  --color-accent: #7c5cff;
```

And the passthrough:

```css
@utility bg-dot-pattern {
  background-image: none;
}
```

- [ ] **Step 5: Rebuild**

Run:
```bash
npm run build
```

Expected: clean build. If this fails with an error about `bg-accent` or `bg-dot-pattern`, grep for the remaining reference:

```bash
grep -rn "bg-dot-pattern\|text-accent[^-]\|bg-accent[^-]\|border-accent[^-]" src/
```

Remove or update each match to use the new tokens (`accent-from`, `accent-via`, `accent-to`) or delete the reference.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat(home): rewrite index as single-page freelance studio composition"
```

---

## Task 16: Restyle `.prose-content` for case-study pages

The case-study MDX files use `.prose-content` from `global.css`. The current rules reference the old green accent and terminal styling. Update them to match the new visual system.

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Find the existing `.prose-content` block**

In `src/styles/global.css`, locate the block starting with:

```css
  .prose-content {
    @apply max-w-[70ch] leading-8 text-zinc-400;
  }
```

and ending at the `.prose-content tbody tr { ... }` rule.

- [ ] **Step 2: Replace that entire block with:**

```css
  .prose-content {
    @apply max-w-[72ch] text-base leading-relaxed text-muted;
  }

  .prose-content h2 {
    @apply font-display text-foreground mt-16 mb-6 text-3xl font-semibold tracking-[-0.03em] md:text-4xl;
  }

  .prose-content h3 {
    @apply font-display text-foreground mt-10 mb-4 text-xl font-semibold tracking-[-0.02em] md:text-2xl;
  }

  .prose-content p {
    @apply mb-6;
  }

  .prose-content strong {
    @apply text-foreground font-semibold;
  }

  .prose-content ul {
    @apply mb-8 ml-6 list-outside list-disc space-y-3;
  }

  .prose-content li::marker {
    color: var(--color-accent-via);
  }

  .prose-content li strong {
    @apply text-foreground;
  }

  .prose-content pre {
    @apply my-8 overflow-x-auto rounded-xl border border-border p-5 font-mono text-xs md:text-sm;
    background: #0c0c11;
  }

  .prose-content code {
    @apply rounded-md border border-border bg-white/[0.02] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground;
  }

  .prose-content pre code {
    @apply border-0 bg-transparent px-0 text-inherit;
  }

  .prose-content blockquote {
    @apply my-8 rounded-r-lg border-l-2 p-5 pl-6 text-base leading-relaxed text-muted not-italic;
    border-left-color: var(--color-accent-via);
    background: rgba(124, 92, 255, 0.04);
  }

  .prose-content blockquote p {
    @apply mb-0;
  }

  .prose-content table {
    @apply my-8 w-full border-collapse overflow-hidden rounded-lg text-sm;
  }

  .prose-content thead {
    @apply border-b border-border;
    background: #0f0f14;
  }

  .prose-content th {
    @apply px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-subtle;
  }

  .prose-content td {
    @apply border-b border-border px-4 py-3 text-muted;
  }

  .prose-content tbody tr {
    @apply transition-colors;
  }

  .prose-content tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
```

- [ ] **Step 3: Build**

Run:
```bash
npm run build
```

Expected: clean build.

- [ ] **Step 4: Spot-check a case study page in the browser**

Run:
```bash
npm run dev
```

Open `http://localhost:4321/projects/gunpowder-fintech-backend` (or any other project slug). Verify:
- Heading uses Inter Tight.
- No green accent bars on `h2`.
- Code blocks render with the new border and dark surface.
- Blockquotes use the violet/blue tint, not green.

Stop dev server (Ctrl-C).

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "style(prose): restyle case-study content to new visual system"
```

---

## Task 17: Remove the `/experience` route

The About section now contains the previously-at list that used to live here. Delete the standalone page.

**Files:**
- Delete: `src/pages/experience.astro`

- [ ] **Step 1: Delete the file**

Run:
```bash
rm src/pages/experience.astro
```

- [ ] **Step 2: Grep for any remaining references**

Run:
```bash
grep -rn "/experience" src/ public/ 2>/dev/null
```

Expected: no results, or only matches inside `dist/` (which is regenerated). If any `.astro` or `.mdx` file still links to `/experience`, update the link to `/#about`.

- [ ] **Step 3: Build — sitemap regenerates**

Run:
```bash
npm run build
```

Expected: clean build. The generated `dist/sitemap-0.xml` no longer contains `/experience`.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore: remove /experience route (folded into About section)"
```

---

## Task 18: Final verification and cleanup

Last sweep for anything left behind from the terminal aesthetic.

- [ ] **Step 1: Grep for terminal motifs**

Run:
```bash
grep -rn "bg-dot-pattern\|System\.Status\|jd\.init\|Execute /projects\|Featured_Operations\|Technical_Arsenal\|Open to Work\|4ade80\|terminal-green" src/
```

Expected: no matches. Any match surfaces leftover old content. Remove or rewrite each.

- [ ] **Step 2: Grep for stale class references to removed tokens**

Run:
```bash
grep -rn "text-accent[^-]\|bg-accent[^-]\|border-accent[^-]\|hover:text-accent[^-]\|hover:border-accent[^-]" src/
```

Expected: no matches. If any remain, replace with `accent-from`, `accent-via`, or `accent-to` as appropriate, or remove the class.

- [ ] **Step 3: Full production build**

Run:
```bash
npm run build
```

Expected: clean build, zero errors, zero warnings.

- [ ] **Step 4: Preview the production build**

Run:
```bash
npm run preview
```

Open `http://localhost:4321` and walk the site:
- Home: hero, services, work, process, about, contact all render correctly with no layout breakage at desktop and mobile widths (resize the window).
- Nav: transparent at top, frosted on scroll, anchor links jump to the right sections, "Start a project" opens mail client.
- `/projects`: renders with new chrome.
- `/projects/gunpowder-fintech-backend` (and one other): MDX prose renders with new styles.
- `/experience`: returns 404 (expected).
- Footer: shows three columns, no "System.Status" text.

Stop preview server (Ctrl-C).

- [ ] **Step 5: Format all files with Prettier**

Run:
```bash
npm run format
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: format and final cleanup after freelance redesign"
```

If `git status` shows nothing to commit after formatting, skip this step.

- [ ] **Step 7: Report completion**

State to the user: site rebuilt as a freelance studio home page with new visual system, 6 section components, new nav/footer, new SEO metadata, `/experience` folded into About, case-study prose restyled. Build is clean. Ready for review in the browser.
