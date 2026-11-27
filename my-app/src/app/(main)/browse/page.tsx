import Link from "next/link";
import type { Metadata } from "next";

import { Character } from "@/components/common/character";
import { LinkButton } from "@/components/common/link-button";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";
import { appData } from "@/data";
import { browseGender } from "@/lib/session";

export const metadata: Metadata = { title: text.screens.browse };

// 설문 없이 둘러보기: 12개 유형을 분야마다 4개씩 묶어 칸(그림 + 유형 이름)으로 보여 준다(휴대폰에서는 2칸씩).
// 칸을 누르면 그 유형의 소개 화면으로 간다. 유형을 판정하지 않으므로 답을 쓰지 않는다.
// 그림은 꾸밈이고(유형 순서대로 여성·남성을 번갈아 쓴다), 칸의 이름(유형 이름)이 읽힌다.
export default function BrowsePage() {
  return (
    <Screen title={text.browseHeading}>
      <p className="text-[0.95rem] leading-[1.6] text-muted-foreground">{text.browseHelp}</p>
      {appData.areas.map((area) => (
        <section key={area.id} data-area={area.id} className="flex flex-col gap-[0.4rem]">
          <h2 className="text-[0.9rem] leading-[1.4] font-extrabold text-(--area-ink)">{area.label}</h2>
          <ul className="grid grid-cols-2 gap-[0.5rem] min-[560px]:grid-cols-4">
            {appData.types
              .filter((type) => type.area === area.id)
              .map((type) => (
                <li key={type.id}>
                  <Link
                    href={`/type/${type.id}`}
                    className="flex h-full flex-col items-center gap-[0.1rem] rounded-xl bg-(--area-wash) px-[0.1rem] pt-[0.3rem] pb-[0.45rem] transition-all hover:ring-2 hover:ring-(--area-ink) active:translate-y-px"
                  >
                    <Character
                      typeId={type.id}
                      gender={browseGender(type.id)}
                      sizes="(max-width: 560px) 28vw, 110px"
                      className="w-[58%] min-[560px]:w-[80%]"
                    />
                    <span className="text-[0.9rem] leading-[1.3] font-bold whitespace-nowrap text-ink">
                      {type.name}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
      <LinkButton href="/survey" variant="cta">
        {text.browseToSurvey}
      </LinkButton>
      <LinkButton href="/" variant="link" className="w-auto self-center">
        {text.browseToStart}
      </LinkButton>
    </Screen>
  );
}
