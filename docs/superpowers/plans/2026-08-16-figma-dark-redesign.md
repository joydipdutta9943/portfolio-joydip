# Figma Dark Redesign + Content Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the portfolio to the "Minimalist Dark" Figma reference (violet + metallic silver, glass surfaces, centered layout) and tighten all homepage + project copy, per the approved spec.

**Architecture:** In-place evolution of the existing `pk-*` design system: tokens first, then chrome (nav/buttons/cards), then sections. New self-contained components (Marquee, TechIconGrid, ProjectCarousel, contact tiles) carry scoped styles or a dedicated stylesheet so tasks 3–10 never edit the same file. Astro islands architecture, SEO/JSON-LD, and the command palette are untouched.

**Tech Stack:** Astro v6, React 19, Tailwind v4 (Vite plugin), `simple-icons` (devDependency, build-time SVG inlining — already installed).

**Spec:** `docs/superpowers/specs/2026-08-16-figma-dark-redesign-design.md`

## Global Constraints

- Branch: all work happens on `redesign/minimalist-dark` (already checked out).
- **No `git commit` — ever.** Joydip commits himself (standing preference). Task "verify" steps replace the usual commit steps.
- No test framework exists; verification = `npm run build` + targeted greps + visual checks. Dev server may already be running at `http://localhost:4321`.
- Cyan `#22d3ee` must not survive anywhere in `src/` (grep gate in Task 11).
- Prettier conventions: double quotes, semicolons, trailing commas (es5), 100 char width. Run `npm run format` after each task.
- Copy must match the spec §5–6 **verbatim** — no improvisation on user-facing text.
- All motion respects the reduced-motion kill-switch in `tokens.css` (it zeroes `animation-duration`/`transition-duration` globally; do not add JS animation loops that bypass CSS).
- Do NOT pass children text across the Astro→React boundary (breaks serialization); pass data via props.
- File ownership is exclusive per task (parallel-safe): only Task 1 edits `tokens.css`; Tasks 2 then 3 edit `kit.css` (in that order); only Task 2 edits `global.css`, `Button.tsx`, `Nav.astro`, `Footer.astro`; only Task 4 edits `index.astro`; only Task 5 edits `content.config.ts` + MDX files; only Task 9 edits `carousel.css`, `Work.astro`, `ProjectCarousel.tsx`.

---

### Task 1: Token layer — palette pivot + scenes (`src/styles/tokens.css`)

**Files:**

- Modify: `src/styles/tokens.css`

**Interfaces:**

- Produces CSS vars consumed by every later task: `--gradient-metal`, `--gradient-ghost-heading`, `--scene-hero`, `--scene-glow`, `--scene-contact`, `--color-metal-ink`, `--radius-2xl`, retuned `--gradient-accent`.

- [ ] **Step 1: Replace the accent block inside `@theme`**

```css
/* Accent (violet + lavender; silver metal for CTAs) */
--color-accent: #7c5cff;
--color-accent-from: #8b7cff;
--color-accent-to: #c4b5fd;
```

- [ ] **Step 2: Update radii inside `@theme`**

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-2xl: 32px;
```

- [ ] **Step 3: In `:root`, replace the two button shadows and add metal ink**

```css
--color-metal-ink: #17171c;
--shadow-btn-primary: 0 0 0 1px rgba(255, 255, 255, 0.14), 0 10px 30px -10px rgba(0, 0, 0, 0.6);
--shadow-btn-primary-hover:
  0 0 0 1px rgba(255, 255, 255, 0.22), 0 16px 40px -12px rgba(0, 0, 0, 0.7);
