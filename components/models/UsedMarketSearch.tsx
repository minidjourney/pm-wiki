import { Search } from "lucide-react";
import { uiCopy } from "@/lib/ui-copy";

type Platform = {
  name: string;
  href: (q: string) => string;
  className: string;
};

const KO_PLATFORMS: Platform[] = [
  {
    name: "당근마켓",
    href: (q) => `https://www.daangn.com/search/${encodeURIComponent(q)}`,
    className:
      "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800 dark:hover:bg-orange-900/40",
  },
  {
    name: "번개장터",
    href: (q) => `https://m.bunjang.co.kr/search/products?q=${encodeURIComponent(q)}`,
    className:
      "bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800 dark:hover:bg-red-900/40",
  },
  {
    name: "중고나라",
    href: (q) => `https://web.joongna.com/search?keyword=${encodeURIComponent(q)}`,
    className:
      "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800 dark:hover:bg-emerald-900/40",
  },
];

/** EN: English-speaking markets only (eBay + Facebook Marketplace). */
const EN_PLATFORMS: Platform[] = [
  {
    name: "eBay",
    href: (q) =>
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
    className:
      "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-900/40",
  },
  {
    name: "Facebook Marketplace",
    href: (q) =>
      `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(q)}`,
    className:
      "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800 dark:hover:bg-indigo-900/40",
  },
];

interface UsedMarketSearchProps {
  modelName: string;
  locale?: "ko" | "en" | "ja";
}

export function UsedMarketSearch({
  modelName,
  locale = "ko",
}: UsedMarketSearchProps) {
  const t = uiCopy(locale === "ja" ? "ja" : locale);
  const platforms = locale === "en" ? EN_PLATFORMS : KO_PLATFORMS;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {t.findListings}
        </h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {t.findListingsHint(modelName)}
      </p>
      <div className="flex flex-wrap gap-3">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.href(modelName)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${p.className}`}
          >
            {p.name}
          </a>
        ))}
      </div>
    </section>
  );
}
