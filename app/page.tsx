import { createClient } from "@/lib/supabase/server";
import { ModelGrid } from "@/components/home/ModelGrid";
import type { PmModel } from "@/types/database";

export default async function Home() {
  const supabase = await createClient();
  const { data: models, error } = await supabase
    .from("pm_models")
    .select("*")
    .eq("status", "published")
    .order("release_year", { ascending: false, nullsFirst: false })
    .order("used_price_a", { ascending: true, nullsFirst: false });

  const publishedModels = (models ?? []) as PmModel[];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero 배너 */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50/50 px-4 py-16 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            내게 딱 맞는 퍼스널 모빌리티 찾기,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
              퍼모위키
            </span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            스펙 비교부터 중고 적정가, 고질병까지 한 번에 확인하세요.
          </p>
        </div>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
        </div>
      </section>

      {/* 카탈로그 섹션 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-200">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
          </div>
        ) : publishedModels.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-muted-foreground">
              등록된 기기가 아직 없습니다.
            </p>
          </div>
        ) : (
          <ModelGrid models={publishedModels} />
        )}
      </section>
    </main>
  );
}