```

(`--shadow-card-hover` keeps its violet glow — unchanged.)

- [ ] **Step 4: Replace both gradients and add the new ones at the end of `:root`**

```css
/* Gradients (convenience) */
--gradient-accent: linear-gradient(100deg, #fafafa 0%, #c4b5fd 55%, #8b7cff 100%);
--gradient-accent-soft: linear-gradient(
  100deg,
  rgba(139, 124, 255, 0.15) 0%,
  rgba(196, 181, 253, 0.15) 100%
);
--gradient-metal: linear-gradient(180deg, #eceef2 0%, #c8ccd6 55%, #9ca0ab 100%);
--gradient-ghost-heading: linear-gradient(
  180deg,
  rgba(196, 181, 253, 0.34) 0%,
  rgba(124, 92, 255, 0.08) 100%
);

/* Gradient scenes (section atmosphere) */
--scene-hero: radial-gradient(900px 600px at 50% -10%, rgba(76, 56, 180, 0.55), transparent 70%);
--scene-glow: radial-gradient(1200px 800px at 50% 50%, rgba(96, 66, 220, 0.38), transparent 75%);
--scene-contact: radial-gradient(1100px 700px at 50% 55%, rgba(96, 66, 220, 0.24), transparent 75%);
```

- [ ] **Step 5: Verify** — `npm run build` passes; `grep -c "22d3ee" src/styles/tokens.css` returns 0.

---

### Task 2: Chrome + kit core (`kit.css`, `global.css`, `Button.tsx`, `Nav.astro`, `Footer.astro`)

**Files:**

- Modify: `src/styles/kit.css`, `src/styles/global.css`, `src/components/react/Button.tsx`, `src/components/ui/Nav.astro`, `src/components/ui/Footer.astro`
- Create: `src/styles/carousel.css` (stub with a header comment only)

**Interfaces:**

- Produces (later tasks rely on these exact names): CSS classes `.pk-sechead`, `.pk-h2-ghost`, `.pk-scene-layer`, `.pk-scene-layer--hero`, `.pk-scene-layer--glow`, `.pk-scene-layer--contact`, `.pk-btn__label`, `.pk-btn__cap`; Button prop `icon?: "arrow" | "download" | "mail"` (default `"arrow"`); restyled `.pk-stats__cell`.

- [ ] **Step 1: kit.css — nav becomes the floating glass pill.** Replace the whole `.pk-nav` → `.pk-nav__right` block (lines ~25–78) with:

```css
.pk-nav {
  position: fixed;
  inset: 14px 0 auto 0;
  z-index: 50;
  padding: 0 16px;
}
.pk-nav__inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 10px 10px 22px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(13, 13, 17, 0.55);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  box-shadow:
    var(--shadow-inset-hi),
    0 8px 30px -12px rgba(0, 0, 0, 0.5);
  transition:
    background 0.3s var(--ease),
    border-color 0.3s var(--ease);
  position: relative;
  z-index: 50;
}
.pk-nav.scrolled .pk-nav__inner {
  background: rgba(10, 10, 14, 0.8);
  border-color: var(--color-border-strong);
}
.pk-nav__brand {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-fg);
  letter-spacing: var(--tracking-tight);
  white-space: nowrap;
}
.pk-nav__links {
  display: flex;
  gap: 26px;
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
  gap: 10px;
}
@media (max-width: 767px) {
  .pk-nav__links,
  .pk-nav__right {
    display: none;
  }
  .pk-nav__inner {
    padding: 12px 18px;
  }
}
```

(Keep the mobile toggle/menu blocks that follow — only adjust `.pk-mobile-menu` `padding` from `110px` to `120px`.)

- [ ] **Step 2: kit.css — metallic pill button.** Replace `.pk-btn` → `.pk-btn:hover .pk-btn__arrow` block with:

```css
.pk-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border-radius: 999px;
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
  color: var(--color-metal-ink);
  background: var(--gradient-metal);
  box-shadow: var(--shadow-btn-primary);
  padding: 7px 7px 7px 22px;
  font-weight: 600;
}
.pk-btn--primary:hover {
  filter: brightness(1.05);
  box-shadow: var(--shadow-btn-primary-hover);
}
.pk-btn__cap {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-metal-ink);
  flex: 0 0 auto;
}
.pk-btn--ghost {
  color: var(--color-fg);
  border: 1px solid var(--color-border-strong);
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 22px;
  gap: 8px;
}
.pk-btn--ghost:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: var(--tint-white-04);
}
.pk-btn--sm.pk-btn--primary {
  padding: 5px 5px 5px 16px;
  font-size: 12.5px;
}
.pk-btn--sm.pk-btn--ghost {
  padding: 8px 14px;
  font-size: 12.5px;
}
.pk-btn--sm .pk-btn__cap {
  width: 26px;
  height: 26px;
}
.pk-btn__arrow {
  width: 15px;
  height: 15px;
  transition: transform 0.3s var(--ease);
}
.pk-btn--sm .pk-btn__arrow {
  width: 12px;
  height: 12px;
}
.pk-btn:hover .pk-btn__arrow {
  transform: translateX(3px);
}
```

- [ ] **Step 3: kit.css — glass card.** In `.pk-card`, replace `background`, `box-shadow`, `border-radius`, `padding` with:

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid var(--color-border);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
border-radius: var(--radius-xl);
padding: 28px;
```

Apply the same `background`/`backdrop-filter`/`box-shadow`/`border-radius` treatment to `.pk-proj` (keep its other props).

- [ ] **Step 4: kit.css — section heads, ghost heading, scene layers.** Insert after the `.pk-h2` rule:

```css
/* Centered section head: Eyebrow + ghost word + real h2 stacked */
.pk-sechead {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 56px;
}
.pk-sechead .pk-h2 {
  margin: 0 auto;
  max-width: 760px;
}
.pk-h2-ghost {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(48px, 9vw, 96px);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--gradient-ghost-heading);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 0 10px;
  user-select: none;
}

/* Gradient scene layers (drop inside any .pk-section, which is position:relative) */
.pk-scene-layer {
  position: absolute;
  inset: -120px 0;
  pointer-events: none;
  z-index: -1;
}
.pk-scene-layer--hero {
  inset: 0;
  background: var(--scene-hero);
}
.pk-scene-layer--glow {
  background: var(--scene-glow);
}
.pk-scene-layer--contact {
  background: var(--scene-contact);
}
```

- [ ] **Step 5: kit.css — stat tiles.** Replace `.pk-stats` and `.pk-stats__cell` with:

```css
.pk-stats {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.pk-stats__cell {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 22px 16px;
  text-align: center;
}
```

(Keep `.pk-stats__v`, `.pk-stats__l`, and the mobile 2-col media query.)

- [ ] **Step 6: kit.css — cyan sweep + dotted grid removal.**
  - Delete the `.pk-page::before` dotted-grid block entirely.
  - `.pk-chip--cyan` → retint to lavender: color `#c4b5fd`, background `rgba(196, 181, 253, 0.08)`, border-color `rgba(196, 181, 253, 0.22)`.
  - In the `.pk-process-grid::before` gradient, replace `rgba(34, 211, 238, 0.25)` with `rgba(196, 181, 253, 0.25)`.
  - Old footer block: replace the `.pk-footer` and `.pk-footer__inner` rules with:

