import Link from "next/link";
import type { Guide } from "@/lib/guides";
import type { LocaleCode } from "@/lib/locale";
import { guidesIndexPath } from "@/lib/guides";

type Props = {
  guide: Guide;
  locale: LocaleCode;
};

/**
 * Skeleton article layout for Design to refine:
 * large H1, TOC (collapsible on mobile via details), checklist cards,
 * related-model slot, bottom CTAs.
 */
export function GuideArticle({ guide, locale }: Props) {
  const lang = locale === "en" ? "en" : "ko";
  const title = guide.title[lang];
  const compareHref = locale === "en" ? "/en" : "/";
  const tocLabel = lang === "en" ? "On this page" : "목차";
  const checklistLabel = lang === "en" ? "Checklist" : "체크리스트";
  const relatedLabel =
    lang === "en" ? "Related models (slot)" : "관련 모델 (슬롯)";
  const ctaCompare = lang === "en" ? "Browse models" : "모델 둘러보기";
  const ctaGuides = lang === "en" ? "All guides" : "가이드 목록";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm text-muted-foreground">
        <Link href={guidesIndexPath(locale)} className="hover:text-primary">
          {ctaGuides}
        </Link>
      </p>

      <article>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {guide.description[lang]}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{guide.publishedAt}</p>

        <details className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 open:pb-3 dark:border-slate-800 dark:bg-slate-900/50 md:open">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            {tocLabel}
          </summary>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {guide.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-primary">
                  {s.title[lang]}
                </a>
              </li>
            ))}
          </ol>
        </details>

        <div className="mt-10 space-y-12">
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {section.title[lang]}
              </h2>
              {section.paragraphs[lang].map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="mt-3 text-base leading-relaxed text-foreground/90"
                >
                  {p}
                </p>
              ))}
              {section.checklist && section.checklist[lang].length > 0 ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {checklistLabel}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {section.checklist[lang].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 text-[10px] dark:border-slate-600"
                        >
                          ☐
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-foreground">{relatedLabel}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "en"
              ? "Hook ModelCard rail here (relatedModelSlugs)."
              : "여기에 기존 ModelCard 레일 연결 (relatedModelSlugs)."}
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={compareHref}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {ctaCompare}
          </Link>
          <Link
            href={guidesIndexPath(locale)}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-foreground dark:border-slate-700"
          >
            {ctaGuides}
          </Link>
        </div>
      </article>
    </main>
  );
}
