import type { ReactElement } from "react";
import { localizeKoDuration } from "@/lib/ui-copy";
import {
  ListChecks,
  Plug,
  Smartphone,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react";
import { ChecklistAccordion } from "@/components/models/ChecklistAccordion";
import { ModelFaq } from "@/components/models/ModelFaq";
import { AdSlot } from "@/components/ads/AdSlot";
import type { FaqItem } from "@/lib/seo";

export type EnModelSectionsProps = {
  model: any;
  t: any;
  faqs: FaqItem[];
  defects: any[];
  checklist: any[];
  pros: string[];
  cons: string[];
  batteryCheckMethod: string | null;
  chargerSpec: string | null;
  specCards: { label: string; value: string | number; icon: ReactElement }[];
};

export function EnModelSections({
  model,
  t,
  faqs,
  defects,
  checklist,
  pros,
  cons,
  batteryCheckMethod,
  chargerSpec,
  specCards,
}: EnModelSectionsProps) {
  return (
    <>
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">{t.keySpecs}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specCards.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {s.icon}
                    <span className="text-xs font-medium">{s.label}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          {(chargerSpec || model.app_integration_available != null || batteryCheckMethod) && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Plug className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">{t.deviceTips}</h2>
              </div>
              <div className="space-y-3">
                {model.app_integration_available != null && (
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <span className={model.app_integration_available ? "rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800" : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"}>
                      {model.app_integration_available ? t.appSupported : t.appUnsupported}
                    </span>
                  </div>
                )}
                {chargerSpec && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t.chargerSpec}</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{localizeKoDuration(chargerSpec, "en")}</p>
                  </div>
                )}
                {batteryCheckMethod && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t.batteryCheck}</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{batteryCheckMethod}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {(pros.length > 0 || cons.length > 0) && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">{t.prosCons}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pros.length > 0 && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2"><ThumbsUp className="size-4 text-emerald-600" /><span className="text-sm font-semibold">{t.pros}</span></div>
                    <ul className="space-y-1.5 text-sm text-emerald-800">{pros.map((p: string, i: number) => <li key={i}>· {p}</li>)}</ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2"><ThumbsDown className="size-4 text-red-600" /><span className="text-sm font-semibold">{t.cons}</span></div>
                    <ul className="space-y-1.5 text-sm text-red-800">{cons.map((c: string, i: number) => <li key={i}>· {c}</li>)}</ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {defects.length > 0 && (
            <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2"><AlertTriangle className="size-4 text-red-600" /><h2 className="text-base font-semibold text-foreground">{t.knownIssues}</h2></div>
              <ul className="space-y-3">
                {defects.map((d: any, i: number) => {
                  const defectText = typeof d === 'object' && d !== null ? d.issue : d;
                  return (
                    <li key={i} className="rounded-xl border border-red-200/80 bg-red-50/80 p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-900">{t.caution}</span>
                        <p className="text-sm font-medium leading-relaxed text-red-950">{defectText}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {checklist.length > 0 && (
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2"><ListChecks className="size-4 text-muted-foreground" /><h2 className="text-base font-semibold text-foreground">{t.checklist}</h2></div>
              <ChecklistAccordion items={checklist} locale="en" />
            </section>
          )}

          <AdSlot slot="model-bottom" className="min-h-[90px] w-full overflow-hidden rounded-xl" />

          <ModelFaq items={faqs} title={t.faq} />
    </>
  );
}