```css
.pk-footer {
  border-top: 1px solid var(--color-border);
  margin-top: 96px;
  background: #050507;
}
.pk-footer__inner {
  max-width: var(--max-w-page);
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 28px;
}
.pk-footer__brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pk-footer__logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-fg);
  letter-spacing: var(--tracking-tight);
}
```

(Keep `.pk-footer__copy`, `.pk-footer__links`, `.pk-footer__deploy` rules as-is, but change `.pk-footer__links` to `flex-direction: column; gap: 12px; font-size: 13px;`.)

- [ ] **Step 7: Footer.astro — brand column + resume link.** Replace the `<footer>` markup body (keep the frontmatter and the deploy-age `<script>` exactly as they are):

```astro
<footer class="pk-footer">
  <div class="pk-footer__inner">
    <div class="pk-footer__brand">
      <span class="pk-footer__logo">Joydip Dutta</span>
      <span class="pk-footer__copy">© {year} · Product Engineer</span>
      <span class="pk-footer__deploy" data-build-iso={buildIso}>
        <span data-deploy-age>recently deployed</span>
      </span>
    </div>

    <div class="pk-footer__links">
      <a
        href="https://github.com/joydipdutta9943"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <SocialIcon name="github" />
        <span>GitHub</span>
      </a>
      <a
        href="https://www.linkedin.com/in/joydip-dutta-569428141/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <SocialIcon name="linkedin" />
        <span>LinkedIn</span>
      </a>
      <a href="mailto:joydip.dutta9943@gmail.com" aria-label="Email">
        <SocialIcon name="mail" />
        <span>Email</span>
      </a>
      <a href="/resume-joydip-dutta.pdf" target="_blank" aria-label="Resume">
        <span>Resume (PDF)</span>
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Step 8: Button.tsx — icon cap.** Replace the `ArrowRight` component and `content` construction:

```tsx
type IconName = "arrow" | "download" | "mail";

const ICON_PATHS: Record<IconName, string[]> = {
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "m7 10 5 5 5-5", "M12 15V3"],
  mail: [
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
    "m22 6-10 7L2 6",
  ],
};

