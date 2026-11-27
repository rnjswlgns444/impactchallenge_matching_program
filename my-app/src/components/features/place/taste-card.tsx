import { ArrowRightIcon, ImageIcon, PlayIcon, SparklesIcon } from "lucide-react";

import { LinkButton } from "@/components/common/link-button";
import { text } from "@/content/text";
import { tasteKind, type Taste } from "@/core/taste";

// 기관 화면의 체험 카드: 딱지 → 제목 → 설명 → 체험 화면을 여는 단추.
// 해 볼 것이나 팀이 만든 연습이 있으면 '집에서 먼저 체험하기', 영상만 있으면 '영상으로 둘러보기',
// 사진만 있으면 '사진으로 둘러보기'라고 부른다.
// 보여 줄 것이 없는 기관에는 이 카드를 그리지 않는다(부르는 쪽이 taste.ready를 본다).
// 영상과 연습은 체험 화면에 들어가야 불러온다. 노란 주 단추는 전화 문의에만 쓰므로 이 단추는 테두리 단추다.

const LOOK = {
  do: { Icon: SparklesIcon, label: text.tasteLabel, button: text.tasteButton },
  video: { Icon: PlayIcon, label: text.tasteVideos, button: text.tasteVideoButton },
  photo: { Icon: ImageIcon, label: text.tastePhotos, button: text.tastePhotoButton },
} as const;

export function TasteCard({ taste, href }: { taste: Taste; href: string }) {
  const { Icon, label, button } = LOOK[tasteKind(taste)];
  // 카드에는 맨 앞의 것 하나만 소개한다: 해 볼 것 → 연습 → 영상 → 사진
  const first = taste.tools[0] ?? taste.practice ?? taste.photos[0];
  const video = taste.videos[0];
  const title = taste.tools[0]?.title ?? taste.practice?.title ?? video?.title ?? first?.title;
  const body = taste.tools[0]?.body ?? taste.practice?.body ?? (video ? text.tasteFilmBody : first?.body);
  return (
    <section className="flex min-w-0 flex-col gap-[0.6rem] rounded-xl border border-edge bg-card p-[0.9rem] shadow-card">
      <p className="flex items-center gap-[0.35rem] text-[0.8rem] leading-[1.5] font-bold text-teal">
        <Icon aria-hidden="true" className="size-[0.95rem] shrink-0" />
        {label}
      </p>
      <div className="flex flex-col gap-[0.2rem]">
        <h2 className="text-[1.1rem] leading-[1.35] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
        <p className="text-[0.95rem] leading-[1.6]">{body}</p>
      </div>
      <LinkButton href={href} variant="outline" className="gap-[0.4rem] font-bold text-teal hover:text-teal">
        {button}
        <ArrowRightIcon aria-hidden="true" />
      </LinkButton>
    </section>
  );
}
