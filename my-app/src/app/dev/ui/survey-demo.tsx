"use client";

import { useState } from "react";

import { ChoiceCard, ChoiceGroup } from "@/components/common/choice-card";
import { StickyActions } from "@/components/layout/sticky-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel } from "@/components/ui/progress";

// 개발용: 3문항 설문 시험판. 진행 막대, 선택 카드, 아래 붙는 '다음'이
// 휴대폰 폭에서 맞는지 보려는 것이다. 답은 저장하지 않는다(실제 설문은 저장소에 쓴다).

const SCALE = ["매우 그래요", "그래요", "보통이에요", "아니에요", "전혀 아니에요"];

const QUESTIONS = [
  { kind: "scale", title: "꾸준히 다닐 직장을 찾고 싶어요.", options: SCALE },
  { kind: "single", title: "성별을 알려 주세요.", options: ["여성", "남성"] },
  { kind: "number", title: "태어난 해를 적어 주세요.", options: [] },
] as const;

export function SurveyDemo() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);

  const question = QUESTIONS[index];
  const answer = answers[index];
  const last = index === QUESTIONS.length - 1;
  const setAnswer = (value: string) =>
    setAnswers((prev) => prev.map((old, i) => (i === index ? value : old)));

  return (
    <div className="flex flex-col gap-[0.6rem]">
      <Progress value={((index + 1) / QUESTIONS.length) * 100} className="gap-[0.3rem]">
        <ProgressLabel className="font-bold text-teal tabular-nums">
          질문 {index + 1} / {QUESTIONS.length}
        </ProgressLabel>
      </Progress>

      <div className="flex flex-col gap-[0.6rem] rounded-xl border bg-card p-[0.8rem]">
        <h3 className="text-[clamp(1.24rem,4.5vw,1.6rem)] leading-[1.4] font-bold">
          {question.title}
        </h3>
        {question.kind === "number" ? (
          <Input
            inputMode="numeric"
            placeholder="예) 1966"
            aria-label={question.title}
            value={answer}
            onChange={(event) => setAnswer(event.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-[2.6rem] bg-card text-base md:text-base"
          />
        ) : (
          <ChoiceGroup value={answer || null} onValueChange={setAnswer} label={question.title}>
            {question.options.map((option) => (
              <ChoiceCard key={option} value={option}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGroup>
        )}
      </div>

      <StickyActions>
        <Button
          variant="cta"
          size="touch"
          disabled={!answer}
          onClick={() => setIndex(last ? 0 : index + 1)}
        >
          {last ? "처음 문항으로" : "다음"}
        </Button>
      </StickyActions>
      <Button
        variant="link"
        size="touch"
        className="w-auto self-start"
        disabled={index === 0}
        onClick={() => setIndex(index - 1)}
      >
        ← 이전으로
      </Button>
    </div>
  );
}
