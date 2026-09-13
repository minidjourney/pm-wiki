import { Search } from "lucide-react";

const PLATFORMS = [
  {
    name: "당근마켓",
    href: (q: string) => `https://www.daangn.com/search/${encodeURIComponent(q)}`,
    className: "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800 dark:hover:bg-orange-900/40",
  },
  {
    name: "번개장터",
    href: (q: string) => `https://m.bunjang.co.kr/search/products?q=${encodeURIComponent(q)}`,
    className: "bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800 dark:hover:bg-red-900/40",
  },
  {
    name: "중고나라",
    href: (q: string) => `https://web.joongna.com/search?keyword=${encodeURIComponent(q)}`,
    className: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800 dark:hover:bg-emerald-900/40",
  },
] as const;

interface UsedMarketSearchProps {
  modelName: string;
  locale?: "ko" | "en";
}

export function UsedMarketSearch({
  modelName,
  locale = "ko",
}: UsedMarketSearchProps) {
  const isEn = locale === "en";
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {isEn ? "🔍 Find used listings" : "🔍 실시간 중고 매물 찾아보기"}
        </h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {isEn
          ? <>Opens search results for &quot;{modelName}&quot; on each Korean marketplace.</>
          : <>클릭 시 해당 플랫폼에서 &quot;{modelName}&quot; 검색 결과로 이동합니다.</>}
      </p>
      <div className="flex flex-wrap gap-3">
        {PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.href(modelName)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${p.className}`}
          >
            {p.name}
          </a>
        ))}
      </div>
    </section>
  );
}
