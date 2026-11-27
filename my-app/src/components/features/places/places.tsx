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
import { kindLabel } from "@/components/features/type-view/place-section";
import { placeHref, typeHomeHref } from "@/lib/routes";

// '다른 곳 n곳'을 눌러서 온 화면: 앞의 3곳 말고 나머지 곳의 줄. 줄을 누르면 그 기관의 안내 화면으로 간다.
// 보여 줄 곳은 후보 거르기가 걸러 준 것뿐이다. 나머지가 없으면 돌려보낸다.

export function Places() {
  const viewed = useViewedType();
  if (!viewed.ok) return <Redirect to={viewed.to} />;
  return <PlacesBody key={viewed.type.id} type={viewed.type} browse={viewed.browse} />;
}

function PlacesBody({ type, browse }: { type: TypeInfo; browse: boolean }) {
  const context = usePlaceContext(type.id, browse);
  const browseType = browse ? type.id : null;
  const home = typeHomeHref(browseType);
  const rest = context.places.slice(SHOWN_PLACES);
  if (rest.length === 0) return <Redirect to={home} />;

  return (
    <>
      <div className="flex items-start gap-[0.56rem]">
        <BackLink href={home} className="size-[2.6rem]" />
        <h1 className="pt-[0.3rem] text-[clamp(1.3rem,5vw,1.6rem)] leading-[1.35] font-extrabold tracking-[-0.02em] text-balance">
          {fill(text.morePlacesHeading, { type: type.name })}
        </h1>
      </div>
      {rest.map((program) => (
        <div key={program.id} className="flex flex-col gap-[0.2rem]">
          <PlaceRow
            href={placeHref(program.id, browseType, true)}
            badge={kindLabel(program)}
            star={program.id in context.reasons ? text.aiStarLabel : undefined}
            title={placeName(program)}
            sub={program["프로그램명"]}
          />
          <p className="px-[0.24rem] text-sm text-muted-foreground">{program["한줄설명"]}</p>
        </div>
      ))}
      <LinkButton href={home} variant="outline" className="font-bold text-teal hover:text-teal">
        {text.backBottom}
      </LinkButton>
    </>
  );
}
