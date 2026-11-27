"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// 접힌 줄. 누르면 아래로 펼쳐진다. 여러 줄을 함께 펼쳐 둘 수 있다.
// - box(기본): 줄마다 흰 카드 (결과 화면의 '더 보기')
// - line: 상자 없이 위쪽 가는 줄 (기관 세부 화면)

export function FoldGroup({
  look = "box",
  className,
  children,
}: {
  look?: "box" | "line";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Accordion
      multiple
      data-look={look}
      className={cn("group/fold", look === "box" ? "gap-[0.5rem]" : "", className)}
    >
      {children}
    </Accordion>
  );
}

export function Fold({
  value,
  title,
  children,
}: {
  value: string; // 이 묶음 안에서 겹치지 않는 이름
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="group-data-[look=box]/fold:rounded-xl group-data-[look=box]/fold:border group-data-[look=box]/fold:border-edge group-data-[look=box]/fold:bg-card group-data-[look=box]/fold:shadow-card group-data-[look=box]/fold:not-last:border-b group-data-[look=line]/fold:border-t group-data-[look=line]/fold:border-border group-data-[look=line]/fold:not-last:border-b-0"
    >
      <AccordionTrigger className="min-h-[2.9rem] items-center gap-[0.4rem] py-[0.5rem] text-[0.95rem] leading-snug font-bold text-ink hover:no-underline group-data-[look=box]/fold:px-[0.9rem] group-data-[look=line]/fold:rounded-none **:data-[slot=accordion-trigger-icon]:size-[1.15rem] **:data-[slot=accordion-trigger-icon]:text-teal">
        {title}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-[0.5rem] pb-[0.8rem] text-[0.95rem] leading-[1.6] text-foreground group-data-[look=box]/fold:px-[0.9rem] [&_a]:no-underline [&_p:not(:last-child)]:mb-0">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
