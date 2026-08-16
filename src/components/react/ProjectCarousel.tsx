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
  const reduced = usePrefersReducedMotion();
  const pointerStart = useRef<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isInteracting = useRef(false);

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

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || reduced || visible.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, reduced, visible.length, nextSlide]);

  // Synchronize mobile scroll position smoothly
  useEffect(() => {
    if (!scrollRef.current || isInteracting.current) return;
    const cardEl = scrollRef.current.children[index] as HTMLElement | undefined;
    if (cardEl) {
      cardEl.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [index, reduced]);

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
          onTouchStart={() => setIsPaused(true)}
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
