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
        <BackLink href={home} className="size-[2.6rem] border-[1.5px] border-teal text-teal" />
        <h1 className="pt-[0.28rem] text-[clamp(1.24rem,4.5vw,1.6rem)] leading-[1.4] font-bold text-balance">
          {fill(text.morePlacesHeading, { type: type.name })}
        </h1>
      </div>
      {rest.map((program) => (
        <div key={program.id} className="flex flex-col gap-[0.2rem]">
          <PlaceRow
            href={placeHref(program.id, browseType, true)}
            title={placeName(program)}
            sub={program["프로그램명"]}
          />
          <p className="px-[0.24rem] text-sm text-muted-foreground">{program["한줄설명"]}</p>
        </div>
      ))}
      <LinkButton href={home} variant="outline" className="justify-start border-teal font-bold text-teal hover:text-teal">
        {text.backBottom}
      </LinkButton>
    </>
  );
}
