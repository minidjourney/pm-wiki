import Link from "next/link";
import type { Metadata } from "next";
import { listGuides, guidePath } from "@/lib/guides";
import { hreflangLanguages } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "구매 가이드",
  description:
    "중고·신품 퍼스널 모빌리티 고르는 법, 체크리스트, 카테고리별 가이드",
  alternates: {
    canonical: `${SITE_URL}/guides`,
    languages: hreflangLanguages("/guides", "/en/guides"),
  },
};

export default function GuidesIndexPage() {
  const guides = listGuides();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        구매 가이드
      </h1>
      <p className="mt-3 text-muted-foreground">
        템플릿 스펙만으로 끝나지 않는, 편집자가 쓴 구매·중고 가이드입니다.
      </p>
      <ul className="mt-10 space-y-4">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={guidePath(g.slug, "ko")}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {g.title.ko}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {g.description.ko}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{g.publishedAt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
