import { ExternalLinkIcon, PlayIcon, SparklesIcon } from "lucide-react";

import { Fold, FoldGroup } from "@/components/common/fold";
import { LinkButton } from "@/components/common/link-button";
import { fill, text } from "@/content/text";
import type { Taste } from "@/core/taste";

// 기관 화면의 '집에서 먼저 체험하기' 카드: 딱지 → 제목 → 설명 → 단추 → (영상이 있으면) 접힌 줄.
// 무엇을 보여 줄지는 core/taste.ts가 정하고, 여기서는 그리기만 한다.
// 노란 주 단추(전화 문의)는 화면에 하나만 두므로 이 단추는 테두리 단추다.

export function TasteCard({
  taste,
  href,
}: {
  taste: Taste;
  href: string; // 우리 앱 안의 체험 화면 주소. 바깥 주소로 가는 체험이면 쓰지 않는다
}) {
  const outside = taste.action.kind === "link";
  return (
    <section className="flex flex-col gap-[0.6rem] rounded-xl border border-edge bg-card px-[0.9rem] pt-[0.9rem] shadow-card">
      <p className="flex items-center gap-[0.3rem] text-[0.8rem] leading-[1.5] font-bold text-teal">
        <SparklesIcon aria-hidden="true" className="size-[0.95rem]" />
        {text.tasteLabel}
      </p>
      <div className="flex flex-col gap-[0.2rem]">
        <h2 className="text-[1.1rem] leading-[1.35] font-extrabold tracking-[-0.02em] text-ink">
          {taste.title ?? text.tasteTitle}
        </h2>
        <p className="text-[0.95rem] leading-[1.6]">{taste.body ?? text.tasteBody}</p>
      </div>
      <LinkButton
        href={taste.action.kind === "link" ? taste.action.url : href}
        variant="outline"
        className="gap-[0.4rem] font-bold text-teal hover:text-teal"
      >
        {text.tasteButton}
        {outside ? <ExternalLinkIcon aria-hidden="true" /> : null}
      </LinkButton>
      {taste.videos.length > 0 ? (
        <FoldGroup look="line">
          <Fold value="videos" title={text.tasteVideos}>
            <ul className="flex flex-col gap-[0.4rem]">
              {taste.videos.map((video) => (
                <li key={video.url}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[2.9rem] items-center gap-[0.5rem] rounded-xl border border-edge px-[0.7rem] py-[0.45rem] hover:border-teal"
                  >
                    <PlayIcon aria-hidden="true" className="size-[1.1rem] shrink-0 text-teal" />
                    <span className="flex flex-col">
                      <b className="leading-[1.4] font-bold text-ink">{video.title}</b>
                      <span className="text-[0.8rem] leading-[1.5] text-muted-foreground">
                        {fill(text.tasteVideoBy, { by: video.by })}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Fold>
        </FoldGroup>
      ) : (
        <div className="h-[0.3rem]" />
      )}
    </section>
  );
}
