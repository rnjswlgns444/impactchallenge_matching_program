import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

// 누르면 다른 화면으로 가는 흰 카드. 큰 글(기관 이름) 아래에 작은 글(하는 일)을 둔다.
// 결과 화면의 기관 카드, 다른 곳 목록, '더 보기'의 줄에 쓴다.

export function PlaceRow({
  href,
  title,
  sub,
  badge,
}: {
  href: string;
  title: string;
  sub?: string;
  badge?: string; // 이름 위의 작은 딱지(언제든 문의할 수 있어요 등)
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[3.3rem] items-center gap-[0.5rem] rounded-xl border border-edge bg-card px-[0.9rem] py-[0.65rem] shadow-card transition-all hover:border-teal active:translate-y-px active:bg-aqua active:shadow-none"
    >
      <span className="flex flex-1 flex-col gap-[0.1rem]">
        {badge ? (
          <span className="mb-[0.15rem] self-start rounded-full bg-aqua px-[0.5rem] py-[0.05rem] text-[0.7rem] leading-[1.5] font-bold text-teal">
            {badge}
          </span>
        ) : null}
        <span className="text-[1rem] leading-[1.35] font-bold text-ink">{title}</span>
        {sub ? <span className="text-[0.8rem] leading-[1.45] text-muted-foreground">{sub}</span> : null}
      </span>
      <ChevronRightIcon aria-hidden="true" className="size-[1.2rem] shrink-0 text-teal" />
    </Link>
  );
}
