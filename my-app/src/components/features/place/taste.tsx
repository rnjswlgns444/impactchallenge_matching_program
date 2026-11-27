"use client";

import { useSearchParams } from "next/navigation";

import { BackLink } from "@/components/common/back-link";
import { LinkButton } from "@/components/common/link-button";
import { Notice } from "@/components/common/notice";
import { Redirect } from "@/components/common/redirect";
import { text } from "@/content/text";
import { placeName } from "@/core/places";
import { tasteOf } from "@/core/taste";
import type { TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { useViewedType } from "@/hooks/use-viewed-type";
import { placeHref, typeHomeHref } from "@/lib/routes";

// 체험 화면: 분야 색 머리('←' + '집에서 먼저 체험하기' + 기관 이름) → 체험 → '← 기관 안내로 돌아가기'.
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

  return (
    <>
      <header
        data-area={type.area}
        className="-mx-[1rem] -mt-[1rem] flex flex-col gap-[0.5rem] rounded-b-[1.6rem] bg-(--area-wash) px-[1rem] pt-[0.9rem] pb-[1.2rem] min-[601px]:mx-0 min-[601px]:mt-0 min-[601px]:rounded-[1.6rem]"
      >
        <div className="flex items-center gap-[0.5rem]">
          <BackLink href={back} />
          <p className="rounded-full bg-(--area-ink) px-[0.7rem] py-[0.12rem] text-[0.8rem] leading-[1.5] font-bold text-white">
            {text.tasteLabel}
          </p>
        </div>
        <h1 className="text-[clamp(1.4rem,6.4vw,1.9rem)] leading-[1.25] font-extrabold tracking-[-0.03em] text-pretty">
          {placeName(program)}
        </h1>
        <p className="text-[0.95rem] leading-[1.4] font-bold text-(--area-ink)">{program["프로그램명"]}</p>
      </header>

      {/* 동료가 넘겨주는 체험 기능은 여기에 끼운다(taste.ready일 때). 지금은 모든 기관이 준비 중이다 */}
      {taste.ready ? null : <Notice kind="info">{text.tasteWaiting}</Notice>}

      <LinkButton href={back} variant="outline" className="font-bold text-teal hover:text-teal">
        {text.tasteBack}
      </LinkButton>
    </>
  );
}
