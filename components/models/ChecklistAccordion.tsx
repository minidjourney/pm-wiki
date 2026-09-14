"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { uiCopy } from "@/lib/ui-copy";

interface ChecklistItem {
  title?: string;
  description?: string;
  // 기존에 혹시 다른 이름표(issue, content 등)로 들어왔을 경우를 대비한 방어 코드
  issue?: string; 
  content?: string; 
}


export function ChecklistAccordion({
  items,
  locale = "ko",
}: {
  items: ChecklistItem[];
  locale?: "ko" | "en";
}) {
  if (!items || items.length === 0) return null;
  const t = uiCopy(locale);

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => {
        const title = item.title || item.issue || t.checklistItem(index + 1);
        const content = item.description || item.content || item;

        return (
          <AccordionItem key={index} value={`item-${index}`} className="border-b-slate-100">
            <AccordionTrigger className="min-h-11 py-3 text-sm font-medium hover:no-underline hover:text-blue-600 text-left">
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {index + 1}
                </span>
                {title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground pl-7">
              {typeof content === "string" ? content : t.checklistFallback}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}