const BtnIcon = ({ name }: { name: IconName }) => (
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
    {ICON_PATHS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);
```

Add `icon?: IconName;` to `Props` (default `"arrow"` in destructuring), then:

```tsx
const content =
  variant === "primary" ? (
    <>
      <span className="pk-btn__label">{children}</span>
      <span className="pk-btn__cap">
        <BtnIcon name={icon} />
      </span>
    </>
  ) : (
    <>
      {children}
      <BtnIcon name={icon} />
    </>
  );
```

- [ ] **Step 9: global.css — carousel import.** After `@import "./kit.css";` add `@import "./carousel.css";` and create `src/styles/carousel.css` containing only:

```css
/* ProjectCarousel styles — populated by the Work-section task */
```

- [ ] **Step 10: Verify** — `npm run build`; then load `http://localhost:4321/` and confirm: floating pill nav, metallic "Start a project" with circular arrow cap, no dotted grid. Also check `CopyEmailButton.tsx` (`src/components/react/CopyEmailButton.tsx`): if it renders `pk-btn pk-btn--primary` markup directly, wrap its label/icon in `.pk-btn__label` / `.pk-btn__cap` the same way; if it uses the `Button` component, no change.

---

### Task 3: Hero rework (`Hero.astro` + hero styles in `kit.css`)

**Files:**

- Modify: `src/components/sections/Hero.astro`, `src/styles/kit.css` (hero block only — `.pk-hero*` rules and a new `.pk-scrolldown`)

**Interfaces:**

- Consumes: `.pk-scene-layer--hero`, `.pk-stats__cell`, Button `icon` prop, `RevealWords` `segments[]` API (unchanged).

- [ ] **Step 1: kit.css hero block.** Replace `.pk-hero`, `.pk-hero__title`, `.pk-hero__sub`, `.pk-hero__actions` with:

```css
.pk-hero {
  min-height: 92vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  text-align: center;
}
.pk-hero__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(52px, 5.5vw + 16px, 92px);
  line-height: 1.02;
  letter-spacing: var(--tracking-tightest);
  color: var(--color-fg);
  margin: 28px auto 10px;
  max-width: 980px;
}
.pk-hero__role {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(22px, 1.6vw + 12px, 32px);
  letter-spacing: var(--tracking-tight);
  color: var(--color-fg);
  margin: 0 0 18px;
}
.pk-hero__sub {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-fg-muted);
  max-width: 560px;
  margin: 0 auto 40px;
  letter-spacing: var(--tracking-tight);
}
.pk-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 56px;
}
.pk-scrolldown {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.03);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-fg-muted);
  margin: 0 auto 56px;
  transition: all 0.2s var(--ease);
}
.pk-scrolldown:hover {
  color: var(--color-fg);
  border-color: var(--color-border-strong);
  transform: translateY(2px);
}
.pk-scrolldown svg {
  width: 18px;
  height: 18px;
}
```

- [ ] **Step 2: Hero.astro — full replacement**

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

const heroSegments = [{ text: "Hi, I'm" }, { text: "Joydip", className: "gradient-text" }];
---

<section id="top" class="pk-section pk-hero" style="padding: 0 24px;">
  <div class="pk-scene-layer pk-scene-layer--hero" aria-hidden="true"></div>

  <div class="pk-section__inner" style="padding: 150px 0 80px; width: 100%;">
    <StatusPill>Open to select side projects</StatusPill>

    <h1 class="pk-hero__title">
      <RevealWords client:load segments={heroSegments} />
    </h1>

    <p class="pk-hero__role">Product Engineer · Backend, AI &amp; Fintech</p>

    <p class="pk-hero__sub">
      ~ I build backends, SaaS platforms &amp; AI systems that hold up in production ~
    </p>

    <div class="pk-hero__actions">
      <Button client:load href="/#contact">Start a project</Button>
      <Button client:load variant="ghost" href="/#work">See my work</Button>
    </div>

    <a href="/#work" class="pk-scrolldown" aria-label="Scroll to work section">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </a>

    <div class="pk-stats">
      {stats.map((s) => <CountUpStat client:visible value={s.value} label={s.label} />)}
    </div>
  </div>
</section>
```

Note: `StatusPill` renders inline-flex; centering comes from `text-align: center` on `.pk-hero`. The old `radial-glow-v2` div is gone from the hero.

- [ ] **Step 3: Verify** — `npm run build`; homepage hero is centered with "Hi, I'm Joydip" (gradient on "Joydip"), role line, tilde tagline, metallic + ghost CTAs, chevron circle, 4 stat tiles.

---

### Task 4: Marquee band (`Marquee.astro` + `index.astro`)

**Files:**

- Create: `src/components/sections/Marquee.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/sections/Marquee.astro`**

```astro
---
const items = [
  "Product Engineering",
  "Backend Architecture",
  "AI & RAG Systems",
  "Fintech Platforms",
  "Technical Advisory",
];
---

<div class="pk-marquee" aria-hidden="true">
  <div class="pk-marquee__track">
    {
      [0, 1].map(() => (
        <div class="pk-marquee__group">
          {items.map((t) => (
            <span class="pk-marquee__item">
              <span class="pk-marquee__star">✦</span>
              {t}
            </span>
          ))}
        </div>
      ))
    }
  </div>
</div>

<style>
  .pk-marquee {
    position: relative;
    overflow: hidden;
    padding: 26px 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    background: linear-gradient(
      90deg,
      rgba(96, 66, 220, 0.16),
      rgba(124, 92, 255, 0.26),
      rgba(96, 66, 220, 0.16)
    );
  }
  .pk-marquee__track {
    display: flex;
    width: max-content;
    animation: pk-marquee-scroll 36s linear infinite;
  }
  .pk-marquee__group {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
  }
  .pk-marquee__item {
    display: inline-flex;
    align-items: center;
    gap: 22px;
    padding-right: 22px;
    font-family: var(--font-display);
    font-size: clamp(20px, 2.2vw, 30px);
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    white-space: nowrap;
    background: var(--gradient-ghost-heading);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .pk-marquee__star {
    background: none;
    -webkit-text-fill-color: rgba(196, 181, 253, 0.45);
    font-size: 0.8em;
  }
  @keyframes pk-marquee-scroll {
    to {
      transform: translateX(-50%);
    }
  }
</style>
```

- [ ] **Step 2: Mount it in `src/pages/index.astro`** — import `Marquee from "../components/sections/Marquee.astro";` and render `<Marquee />` between `<Hero />` and `<Services />`.

- [ ] **Step 3: Verify** — band scrolls seamlessly (the two duplicated groups make `translateX(-50%)` loop cleanly); with `prefers-reduced-motion: reduce` emulated it is static; `npm run build` passes.

---

### Task 5: Content schema + 12 project descriptions

**Files:**

- Modify: `src/content.config.ts`, all 12 files in `src/content/projects/*.mdx` (frontmatter only)

**Interfaces:**

- Produces: optional frontmatter field `category: "fintech" | "ai" | "saas"` consumed by Task 9's `Work.astro`.

- [ ] **Step 1: Schema.** In `src/content.config.ts`, add to the projects schema object:

```ts
    category: z.enum(["fintech", "ai", "saas"]).optional(),
```

- [ ] **Step 2: Frontmatter edits.** For each file, replace `description:` and add `category:` (touch nothing else — not the body, not other fields):

| File                             | `category` | `description`                                                                                                                 |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `gunpowder-fintech-backend.mdx`  | `fintech`  | `Multi-tenant WealthTech engine on Bun + serverless Postgres — advisor report prep cut from 2 hours to 30 seconds.`           |
| `unified-ai-agent.mdx`           | `ai`       | `Multi-modal RAG platform hitting 85% retrieval accuracy across PDFs, scans, and images for 1,000+ concurrent users.`         |
| `levo-microservices.mdx`         | `saas`     | `Polyglot TypeScript + Go monorepo behind a high-speed website builder — millions of daily pageviews analyzed in ClickHouse.` |
| `smartcue-service.mdx`           | `ai`       | `AI demo engine with ElevenLabs voiceovers and server-side video rendering — enterprise demo production time cut 80%.`        |
| `faas-automation.mdx`            | `fintech`  | `Fund management SaaS automating NAV allocations and investor statements — form turnaround from 3 days to 10 minutes.`        |
| `dyrect-backend.mdx`             | `saas`     | `Multi-tenant QR product-registration platform that lifted post-sales customer registrations 45%.`                            |
| `crooze-gamified-fitness.mdx`    | `saas`     | `Cycling gamification backend with real-time Redis leaderboards — daily engagement up 35%.`                                   |
| `agrieasy-digital-ecosystem.mdx` | `saas`     | `Tri-schema GraphQL backend serving 30k+ farmers and buyers at 99.9% uptime — down to SMS on feature phones.`                 |
| `teamify-service.mdx`            | `saas`     | `Event marketplace backend with durable Hatchet workflows and Stripe Connect payouts — zero double-bookings at peak.`         |
| `touchbase-service.mdx`          | `saas`     | `Real-estate CRM syncing Outlook mail and meetings via Microsoft Graph — contractor response times up 40%.`                   |
| `agnibina-model-school.mdx`      | `saas`     | `SEO-first school portal streamlining parent communication with CBSE-compliant publishing.`                                   |
| `ecommerce-recommendation.mdx`   | `ai`       | `Predictive recommendation engine driving sales through personalized, collaborative product filtering.`                       |

- [ ] **Step 3: Verify** — `npm run build` (validates schema against every file); `grep -L "category:" src/content/projects/*.mdx` prints nothing.

---

### Task 6: Services + Process restyle & copy

**Files:**

- Modify: `src/components/sections/Services.astro`, `src/components/sections/Process.astro`

**Interfaces:**

- Consumes: `.pk-sechead`, `.pk-h2-ghost` from Task 2.

- [ ] **Step 1: Services.astro.** Keep the `services` array structure, icons, and tags; replace only the four `pitch` strings and the section header. New pitches:
  - Product Engineering: `Full SaaS builds from zero — backend, APIs, auth, payments. 4–12 week engagements.`
  - Backend Architecture: `Microservices, event systems, scale-ready foundations — greenfield or review.`
  - AI & RAG Systems: `LLM features that work on real data — vector search, agents, retrieval pipelines.`
  - Technical Advisory: `Architecture reviews, hire-a-senior-for-a-week. Async, fixed scope.`

  Replace the header block (`<Eyebrow …/>` + `<h2 …>`) with:

```astro
<div class="pk-sechead">
  <Eyebrow n="01" label="What I build" />
  <span class="pk-h2-ghost" aria-hidden="true">Services</span>
  <h2 class="pk-h2">What I build.</h2>
</div>
```

- [ ] **Step 2: Process.astro.** Same header pattern (`n="03"`, label `How I work`, ghost word `Process`, h2 `Predictable. No surprises.`). Replace the three step `body` strings:
  - Discovery: `We pin down the product, the constraints, and the bar. If it's not a fit, I'll say so.`
  - Architecture: `Data model, API contract, infra plan — approved before any production code.`
  - Build & ship: `Weekly demos, continuous deploys. Your repo, your conventions, your code.`

- [ ] **Step 3: Verify** — `npm run build`; both sections show centered ghost headings; card text matches the strings above exactly.

---

### Task 7: About — intro card + tech icon grid

**Files:**

- Modify: `src/components/sections/About.astro` (full rewrite)
- Create: `src/components/ui/TechIconGrid.astro`

**Interfaces:**

- Consumes: `.pk-sechead`, `.pk-h2-ghost`, Button `icon="download"`. `simple-icons` is already installed (devDependency).

- [ ] **Step 1: Create `src/components/ui/TechIconGrid.astro`**

```astro
---
import * as si from "simple-icons";

// Luminance guard: dark brand marks (Bun, Next.js…) get a light neutral instead.
function displayColor(hex: string): string {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.28 ? "#e4e4e7" : `#${hex}`;
}

const tools = [
  { icon: si.siTypescript, label: "TypeScript" },
  { icon: si.siGo, label: "Go" },
  { icon: si.siPython, label: "Python" },
  { icon: si.siNodedotjs, label: "Node.js" },
  { icon: si.siBun, label: "Bun" },
  { icon: si.siReact, label: "React" },
  { icon: si.siNextdotjs, label: "Next.js" },
  { icon: si.siGraphql, label: "GraphQL" },
  { icon: si.siPostgresql, label: "PostgreSQL" },
  { icon: si.siMongodb, label: "MongoDB" },
  { icon: si.siClickhouse, label: "ClickHouse" },
  { icon: si.siRedis, label: "Redis" },
  { icon: si.siDocker, label: "Docker" },
  { icon: si.siKubernetes, label: "Kubernetes" },
  { icon: si.siLangchain, label: "LangChain" },
  { icon: si.siGooglegemini, label: "Google Gemini" },
];
---

<ul class="pk-tools" role="list">
  {
    tools.map((t) => (
      <li class="pk-tool" title={t.label}>
        <span
          class="pk-tool__disc"
          style={`--tool-color: ${displayColor(t.icon.hex)}`}
          set:html={t.icon.svg}
        />
        <span class="sr-only">{t.label}</span>
      </li>
    ))
  }
</ul>

<style>
  .pk-tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;
    list-style: none;
    padding: 0;
    margin: 0;
    max-width: 640px;
  }
  .pk-tool__disc {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.25s var(--ease),
      border-color 0.25s var(--ease);
  }
  .pk-tool:hover .pk-tool__disc {
    transform: translateY(-3px);
    border-color: var(--color-border-strong);
  }
  .pk-tool__disc :global(svg) {
    width: 24px;
    height: 24px;
    fill: var(--tool-color);
  }
</style>
```

- [ ] **Step 2: Rewrite `About.astro`.** Keep the `previouslyAt` array exactly as it is today (dates are already correct). Full new body:

```astro
---
import Button from "../react/Button";
import Eyebrow from "../ui/Eyebrow.astro";
import TechIconGrid from "../ui/TechIconGrid.astro";

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
  <div class="pk-scene-layer pk-scene-layer--glow" aria-hidden="true"></div>
  <div
    class="pk-section__inner"
    style="display: flex; flex-direction: column; align-items: center;"
  >
    <div class="pk-sechead">
      <Eyebrow n="04" label="About" />
      <span class="pk-h2-ghost" aria-hidden="true">About</span>
      <h2 class="pk-h2">Hi, I'm Joydip.</h2>
    </div>

    <div
      class="pk-card"
      style="max-width: 720px; width: 100%; text-align: center; padding: 40px; border-radius: var(--radius-2xl);"
    >
      <div
        style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-fg-subtle); margin-bottom: 16px;"
      >
        My introduction
      </div>
      <p
        style="margin: 0 0 16px; font-size: 17px; line-height: 1.7; color: var(--color-fg-body); letter-spacing: var(--tracking-tight);"
      >
        Product engineer with 3+ years shipping fintech, AI, and SaaS systems — currently building
        WealthTech at Gunpowder Innovations. TypeScript and Go for most things, Python when the ML
        demands it.
      </p>
      <p style="margin: 0 0 28px; font-size: 16px; color: var(--color-fg-muted);">
        I work async, keep scope honest, and don't chase frameworks.
      </p>
      <div style="display: flex; justify-content: center;">
        <Button client:visible href="/resume-joydip-dutta.pdf" external icon="download">
          Download resume
        </Button>
      </div>
    </div>

    <div style="margin: 56px 0 0; display: flex; flex-direction: column; align-items: center;">
      <TechIconGrid />
    </div>

    <div style="margin-top: 64px; max-width: 720px; width: 100%;">
      <div
        style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-fg-subtle); margin-bottom: 14px; text-align: center;"
      >
        Experience
      </div>
      <ul style="list-style: none; padding: 0; margin: 0;">
        {
          previouslyAt.map((r, i) => (
            <li
              style={`display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start; padding: 16px 0; ${i < previouslyAt.length - 1 ? "border-bottom: 1px solid var(--color-border);" : ""}`}
            >
              <div>
                <div style="color: var(--color-fg); font-size: 16px; font-weight: 500; letter-spacing: var(--tracking-tight);">
                  {r.role}
                </div>
                <div style="color: var(--color-fg-body); font-size: 14px; margin-top: 4px;">
                  {r.company}
                  <span style="color: var(--color-fg-subtle);"> · {r.location}</span>
                </div>
              </div>
              <span style="color: var(--color-fg-subtle); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; white-space: nowrap; padding-top: 3px;">
                {r.years}
              </span>
            </li>
          ))
        }
      </ul>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify** — `npm run build`; About shows glass intro card, 16 circular icons (Bun/Next.js legible, not black-on-black), experience list. No text-chip skill cards remain.

---

### Task 8: Contact — glass card + tile trio

**Files:**

- Modify: `src/components/sections/Contact.astro` (full rewrite; tile styles scoped in this file)

**Interfaces:**

- Consumes: `.pk-sechead`, `.pk-h2-ghost`, `.pk-scene-layer--contact`, Button `icon="mail"`, existing `CopyEmailButton` island.

- [ ] **Step 1: Rewrite `Contact.astro`**

```astro
---
import Button from "../react/Button";
import Eyebrow from "../ui/Eyebrow.astro";
import CopyEmailButton from "../react/CopyEmailButton";
---

<section id="contact" class="pk-section" style="text-align: center;">
  <div class="pk-scene-layer pk-scene-layer--contact" aria-hidden="true"></div>

  <div class="pk-section__inner" style="max-width: 980px;">
    <div class="pk-sechead" style="margin-bottom: 40px;">
      <Eyebrow n="05" label="Start a project" />
      <span class="pk-h2-ghost" aria-hidden="true">Contact</span>
      <h2 class="pk-h2" style="font-size: clamp(40px, 3vw + 20px, 64px);">
        Have something <span class="gradient-text">hard to build?</span>
      </h2>
    </div>

    <div
      class="pk-card"
      style="padding: 48px 32px; border-radius: var(--radius-2xl); text-align: center;"
    >
      <p
        style="color: var(--color-fg-body); font-size: 17px; line-height: 1.6; max-width: 560px; margin: 0 auto 40px;"
      >
        I take a couple of side projects at a time. Funded startups, real products, scoped under ~3
        months. I reply within 24 hours.
      </p>

      <div class="pk-tiles">
        <div class="pk-tile">
          <span class="pk-tile__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <path d="m22 6-10 7L2 6"></path>
            </svg>
          </span>
          <h3 class="pk-tile__title">Get in touch</h3>
          <p class="pk-tile__body">joydip.dutta9943@gmail.com</p>
          <CopyEmailButton client:visible label="Copy email" />
        </div>

        <div class="pk-tile">
          <span class="pk-tile__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5z"
              ></path>
            </svg>
          </span>
          <h3 class="pk-tile__title">Project inquiry</h3>
          <p class="pk-tile__body">Have a brief? Send scope and timeline.</p>
          <Button
            client:visible
            href="mailto:joydip.dutta9943@gmail.com?subject=Project%20inquiry"
            icon="mail"
          >
            Contact me
          </Button>
        </div>

        <div class="pk-tile">
          <span class="pk-tile__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <h3 class="pk-tile__title">Availability</h3>
          <p class="pk-tile__body">Async-friendly · IST · remote</p>
          <Button
            client:visible
            href="https://www.linkedin.com/in/joydip-dutta-569428141/"
            external
          >
            LinkedIn
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .pk-tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .pk-tile {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .pk-tile__icon {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-fg);
    margin-bottom: 6px;
  }
  .pk-tile__icon svg {
    width: 20px;
    height: 20px;
  }
  .pk-tile__title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    color: var(--color-fg);
    margin: 0;
  }
  .pk-tile__body {
    font-size: 13.5px;
    color: var(--color-fg-muted);
    margin: 0 0 14px;
  }
  @media (max-width: 767px) {
    .pk-tiles {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Verify** — `npm run build`; three tiles render with pill CTAs; the copy-email button still copies; the social row is gone from Contact (footer covers it).

---

### Task 9: Work section — tabs + center-focus carousel (**after Task 5**)

**Files:**

- Create: `src/components/react/ProjectCarousel.tsx`
- Modify: `src/styles/carousel.css` (replace stub), `src/components/sections/Work.astro` (full rewrite)

**Interfaces:**

- Consumes: `category` frontmatter (Task 5), `.pk-sechead`/`.pk-h2-ghost` (Task 2), `usePrefersReducedMotion` hook.
- Produces: `CarouselProject` type `{ id, title, description, techStack, image?, category?, featured }`.

- [ ] **Step 1: Rewrite `Work.astro`**

```astro
---
import { getCollection } from "astro:content";
import Eyebrow from "../ui/Eyebrow.astro";
import ProjectCarousel from "../react/ProjectCarousel";

const all = await getCollection("projects");
const sorted = all.sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
const projects = sorted.map((p, i) => ({
  id: p.id,
  title: p.data.title,
  description: p.data.description,
  techStack: p.data.techStack,
  image: p.data.image,
  category: p.data.category,
  featured: i < 5,
}));
---

<section id="work" class="pk-section">
  <div class="pk-scene-layer pk-scene-layer--glow" aria-hidden="true"></div>
  <div class="pk-section__inner">
    <div class="pk-sechead">
      <Eyebrow n="02" label="Selected work" />
      <span class="pk-h2-ghost" aria-hidden="true">Work</span>
      <h2 class="pk-h2">Production systems, not demos.</h2>
    </div>

    <ProjectCarousel client:visible projects={projects} />

    <div style="margin-top: 40px; display: flex; justify-content: center;">
      <a href="/projects" class="pk-btn pk-btn--ghost" data-astro-prefetch>
        See all {sorted.length} projects
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/react/ProjectCarousel.tsx`**

```tsx
import { useMemo, useRef, useState, useEffect } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type CarouselProject = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  image?: string;
  category?: "fintech" | "ai" | "saas";
  featured: boolean;
};

const TABS = [
  { key: "featured", label: "Featured" },
  { key: "fintech", label: "Fintech" },
  { key: "ai", label: "AI & Data" },
  { key: "saas", label: "SaaS Platforms" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export default function ProjectCarousel({ projects }: { projects: CarouselProject[] }) {
  const [tab, setTab] = useState<TabKey>("featured");
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const pointerStart = useRef<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const visible = useMemo(
    () => projects.filter((p) => (tab === "featured" ? p.featured : p.category === tab)),
    [projects, tab]
  );

  const clamp = (i: number) => Math.max(0, Math.min(visible.length - 1, i));

  const selectTab = (key: TabKey) => {
    setTab(key);
    setIndex(0);
  };

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    selectTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) > 40) setIndex((i) => clamp(i + (dx < 0 ? 1 : -1)));
  };

  return (
    <div className="pk-carousel">
      <div className="pk-carousel__tabs" role="tablist" aria-label="Filter projects">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            tabIndex={tab === t.key ? 0 : -1}
            className={`pk-carousel__tab${tab === t.key ? "is-active" : ""}`}
            onClick={() => selectTab(t.key)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mobile ? (
        <div className="pk-carousel__scroll">
          {visible.map((p) => (
            <a key={p.id} href={`/projects/${p.id}`} className="pk-ccard pk-ccard--flat">
              <CardBody p={p} />
            </a>
          ))}
        </div>
      ) : (
        <div
          className="pk-carousel__stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          aria-roledescription="carousel"
          aria-label="Project case studies"
        >
          {visible.map((p, i) => {
            const offset = i - index;
            if (Math.abs(offset) > 2) return null;
            const style: React.CSSProperties = {
              transform: reduced
                ? undefined
                : `translateX(${offset * 58}%) scale(${1 - Math.min(Math.abs(offset), 2) * 0.13})`,
              opacity: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.45 : 0.15,
              zIndex: 10 - Math.abs(offset),
              pointerEvents: Math.abs(offset) > 1 ? "none" : undefined,
              display: reduced && offset !== 0 ? "none" : undefined,
            };
            return (
              <a
                key={p.id}
                href={`/projects/${p.id}`}
                className="pk-ccard"
                style={style}
                tabIndex={offset === 0 ? 0 : -1}
                aria-hidden={offset !== 0 || undefined}
                onClick={(e) => {
                  if (offset !== 0) {
                    e.preventDefault();
                    setIndex(i);
                  }
                }}
              >
                <CardBody p={p} />
              </a>
            );
          })}

          <div className="pk-carousel__ctrls">
            <button
              type="button"
              aria-label="Previous project"
              disabled={index === 0}
              onClick={() => setIndex((i) => clamp(i - 1))}
            >
              ←
            </button>
            <span className="pk-carousel__count">
              {visible.length === 0 ? "0 / 0" : `${index + 1} / ${visible.length}`}
            </span>
            <button
              type="button"
              aria-label="Next project"
              disabled={index >= visible.length - 1}
              onClick={() => setIndex((i) => clamp(i + 1))}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CardBody({ p }: { p: CarouselProject }) {
  return (
    <>
      {p.image ? (
        <span className="pk-ccard__img">
          <img src={p.image} alt="" loading="lazy" decoding="async" />
        </span>
      ) : (
        <span className="pk-ccard__img pk-ccard__img--empty" aria-hidden="true" />
      )}
      <span className="pk-ccard__body">
        <span className="pk-ccard__title">{p.title}</span>
        <span className="pk-ccard__desc">{p.description}</span>
        <span className="pk-ccard__chips">
          {p.techStack.slice(0, 4).map((t) => (
            <span key={t} className="pk-chip">
              {t}
            </span>
          ))}
        </span>
      </span>
    </>
  );
}
```

- [ ] **Step 3: Replace `src/styles/carousel.css` stub**

```css
/* ProjectCarousel — tabs + center-focus stage (desktop), snap-scroll (mobile) */
.pk-carousel__tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  width: max-content;
  max-width: 100%;
  margin: 0 auto 44px;
  overflow-x: auto;
}
.pk-carousel__tab {
  border: none;
  background: transparent;
  color: var(--color-fg-muted);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  padding: 9px 18px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s var(--ease);
}
.pk-carousel__tab:hover {
  color: var(--color-fg);
}
.pk-carousel__tab.is-active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-fg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.pk-carousel__tab:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.pk-carousel__stage {
  position: relative;
  height: 520px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  touch-action: pan-y;
}
.pk-ccard {
  position: absolute;
  top: 0;
  width: min(560px, 90%);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
  transition:
    transform 0.5s var(--ease),
    opacity 0.5s var(--ease);
}
.pk-ccard:hover {
  border-color: var(--color-border-strong);
}
.pk-ccard__img {
  display: block;
  aspect-ratio: 16 / 9;
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}
.pk-ccard__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pk-ccard__img--empty {
  background:
    radial-gradient(400px 200px at 50% 0%, rgba(124, 92, 255, 0.25), transparent 70%),
    var(--color-surface-raised);
}
.pk-ccard__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 26px;
  text-align: left;
}
.pk-ccard__title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  color: var(--color-fg);
  letter-spacing: var(--tracking-tight);
}
.pk-ccard__desc {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--color-fg-body);
}
.pk-ccard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.pk-carousel__ctrls {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 20;
}
.pk-carousel__ctrls button {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(13, 13, 17, 0.7);
  color: var(--color-fg);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s var(--ease);
}
.pk-carousel__ctrls button:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background: rgba(255, 255, 255, 0.06);
}
.pk-carousel__ctrls button:disabled {
  opacity: 0.35;
  cursor: default;
}
.pk-carousel__count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-fg-subtle);
  letter-spacing: 0.1em;
}

