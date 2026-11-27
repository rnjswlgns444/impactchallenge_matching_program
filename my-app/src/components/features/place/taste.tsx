"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { ExternalLinkIcon, ImageIcon } from "lucide-react";

import { BackLink } from "@/components/common/back-link";
import { LinkButton } from "@/components/common/link-button";
import { Redirect } from "@/components/common/redirect";
import { fill, text } from "@/content/text";
import { placeName } from "@/core/places";
import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { tasteKind, tasteOf, type TastePhoto, type TasteTool, type TasteVideo } from "@/core/taste";
import type { TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { useViewedType } from "@/hooks/use-viewed-type";
import { placeHref, typeHomeHref } from "@/lib/routes";

const KIND_LABEL = { do: text.tasteLabel, video: text.tasteVideos, photo: text.tastePhotos } as const;

// 연습의 내용은 크기가 커서, 연습이 있는 기관의 체험 화면에서만 불러온다
const PracticePanel = dynamic(() => import("./practice-panel"), { ssr: false, loading: () => <ScreenSkeleton /> });

// 실제 활동 사진이 보이는 공식 페이지 하나(새 창)
function PhotoPanel({ photo }: { photo: TastePhoto }) {
  return (
    <section className="flex min-w-0 flex-col gap-[0.6rem] rounded-xl border border-edge bg-card p-[0.9rem] shadow-card">
      <h2 className="text-[1.25rem] leading-snug font-extrabold text-ink">{photo.title}</h2>
      <p className="text-[1rem] leading-[1.6]">{photo.body}</p>
      <LinkButton href={photo.url} variant="outline" className="gap-[0.4rem] font-bold text-teal hover:text-teal">
        <ImageIcon aria-hidden="true" />
        {text.tastePhotoButton}
      </LinkButton>
      <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">{fill(text.tastePhotoBy, { by: photo.by })}</p>
    </section>
  );
}

// 해 볼 것 하나: 무엇을 해 볼 수 있는지 + 공식 화면을 여는 단추(새 창)
function ToolPanel({ tool }: { tool: TasteTool }) {
  return (
    <section className="flex min-w-0 flex-col gap-[0.6rem] rounded-xl border border-edge bg-card p-[0.9rem] shadow-card">
      <h2 className="text-[1.25rem] leading-snug font-extrabold text-ink">{tool.title}</h2>
      <p className="text-[1rem] leading-[1.6]">{tool.body}</p>
      <LinkButton href={tool.url} variant="cta" className="gap-[0.4rem]">
        {tool.linkLabel}
        <ExternalLinkIcon aria-hidden="true" />
      </LinkButton>
      <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">{fill(text.tasteToolBy, { by: tool.by })}</p>
    </section>
  );
}

function FilmPanel({ video }: { video: TasteVideo }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    // 숨겨진 화면에 남은 플레이어가 계속 재생되지 않게 한다.
    const pending = requestAnimationFrame(() => frame.setAttribute("src", video.url));
    return () => {
      cancelAnimationFrame(pending);
      frame.removeAttribute("src");
    };
  }, [video.url]);
  return (
    <section className="grid min-w-0 gap-[0.6rem] rounded-xl border border-edge bg-card p-[0.8rem] shadow-card">
      <h2 className="text-[1.25rem] leading-snug font-bold">{video.title}</h2>
      <p className="text-[1rem] text-muted-foreground">{fill(text.tasteVideoBy, { by: video.by })}</p>
      <iframe
        ref={ref}
        title={video.title}
        allow="encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video min-h-[10rem] w-full rounded-lg border-0"
      />
    </section>
  );
}

// 체험 화면: 분야 색 머리('←' + '집에서 먼저 체험하기' + 기관 이름) → 해 볼 것 → 팀이 만든 연습 → 영상 → 사진 → '← 기관 안내로 돌아가기'.
// 보여 줄 것이 없는 기관은 이 화면을 열지 않고 기관 화면으로 돌려보낸다.
// 기관 화면과 같은 겹을 지킨다: 지금 후보에 없는 곳은 주소를 쳐도 열리지 않는다.
// 체험에는 설문 답과 사는 동을 넘기지 않는다. 넘기는 것은 기관 한 줄뿐이다.

export function TasteScreen({ programId }: { programId: string }) {
  const viewed = useViewedType();
  if (!viewed.ok) return <Redirect to={viewed.to} />;
  return (
    <TasteBody
      key={`${viewed.type.id}-${programId}`}
      programId={programId}
      type={viewed.type}
      browse={viewed.browse}
    />
  );
}

function TasteBody({ programId, type, browse }: { programId: string; type: TypeInfo; browse: boolean }) {
  const fromList = useSearchParams().get("from") === "places";
  const context = usePlaceContext(type.id, browse);
  const browseType = browse ? type.id : null;

  const allowed = browse ? context.places : [...context.places, ...context.consults];
  const program = allowed.find((one) => one.id === programId);
  if (!program) return <Redirect to={typeHomeHref(browseType)} />;

  const back = placeHref(program.id, browseType, fromList);
  const taste = tasteOf(program);
  if (!taste.ready) return <Redirect to={back} />;

  return (
    <>
      <header
        data-area={type.area}
        className="-mx-[1rem] -mt-[1rem] flex flex-col gap-[0.5rem] rounded-b-[1.6rem] bg-(--area-wash) px-[1rem] pt-[0.9rem] pb-[1.2rem] min-[601px]:mx-0 min-[601px]:mt-0 min-[601px]:rounded-[1.6rem]"
      >
        <div className="flex items-center gap-[0.5rem]">
          <BackLink href={back} />
          <p className="rounded-full bg-(--area-ink) px-[0.7rem] py-[0.12rem] text-[0.8rem] leading-[1.5] font-bold text-white">
            {KIND_LABEL[tasteKind(taste)]}
          </p>
        </div>
        <h1 className="text-[clamp(1.4rem,6.4vw,1.9rem)] leading-[1.25] font-extrabold tracking-[-0.03em] text-pretty">
          {placeName(program)}
        </h1>
      </header>

      {taste.tools.map((tool) => (
        <ToolPanel key={tool.url} tool={tool} />
      ))}
      {taste.practice ? (
        <section className="flex min-w-0 flex-col gap-[0.5rem]">
          <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">
            <b className="font-bold text-teal">{text.tastePracticeLabel}</b> · {text.tastePracticeNote}
          </p>
          <PracticePanel id={taste.practice.id} />
        </section>
      ) : null}
      {taste.videos.map((video) => (
        <FilmPanel key={video.url} video={video} />
      ))}
      {taste.photos.map((photo) => (
        <PhotoPanel key={photo.url} photo={photo} />
      ))}

      <LinkButton href={back} variant="outline" className="font-bold text-teal hover:text-teal">
        {text.tasteBack}
      </LinkButton>
    </>
  );
}
