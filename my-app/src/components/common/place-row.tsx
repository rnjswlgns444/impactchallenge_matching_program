import Link from "next/link";
import { ChevronRightIcon, StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// 누르면 다른 화면으로 가는 흰 카드. 앞에 그림(lead)을 두고, 큰 글(기관 이름) 아래에 작은 글을 둔다.
// 결과 화면의 기관 줄, 다른 곳 목록, '더 보기'의 줄에 쓴다.

export function PlaceRow({
  href,
  title,
  sub,
  badge,
  star,
  lead,
  number,
}: {
  href: string;
  title: string;
  sub?: string; // 이름 아래의 작은 글(종류와 거리 등)
  badge?: string; // 이름 위의 작은 딱지
  star?: string; // 주면 이름 앞에 별을 붙이고 노란 테두리를 두른다. 값은 별을 읽어 주는 말이다
  lead?: React.ReactNode; // 맨 앞의 그림(기관 종류 그림 등)
  number?: number | null; // 지도의 번호. 그림 위에 작은 동그라미로 붙는다
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[3.3rem] items-center gap-[0.65rem] rounded-xl border border-edge bg-card px-[0.8rem] py-[0.6rem] shadow-card transition-all hover:border-teal active:translate-y-px active:bg-aqua active:shadow-none",
        star ? "border-2 border-cta" : ""
      )}
    >
      {lead ? (
        <span className="relative shrink-0">
          {lead}
          {number ? (
            <span
              aria-hidden="true"
              className="absolute -top-[0.3rem] -left-[0.3rem] grid size-[1.1rem] place-items-center rounded-full bg-ink text-[0.65rem] leading-none font-extrabold text-white ring-2 ring-white"
            >
              {number}
            </span>
          ) : null}
        </span>
      ) : null}
      <span className="flex flex-1 flex-col gap-[0.1rem]">
        {badge ? (
          <span className="mb-[0.15rem] self-start rounded-full bg-aqua px-[0.5rem] py-[0.05rem] text-[0.7rem] leading-[1.5] font-bold text-teal">
            {badge}
          </span>
        ) : null}
        <span className="text-[1rem] leading-[1.35] font-bold text-ink">
          {star ? (
            <StarIcon
              role="img"
              aria-label={star}
              className="mr-[0.25rem] inline size-[1rem] -translate-y-[0.1rem] fill-cta text-cta-border"
            />
          ) : null}
          {title}
        </span>
        {sub ? <span className="text-[0.8rem] leading-[1.45] text-muted-foreground">{sub}</span> : null}
      </span>
      <ChevronRightIcon aria-hidden="true" className="size-[1.2rem] shrink-0 text-teal" />
    </Link>
  );
}
