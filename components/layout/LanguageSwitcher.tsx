"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

const LOCALES = [
  { code: "ko", label: "한국어", shortLabel: "한", href: "/" },
  { code: "en", label: "English", shortLabel: "EN", href: "/en" },
  { code: "ja", label: "日本語", shortLabel: "日", href: "/ja" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

function getLocaleFromPath(pathname: string): LocaleCode {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return "ja";
  return "ko";
}

function hrefForLocale(code: LocaleCode, pathname: string): string {
  if (code === "ko") {
    // Keep current Korean path; leave en/ja stubs for home
    if (getLocaleFromPath(pathname) === "ko") return pathname || "/";
    return "/";
  }
  return LOCALES.find((l) => l.code === code)!.href;
}

export function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const current = getLocaleFromPath(pathname);

  return (
    <nav
      aria-label="언어 선택"
      className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700"
    >
      <span className="hidden sm:inline-flex min-h-11 min-w-9 items-center justify-center text-muted-foreground" aria-hidden>
        <Globe className="size-4" />
      </span>
      {LOCALES.map((locale) => {
        const selected = current === locale.code;
        const href = hrefForLocale(locale.code, pathname);

        return (
          <Link
            key={locale.code}
            href={href}
            hrefLang={locale.code === "ko" ? "ko" : locale.code}
            lang={locale.code === "ko" ? "ko" : locale.code}
            aria-current={selected ? "true" : undefined}
            aria-label={`${locale.label}${selected ? " (선택됨)" : ""}`}
            title={locale.code === "ko" ? locale.label : `${locale.label} — 준비 중`}
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
