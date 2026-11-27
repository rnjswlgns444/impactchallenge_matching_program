"use client";

import { useSearchParams } from "next/navigation";
import { ExternalLinkIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { BackLink } from "@/components/common/back-link";
import { Character, characterGender } from "@/components/common/character";
import { KindIcon } from "@/components/common/kind-icon";
import { Fold, FoldGroup } from "@/components/common/fold";
import { LinkButton } from "@/components/common/link-button";
import { Notice } from "@/components/common/notice";
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
import { useViewedType } from "@/hooks/use-viewed-type";
import { browseGender } from "@/lib/session";
import { placesHref, typeHomeHref } from "@/lib/routes";

// 기관 세부 화면:
// 분야 색 머리('←' + '○○형에 추천!' + 기관 이름 + 하는 일 + 그림) → 한 줄 설명 → 단추(전화 문의를 가장 크게)
// → 접힌 줄 넷(지원을 처음 경험할 때, 걱정 세 가지) → 확인 날짜 → '← 뒤로 돌아가기'.
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
  const reason = context.reasons[program.id];

  // 가장 눈에 띄게 둘 단추 하나: 전화가 있으면 첫 전화, 없으면 첫 단추(공식 안내나 목록)
  const main = links.find((link) => link.kind === "phone") ?? links[0];
  const others = links.filter((link) => link !== main);

  return (
    <>
      <header
        data-area={type.area}
        className="-mx-[1rem] -mt-[1rem] flex flex-col gap-[0.5rem] rounded-b-[1.6rem] bg-(--area-wash) px-[1rem] pt-[0.9rem] pb-[1.2rem] min-[601px]:mx-0 min-[601px]:mt-0 min-[601px]:rounded-[1.6rem]"
      >
        <div className="flex items-center gap-[0.5rem]">
          <BackLink href={back} />
          <KindIcon word={program["핀그림"]} className="size-[2.3rem] ring-white" />
          {own ? (
            <p className="rounded-full bg-(--area-ink) px-[0.7rem] py-[0.12rem] text-[0.8rem] leading-[1.5] font-bold text-white">
              {fill(text.placeForType, { name: type.name })}
            </p>
          ) : null}
        </div>
        <div className="flex items-end gap-[0.4rem]">
          <div className="flex flex-1 flex-col gap-[0.2rem]">
            <h1 className="text-[clamp(1.4rem,6.4vw,1.9rem)] leading-[1.25] font-extrabold tracking-[-0.03em] text-pretty">
              {placeName(program)}
            </h1>
            <p className="text-[0.95rem] leading-[1.4] font-bold text-(--area-ink)">{program["프로그램명"]}</p>
          </div>
          {gender ? (
            <Character
              typeId={type.id}
              gender={gender}
              sizes="96px"
              className="-mb-[0.3rem] size-[clamp(64px,20vw,96px)] shrink-0 object-contain"
            />
          ) : null}
        </div>
      </header>

      {reason ? (
        // AI가 쓴 글은 그대로 글자로만 보여 준다
        <Notice kind="info">
          <b className="font-bold text-ink">{text.aiReason}</b>
          <br />
          {reason}
        </Notice>
      ) : null}
      <p className="text-[1rem] leading-[1.6]">{program["한줄설명"]}</p>
      {program["종류"] === KIND_LIST ? <Notice kind="info">{text.listNote}</Notice> : null}

      {main ? (
        <div className="flex flex-col gap-[0.5rem]">
          <LinkButton href={main.url} variant="cta" className="gap-[0.4rem]">
            {linkIcon(main.kind)}
            {LINK_TEXT[main.kind]}
            {main.note}
          </LinkButton>
          {others.length > 0 ? (
            <div className="flex flex-wrap gap-[0.4rem]">
              {others.map((link) => (
                <LinkButton
                  key={`${link.kind}-${link.url}`}
                  href={link.url}
                  variant="outline"
                  size="default"
                  className="h-auto min-h-[2.6rem] flex-1 gap-[0.35rem] rounded-xl px-[0.75rem] py-[0.4rem] text-[0.85rem] leading-[1.4] font-bold whitespace-normal text-teal hover:text-teal [&_svg]:size-[1rem]"
                >
                  {linkIcon(link.kind)}
                  {LINK_TEXT[link.kind]}
                  {link.note}
                </LinkButton>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-edge bg-card px-[0.9rem] shadow-card">
        <FoldGroup look="line">
          {facts.length > 0 ? (
            <Fold value="first" title={text.firstTimeHeading}>
              <dl className="flex flex-col gap-[0.6rem]">
                {facts.map((fact) => (
                  <div key={fact.kind}>
                    <dt className="text-[0.8rem] font-bold text-teal">{FACT_TEXT[fact.kind]}</dt>
                    <dd className="text-[0.95rem] leading-[1.6]">{fact.value}</dd>
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
                  <ul className="flex list-disc flex-col gap-[0.25rem] pl-[1.1rem] marker:text-teal">
                    {lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">{text.worryUnknown}</p>
                )}
              </Fold>
            );
          })}
        </FoldGroup>
      </div>

      <p className="text-[0.75rem] leading-[1.5] text-muted-foreground">
        {fill(text.checkedNote, { date: koreanDate(program["확인날짜"]) })}
      </p>

      <LinkButton href={back} variant="outline" className="font-bold text-teal hover:text-teal">
        {text.backBottom}
      </LinkButton>
    </>
  );
}
