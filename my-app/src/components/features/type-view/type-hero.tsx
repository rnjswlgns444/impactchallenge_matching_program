import { Character, type CharacterGender } from "@/components/common/character";
import { fill, text } from "@/content/text";
import type { TypeInfo } from "@/data/types";

// 유형 카드: 캐릭터 그림 → 딱지('나의 유형' 또는 '유형 소개') → 유형 이름 → 설명 문장.
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
  return (
    <section
      data-area={type.area}
      className="flex flex-col items-center gap-[0.28rem] rounded-xl border border-(--area-rule) bg-(--area-wash) px-[0.88rem] pt-[0.8rem] pb-[0.92rem] text-center"
    >
      {gender ? (
        <Character
          typeId={type.id}
          gender={gender}
          alt={fill(text.typeImageAlt, { name: type.name })}
          sizes="200px"
          eager
          className="w-[min(200px,56vw)]"
        />
      ) : null}
      <p className="rounded-full bg-(--area-ink) px-[0.64rem] py-[0.12rem] text-sm leading-[1.5] font-bold text-white">
        {label}
      </p>
      <h1 className="text-[clamp(1.32rem,4.7vw,1.56rem)] leading-[1.4] font-bold">{type.name}</h1>
      <p className="text-[0.95rem] leading-[1.5] text-ink">{type.statement}</p>
    </section>
  );
}
