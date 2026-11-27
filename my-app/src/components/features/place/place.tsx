"use client";

import { useSearchParams } from "next/navigation";
import { ExternalLinkIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { BackLink } from "@/components/common/back-link";
import { Character, characterGender } from "@/components/common/character";
import { Fold, FoldGroup } from "@/components/common/fold";
import { LinkButton } from "@/components/common/link-button";
import { Redirect } from "@/components/common/redirect";
import { fill, koreanDate, text } from "@/content/text";
import {
  placeFacts,
  placeLinks,
  placeName,
  worryLines,
  type CheckLabels,
  type Fact,
  type PlaceLink,
} from "@/core/places";
import { GENDER_Q, KIND_LIST, splitMulti } from "@/core/table";
import { appData } from "@/data";
import type { TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { useSurvey } from "@/hooks/use-survey";
import { browseGender, useViewedType } from "@/hooks/use-viewed-type";
import { placesHref, typeHomeHref } from "@/lib/routes";

// 기관 세부 화면(동료 화면의 모양). 흰 카드 하나에 담는다:
// 머리 상자('←' + '○○형에 추천!' + 기관 이름 + 그림) → 하는 일 + 한 줄 설명 → 단추 줄(공식 안내·전화·길찾기)
// → 접힌 줄 넷(지원을 처음 경험할 때, 걱정 세 가지) → 확인 날짜. 카드 아래에 '← 뒤로 돌아가기'.
//
// 그릴 때마다 지금의 후보를 다시 만든다. 이 곳이 그 안에 없으면(끝난 곳, 답을 고쳐 빠진 곳) 그리지 않고 돌려보낸다.
// '이렇게 물어보세요' 문장은 넣지 않는다. 전화 단추는 접지 않는다.

const LABELS: CheckLabels = {
  ageUnconfirmed: text.ageUnconfirmed,
  unconfirmed: (column) => fill(text.unconfirmed, { column }),
};

const LINK_TEXT: Record<PlaceLink["kind"], string> = {
  guide: text.guideButton,
  list: text.listButton,
  apply: text.applyButton,
  phone: text.phoneButton,
  route: text.routeButton,
};

const FACT_TEXT: Record<Fact["kind"], string> = {
  where: text.factWhere,
  whereRemote: text.factWhereRemote,
  who: text.factWho,
  how: text.factHow,
  contact: text.factContact,
};

function linkIcon(kind: PlaceLink["kind"]) {
  if (kind === "phone") return <PhoneIcon aria-hidden="true" />;
  if (kind === "route") return <MapPinIcon aria-hidden="true" />;
  return <ExternalLinkIcon aria-hidden="true" />;
}

export function Place({ programId }: { programId: string }) {
  const viewed = useViewedType();
  if (!viewed.ok) return <Redirect to={viewed.to} />;
  return <PlaceBody key={`${viewed.type.id}-${programId}`} programId={programId} type={viewed.type} browse={viewed.browse} />;
}

function PlaceBody({ programId, type, browse }: { programId: string; type: TypeInfo; browse: boolean }) {
  const genderAnswer = useSurvey((state) => state.answers[GENDER_Q]);
  const fromList = useSearchParams().get("from") === "places";
  const context = usePlaceContext(type.id, browse);
  const browseType = browse ? type.id : null;
  const home = typeHomeHref(browseType);

  // 지금 후보에 있는 곳만 그린다. 설문 결과에서는 '함께 찾아 주는 곳'(일반 창구)도 열 수 있다
  const allowed = browse ? context.places : [...context.places, ...context.consults];
  const program = allowed.find((one) => one.id === programId);
  if (!program) return <Redirect to={home} />;

  const back = fromList ? placesHref(browseType) : home;
  // 이 유형의 곳인지(일반 창구는 아니다). 아니면 '○○형에 추천!'을 붙이지 않는다
  const own = splitMulti(program["유형태그"]).includes(type.id);
  const gender = browse ? browseGender(type.id) : characterGender(genderAnswer);
  const links = placeLinks(program, appData.venues[program.id] ?? []);
  const facts = placeFacts(program);

  return (
    <>
      <article className="flex flex-col gap-[0.6rem] rounded-xl border border-[#D2DED5] bg-card p-[clamp(0.75rem,4vw,1.6rem)] text-[#1C3932]">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-[0.4rem] gap-y-[0.3rem] rounded-[0.8rem_1rem_0.8rem_0.6rem] border border-[#EDDDC7] bg-[#FBF0DE] px-[0.6rem] py-[0.5rem]">
          <BackLink href={back} className="size-[2rem]" />
          <p className="col-span-2 text-sm leading-[1.4] font-bold text-[#21695A]">
            {own ? fill(text.placeForType, { name: type.name }) : ""}
          </p>
          <h1 className="col-span-2 text-[clamp(1.24rem,4.5vw,1.76rem)] leading-[1.28] font-bold text-[#173B32]">
            {placeName(program)}
          </h1>
          {gender ? (
            <Character
              typeId={type.id}
              gender={gender}
              sizes="86px"
              className="size-[clamp(52px,12vw,86px)] object-contain"
            />
          ) : null}
        </header>

        <h2 className="text-[1.04rem] leading-[1.45] font-bold text-[#1C3932]">{program["프로그램명"]}</h2>
        <p>{program["한줄설명"]}</p>
        {program["종류"] === KIND_LIST ? <p>{text.listNote}</p> : null}

        {links.length > 0 ? (
          <div className="flex flex-wrap gap-[0.4rem]">
            {links.map((link) => (
              <LinkButton
                key={`${link.kind}-${link.url}`}
                href={link.url}
                variant="outline"
                size="default"
                className="h-auto min-h-[2.3rem] gap-[0.35rem] rounded-[10px] border-[#A6BFB1] px-[0.75rem] py-[0.4rem] text-sm leading-[1.4] font-semibold whitespace-normal text-[#174E43] [&_svg]:size-[1rem]"
              >
                {linkIcon(link.kind)}
                {LINK_TEXT[link.kind]}
                {link.note}
              </LinkButton>
            ))}
          </div>
        ) : null}

        <FoldGroup look="line">
          {facts.length > 0 ? (
            <Fold value="first" title={text.firstTimeHeading}>
              <dl>
                {facts.map((fact) => (
                  <div key={fact.kind} className="mb-[0.5rem]">
                    <dt className="text-sm font-bold">{FACT_TEXT[fact.kind]}</dt>
                    <dd className="text-sm leading-[1.6]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Fold>
          ) : null}
          {appData.settings.worries.map((worry) => {
            // 정보표에 확인된 내용이 없으면 지어내지 않고 그 사실을 알린다
            const lines = worryLines(program, worry, LABELS, own ? type : null);
            return (
              <Fold key={worry.id} value={worry.id} title={worry.label}>
                {lines.length > 0 ? (
                  lines.map((line) => (
                    <p key={line} className="text-sm leading-[1.6]">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-[1.6]">{text.worryUnknown}</p>
                )}
              </Fold>
            );
          })}
        </FoldGroup>

        <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">
          {fill(text.checkedNote, { date: koreanDate(program["확인날짜"]) })}
        </p>
      </article>

      <LinkButton href={back} variant="outline" className="justify-start border-teal font-bold text-teal hover:text-teal">
        {text.backBottom}
      </LinkButton>
    </>
  );
}
