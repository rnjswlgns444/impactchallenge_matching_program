"use client";

import Link from "next/link";
import { StarIcon } from "lucide-react";

import type { CharacterGender } from "@/components/common/character";
import { LinkButton } from "@/components/common/link-button";
import { Notice } from "@/components/common/notice";
import { Spinner } from "@/components/ui/spinner";
import { fill, text } from "@/content/text";
import { NEAR_KM, nearStop, routeStops, type Stop } from "@/core/geo";
import { SHOWN_PLACES, noPlace, noVisit, placeName, type PlaceContext } from "@/core/places";
import { detailOf } from "@/core/selection";
import { appData } from "@/data";
import type { Dong, TypeInfo } from "@/data/types";
import { placeHref, placesHref } from "@/lib/routes";
import type { AiState } from "@/stores/survey-store";

import { DetailQuestion } from "./detail-question";
import { FallbackCard } from "./fallback-card";
import { WalkScene } from "./walk-scene";

// '○○형의 첫걸음 길' 구역. 산책길 그림 한 장에 추천 기관 3곳을 건물로 세운다(walk-scene.tsx).
// 건물을 누르면 그 기관의 안내 화면으로 간다. 그림 아래의 단추 '목록으로 보기'를 누르면
// 추천 3곳과 나머지 곳이 함께 나오는 목록 화면으로 간다.
//
// 보여 줄 곳과 순서는 이미 정해진 것(context.places)을 그대로 쓴다. 여기서 거르거나 순서를 바꾸지 않는다.
// 사는 동은 순서를 바꾸지 않는다. 추천 3곳 중 가장 가까운 한 곳에 딱지를 붙일 뿐이다.
// 전화로 문의할 곳이 없을 수도 있으므로(목록만 있는 유형) '문의할 수 있는 곳'이라고 쓰지 않는다.

const REMOTE_WORDS = new Set(["전화", "온라인"]);

// 목록 줄의 작은 글: 종류 낱말. 찾아가지 않고 쓰는 곳은 "전화·온라인으로"를 붙인다. 예) "문화", "상담 · 전화·온라인으로"
export function stopNote(stop: Stop): string {
  const program = stop.program;
  const parts = [program["핀그림"]];
  if (!stop.venue && noVisit(program["장소"] || program["진행방식"])) {
    // 종류 낱말이 이미 '전화'·'온라인'이면 낱말 대신 이 말을 쓴다
    if (REMOTE_WORDS.has(program["핀그림"])) parts.pop();
    parts.push(text.remotePlace);
  }
  return parts.filter(Boolean).join(" · ");
}

export function PlaceSection({
  type,
  context,
  browse,
  dong,
  gender,
  ai = null,
  asking = false,
}: {
  type: TypeInfo;
  context: PlaceContext;
  browse: boolean;
  dong: Dong | null; // 우리 동네. 고르지 않았으면 null
  gender: CharacterGender | null; // 그림 속 길의 시작에 세울 캐릭터의 성별
  ai?: AiState | null; // AI 추가 추천 결과(설문 결과에서만)
  asking?: boolean; // AI의 답을 기다리는 중
}) {
  const { result, places, reasons } = context;
  const starred = Object.keys(reasons).length > 0;
  const browseType = browse ? type.id : null;
  const detail = detailOf(type);
  const { stops } = routeStops(places, appData.venues, dong, SHOWN_PLACES);
  const near = nearStop(stops, NEAR_KM);
  const hasPlaces = !result.needsChoice && places.length > 0;

  return (
    <section className="flex flex-col gap-[0.5rem]">
      <div className="flex flex-col gap-[0.15rem]">
        <h2 className="text-[1.15rem] leading-[1.4] font-extrabold tracking-[-0.02em]">
          {fill(text.routeHeading, { name: type.name })}
        </h2>
        {/* 우리 동네. 설문 결과에서는 고르거나 바꾸러 갈 수 있다(둘러보기에는 맞춰 보기 화면이 없다) */}
        {hasPlaces && (dong || !browse) ? (
          <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">
            {dong ? fill(text.myDong, { dong: dong.name }) : null}
            {dong && !browse ? " · " : null}
            {browse ? null : (
              <Link href="/tune" className="font-bold text-teal underline underline-offset-4">
                {dong ? text.dongChange : text.dongPick}
              </Link>
            )}
          </p>
        ) : null}
      </div>

      {/* AI에게 묻는 동안에도 아래의 기본 기관은 그대로 보인다 */}
      {asking ? (
        <Notice kind="info" live>
          <span className="flex items-start gap-[0.5rem]">
            <Spinner className="mt-[0.3rem] size-[1rem] shrink-0 text-teal" />
            <span>{text.aiWait}</span>
          </span>
        </Notice>
      ) : null}
      {/* AI가 못 찾았거나 실패해도 기관은 그대로 보여 주고, 그 사실만 알린다 */}
      {!asking && ai?.status === "unclear" ? <Notice>{text.aiUnclear}</Notice> : null}
      {!asking && ai?.status === "fail" ? <Notice kind="fail">{text.aiFail}</Notice> : null}
      {!asking && ai && (ai.status === "ok" || ai.status === "partial") && !starred ? (
        <Notice kind="info">{text.aiNone}</Notice>
      ) : null}
      {!asking && ai && starred && ai.unmatched.length > 0 ? (
        <Notice>{fill(text.aiUnmatched, { items: ai.unmatched.join(", ") })}</Notice>
      ) : null}

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

          {starred ? (
            <p className="flex items-start gap-[0.3rem] text-[0.8rem] leading-[1.5] font-semibold text-foreground">
              <StarIcon aria-hidden="true" className="mt-[0.2rem] size-[0.9rem] shrink-0 fill-cta text-cta-border" />
              {text.aiStarNote}
            </p>
          ) : null}

          <WalkScene
            typeId={type.id}
            gender={gender}
            buildings={stops.map((stop) => {
              const star = stop.program.id in reasons;
              const tag = stop === near ? text.nearTag : undefined;
              const name = placeName(stop.program);
              return {
                key: stop.program.id,
                href: placeHref(stop.program.id, browseType),
                number: stop.number ?? 0,
                word: stop.program["핀그림"],
                name,
                label: [
                  fill(text.placeOpen, { number: stop.number ?? "", kind: stop.program["핀그림"] ?? "", name }),
                  star ? text.aiStarLabel : "",
                  tag ?? "",
                ]
                  .filter(Boolean)
                  .join(", "),
                star,
                tag,
              };
            })}
          />

          <LinkButton href={placesHref(browseType)} variant="outline" className="font-bold text-teal hover:text-teal">
            {fill(text.seeList, { count: places.length })}
          </LinkButton>
        </>
      )}
    </section>
  );
}
