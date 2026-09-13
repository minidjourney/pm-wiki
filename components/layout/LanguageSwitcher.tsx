"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  getLocaleFromPath,
  switchLocalePath,
  withSearchParams,
  type Locale,
} from "@/lib/i18n";

const LOCALES = [
  { code: "ko" as const, label: "한국어", shortLabel: "한" },
  { code: "en" as const, label: "English", shortLabel: "EN" },
  { code: "ja" as const, label: "日本語", shortLabel: "日" },
];

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const current = getLocaleFromPath(pathname);

  return (
    <nav
      aria-label="Language"
      className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700"
    >
      <span className="hidden sm:inline-flex min-h-11 min-w-9 items-center justify-center text-muted-foreground" aria-hidden>
        <Globe className="size-4" />
      </span>
      {LOCALES.map((locale) => {
        const selected = current === locale.code;
        const base = switchLocalePath(pathname, locale.code as Locale);
        const href = withSearchParams(base, searchParams);

        return (
          <Link
            key={locale.code}
            href={href}
            hrefLang={locale.code}
            lang={locale.code}
            aria-current={selected ? "true" : undefined}
            aria-label={`${locale.label}${selected ? " (current)" : ""}`}
            title={locale.code === "ja" ? `${locale.label} — Coming soon` : locale.label}
            className={
              selected
                ? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-slate-100 px-2.5 text-xs font-semibold text-foreground sm:px-3 sm:text-sm dark:bg-slate-800"
                : "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground sm:px-3 sm:text-sm dark:hover:bg-slate-900"
            }
          >
            <span className="sm:hidden">{locale.shortLabel}</span>
            <span className="hidden sm:inline">{locale.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
