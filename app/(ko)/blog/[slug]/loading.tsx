import { Loader2 } from "lucide-react";

export default function BlogPostLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <div className="h-9 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="mt-8 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
            style={{ width: i === 3 ? "80%" : "100%" }}
          />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      </div>
    </main>
  );
}
