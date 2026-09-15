import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ModelGrid } from "@/components/home/ModelGrid";
import { CategoryTop10 } from "@/components/home/CategoryTop10";
import { AdSlot } from "@/components/ads/AdSlot";
import type { Metadata } from "next";
import type { PmModel } from "@/types/database";
import { SITE_URL } from "@/lib/site";
import { hreflangLanguages } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Personal Mobility Used Prices & Specs",
  description:
    "Compare e-kickboards, e-bikes, scooters, and unicycles — Korean used-market prices, specs, and known issues. Pumo Wiki.",
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: hreflangLanguages("/", "/en"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/en`,
    siteName: "Pumo Wiki",
    title: "Pumo Wiki | Personal Mobility Used Prices & Specs",
    description:
      "Compare e-kickboards, e-bikes, scooters, and unicycles — used prices, specs, and known issues.",
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

function ModelGridFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-11 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </div>
  );
}

export default async function EnglishHome() {
  const supabase = await createClient();
  const { data: models, error } = await supabase
    .from("pm_models")
    .select("*")
    .eq("status", "published")
    .order("release_year", { ascending: false, nullsFirst: false })
    .order("used_price_min", { ascending: true, nullsFirst: false });

  const publishedModels = (models ?? []) as PmModel[];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950" lang="en">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50/50 px-4 py-16 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Find the right personal mobility,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
              Pumo Wiki
            </span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Specs, Korean used-market prices, and known issues — in one place.
          </p>
        </div>
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-6">
        <AdSlot slot="home-mid" className="min-h-[90px] w-full overflow-hidden rounded-xl" />
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-4">
        {!error && publishedModels.length > 0 ? (
          <CategoryTop10 models={publishedModels} locale="en" />
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-200">
              Failed to load models. Please try again later.
            </p>
          </div>
        ) : publishedModels.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-muted-foreground">No published models yet.</p>
          </div>
        ) : (
          <Suspense fallback={<ModelGridFallback />}>
            <ModelGrid models={publishedModels} />
          </Suspense>
        )}
      </section>
    </main>
  );
}
