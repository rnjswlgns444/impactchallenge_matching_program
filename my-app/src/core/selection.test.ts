// 문항 구성과 선택지 테스트. app/tests/test_core.py의 문항 관련 테스트를 옮긴 것이다.
// 문항과 유형은 실제 자료를 쓴다(새 앱의 자료에는 걸림돌 문항이 없다).

import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import type { Option, TypeInfo } from "@/data/types";

import { CHOOSE, RESULT, score } from "./scoring";
import {
  agesFromBirthYear,
  choiceQuestions,
  chosenDetailOptions,
  detailOf,
  fullNumber,
  nextQuestion,
  optionsOf,
  question,
  surveyQuestions,
  toggle,
} from "./selection";
import { AGE_Q, GENDER_Q, PRIORITY_Q, WORK_Q } from "./table";

const { questions, types } = appData;
const typeOf = (id: string): TypeInfo => types.find((t) => t.id === id)!;
const choice = choiceQuestions(questions);

// 실제 문항(C01~C09)에 고른 보기. 글자 하나가 문항 하나다
const picks = (letters: string): Record<string, unknown> =>
  Object.fromEntries(choice.map((q, i) => [q.id, letters[i]]));
const T05_ONLY = picks("bbbccabca"); // 취미발견형이 단독 1위(9.5점, 다음 동네친구형 6.5점)
const T05_T07_TIE = picks("bbbcabbca"); // 취미발견형·동네친구형 8.5점 동점(같은 분야라 본인이 고름)
const judge = (answers: Record<string, unknown>, priority: string | null = null) =>
  score(
    answers,
    choice,
    types.map((t) => t.id),
    appData.tiebreak,
    priority
  );

describe("문항 구성과 유형 연결", () => {
  it("survey_asks_profile_then_choice: 기본정보 3문항 뒤에 유형 찾기 9문항, 척도·걸림돌은 없다", () => {
    const survey = surveyQuestions(questions);
    expect(survey.slice(0, 3).map((q) => q.id)).toEqual([GENDER_Q, AGE_Q, WORK_Q]);
    expect(survey.slice(3)).toEqual(choice);
    expect(survey).toHaveLength(12);
  });

  it("next_question: 답하지 않은 첫 문항을 주고, 다 답하면 null이다", () => {
    expect(nextQuestion({}, questions)?.id).toBe(GENDER_Q);
    expect(nextQuestion({ [GENDER_Q]: "female" }, questions)?.id).toBe(AGE_Q);
    const all = Object.fromEntries(surveyQuestions(questions).map((q) => [q.id, "a"]));
    expect(nextQuestion(all, questions)).toBeNull();
  });

  it("real_questions_lead_to_one_type", () => {
    const result = judge(T05_ONLY);
    expect([result.state, result.primary]).toEqual([RESULT, "T05"]);
    expect(result.scores.T05).toBe(9.5);
  });

  it("profile_does_not_change_type: 기본정보는 유형을 바꾸지 않는다", () => {
    const base = judge(T05_ONLY);
    const withProfile = judge({ ...T05_ONLY, [GENDER_Q]: "male", [AGE_Q]: 1950, [WORK_Q]: "employed" });
    expect(withProfile).toEqual(base);
  });

  it("tie_is_settled_by_the_user: 동점이면 본인이 후보 가운데서 고른다", () => {
    const tie = judge(T05_T07_TIE);
    expect(tie.state).toBe(CHOOSE);
    const options = optionsOf(question(questions, PRIORITY_Q), types, tie.candidates);
    expect(options.map((opt) => opt.id)).toEqual(["T05", "T07"]);
    expect(options[0].label).toBe(typeOf("T05").statement);
    expect(judge(T05_T07_TIE, "T07").primary).toBe("T07");
    expect(judge(T05_T07_TIE, "T01").state).toBe(CHOOSE); // 후보가 아닌 유형은 고른 것으로 치지 않는다
  });
});

describe("선택지", () => {
  it("exclusive_option_cannot_mix: 함께 고를 수 없는 선택지", () => {
    const options: Option[] = [
      { id: "alone", label: "혼자" },
      { id: "cost", label: "비용" },
      { id: "none", label: "없어요", exclusive: true },
    ];
    expect(toggle(["alone", "cost"], "none", options)).toEqual(["none"]); // 없어요를 누르면 나머지가 풀림
    expect(toggle(["none"], "alone", options)).toEqual(["alone"]); // 다른 것을 누르면 없어요가 풀림
    expect(toggle(["alone"], "cost", options)).toEqual(["alone", "cost"]);
    expect(toggle(["alone", "cost"], "alone", options)).toEqual(["cost"]); // 다시 누르면 해제
  });

  it("disabled_detail_is_not_asked: 꺼 둔 세부 질문은 묻지 않는다", () => {
    const off: TypeInfo = structuredClone(typeOf("T08"));
    off.detail!.enabled = false;
    expect(detailOf(off)).toBeNull();
    expect(detailOf(typeOf("T08"))?.id).toBe("D08");
    expect(detailOf(typeOf("T12"))?.id).toBe("D12");
    expect(detailOf(typeOf("T01"))?.id).toBe("D01");
    expect(chosenDetailOptions(off, [off.detail!.options[0].id])).toEqual([]);
    expect(chosenDetailOptions(typeOf("T01"), ["explore", "unknown"]).map((opt) => opt.id)).toEqual(["explore"]);
  });

  it("세부 질문의 답은 하나여도, 목록이어도, 비어 있어도 된다", () => {
    expect(chosenDetailOptions(typeOf("T01"), "explore").map((opt) => opt.id)).toEqual(["explore"]);
    expect(chosenDetailOptions(typeOf("T01"), null)).toEqual([]);
    expect(chosenDetailOptions(typeOf("T01"), [])).toEqual([]);
    expect(chosenDetailOptions(typeOf("T01"), "")).toEqual([]);
  });
});

describe("태어난 해", () => {
  it("two_digit_birth_year_is_read_as_19xx: 66은 1966으로 받고, 범위 밖은 받지 않는다", () => {
    const age = question(questions, AGE_Q);
    expect(fullNumber(age, 66)).toBe(1966);
    expect(fullNumber(age, 1966)).toBe(1966);
    expect(fullNumber(age, 5)).toBeNull(); // 1905년생은 범위(1920~) 밖
    expect(fullNumber(age, 1800)).toBeNull();
    expect(fullNumber(age, 2020)).toBeNull();
    expect(fullNumber(age, null)).toBeNull();
    expect(fullNumber(age, "1966")).toBeNull();
    expect(fullNumber(age, 1966.5)).toBeNull();
    expect(fullNumber({ min: 0, max: 120 }, 66)).toBe(66); // short_base가 없는 문항은 그대로
  });

  it("만 나이는 생일 전후로 한 살 차이 나는 두 가지다", () => {
    expect(agesFromBirthYear(1976, 2026)).toEqual([49, 50]);
    expect(agesFromBirthYear(1976, 2027)).toEqual([50, 51]);
  });
});
