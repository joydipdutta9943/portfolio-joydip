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
