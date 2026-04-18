import { useInView } from "./useInView";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Props = {
  text: string;
  className?: string;
  delayOffset?: number;
};

export default function RevealWords({ text, className = "", delayOffset = 0 }: Props) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.2, once: true });
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");
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
