"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { Menu, Search, Scale } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { SearchModal } from "./SearchModal";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCompareStore, MAX_COMPARE_COUNT } from "@/store/useCompareStore";
import { CATEGORY_LABELS, getLocaleFromPath, localePath, resolveClientLocale, type LocaleCode } from "@/lib/locale";
import { uiCopy } from "@/lib/ui-copy";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const [locale, setLocale] = useState<LocaleCode>(() => getLocaleFromPath(pathname));
  const compareCount = useCompareStore((s) => s.items.length);
  const t = uiCopy(locale);
  const homeHref = localePath("/", locale);
  const labels = CATEGORY_LABELS[locale === "ja" ? "ko" : locale];

  useEffect(() => {
    setLocale(resolveClientLocale(pathname));
  }, [pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const compareIcon = (
    <>
      <Scale className="size-5" />
      {compareCount > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold leading-none text-white">
          {compareCount}
        </span>
      ) : null}
      <span className="sr-only">
        {t.compareTray(compareCount, MAX_COMPARE_COUNT)}
      </span>
    </>
  );

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <Link
            href={homeHref}
            className="inline-flex min-h-11 items-center text-lg font-bold text-blue-600 transition-colors hover:text-blue-700 sm:text-xl dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t.siteName}
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <Suspense fallback={<div className="inline-flex h-11 min-w-[4.5rem] rounded-lg border border-slate-200 dark:border-slate-700" aria-hidden />}>
              <LanguageSwitcher />
            </Suspense>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
              aria-label={t.searchAria}
            >
              <Search className="size-5" />
            </button>

            {compareCount >= 2 ? (
              <Link
                href="/compare"
                className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
                aria-label={t.compareTitle}
              >
                {compareIcon}
              </Link>
            ) : (
              <span
                className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground"
                title={t.compareEmptyHint}
              >
                {compareIcon}
              </span>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 md:hidden"
                  aria-label={t.openMenu}
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-left">{t.menu}</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  <Link
                    href={homeHref}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.home}
                  </Link>
                  {(
                    [
                      ["kickboard", labels.kickboard],
                      ["ebike", labels.ebike],
                      ["scooter", labels.scooter],
                      ["unicycle", labels.unicycle],
                    ] as const
                  ).map(([cat, label]) => {
                    const href =
                      homeHref === "/"
                        ? `/?category=${cat}`
                        : `${homeHref}?category=${cat}`;
                    return (
                      <Link
                        key={cat}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Suspense fallback={null}>
                    <LanguageSwitcher variant="menu" />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