/* Mobile: horizontal snap-scroll */
.pk-carousel__scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}
.pk-carousel__scroll .pk-ccard--flat {
  position: static;
  flex: 0 0 84%;
  scroll-snap-align: center;
}
```

- [ ] **Step 4: Verify** — `npm run build`; tabs filter correctly (Featured=5, Fintech=2, AI & Data=3, SaaS Platforms=7); arrows/keyboard/swipe advance; side-card click focuses it; at 390px viewport it renders the snap-scroll row; with reduced motion only the center card shows, no transforms.

---

### Task 10: Subpage polish (`/projects`, `[slug]`)

**Files:**

- Modify: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`

- [ ] **Step 1: `/projects` listing.** Replace the `Eyebrow`/`h1`/lede block header with a centered `.pk-sechead` (Eyebrow n="—" label="Case studies", ghost word `Projects`, h1 keeps class `pk-h2`, text `All projects.`), and move the lede below the h1 with `margin: -40px auto 72px; text-align: center;`. Grid markup and card classes stay (they inherit the Task 2 glass card styles).

- [ ] **Step 2: `[slug]` page.** One change: give the description paragraph `color: var(--color-fg-body)` (currently `--color-fg-muted`). Prose accents need no edits — they follow `--gradient-accent` automatically. Confirm the hero image block keeps `decoding="async"` with no `loading="lazy"` (LCP candidate — must stay eager).

