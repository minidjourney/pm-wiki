"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LOCALES,
  getLocaleFromPath,
  hrefForLocale,
  withSearchParams,
  type LocaleCode,
} from "@/lib/locale";

interface LanguageSwitcherProps {
  /** header: compact dropdown on mobile, segmented control from sm+ */
  variant?: "header" | "menu";
}

function localeMeta(code: LocaleCode) {
  return LOCALES.find((l) => l.code === code)!;
}

function LocaleLink({
  code,
  pathname,
  searchParams,
  selected,
  className,
  children,
}: {
  code: LocaleCode;
  pathname: string;
  searchParams: { get: (k: string) => string | null; toString: () => string };
  selected: boolean;
  className: string;
  children: ReactNode;
}) {
  const meta = localeMeta(code);
  const href = withSearchParams(hrefForLocale(code, pathname), searchParams);
  return (
    <Link
      href={href}
      hrefLang={code}
      lang={code}
      aria-current={selected ? "page" : undefined}
      aria-label={`${meta.label}${selected ? " (selected)" : ""}`}
      title={meta.label}
      className={className}
    >
      {children}
    </Link>
  );
}

export function LanguageSwitcher({ variant = "header" }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const current = getLocaleFromPath(pathname);
  const currentMeta = localeMeta(current);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (variant === "menu") {
    return (
      <nav aria-label="Language" className="flex flex-col gap-1">
        <p className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Language
        </p>
        {LOCALES.map((locale) => {
          const selected = current === locale.code;
          return (
            <LocaleLink
              key={locale.code}
              code={locale.code}
              pathname={pathname}
              searchParams={searchParams}
              selected={selected}
              className={cn(
                "flex min-h-11 items-center justify-between rounded-lg px-4 text-sm font-medium transition-colors",
                selected
                  ? "bg-blue-600 text-white"
                  : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <span>
                <span className="mr-2 text-xs font-semibold opacity-80">
                  {locale.shortLabel}
                </span>
                {locale.label}
              </span>
              {selected ? <Check className="size-4" aria-hidden /> : null}
            </LocaleLink>
          );
        })}
      </nav>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Mobile: one control instead of three cramped chips */}
      <div className="sm:hidden">
        <button
          type="button"
          aria-label={`Language: ${currentMeta.label}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
        >
          <Globe className="size-4 text-blue-600 dark:text-blue-400" aria-hidden />
          <span>{currentMeta.shortLabel}</span>
          <ChevronDown
            className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
        {open ? (
          <ul
            id={menuId}
            role="listbox"
            aria-label="Language"
            className="absolute right-0 top-full z-50 mt-1.5 min-w-[11.5rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {LOCALES.map((locale) => {
              const selected = current === locale.code;
              return (
                <li key={locale.code} role="option" aria-selected={selected}>
                  <LocaleLink
                    code={locale.code}
                    pathname={pathname}
                    searchParams={searchParams}
                    selected={selected}
                    className={cn(
                      "flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium",
                      selected
                        ? "bg-blue-600 text-white"
                        : "text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <span>
                      <span className="mr-2 text-xs font-semibold opacity-80">
                        {locale.shortLabel}
                      </span>
                      {locale.label}
                    </span>
                    {selected ? <Check className="size-4" aria-hidden /> : null}
                  </LocaleLink>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {/* sm+: segmented control with a clear selected fill */}
      <nav
        aria-label="Language"
        className="hidden items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700 sm:inline-flex"
      >
        <span
          className="inline-flex min-h-11 min-w-9 items-center justify-center text-muted-foreground"
          aria-hidden
        >
          <Globe className="size-4" />
        </span>
        {LOCALES.map((locale) => {
          const selected = current === locale.code;
          return (
            <LocaleLink
              key={locale.code}
              code={locale.code}
              pathname={pathname}
              searchParams={searchParams}
              selected={selected}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm transition-colors",
                selected
                  ? "bg-blue-600 font-semibold text-white shadow-sm"
                  : "font-medium text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-900"
              )}
            >
              {locale.label}
            </LocaleLink>
          );
        })}
      </nav>
    </div>
  );
}
