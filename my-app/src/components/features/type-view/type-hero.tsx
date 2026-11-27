import { Character, type CharacterGender } from "@/components/common/character";
import { fill, text } from "@/content/text";
import { appData } from "@/data";
import type { TypeInfo } from "@/data/types";

// 유형 머리: 분야 색 바탕이 화면 폭을 채우고, 큰 캐릭터 → 딱지 → 유형 이름 → 설명 문장 → 분야 이름.
// 휴대폰에서는 화면 양 끝까지 닿는다(본문 틀의 여백만큼 밖으로 뺀다).
// 바탕색은 분야에 따라 다르다(globals.css의 data-area). 점수는 보여 주지 않는다.
// 성별 답이 없으면 그림 없이 그린다.

export function TypeHero({
  type,
  label,
  gender,
}: {
  type: TypeInfo;
  label: string;
  gender: CharacterGender | null;
}) {
  const area = appData.areas.find((one) => one.id === type.area);
  return (
    <section
      data-area={type.area}
      className="-mx-[1rem] -mt-[1rem] flex flex-col items-center gap-[0.35rem] rounded-b-[1.6rem] bg-(--area-wash) px-[1.2rem] pt-[1.2rem] pb-[1.5rem] text-center min-[601px]:mx-0 min-[601px]:mt-0 min-[601px]:rounded-[1.6rem]"
    >
      <p className="rounded-full bg-(--area-ink) px-[0.75rem] py-[0.15rem] text-[0.8rem] leading-[1.5] font-bold text-white">
        {label}
      </p>
      {gender ? (
        <Character
          typeId={type.id}
          gender={gender}
          alt={fill(text.typeImageAlt, { name: type.name })}
          sizes="(max-width: 440px) 62vw, 270px"
          eager
          className="w-[min(270px,62vw)] drop-shadow-[0_10px_14px_rgb(20_63_60/0.12)]"
        />
      ) : null}
      <h1 className="text-[clamp(1.8rem,9vw,2.3rem)] leading-[1.2] font-extrabold tracking-[-0.04em]">
        {type.name}
      </h1>
      <p className="max-w-[18rem] text-[1rem] leading-[1.5] text-pretty text-ink">{type.statement}</p>
      {area ? (
        <p className="mt-[0.3rem] rounded-full border border-(--area-rule) bg-white/70 px-[0.7rem] py-[0.1rem] text-[0.75rem] leading-[1.5] font-bold text-(--area-ink)">
          {area.label}
        </p>
      ) : null}
    </section>
  );
}

// 유형의 특징 글. 접지 않고 카드로 보여 준다(글은 types.yaml의 feature 그대로).
export function TypeFeature({ type }: { type: TypeInfo }) {
  return (
    <section className="flex flex-col gap-[0.4rem]">
      <h2 className="text-[1.15rem] leading-[1.4] font-extrabold tracking-[-0.02em]">{text.featureHeading}</h2>
      <p className="rounded-xl border border-edge bg-card px-[0.9rem] py-[0.8rem] text-[0.95rem] leading-[1.65] shadow-card">
        {type.feature}
      </p>
    </section>
  );
}