- [ ] **Step 3: Verify** — `npm run build`; visit one case study: blockquote bar and list markers render lavender, not cyan.

---

### Task 11: Verification sweep (final gate)

**Files:** none (read-only checks + fixes for whatever they surface)

- [ ] **Step 1: Grep gates**

```bash
grep -rn "22d3ee" src/ && echo "FAIL: cyan survives" || echo "PASS"
grep -rn "radial-glow-v2" src/components src/pages   # any remaining users must be scene layers now
npx prettier --check "src/**/*.{astro,css,tsx,ts,mdx}"
```

- [ ] **Step 2: Build + screenshots** — `npm run build`; screenshot `/`, `/projects`, one `[slug]` at 390 / 768 / 1440 px wide; compare against the Figma reference for: pill nav, gradient scenes, metallic CTAs, ghost headings, marquee, carousel, contact tiles, black footer.
- [ ] **Step 3: A11y pass** — keyboard-only: tab through nav → hero CTAs → carousel tabs (arrow keys switch) → carousel next/prev → contact tiles → footer. Emulate `prefers-reduced-motion` and confirm: no marquee scroll, no carousel transforms, reveals instant.
- [ ] **Step 4: Report** — list every issue found + fixed; final `git status --short` + diffstat for Joydip to review and commit.
