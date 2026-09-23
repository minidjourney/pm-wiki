import Link from "next/link";
import type { Metadata } from "next";
import { listGuides, guidePath } from "@/lib/guides";
import { hreflangLanguages } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Buying Guides",
  description:
    "Editor-written checklists and buying guides for personal mobility — used and new.",
  alternates: {
    canonical: `${SITE_URL}/en/guides`,
    languages: hreflangLanguages("/guides", "/en/guides"),
  },
};

export default function EnGuidesIndexPage() {
  const guides = listGuides();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Buying Guides
      </h1>
      <p className="mt-3 text-muted-foreground">
        Editor-written guides — not just template spec sheets.
      </p>
      <ul className="mt-10 space-y-4">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={guidePath(g.slug, "en")}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {g.title.en}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {g.description.en}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{g.publishedAt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
