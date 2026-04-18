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
