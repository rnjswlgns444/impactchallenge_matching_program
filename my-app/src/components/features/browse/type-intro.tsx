"use client";

import { FinePrint } from "@/components/common/fine-print";
import { Fold, FoldGroup } from "@/components/common/fold";
import { LinkButton } from "@/components/common/link-button";
import { PlaceSection } from "@/components/features/type-view/place-section";
import { TypeHero } from "@/components/features/type-view/type-hero";
import { fill, koreanDate, text } from "@/content/text";
import { SHOWN_PLACES } from "@/core/places";
import type { TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { browseGender } from "@/hooks/use-viewed-type";

// 유형 소개 화면: 둘러보기에서 고른 유형의 기본 화면. 유형 카드 → 이 유형의 특징 → 맞는 기관 → 돌아가기.
// 설문 답을 쓰지 않는다. 그래서 성별·나이로 거르지 않고, 답변 수정과 다시 하기가 없다.
// 운영 중인지, 종료일이 지났는지는 결과 화면과 똑같이 후보 거르기가 거른다.

export function TypeIntro({ type }: { type: TypeInfo }) {
  const context = usePlaceContext(type.id, true);
  const shown = context.places.slice(0, SHOWN_PLACES);

  const notes: string[] = [text.disclaimer];
  if (shown.length > 0 && !context.result.needsChoice) {
    const oldest = shown.map((program) => program["확인날짜"]).sort()[0];
    notes.push(fill(text.placesChecked, { date: koreanDate(oldest) }));
  }

  return (
    <>
      <TypeHero type={type} label={text.typeLabelBrowse} gender={browseGender(type.id)} />
      <FoldGroup>
        <Fold value="feature" title={text.featureHeading}>
          <p>{type.feature}</p>
        </Fold>
      </FoldGroup>
      <PlaceSection type={type} context={context} browse />
      <div className="mt-[0.4rem] flex flex-col gap-[0.45rem]">
        <LinkButton href="/browse" variant="outline">
          {text.viewBack}
        </LinkButton>
        <LinkButton href="/survey" variant="cta">
          {text.browseToSurvey}
        </LinkButton>
      </div>
      <FinePrint items={notes} />
    </>
  );
}
