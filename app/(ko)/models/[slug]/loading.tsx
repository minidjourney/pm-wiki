import { Loader2 } from "lucide-react";

export default function ModelLoading() {
  return (
    <main className="min-h-screen bg-slate-50/80 pb-12 md:mx-auto md:max-w-2xl">
      <section className="border-b border-slate-100 bg-white px-4 py-6">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </section>
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">모델 정보 불러오는 중</p>
      </div>
    </main>
  );
}
