import { LinkButton } from "@/components/common/link-button";
import { text } from "@/content/text";
import { phones } from "@/core/places";
import type { FallbackCard as FallbackCardData } from "@/data/types";

// 정보표에서 안내할 곳을 하나도 찾지 못했을 때 보여 주는 기본 창구(settings.yaml의 fallback_card).

export function FallbackCard({ card }: { card: FallbackCardData }) {
  return (
    <div className="flex flex-col gap-[0.45rem] rounded-xl border bg-card p-[0.8rem]">
      <div>
        <h3 className="text-[1.12rem] leading-[1.4] font-bold">{card.name}</h3>
        <p className="text-sm font-semibold text-teal">{card.org}</p>
      </div>
      <p>{card.description}</p>
      {card.url ? (
        <LinkButton href={card.url} variant="cta">
          {text.detailButton}
        </LinkButton>
      ) : null}
      {phones(card.phone).map((phone) => (
        <LinkButton key={phone.number} href={`tel:${phone.number}`} variant="outline">
          {text.phoneButton} {phone.shown}
        </LinkButton>
      ))}
    </div>
  );
}
