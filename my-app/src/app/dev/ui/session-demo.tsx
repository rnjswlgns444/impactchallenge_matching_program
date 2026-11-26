"use client";

import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurvey } from "@/hooks/use-survey";
import { useSurveyStore } from "@/stores/survey-store";

// 개발용: 답 저장소를 눌러 보는 칸. 되묻는 창은 /browse 같은 화면의 ANTI로 본다.

function AnswerCount() {
  // 답의 수(숫자)만 고른다. selector가 새 객체를 만들지 않게 한다.
  const count = useSurvey((state) => Object.keys(state.answers).length);
  return <p data-testid="answer-count">저장된 답: {count}개</p>;
}

export function SessionDemo() {
  return (
    <>
      <Suspense fallback={<Skeleton className="h-[1.6rem] w-1/2" />}>
        <AnswerCount />
      </Suspense>
      <Button
        variant="outline"
        size="touch"
        onClick={() => {
          const store = useSurveyStore.getState();
          const next = Object.keys(store.answers).length + 1;
          store.setAnswer("DEMO" + next, 5);
        }}
      >
        답 하나 넣기
      </Button>
      <Button
        variant="outline"
        size="touch"
        onClick={() => useSurveyStore.getState().reset()}
      >
        답 지우기
      </Button>
    </>
  );
}
