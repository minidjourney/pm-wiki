"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPath } from "@/lib/locale";
import { uiCopy } from "@/lib/ui-copy";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const locale = getLocaleFromPath(usePathname() ?? "/");
  const t = uiCopy(locale);

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {t.siteName}. {t.footerTagline}
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-foreground">
            {t.privacy}
          </Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-foreground">
            {t.terms}
          </Link>
          <Link href="/blog" className="inline-flex min-h-11 items-center hover:text-foreground">
            {t.blog}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
