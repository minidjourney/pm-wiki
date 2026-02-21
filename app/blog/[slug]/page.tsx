import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { BlogPost } from "@/types/database";
import { RelatedModels } from "@/components/blog/RelatedModels";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "글 없음 - 퍼모위키" };
  return {
    title: `${data.title} - 퍼모위키`,
    description: (data as { title: string }).title,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) notFound();

  const typedPost = post as BlogPost;
  const relatedSlugs = typedPost.related_models ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <article>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {typedPost.title}
        </h1>
        {typedPost.created_at && (
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(typedPost.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <div
          className="prose prose-slate mt-8 dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: typedPost.content ?? "" }}
        />
        <RelatedModels slugs={relatedSlugs} />
      </article>
    </main>
  );
}
