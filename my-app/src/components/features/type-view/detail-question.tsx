"use client";

import { Button } from "@/components/ui/button";
import { toggle } from "@/core/selection";
import type { Detail } from "@/data/types";
import { useSurvey } from "@/hooks/use-survey";
import { useSurveyStore } from "@/stores/survey-store";

// 유형의 세부 질문. 고른 것에 따라 보여 줄 곳이 달라진다.
// 누르면 곧바로 저장소에 쓴다. 고른 것을 다시 누르면 고르지 않은 것으로 돌아간다.
// 고른 것은 브라우저 안에만 둔다. 마음·건강 세부 답을 포함해 어디로도 보내지 않는다.

export function DetailQuestion({
  typeId,
  detail,
  browse,
}: {
  typeId: string;
  detail: Detail;
  browse: boolean; // 둘러보기에서 고른 것은 설문 결과와 섞이지 않게 따로 둔다
}) {
  const current = useSurvey((state) => (browse ? state.browseDetails : state.details)[typeId]);
  const chosen = Array.isArray(current) ? current : current ? [current] : [];

  function pick(optionId: string) {
    const next =
      detail.selection === "multi"
        ? toggle(chosen, optionId, detail.options)
        : chosen.includes(optionId)
          ? null
          : optionId;
    useSurveyStore.getState().setDetail(typeId, next, browse);
  }

  return (
    <div role="group" aria-label={detail.text} className="flex flex-col gap-[0.45rem]">
      <p className="text-base leading-[1.4] font-bold text-ink">{detail.text}</p>
      {detail.options.map((option) => {
        const selected = chosen.includes(option.id);
        return (
          <Button
            key={option.id}
            type="button"
            variant="outline"
            size="touch"
            aria-pressed={selected}
            onClick={() => pick(option.id)}
            className="justify-start gap-[0.7rem] rounded-xl text-left aria-pressed:border-teal aria-pressed:bg-aqua aria-pressed:shadow-none aria-pressed:ring-2 aria-pressed:ring-teal"
          >
            {/* 앞 동그라미: 고르면 채워진다(색을 구분하기 어려운 분도 모양으로 안다) */}
            <span
              aria-hidden="true"
              className={
                selected
                  ? "size-[1.08rem] shrink-0 rounded-full border-[0.31rem] border-teal bg-card"
                  : "size-[1.08rem] shrink-0 rounded-full border-[1.5px] border-line bg-card"
              }
            />
            <span className="flex-1">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
