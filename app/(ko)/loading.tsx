import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <span className="sr-only">로딩 중</span>
    </div>
  );
}
