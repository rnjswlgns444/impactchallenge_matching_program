"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ChoiceCard, ChoiceGroup } from "@/components/common/choice-card";
import { LinkButton } from "@/components/common/link-button";
import { Notice } from "@/components/common/notice";
import { Redirect } from "@/components/common/redirect";
import { StickyActions } from "@/components/layout/sticky-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { fill, text } from "@/content/text";
import { CHOOSE } from "@/core/scoring";
import { fullNumber, optionsOf } from "@/core/selection";
import { SCALE } from "@/core/table";
import { appData } from "@/data";
import type { Question } from "@/data/types";
import { useSurvey } from "@/hooks/use-survey";
import { SURVEY, firstOpen, judge } from "@/lib/session";
import { useSurveyStore, type Answer } from "@/stores/survey-store";

import { optionIcon } from "./option-icon";

// 설문 화면. 한 화면에 한 문항이고, 모든 문항은 답해야 넘어간다('넘어가기'가 없다).
//
// 문항마다 주소가 다르다(/survey?q=3). 그래서 휴대폰 '뒤로 가기'를 누르면 앞 문항으로 간다.
// - q가 없으면 아직 답하지 않은 첫 문항으로 보낸다. 앞 문항을 건너뛴 주소로 와도 같다.
// - /survey?edit=Q05는 결과 화면에서 답 하나만 고칠 때 쓴다. 그 문항만 다시 묻고 결과로 돌아간다.
// 답은 '다음'을 누를 때 저장소에 쓴다. 고르는 중인 값은 문항마다 새로 만드는 QuestionView가 들고 있다.

export function Survey() {
  const answers = useSurvey((state) => state.answers);
  const params = useSearchParams();
  const open = firstOpen(answers);
  const done = open === SURVEY.length;

  const editing = done ? SURVEY.find((question) => question.id === params.get("edit")) : undefined;
  if (editing) {
    return (
      <QuestionView key={`edit-${editing.id}`} question={editing} stored={answers[editing.id]} editing />
    );
  }

  const wanted = Number(params.get("q"));
  const valid =
    Number.isInteger(wanted) && wanted >= 1 && wanted <= Math.min(open + 1, SURVEY.length);
  if (!valid) {
    // 다 답하고 주소 없이 왔으면(시작 화면에서 다시 누름) 결과로, 아니면 이어서 답할 문항으로 보낸다
    return <Redirect to={done ? "/result" : `/survey?q=${open + 1}`} />;
  }
  const question = SURVEY[wanted - 1];
  return (
    <QuestionView key={question.id} question={question} stored={answers[question.id]} position={wanted} />
  );
}

