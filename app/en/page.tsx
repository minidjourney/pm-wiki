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
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-5 py-16 text-center sm:py-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
          English
        </p>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Coming soon
        </h1>
        <p className="mb-2 max-w-md text-base text-muted-foreground sm:text-lg">
          English pages will live under{" "}
          <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-800">/en</code>.
        </p>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
          Product names will use the English field once those routes are live.
          Korean remains the default site.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Korean
        </Link>
      </section>
    </main>
  );
}
