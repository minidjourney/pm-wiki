import Link from "next/link";
import Image from "next/image";
import type { PmModel } from "@/types/database";
import type { LocaleCode } from "@/lib/locale";
import { displayModelName, localePath } from "@/lib/locale";
import { uiCopy } from "@/lib/ui-copy";

function priceLabel(model: PmModel, locale: LocaleCode): string {
  if (locale === "en") {
    const min = model.used_price_min_usd;
    const max = model.used_price_max_usd;
    if (min != null && max != null && min > 0 && max > 0) {
      return `$${Math.round(min).toLocaleString("en-US")}–$${Math.round(max).toLocaleString("en-US")}`;
    }
    if (model.original_price_usd != null && model.original_price_usd > 0) {
      return `$${Math.round(model.original_price_usd).toLocaleString("en-US")}`;
    }
    return "Price TBD";
  }
  const p = model.original_price;
  if (p != null && p > 0) {
    if (p >= 10000) return `${(p / 10000).toFixed(0)}만 원`;
    return `${p.toLocaleString()}원`;
  }
  return "가격 정보 없음";
}

export function SimilarModelsRail({
  models,
  locale = "ko",
}: {
  models: PmModel[];
  locale?: LocaleCode;
}) {
  if (!models.length) return null;
  const t = uiCopy(locale === "ja" ? "ja" : locale);

  return (
    <section className="border-t border-slate-100 bg-white px-4 py-6" aria-labelledby="similar-models-heading">
      <h2 id="similar-models-heading" className="mb-3 text-base font-semibold text-foreground">
        {t.similarModels}
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory [scrollbar-width:thin]">
        {models.map((model) => {
          const name = displayModelName(model, locale === "ja" ? "ko" : locale);
          const href = localePath(`/models/${model.slug}`, locale === "ja" ? "ko" : locale);
          const img = model.image_url && !model.image_url.includes("placeholder") ? model.image_url : null;
          return (
            <Link
              key={model.id}
              href={href}
              className="snap-start shrink-0 w-[9.5rem] rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 shadow-sm transition hover:border-blue-200 hover:bg-white"
            >
              <div className="relative mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-100 to-slate-200/60">
                {img ? (
                  <Image src={img} alt={name} width={160} height={160} className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">{name}</p>
              <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                {priceLabel(model, locale === "ja" ? "ko" : locale)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
