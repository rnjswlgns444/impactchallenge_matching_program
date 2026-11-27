import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { text } from "@/content/text";
import { cn } from "@/lib/utils";

// 화살표만 보이는 돌아가기 단추. 이름('뒤로')은 화면 읽기 도구가 읽는다.

export function BackLink({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={text.backLabel}
      className={cn(
        "grid size-[2.3rem] shrink-0 place-items-center rounded-full border border-edge bg-card text-teal shadow-card hover:border-teal active:translate-y-px",
        className
      )}
    >
      <ArrowLeftIcon aria-hidden="true" className="size-[1.2rem]" />
    </Link>
  );
}
