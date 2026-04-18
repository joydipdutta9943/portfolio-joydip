import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { CmdItem } from "./types";

type Props = { items: CmdItem[] };

const ArrowIcon = () => (
  <svg
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

const EMAIL = "joydip.dutta9943@gmail.com";

function itemMatches(item: CmdItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.meta === "CASE STUDY" && item.tags) {
    return item.tags.some((t) => t.toLowerCase().includes(q));
  }
  return false;
}

export default function CommandPalette({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openerRef = useRef<Element | null>(null);

  const filtered = items.filter((it) => itemMatches(it, query));

  useEffect(() => {
    const onOpen = () => {
      openerRef.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener("pk:cmd-open", onOpen);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openerRef.current = document.activeElement;
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pk:cmd-open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (openerRef.current && "focus" in openerRef.current) {
        (openerRef.current as HTMLElement).focus();
      }
    }
  }, [open]);

  const close = () => setOpen(false);

  const run = (item: CmdItem) => {
    close();
    if (item.meta === "NAV") {
      const href = item.href;
      if (href.startsWith("#") || href.startsWith("/#")) {
        const id = href.replace(/^.*#/, "");
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = href;
        }
      } else {
        window.location.href = href;
      }
      return;
    }
    if (item.meta === "ACTION" && "action" in item && item.action === "copy-email") {
      navigator.clipboard?.writeText(EMAIL);
      return;
    }
    if ("href" in item && item.href) {
      if (item.meta === "EXT") {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = item.href;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`pk-cmd-overlay ${open ? "open" : ""}`}
      onClick={close}
      aria-hidden={!open}
    >
      <div
        className="pk-cmd"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          className="pk-cmd__input"
          placeholder="Search — actions, pages, case studies…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          aria-label="Search commands"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="pk-cmd__list" role="listbox">
          {filtered.length === 0 && (
            <div
              className="pk-cmd__item"
              style={{ color: "var(--color-fg-subtle)" }}
              aria-disabled="true"
            >
              No results
            </div>
          )}
          {filtered.map((it, i) => (
            <div
              key={it.id}
              className="pk-cmd__item"
              data-active={i === active}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(it)}
            >
              <div className="pk-cmd__icon">
                <ArrowIcon />
              </div>
              <span>{it.label}</span>
              <span className="pk-cmd__meta">{it.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
