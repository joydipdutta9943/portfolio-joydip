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
