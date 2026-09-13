import type { FaqItem } from "@/lib/seo";

export function ModelFaq({
  items,
  title = "자주 묻는 질문",
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (!items.length) return null;

  return (
    <section
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      aria-labelledby="model-faq-heading"
    >
      <h2 id="model-faq-heading" className="mb-4 text-base font-semibold text-foreground">
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-slate-100 bg-slate-50/60 p-4 open:bg-white"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                <span>{item.question}</span>
                <span className="shrink-0 text-muted-foreground transition group-open:rotate-180">▾</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
