import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} 퍼모위키. 퍼스널 모빌리티 중고 시세·스펙 정보.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            이용약관
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            블로그
          </Link>
        </nav>
      </div>
    </footer>
  );
}
