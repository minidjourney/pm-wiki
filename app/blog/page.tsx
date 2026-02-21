import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";

export const revalidate = 3600;

export const metadata = {
  title: "블로그 - 퍼모위키",
  description: "퍼스널 모빌리티 구매 가이드, 비교 후기, 시세 정보",
};

export default async function BlogListPage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as BlogPost[];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">
        블로그
      </h1>
      {error ? (
        <p className="text-muted-foreground">목록을 불러오는 중 오류가 발생했습니다.</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">등록된 글이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {post.thumbnail_url ? (
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={post.thumbnail_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800" />
              )}
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-semibold text-foreground group-hover:text-primary line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
