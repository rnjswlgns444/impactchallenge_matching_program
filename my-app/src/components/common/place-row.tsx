import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

// 누르면 다른 화면으로 가는 줄. 큰 글(기관 이름) 아래에 작은 글(하는 일)을 둔다.
// 결과 화면의 기관 카드, 다른 곳 목록, '더 보기'의 줄에 쓴다.

export function PlaceRow({
  href,
  title,
  sub,
}: {
  href: string;
  title: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[3.1rem] items-center gap-[0.5rem] rounded-lg border-[1.5px] border-line bg-card px-[0.8rem] py-[0.5rem] hover:border-teal hover:bg-muted active:bg-aqua"
    >
      <span className="flex flex-1 flex-col">
        <span className="text-[0.95rem] leading-[1.35] font-bold text-ink">{title}</span>
        {sub ? <span className="text-[0.8rem] leading-[1.4] text-foreground">{sub}</span> : null}
      </span>
      <ChevronRightIcon aria-hidden="true" className="size-[1.2rem] shrink-0 text-teal" />
    </Link>
  );
}