function QuestionView({
  question,
  stored,
  position = 0,
  editing = false,
}: {
  question: Question;
  stored: Answer | undefined;
  position?: number; // 몇 번째 문항인지(1부터). 답 하나만 고칠 때는 쓰지 않는다
  editing?: boolean;
}) {
  const router = useRouter();
  const total = SURVEY.length;
  const isNumber = question.selection === "number";
  const isScale = question.selection === SCALE;
  if (!isNumber && !isScale && question.selection !== "single") {
    // 지금 설문에는 하나만 고르는 문항, 척도 문항, 숫자 문항뿐이다
    throw new Error(`설문 화면이 그릴 수 없는 문항입니다: ${question.id} (${question.selection})`);
  }

  const options: { id: string; label: string; icon?: string }[] = isScale
    ? appData.scale.map((option) => ({ id: String(option.value), label: option.label }))
    : optionsOf(question, appData.types);

  // 방금 고르거나 적은 것. 앞서 낸 답이 있으면 그것을 표시해 준다
  const [draft, setDraft] = useState(stored === undefined ? "" : String(stored));
  const [refused, setRefused] = useState(false); // 숫자를 받지 못했을 때 안내를 띄운다
  const picked = options.some((option) => option.id === draft);

  function submit() {
    let value: Answer;
    if (isNumber) {
      const full = /^\d+$/.test(draft) ? fullNumber(question, Number(draft)) : null;
      if (full === null) {
        setRefused(true); // 비웠거나 범위 밖이면 넘어가지 않고 다시 적어 달라고 한다
        return;
      }
      value = full;
    } else {
      if (!picked) return;
      value = isScale ? Number(draft) : draft;
    }
    useSurveyStore.getState().setAnswer(question.id, value);

    if (editing) {
      router.push("/result"); // 답이 바뀌었으니 결과 화면이 답에서 다시 판정한다
    } else if (position < total) {
      router.push(`/survey?q=${position + 1}`);
    } else {
      // 마지막 문항: 가장 높은 유형이 여럿이면 먼저 볼 유형을 고르러 간다
      const judged = judge(useSurveyStore.getState().answers);
      router.push(judged.state === CHOOSE ? "/pick" : "/result");
    }
  }

  // 딱 절반째 문항과 마지막 세 문항에서는 진행 글자 옆에 짧은 응원을 붙인다
  const cheer =
    position === Math.ceil(total / 2) ? text.cheerHalf : position > total - 3 ? text.cheerLast : "";
  const help = question.help ?? (isScale ? text.scaleHelp : "");

  return (
    <form
      className="flex flex-1 flex-col gap-[0.6rem]"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {editing ? (
        // 답 하나만 고치는 중: '질문 5 / 27'을 보여 주면 뒤의 문항을 다시 해야 하는 것으로 읽힌다
        <Notice kind="info">{text.editNotice}</Notice>
      ) : (
        <Progress value={(position / total) * 100} className="gap-[0.3rem]">
          <div className="flex w-full items-baseline justify-between gap-[0.48rem]">
            <ProgressLabel className="font-bold text-teal tabular-nums">
              {fill(text.progress, { number: position, total })}
            </ProgressLabel>
            {cheer ? <span className="text-sm font-bold text-clay">{cheer}</span> : null}
          </div>
        </Progress>
      )}

      <div className="flex flex-col gap-[0.6rem] rounded-xl border bg-card p-[clamp(0.76rem,3vw,1.3rem)] shadow-[0_3px_14px_rgba(48,55,37,0.045)]">
        <div>
          <h1 aria-live="polite" className="text-[clamp(1.24rem,4.5vw,1.6rem)] leading-[1.4] font-bold">
            {question.text}
          </h1>
          {help ? (
            <p className="mt-[0.26rem] text-[0.95rem] leading-[1.6] text-muted-foreground">{help}</p>
          ) : null}
        </div>

        {isNumber ? (
          <>
            <Input
              inputMode="numeric"
              autoComplete="off"
              placeholder={text.numberPlaceholder}
              aria-label={question.text}
              aria-invalid={refused || undefined}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value.replace(/\D/g, "").slice(0, 4));
                setRefused(false);
              }}
              className="h-[2.6rem] bg-card text-base md:text-base"
            />
            {refused ? <Notice live>{text.numberRequired}</Notice> : null}
          </>
        ) : (
          <ChoiceGroup value={picked ? draft : null} onValueChange={setDraft} label={question.text}>
            {options.map((option) => (
              <ChoiceCard key={option.id} value={option.id} icon={optionIcon(option.icon)}>
                {option.label}
              </ChoiceCard>
            ))}
          </ChoiceGroup>
        )}
      </div>

      <StickyActions>
        <Button type="submit" variant="cta" size="touch" disabled={!isNumber && !picked}>
          {text.next}
        </Button>
      </StickyActions>

      {editing ? (
        <LinkButton href="/result" variant="link" className="w-auto self-start">
          {text.editCancel}
        </LinkButton>
      ) : (
        // 첫 문항에서는 시작 화면으로 돌아간다. 답은 지워지지 않는다
        <LinkButton
          href={position > 1 ? `/survey?q=${position - 1}` : "/"}
          variant="link"
          className="w-auto self-start"
        >
          {text.back}
        </LinkButton>
      )}
    </form>
  );
}
