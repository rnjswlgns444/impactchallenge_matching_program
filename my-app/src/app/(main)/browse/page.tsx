import Link from "next/link";
import type { Metadata } from "next";

import { Character } from "@/components/common/character";
import { LinkButton } from "@/components/common/link-button";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";
import { appData } from "@/data";

export const metadata: Metadata = { title: text.screens.browse };

// 설문 없이 둘러보기: 12개 유형을 3개씩 4줄의 칸(그림 + 유형 이름)으로 한눈에 보여 준다.
// 칸을 누르면 그 유형의 소개 화면으로 간다. 유형을 판정하지 않으므로 답을 쓰지 않는다.
// 그림은 꾸밈이고(유형 순서대로 여성·남성을 번갈아 쓴다), 칸의 이름(유형 이름)이 읽힌다.
export default function BrowsePage() {
  return (
    <Screen title={text.browseHeading}>
      <p className="text-[0.95rem] leading-[1.6] text-muted-foreground">{text.browseHelp}</p>
      <ul className="grid grid-cols-3 gap-[0.4rem]">
        {appData.types.map((type, index) => (
          <li key={type.id}>
            <Link
              href={`/type/${type.id}`}
              data-area={type.area}
              className="flex h-full flex-col items-center gap-[0.1rem] rounded-xl border-[1.5px] border-(--area-rule) bg-(--area-wash) px-[0.1rem] pt-[0.28rem] pb-[0.4rem] hover:border-(--area-ink)"
            >
              <Character
                typeId={type.id}
                gender={index % 2 === 0 ? "female" : "male"}
                sizes="(max-width: 672px) 30vw, 200px"
                className="w-[88%]"
              />
              <span className="text-[clamp(0.75rem,4.4vw,0.85rem)] leading-[1.3] font-bold whitespace-nowrap text-ink">
                {type.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <LinkButton href="/survey" variant="cta">
        {text.browseToSurvey}
      </LinkButton>
      <LinkButton href="/" variant="link" className="w-auto self-center">
        {text.browseToStart}
      </LinkButton>
    </Screen>
  );
}
