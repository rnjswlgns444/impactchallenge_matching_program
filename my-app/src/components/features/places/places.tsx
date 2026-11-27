"use client";

import { BackLink } from "@/components/common/back-link";
import { LinkButton } from "@/components/common/link-button";
import { PlaceRow } from "@/components/common/place-row";
import { Redirect } from "@/components/common/redirect";
import { fill, text } from "@/content/text";
import { SHOWN_PLACES, placeName } from "@/core/places";
import type { TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { useViewedType } from "@/hooks/use-viewed-type";
import { KindIcon } from "@/components/common/kind-icon";
import { stopNote } from "@/components/features/type-view/place-section";
import { NEAR_KM, nearStop, routeStops } from "@/core/geo";
import { appData } from "@/data";
import { useDong } from "@/hooks/use-dong";
import { placeHref, typeHomeHref } from "@/lib/routes";

// '목록으로 보기'를 눌러서 온 화면: 그림에 나온 추천 3곳(번호가 붙는다)과 나머지 곳을 줄로 함께 보여 준다.
// 줄을 누르면 그 기관의 안내 화면으로 간다. 보여 줄 곳은 후보 거르기가 걸러 준 것뿐이다. 곳이 없으면 돌려보낸다.

export function Places() {
  const viewed = useViewedType();
  if (!viewed.ok) return <Redirect to={viewed.to} />;
  return <PlacesBody key={viewed.type.id} type={viewed.type} browse={viewed.browse} />;
}

function PlacesBody({ type, browse }: { type: TypeInfo; browse: boolean }) {
  const context = usePlaceContext(type.id, browse);
  const browseType = browse ? type.id : null;
  const home = typeHomeHref(browseType);
  const dong = useDong();
  const { stops, others } = routeStops(context.places, appData.venues, dong, SHOWN_PLACES);
  const near = nearStop(stops, NEAR_KM);
  const all = [...stops, ...others];
  if (all.length === 0) return <Redirect to={home} />;

  return (
    <>
      <div className="flex items-start gap-[0.56rem]">
        <BackLink href={home} className="size-[2.6rem]" />
        <h1 className="pt-[0.3rem] text-[clamp(1.3rem,5vw,1.6rem)] leading-[1.35] font-extrabold tracking-[-0.02em] text-balance">
          {fill(text.allPlacesHeading, { type: type.name })}
        </h1>
      </div>
      {all.map((stop) => (
        <PlaceRow
          key={stop.program.id}
          href={placeHref(stop.program.id, browseType, true)}
          lead={<KindIcon word={stop.program["핀그림"]} />}
          number={stop.number}
          badge={stop === near ? text.nearTag : undefined}
          star={stop.program.id in context.reasons ? text.aiStarLabel : undefined}
          title={placeName(stop.program)}
          sub={stopNote(stop)}
        />
      ))}
      <LinkButton href={home} variant="outline" className="font-bold text-teal hover:text-teal">
        {text.backBottom}
      </LinkButton>
    </>
  );
}
