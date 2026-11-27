"use client";

import { Button } from "@/components/ui/button";
import { text } from "@/content/text";
import { appData } from "@/data";
import { useSurvey } from "@/hooks/use-survey";
import { useSurveyStore } from "@/stores/survey-store";

// 사는 동 고르기(안 골라도 된다). 구마다 묶은 동 단추를 누르면 곧바로 저장소에 쓴다.
// 고른 동을 다시 누르면 고르지 않은 것으로 돌아간다.
// 동은 결과 화면의 지도 그림과 '약 n km'에만 쓴다. 서버로도 AI로도 보내지 않는다.

const GROUPS = [...new Set(appData.dongs.map((dong) => dong.gu))];

export function DongPicker() {
  const chosen = useSurvey((state) => state.dong);
  if (appData.dongs.length === 0) return null; // 동 자료를 읽지 못했으면 묻지 않는다

  return (
    <div role="group" aria-label={text.dongAsk} className="flex flex-col gap-[0.4rem]">
      <div>
        <p className="text-base leading-[1.4] font-bold text-ink">{text.dongAsk}</p>
        <p className="text-[0.9rem] leading-[1.55] text-muted-foreground">{text.dongHelp}</p>
      </div>
      {GROUPS.map((gu) => (
        <div key={gu} className="flex flex-col gap-[0.3rem]">
          <p className="text-[0.8rem] font-bold text-teal">{gu}</p>
          <div className="grid grid-cols-3 gap-[0.35rem]">
            {appData.dongs
              .filter((dong) => dong.gu === gu)
              .map((dong) => {
                const selected = dong.name === chosen;
                return (
                  <Button
                    key={dong.name}
                    type="button"
                    variant="outline"
                    aria-pressed={selected}
                    onClick={() => useSurveyStore.getState().setDong(selected ? null : dong.name)}
                    className="h-auto min-h-[2.6rem] rounded-xl px-[0.2rem] text-[0.9rem] font-semibold whitespace-nowrap aria-pressed:border-teal aria-pressed:bg-aqua aria-pressed:font-bold aria-pressed:shadow-none aria-pressed:ring-2 aria-pressed:ring-teal"
                  >
                    {dong.name}
                  </Button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
