import { ArrowRightIcon, PlayIcon, SparklesIcon } from "lucide-react";

import { LinkButton } from "@/components/common/link-button";
import { text } from "@/content/text";
import type { Taste } from "@/core/taste";

// 기관 안내에서는 체험 화면만 연다. 영상은 체험 화면에 들어가야 불러온다.
export function TasteCard({ taste, href }: { taste: Taste; href: string }) {
  const Icon = taste.videos.length ? PlayIcon : SparklesIcon;
  return (
    <section className="flex min-w-0 flex-col gap-[0.6rem] rounded-xl border border-edge bg-card p-[0.9rem] shadow-card">
      <p className="flex items-center gap-[0.35rem] text-[1rem] font-bold text-teal">
        <Icon aria-hidden="true" className="size-[1rem] shrink-0" />
        {text.tasteLabel}
      </p>
      <h2 className="text-[1.15rem] leading-snug font-extrabold text-ink">
        {taste.title ?? text.tasteTitle}
      </h2>
      <p className="text-[1rem] leading-relaxed">{taste.body ?? text.tasteBody}</p>
      <LinkButton href={taste.action.kind === "link" ? taste.action.url : href} variant="outline" className="font-bold text-teal hover:text-teal">
        {text.tasteButton}
        <ArrowRightIcon aria-hidden="true" />
      </LinkButton>
    </section>
  );
}
