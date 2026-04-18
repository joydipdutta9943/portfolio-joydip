import { useInView } from "./useInView";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type Segment = { text: string; className?: string };

type Props = {
  text?: string;
  segments?: Segment[];
  className?: string;
  delayOffset?: number;
};

export default function RevealWords({
  text,
  segments,
  className = "",
  delayOffset = 0,
}: Props) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.2, once: true });
  const reduced = usePrefersReducedMotion();
  const visible = reduced ? true : inView;

  const actualSegments: Segment[] = segments ?? (text ? [{ text }] : []);

  type Entry = { word: string; segClass?: string; addSpace: boolean };
  const entries: Entry[] = [];
  actualSegments.forEach((seg, sIdx) => {
    const words = seg.text.split(/\s+/).filter(Boolean);
    const isLastSeg = sIdx === actualSegments.length - 1;
    words.forEach((w, i) => {
      const isLastInSeg = i === words.length - 1;
      entries.push({
        word: w,
        segClass: seg.className,
        addSpace: !(isLastSeg && isLastInSeg),
      });
    });
  });

  return (
    <span ref={ref} className={className}>
      {entries.map((entry, i) => {
        const cls = ["pk-reveal-word", entry.segClass || "", visible ? "in" : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={i}
            className={cls}
            style={{ transitionDelay: `${delayOffset + i * 55}ms` }}
          >
            {entry.word}
            {entry.addSpace ? "\u00a0" : ""}
          </span>
        );
      })}
    </span>
  );
}
