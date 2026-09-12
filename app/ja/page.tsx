import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "日本語 — 準備中",
  description: "パーモウィキの日本語コンテンツは準備中です。",
  robots: { index: false, follow: false },
};

export default function JapaneseComingSoonPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
          日本語
        </p>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          준비 중
        </h1>
        <p className="mb-2 max-w-md text-lg text-muted-foreground">
          準備中です
        </p>
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          日本語ページは今後 <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-800">/ja/...</code> に追加予定です。
          製品名は当面韓国語のまま表示されます。
        </p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          한국어로 돌아가기
        </Link>
      </section>
    </main>
  );
}
