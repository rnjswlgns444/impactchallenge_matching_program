"use client";

import { characterGender } from "@/components/common/character";
import { FinePrint } from "@/components/common/fine-print";
import { Fold, FoldGroup } from "@/components/common/fold";
import { PlaceRow } from "@/components/common/place-row";
import { Redirect } from "@/components/common/redirect";
import { RestartButton } from "@/components/features/session/restart-button";
import { PlaceSection } from "@/components/features/type-view/place-section";
import { TypeHero } from "@/components/features/type-view/type-hero";
import { fill, koreanDate, text } from "@/content/text";
import { SHOWN_PLACES, placeName } from "@/core/places";
import { CHOOSE } from "@/core/scoring";
import { GENDER_Q, PRIORITY_Q, SCALE } from "@/core/table";
import { appData, getType } from "@/data";
import type { Question, TypeInfo } from "@/data/types";
import { usePlaceContext } from "@/hooks/use-place-context";
import { useSurvey } from "@/hooks/use-survey";
import { placeHref, surveyEditHref } from "@/lib/routes";
import { SURVEY, isComplete, judge } from "@/lib/session";
import type { Answer } from "@/stores/survey-store";

// 결과 화면: 유형 카드 → 이 유형의 특징(접힌 줄) → 유형에 맞는 기관 → 더 보기 → 처음부터 다시 하기 → 작은 글.
// 대표 유형 하나만 보여 준다. 점수는 보여 주지 않는다. 결과는 저장해 두지 않고 답에서 다시 판정한다.
// 설문을 덜 했으면 설문으로, 가장 높은 유형이 여럿인데 아직 고르지 않았으면 고르는 화면으로 보낸다.

export function Result() {
  const answers = useSurvey((state) => state.answers);
  if (!isComplete(answers)) return <Redirect to="/survey" />;

  const judged = judge(answers);
  const type = judged.primary ? getType(judged.primary) : undefined;
  if (judged.state === CHOOSE || !type) return <Redirect to="/pick" />;

  // 가장 높은 유형이 여럿이어서 본인이 골랐던 사람에게만 '다시 고르기'를 보여 준다
  const canRepick = judged.candidates.length > 1 && PRIORITY_Q in answers;
  return <ResultBody key={type.id} type={type} answers={answers} canRepick={canRepick} />;
}

// 설문 답을 화면에 보여 줄 글로 바꾼다. 예) 4 → '그래요', 'female' → '여성'
function answerLabel(question: Question, value: Answer | undefined): string {
  const options =
    question.selection === SCALE
      ? appData.scale.map((option) => ({ id: String(option.value), label: option.label }))
      : (question.options ?? []);
  return options.find((option) => option.id === String(value))?.label ?? String(value ?? "");
}

function ResultBody({
  type,
  answers,
  canRepick,
}: {
  type: TypeInfo;
  answers: Record<string, Answer>;
  canRepick: boolean;
}) {
  const context = usePlaceContext(type.id, false);
  const shown = context.places.slice(0, SHOWN_PLACES);
  // 위에 이미 놓인 창구는 '함께 찾아 주는 곳'에서 되풀이하지 않는다
  const onScreen = new Set(context.places.map((program) => program.id));
  const consults = context.consults.filter((program) => !onScreen.has(program.id));

  const notes: string[] = [text.disclaimer];
  if (shown.length > 0 && !context.result.needsChoice) {
    // 화면에 놓인 곳 가운데 가장 오래된 확인 날짜
    const oldest = shown.map((program) => program["확인날짜"]).sort()[0];
    notes.push(fill(text.placesChecked, { date: koreanDate(oldest) }));
  }

  return (
    <>
      {/* 성별 답은 그림을 고르는 데만 쓴다 */}
      <TypeHero type={type} label={text.typeLabel} gender={characterGender(answers[GENDER_Q])} />
      <FoldGroup>
        <Fold value="feature" title={text.featureHeading}>
          <p>{type.feature}</p>
        </Fold>
      </FoldGroup>

      <PlaceSection type={type} context={context} browse={false} />

      <FoldGroup className="mt-[0.4rem]">
        <Fold value="more" title={text.moreToggle}>
          <FoldGroup>
            <Fold value="edit" title={text.editHeading}>
              <p className="text-muted-foreground">{text.editSelect}</p>
              {SURVEY.map((question, index) => (
                <PlaceRow
                  key={question.id}
                  href={surveyEditHref(question.id)}
                  title={fill(text.editOption, {
                    number: index + 1,
                    question: question.text,
                    answer: answerLabel(question, answers[question.id]),
                  })}
                />
              ))}
            </Fold>
            {consults.length > 0 ? (
              <Fold value="consult" title={text.consultHeading}>
                {consults.map((program) => (
                  <PlaceRow
                    key={program.id}
                    href={placeHref(program.id, null)}
                    title={placeName(program)}
                    sub={program["프로그램명"]}
                  />
                ))}
              </Fold>
            ) : null}
          </FoldGroup>
          {canRepick ? <PlaceRow href="/pick" title={text.repickButton} /> : null}
        </Fold>
      </FoldGroup>

      <RestartButton />
      <FinePrint items={notes} />
    </>
  );
}
