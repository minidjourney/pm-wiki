"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { UsedChecklistItem } from "@/types/database";

interface ChecklistAccordionProps {
  items: UsedChecklistItem[];
}

export function ChecklistAccordion({ items }: ChecklistAccordionProps) {
  if (!items?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        등록된 체크리스트가 없습니다.
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`step-${index}`} className="border-slate-100">
          <AccordionTrigger className="px-1 py-4 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
            <span className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {item.step}
              </span>
              <span className="font-medium">{item.part}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-4 pt-0">
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">
                {item.check_action}
              </p>
              {item.warning_point && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ⚠ {item.warning_point}
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
