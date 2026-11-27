"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Redirect } from "@/components/common/redirect";
import { DetailQuestion } from "@/components/features/type-view/detail-question";
import { StickyActions } from "@/components/layout/sticky-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { text } from "@/content/text";
import { hasWish } from "@/core/matcher";
import { noPlace } from "@/core/places";
import { CHOOSE } from "@/core/scoring";
import { detailOf, question } from "@/core/selection";
import { FREE_Q } from "@/core/table";
import { appData, getType } from "@/data";
import type { TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { useSurvey } from "@/hooks/use-survey";
import { isComplete, judge, resumeHref } from "@/lib/session";
import { useSurveyStore } from "@/stores/survey-store";

// 조금 더 맞춰 보기: 설문 끝과 결과 사이의 화면. 대표 유형의 세부 질문과 직접 적기가 나온다.
// 둘 다 안 해도 되고, 맨 위에서 바로 건너뛸 수 있다. 유형 이름은 여기서 보여 주지 않는다(결과 화면에서 처음 본다).
//
// '결과 보기'는 AI를 바로 부르지 않는다. '물어야 함'만 켜고 결과 화면으로 간다. 실제 호출은 결과 화면이 한 번 한다.
// 적은 글은 기기 안에만 두고, AI에는 개인정보 형태를 지운 글만 간다.

export function Tune() {
  const answers = useSurvey((state) => state.answers);
  if (!isComplete(answers)) return <Redirect to={resumeHref(answers)} />;

  const judged = judge(answers);
  const type = judged.primary ? getType(judged.primary) : undefined;
  // 가장 높은 유형이 여럿이면 먼저 고른다
  if (judged.state === CHOOSE || !type) return <Redirect to="/pick" />;
  return <TuneBody key={type.id} type={type} />;
}

function TuneBody({ type }: { type: TypeInfo }) {
  const router = useRouter();
  const fieldId = useId();
  const stored = useSurvey((state) => state.wish);
  const context = usePlaceContext(type.id, false);
  const [draft, setDraft] = useState(stored); // 적는 중인 글. 다시 적으러 왔으면 앞서 적은 글을 보여 준다

  const ask = question(appData.questions, FREE_Q);
  const limit = ask.max_characters ?? 500;
  const detail = detailOf(type);

  function leave(wish: string) {
    const mode = wish === "" ? "none" : hasWish(wish, appData.settings.free_empty_words) ? "ask" : "unclear";
    useSurveyStore.getState().finishTune(wish, mode);
    router.push("/result");
  }

  return (
    <form
      className="rise flex flex-1 flex-col gap-[0.8rem]"
      onSubmit={(event) => {
        event.preventDefault();
        leave(draft.trim());
      }}
    >
      <div className="flex flex-col items-start gap-[0.4rem]">
        <p className="rounded-full border border-[#C9E3D9] bg-[#EAF7F2] px-[0.7rem] py-[0.15rem] text-[0.75rem] leading-[1.5] font-bold text-teal">
          {text.tuneBadge}
        </p>
        <h1 className="text-[clamp(1.4rem,6vw,1.8rem)] leading-[1.35] font-extrabold tracking-[-0.03em]">
          {text.tuneHeading}
        </h1>
        <p className="text-[0.95rem] leading-[1.55] text-muted-foreground">{text.tuneHelp}</p>
        {/* 건너뛰기: 적던 글은 버리고 결과로 간다 */}
        <Link
          href="/result"
          onNavigate={(event) => {
            event.preventDefault();
            leave("");
          }}
          className="rounded-md py-[0.3rem] text-[0.95rem] font-bold text-teal underline underline-offset-4"
        >
          {text.tuneSkip}
        </Link>
      </div>

      {/* 안내할 곳이 없는 유형에는 세부 질문을 묻지 않는다 */}
      {detail && !noPlace(context.result) ? <DetailQuestion typeId={type.id} detail={detail} browse={false} /> : null}

      <div className="flex flex-col gap-[0.4rem]">
        <label htmlFor={fieldId} className="text-base leading-[1.4] font-bold text-ink">
          {ask.text}
        </label>
        {ask.help ? <p className="text-[0.9rem] leading-[1.55] text-muted-foreground">{ask.help}</p> : null}
        <Textarea
          id={fieldId}
          value={draft}
          maxLength={limit}
          rows={4}
          placeholder={text.freePlaceholder}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-[6.4rem] rounded-xl border-edge bg-card px-[0.9rem] py-[0.7rem] text-base leading-[1.55] shadow-card placeholder:text-[#66736C] focus:placeholder:text-transparent md:text-base"
        />
        {/* 무엇을 AI로 보내는지. 누르기 전에 읽을 수 있게 단추 바로 위에 둔다 */}
        <p className="text-[0.5rem] leading-[1.6] text-muted-foreground">{text.freePrivacy}</p>
      </div>

      <StickyActions>
        <Button type="submit" variant="cta" size="touch">
          {text.tuneDone}
        </Button>
      </StickyActions>
    </form>
  );
}
