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
