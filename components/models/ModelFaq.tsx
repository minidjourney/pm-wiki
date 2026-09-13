import type { FaqItem } from "@/lib/seo";

export function ModelFaq({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;

  return (
    <section
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      aria-labelledby="model-faq-heading"
    >
      <h2 id="model-faq-heading" className="mb-3 text-base font-semibold text-foreground">
        자주 묻는 질문
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-slate-100 bg-slate-50/60 open:bg-white"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center px-3.5 py-2 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex w-full items-start justify-between gap-3">
                <span className="pt-0.5">{item.question}</span>
                <span className="shrink-0 text-base leading-none text-muted-foreground transition group-open:rotate-180">
                  ▾
                </span>
              </span>
            </summary>
            <p className="px-3.5 pb-3.5 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
