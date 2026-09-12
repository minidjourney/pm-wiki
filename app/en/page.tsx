import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "English — Coming soon",
  description: "English content for Pumo Wiki is coming soon.",
  robots: { index: false, follow: false },
};

export default function EnglishComingSoonPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
          English
        </p>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          준비 중
        </h1>
        <p className="mb-2 max-w-md text-lg text-muted-foreground">
          Coming soon
        </p>
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          English pages will live under <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-800">/en/...</code> later.
          Product names stay in Korean for now.
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
