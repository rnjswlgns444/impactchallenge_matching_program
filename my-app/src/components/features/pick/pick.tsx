"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ChoiceCard, ChoiceGroup } from "@/components/common/choice-card";
import { FinePrint } from "@/components/common/fine-print";
import { Redirect } from "@/components/common/redirect";
import { StickyActions } from "@/components/layout/sticky-actions";
import { Button } from "@/components/ui/button";
import { fill, text } from "@/content/text";
import { buildResult } from "@/core/candidates";
import { now } from "@/core/clock";
import { placeName } from "@/core/places";
import { optionsOf, question } from "@/core/selection";
import { PRIORITY_Q } from "@/core/table";
import { appData } from "@/data";
import { useSurvey } from "@/hooks/use-survey";
import { isComplete, judge, resumeHref } from "@/lib/session";
import { useSurveyStore, type Answer } from "@/stores/survey-store";

// 점수가 가장 높은 유형이 여럿일 때, 무엇부터 볼지 본인이 고른다.
// 코드가 대신 정하지 않는다. 하나를 고르고 '다음'을 눌러야 결과로 넘어간다.
// 고르기 쉽게, 선택지 아래에 그 유형에서 지금 안내할 수 있는 곳 하나를 예로 보여 준다.

export function Pick() {
  const answers = useSurvey((state) => state.answers);
  const details = useSurvey((state) => state.details);
  if (!isComplete(answers)) return <Redirect to={resumeHref(answers)} />;

  const candidates = judge(answers).candidates;
  // 가장 높은 유형이 하나뿐이면 고를 것이 없다
  if (candidates.length < 2) return <Redirect to="/result" />;

  return (
    <PickBody
      key={candidates.join("|")}
      candidates={candidates}
      answers={answers}
      details={details}
      stored={answers[PRIORITY_Q]}
    />
  );
}

function PickBody({
  candidates,
  answers,
  details,
  stored,
}: {
  candidates: string[];
  answers: Record<string, Answer>;
  details: Record<string, string | string[] | null>;
  stored: Answer | undefined;
}) {
  const router = useRouter();
  const [when] = useState(now);
  // 앞서 고른 것이 지금 후보에 있으면 표시해 준다(다시 고르러 왔을 때)
  const [draft, setDraft] = useState(typeof stored === "string" && candidates.includes(stored) ? stored : "");

  const ask = question(appData.questions, PRIORITY_Q);
  const options = optionsOf(ask, appData.types, candidates);
  // 예로 드는 곳도 후보 거르기가 걸러 준 것에서만 고른다
  const previews = buildResult(appData.programs, appData.types, candidates, details, when, answers);
  const examples = new Map(
    previews.map((result) => [result.typeId, result.contacts[0] ?? result.lists[0]] as const)
  );

  return (
    <form
      className="flex flex-1 flex-col gap-[0.6rem]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft) return;
        useSurveyStore.getState().setAnswer(PRIORITY_Q, draft);
        router.push("/result");
      }}
    >
      <p>{candidates.length === 2 ? text.tieTwo : text.tieMany}</p>
      <h1 className="text-[clamp(1.24rem,4.5vw,1.6rem)] leading-[1.4] font-bold">{ask.text}</h1>
      <ChoiceGroup value={draft || null} onValueChange={setDraft} label={ask.text}>
        {options.map((option) => {
          const example = examples.get(option.id);
          return (
            <ChoiceCard
              key={option.id}
              value={option.id}
              note={
                example
                  ? fill(text.priorityExample, { org: placeName(example), program: example["프로그램명"] })
                  : undefined
              }
            >
              {option.label}
            </ChoiceCard>
          );
        })}
      </ChoiceGroup>
      <StickyActions>
        <Button type="submit" variant="cta" size="touch" disabled={!draft}>
          {text.next}
        </Button>
      </StickyActions>
      <FinePrint items={[text.disclaimer]} />
    </form>
  );
}
