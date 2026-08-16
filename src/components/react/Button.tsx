import { useRef, type ReactNode, type MouseEvent } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type IconName = "arrow" | "download" | "mail";

type Props = {
  variant?: "primary" | "ghost";
  size?: "sm";
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
  icon?: IconName;
};

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

export default function Button({
  variant = "primary",
  size,
  href,
  onClick,
  children,
  className = "",
  external,
  ariaLabel,
  icon = "arrow",
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
