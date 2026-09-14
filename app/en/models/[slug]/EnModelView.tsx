import type { ReactElement } from "react";
import Image from "next/image";
import { DollarSign, Sparkles } from "lucide-react";
import { PriceChart } from "@/components/models/PriceChart";
import { UsedMarketSearch } from "@/components/models/UsedMarketSearch";
import { JsonLd } from "@/components/models/JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_URL } from "@/lib/site";
import { CATEGORY_LABELS, shouldShowSubModel } from "@/lib/locale";
import type { FaqItem } from "@/lib/seo";
import { EnModelSections } from "./EnModelSections";

export type EnModelViewProps = {
  model: any;
  displayName: string;
  t: any;
  oneLineSummary: string | null;
  answerCapsule: string;
  faqs: FaqItem[];
  defects: any[];
  checklist: any[];
  pros: string[];
  cons: string[];
  brakeType: string | null;
  suspensionType: string | null;
  batteryCheckMethod: string | null;
  chargerSpec: string | null;
  dimensions: string | null;
  specCards: { label: string; value: string | number; icon: ReactElement }[];
};

export function EnModelView({
  model,
  displayName,
  t,
  oneLineSummary,
  answerCapsule,
  faqs,
  defects,
  checklist,
  pros,
  cons,
  brakeType,
  suspensionType,
  batteryCheckMethod,
  chargerSpec,
  dimensions,
  specCards,
}: EnModelViewProps) {
  return (
    <>
      <JsonLd
        model={{
          ...model,
          model_name: displayName,
          one_line_summary: oneLineSummary,
          brake_type: brakeType,
          suspension_type: suspensionType,
          chronic_defects: defects,
          used_checklist: checklist,
          battery_check_method: batteryCheckMethod,
          charger_spec: chargerSpec,
          dimensions,
        }}
        faqs={faqs}
        locale="en"
      />
      <main className="min-h-screen bg-slate-50/80 pb-12 md:max-w-2xl md:mx-auto">
        <section className="border-b border-slate-100 bg-white px-4 pt-5 pb-5">
          <p className="text-sm font-medium text-muted-foreground">{model.manufacturer}</p>
          <h1 className="mt-0.5 text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {displayName}
            {shouldShowSubModel(displayName, model.sub_model) && (
              <span className="ml-1.5 text-xl font-normal text-muted-foreground">{model.sub_model}</span>
            )}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {CATEGORY_LABELS.en[model.category] || model.category}
            </span>
            {model.is_discontinued && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{t.discontinued}</span>
            )}
          </div>
          <nav aria-label="breadcrumb" className="mt-3 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <a href={`${SITE_URL}/en`} className="hover:text-foreground">Home</a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{displayName}</li>
            </ol>
          </nav>
          <p className="mt-4 text-sm leading-relaxed text-foreground" data-speakable="true">
            {answerCapsule}
          </p>
          {oneLineSummary && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="size-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">{t.expertComment}</span>
              </div>
              <p className="text-base font-medium leading-relaxed text-foreground">{oneLineSummary}</p>
            </div>
          )}
        </section>

        {model.image_url && !model.image_url.includes('placeholder') && (
          <div className="px-4 pt-6">
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/50 p-8 shadow-inner dark:from-slate-800/50 dark:to-slate-900/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4/5 w-4/5 rounded-full bg-white/60 blur-3xl dark:bg-blue-900/20"></div>
              </div>
              <div className="relative z-10 w-full max-w-[280px] drop-shadow-2xl sm:max-w-[340px]">
                <Image
                  src={model.image_url}
                  alt={displayName}
                  width={800}
                  height={800}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 px-4 pt-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{t.priceAnalysis}</h2>
            </div>
            <PriceChart
              originalPrice={model.original_price ?? 0}
              usedPriceMin={model.used_price_min}
              usedPriceMax={model.used_price_max}
              locale="en"
              originalPriceUsd={model.original_price_usd}
              usedPriceMinUsd={model.used_price_min_usd}
              usedPriceMaxUsd={model.used_price_max_usd}
            />
          </section>

          <AdSlot slot="model-mid" className="min-h-[90px] w-full overflow-hidden rounded-xl" />

          <UsedMarketSearch modelName={displayName} locale="en" />

          <EnModelSections
            model={model}
            t={t}
            faqs={faqs}
            defects={defects}
            checklist={checklist}
            pros={pros}
            cons={cons}
            batteryCheckMethod={batteryCheckMethod}
            chargerSpec={chargerSpec}
            specCards={specCards}
          />
        </div>
      </main>
    </>
  );
}
