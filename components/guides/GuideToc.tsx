"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

type Props = {
  items: TocItem[];
  title?: string;
};

/**
 * Mobile-first collapsible TOC. Closed by default on small screens;
 * open by default from md breakpoint up (via matchMedia).
 */
export function GuideToc({ items, title = "목차" }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!items.length) return null;

  return (
    <nav
      aria-label={title}
      className="mt-8 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50"
    >
      <details
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        className="group"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          <span>{title}</span>
          <span
            className="text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            ▾
          </span>
        </summary>
        <ol className="space-y-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white hover:text-primary dark:hover:bg-slate-800"
              >
                <span className="mr-2 tabular-nums text-xs text-slate-400">
                  {i + 1}.
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
