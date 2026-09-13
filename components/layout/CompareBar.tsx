"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X } from "lucide-react";
import { useCompareStore, MAX_COMPARE_COUNT } from "@/store/useCompareStore";

export function CompareBar() {
  const pathname = usePathname() ?? "/";
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  if (items.length === 0) return null;
  if (pathname === "/compare") return null;

  const ready = items.length >= 2;

  return (
    <>
      <div className="h-[4.75rem]" aria-hidden />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 text-xs font-medium text-muted-foreground sm:inline">
              비교함 {items.length}/{MAX_COMPARE_COUNT}
            </span>
            {items.map((item) => (
              <span
                key={item.slug}
                className="inline-flex max-w-[9.5rem] shrink-0 items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1 text-xs font-medium text-foreground dark:bg-slate-800"
              >
                <span className="truncate">{item.model_name}</span>
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-200 hover:text-foreground dark:hover:bg-slate-700"
                  aria-label={`${item.model_name} 제거`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => clear()}
            className="hidden min-h-11 shrink-0 px-2 text-xs text-muted-foreground hover:text-foreground sm:inline"
          >
            비우기
          </button>
          {ready ? (
            <Link
              href="/compare"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Scale className="size-4" aria-hidden />
              비교하기
            </Link>
          ) : (
            <span className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-muted-foreground dark:bg-slate-800">
              1개 더 담기
            </span>
          )}
        </div>
      </div>
    </>
  );
}
