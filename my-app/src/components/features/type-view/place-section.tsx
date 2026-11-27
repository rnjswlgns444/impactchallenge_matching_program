"use client";

import Link from "next/link";

import { Notice } from "@/components/common/notice";
import { PlaceRow } from "@/components/common/place-row";
import { fill, text } from "@/content/text";
import { SHOWN_PLACES, noPlace, placeName, type PlaceContext } from "@/core/places";
import { detailOf } from "@/core/selection";
import { KIND_ALWAYS, KIND_LIST, KIND_PERIOD, NATIONWIDE } from "@/core/table";
import { appData } from "@/data";
import type { Program, TypeInfo } from "@/data/types";
import { placeHref, placesHref } from "@/lib/routes";

import { DetailQuestion } from "./detail-question";
import { FallbackCard } from "./fallback-card";

// 유형에 맞는 기관 구역. 기관을 3곳까지 카드로 보여 주고, 더 있으면 '다른 곳 n곳'으로 묶는다.
// 카드를 누르면 그 기관의 안내 화면으로 간다. 보여 줄 곳은 이미 걸러진 것(context.places)뿐이다.
//
// 전화로 문의할 곳이 없을 수도 있으므로(목록만 있는 유형) 제목에 '문의할 수 있는 곳'이라고 쓰지 않는다.

const KIND_TEXT: Record<string, string> = {
  [KIND_ALWAYS]: text.kindAlways,
  [KIND_PERIOD]: text.kindPeriod,
  [KIND_LIST]: text.kindList,
};

// 기관 카드의 딱지: 전국 창구면 그 사실을, 아니면 종류를 알린다(정보표의 칸 그대로)
export function kindLabel(program: Program): string | undefined {
  return program["범위"] === NATIONWIDE ? text.nationwide : KIND_TEXT[program["종류"]];
}

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
    <section className="flex flex-col gap-[0.5rem]">
      <div>
        <h2 className="text-[1.15rem] leading-[1.4] font-extrabold tracking-[-0.02em]">
          {fill(text.placesHeading, { name: type.name })}
        </h2>
        {!result.needsChoice && places.length > 0 ? (
          <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">{text.placesHint}</p>
        ) : null}
      </div>

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
          {places.slice(0, SHOWN_PLACES).map((program) => (
            <PlaceRow
              key={program.id}
              href={placeHref(program.id, browseType)}
              badge={kindLabel(program)}
              title={placeName(program)}
              sub={program["프로그램명"]}
            />
          ))}
          {rest > 0 ? (
            <Link
              href={placesHref(browseType)}
              className="self-center rounded-full px-[0.9rem] py-[0.5rem] text-[0.9rem] font-bold text-teal underline underline-offset-4"
            >
              {fill(text.moreCount, { count: rest })}
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}
