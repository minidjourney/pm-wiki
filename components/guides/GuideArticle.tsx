import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { RelatedModels } from "@/components/blog/RelatedModels";
import type { Guide } from "@/lib/guides";
import { guidesIndexPath } from "@/lib/guides";
import type { LocaleCode } from "@/lib/locale";
import { markdownToHtml } from "@/lib/markdown";

type Props = {
  guide: Guide;
  locale: LocaleCode;
};

/**
 * Guide article shell for Design to refine:
 * intro → TOC → body (checklist / red flags / FAQ in markdown) →
 * related-model rail → soft CTA.
 */
export async function GuideArticle({ guide, locale }: Props) {
  const lang = locale === "en" ? "en" : "ko";
  const title = guide.title[lang];
  const description = guide.description[lang];
  const homeHref = locale === "en" ? "/en" : "/";
  const ctaModels = lang === "en" ? "Browse models" : "모델 둘러보기";
  const ctaGuides = lang === "en" ? "All guides" : "가이드 목록";

  let bodyHtml = "";
  if (guide.markdownPath && lang === "ko") {
    try {
      const full = path.join(process.cwd(), guide.markdownPath);
      const raw = await readFile(full, "utf8");
      bodyHtml = markdownToHtml(raw);
    } catch {
      bodyHtml = "";
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm text-muted-foreground">
        <Link href={guidesIndexPath(locale)} className="hover:text-primary">
          {ctaGuides}
        </Link>
      </p>

      <article>
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{guide.publishedAt}</p>
        </header>

        {bodyHtml ? (
          <div
            className="prose prose-slate mt-10 max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary prose-table:text-sm"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          <p className="mt-10 text-muted-foreground">
            {lang === "en"
              ? "Korean editorial body is live on /guides; EN translation forthcoming."
              : "본문을 불러오지 못했습니다."}
          </p>
        )}

        {guide.relatedModelSlugs.length > 0 ? (
          <RelatedModels slugs={guide.relatedModelSlugs} />
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {ctaModels}
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
