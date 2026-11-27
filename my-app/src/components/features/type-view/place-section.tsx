"use client";

import { Notice } from "@/components/common/notice";
import { PlaceRow } from "@/components/common/place-row";
import { fill, text } from "@/content/text";
import { SHOWN_PLACES, noPlace, placeName, type PlaceContext } from "@/core/places";
import { detailOf } from "@/core/selection";
import { appData } from "@/data";
import type { TypeInfo } from "@/data/types";
import { placeHref, placesHref } from "@/lib/routes";

import { DetailQuestion } from "./detail-question";
import { FallbackCard } from "./fallback-card";

// 유형에 맞는 기관 구역. 기관을 3곳까지 줄로 보여 주고, 더 있으면 '다른 곳 n곳'으로 묶는다.
// 줄을 누르면 그 기관의 안내 화면으로 간다. 보여 줄 곳은 이미 걸러진 것(context.places)뿐이다.
//
// 전화로 문의할 곳이 없을 수도 있으므로(목록만 있는 유형) 제목에 '문의할 수 있는 곳'이라고 쓰지 않는다.

export function PlaceSection({
  type,
  context,
  browse,
}: {
  type: TypeInfo;
  context: PlaceContext;
  browse: boolean;
}) {
  const { result, places } = context;
  const browseType = browse ? type.id : null;
  const detail = detailOf(type);
  const rest = places.length - SHOWN_PLACES;

  return (
    <section className="flex flex-col gap-[0.45rem]">
      <h2 className="text-[clamp(1.24rem,4.5vw,1.6rem)] leading-[1.4] font-bold">
        {fill(text.placesHeading, { name: type.name })}
      </h2>

      {/* 먼저 골라야 하는 세부 질문(돌봄: 누구의 돌봄인지). 고르면 그 아래에 곳이 나온다 */}
      {detail?.require_choice ? <DetailQuestion typeId={type.id} detail={detail} browse={browse} /> : null}

      {result.needsChoice ? (
        <Notice kind="info">{browse ? text.detailFirstBrowse : text.detailFirst}</Notice>
      ) : places.length === 0 ? (
        <>
          <Notice kind="fail">{text.noProgramAtAll}</Notice>
          <FallbackCard card={appData.settings.fallback_card} />
        </>
      ) : (
        <>
          {/* 이 유형의 곳은 없어 일반 창구를 놓았다 */}
          {noPlace(result) ? <Notice>{text.noProgram}</Notice> : null}
          {result.widened ? <Notice kind="info">{text.widenedNote}</Notice> : null}
          <p className="text-[0.85rem] leading-[1.5] text-muted-foreground">{text.placesHint}</p>
          {places.slice(0, SHOWN_PLACES).map((program) => (
            <PlaceRow
              key={program.id}
              href={placeHref(program.id, browseType)}
              title={placeName(program)}
              sub={program["프로그램명"]}
            />
          ))}
          {rest > 0 ? (
            <PlaceRow href={placesHref(browseType)} title={fill(text.moreCount, { count: rest })} />
          ) : null}
        </>
      )}
    </section>
  );
}
