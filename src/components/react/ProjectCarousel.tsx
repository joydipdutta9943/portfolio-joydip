import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const AUTO_SLIDE_INTERVAL = 4500;

export default function ProjectCarousel({ projects }: { projects: CarouselProject[] }) {
  const [tab, setTab] = useState<TabKey>("featured");
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const reduced = usePrefersReducedMotion();
  const pointerStart = useRef<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isInteracting = useRef(false);
  // Guards the scroll listener from reacting to our own programmatic scrolling.
  const programmatic = useRef(false);
  const programmaticTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const visible = useMemo(
    () => projects.filter((p) => (tab === "featured" ? p.featured : p.category === tab)),
    [projects, tab]
  );

  const nextSlide = useCallback(() => {
    if (visible.length <= 1) return;
    setIndex((i) => (i + 1) % visible.length);
  }, [visible.length]);

  const prevSlide = useCallback(() => {
    if (visible.length <= 1) return;
    setIndex((i) => (i === 0 ? visible.length - 1 : i - 1));
  }, [visible.length]);

  // Only auto-slide while the carousel is actually on screen — otherwise the
  // section keeps advancing (and re-rendering) behind the reader's back.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || reduced || !inView || visible.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, reduced, inView, visible.length, nextSlide]);

  // Synchronize the mobile scroller to `index`. Scroll the container itself rather
  // than calling scrollIntoView() — that walks every scrollable ancestor including
  // the document, so each auto-slide tick yanked the page vertically to the carousel.
  useEffect(() => {
    const el = scrollRef.current;
    // offsetParent is null while the mobile layout is display:none (desktop widths).
    if (!el || el.offsetParent === null || isInteracting.current) return;
    const cardEl = el.children[index] as HTMLElement | undefined;
    if (!cardEl) return;

    const target = cardEl.offsetLeft + cardEl.offsetWidth / 2 - el.clientWidth / 2;
    if (Math.abs(el.scrollLeft - target) < 2) return;

    programmatic.current = true;
    if (programmaticTimer.current) clearTimeout(programmaticTimer.current);
    programmaticTimer.current = setTimeout(() => {
      programmatic.current = false;
    }, 700);

    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  }, [index, reduced, visible.length]);

  useEffect(
    () => () => {
      if (programmaticTimer.current) clearTimeout(programmaticTimer.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // Keep `index` in step with manual swipes so the next auto-slide continues from
  // where the reader left off instead of snapping back.
  const onScrollSync = useCallback(() => {
    if (programmatic.current || rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollRef.current;
      if (!el || el.offsetParent === null) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const card = el.children[i] as HTMLElement;
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (dist < best) {
          best = dist;
          nearest = i;
        }
      }
      setIndex((prev) => (prev === nearest ? prev : nearest));
    });
  }, []);

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
    isInteracting.current = true;
    setIsPaused(true);
    pointerStart.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStart.current !== null) {
      const dx = e.clientX - pointerStart.current;
      pointerStart.current = null;
      if (Math.abs(dx) > 40) {
        if (dx < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    isInteracting.current = false;
    setIsPaused(false);
  };

  const onPointerCancel = () => {
    pointerStart.current = null;
    isInteracting.current = false;
    setIsPaused(false);
  };

  return (
    <div
      ref={rootRef}
      className="pk-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="pk-carousel__tabs" role="tablist" aria-label="Filter projects">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={`pk-carousel-tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls="pk-carousel-panel"
            tabIndex={tab === t.key ? 0 : -1}
            className={tab === t.key ? "pk-carousel__tab is-active" : "pk-carousel__tab"}
            onClick={() => selectTab(t.key)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Both layouts render; CSS media queries pick one, so SSR is correct at every width. */}
      <div id="pk-carousel-panel" role="tabpanel" aria-labelledby={`pk-carousel-tab-${tab}`}>
        <div
          ref={scrollRef}
          className="pk-carousel__scroll"
          onScroll={onScrollSync}
          onTouchStart={() => {
            // A finger beats an in-flight programmatic scroll.
            programmatic.current = false;
            if (programmaticTimer.current) clearTimeout(programmaticTimer.current);
            setIsPaused(true);
          }}
          onTouchEnd={() => setIsPaused(false)}
        >
          {visible.map((p) => (
            <a
              key={p.id}
              href={`/projects/${p.id}`}
              className="pk-ccard pk-ccard--flat"
              draggable={false}
            >
              <CardBody p={p} />
            </a>
          ))}
        </div>

        <div
          className="pk-carousel__stage"
          role="group"
          aria-roledescription="carousel"
          aria-label="Project case studies"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          {visible.map((p, i) => {
            const offset = i - index;
            if (Math.abs(offset) > 2) return null;
            const style: React.CSSProperties = {
              transform: reduced
                ? undefined
                : `translateX(${offset * 105}%) scale(${offset === 0 ? 1 : 0.92})`,
              opacity: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.38 : 0,
              visibility: Math.abs(offset) > 1 ? "hidden" : undefined,
              zIndex: 10 - Math.abs(offset),
              pointerEvents: offset === 0 ? "auto" : Math.abs(offset) === 1 ? "auto" : "none",
              cursor: offset !== 0 ? "pointer" : undefined,
              display: reduced && offset !== 0 ? "none" : undefined,
            };
            return (
              <a
                key={p.id}
                href={`/projects/${p.id}`}
                className="pk-ccard"
                style={style}
                draggable={false}
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
            <button type="button" aria-label="Previous project" onClick={prevSlide}>
              ←
            </button>
            <span className="pk-carousel__count" aria-live="polite">
              {visible.length === 0 ? "0 / 0" : `${index + 1} / ${visible.length}`}
              <span className="sr-only">{visible[index] ? ` — ${visible[index].title}` : ""}</span>
            </span>
            <button type="button" aria-label="Next project" onClick={nextSlide}>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBody({ p }: { p: CarouselProject }) {
  return (
    <>
      {p.image ? (
        <span className="pk-ccard__img">
          <img src={p.image} alt="" loading="lazy" decoding="async" draggable={false} />
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
