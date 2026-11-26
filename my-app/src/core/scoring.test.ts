// 채점·대표 유형 판정 테스트. app/tests/test_scoring.py를 같은 이름으로 옮긴 것이다.
// 자료 파일을 읽지 않고 이 파일 안의 가짜 문항 연결표를 쓴다.

import { describe, expect, it } from "vitest";

import { CHOOSE, RESULT, ScoringError, score } from "./scoring";

// 유형 12개, 유형마다 문항 2개 (T01: Q01·Q02, T02: Q03·Q04, ...)
const two = (n: number) => String(n).padStart(2, "0");
const PAIRS: Record<string, string[]> = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [`T${two(i + 1)}`, [`Q${two(2 * i + 1)}`, `Q${two(2 * i + 2)}`]])
);
const ALL_QUESTIONS = Object.values(PAIRS).flat();

// 모든 문항에 base로 답하고, 적어 준 유형만 두 문항 값을 바꾼다. 예: answers(1, { T06: [5, 5] })
function answers(base: unknown = 1, byType: Record<string, unknown[]> = {}): Record<string, unknown> {
  const result: Record<string, unknown> = Object.fromEntries(ALL_QUESTIONS.map((qid) => [qid, base]));
  for (const [typeId, values] of Object.entries(byType)) {
    PAIRS[typeId].forEach((qid, i) => (result[qid] = values[i]));
  }
  return result;
}
const run = (given: Record<string, unknown>, priority: string | null = null) =>
  score(given, PAIRS, 8, priority);

describe("채점", () => {
  it("all_neutral_asks_the_user_to_choose: 전부 '보통'이면 본인이 12개 중에서 고른다", () => {
    const result = run(answers(3));
    expect(result.state).toBe(CHOOSE);
    expect(result.primary).toBeNull();
    expect(result.candidates).toHaveLength(12);
  });

  it("no_answers_is_an_error: 답이 없으면 유형을 지어내지 않고 멈춘다", () => {
    expect(() => run({})).toThrow(ScoringError);
  });

  it("single_top_becomes_primary", () => {
    const result = run(answers(1, { T06: [5, 5] }));
    expect([result.state, result.primary, result.secondary]).toEqual([RESULT, "T06", null]);
    expect(result.scores.T06).toBe(10);
    expect(result.scores.T01).toBe(2);
  });

  it("tie_asks_the_user_to_choose", () => {
    const result = run(answers(1, { T06: [5, 5], T07: [5, 5] }));
    expect(result.state).toBe(CHOOSE);
    expect(result.primary).toBeNull();
    expect(result.candidates).toEqual(["T06", "T07"]);
  });

  it("chosen_priority_becomes_primary_and_other_is_secondary", () => {
    const result = run(answers(1, { T06: [5, 5], T07: [5, 5] }), "T07");
    expect([result.state, result.primary, result.secondary]).toEqual([RESULT, "T07", "T06"]);
  });

  it("low_single_top_still_becomes_primary: 점수가 낮아도 가장 높은 유형이 하나면 대표가 된다", () => {
    for (const pair of [[4, 3], [3, 3], [2, 1]]) {
      const result = run(answers(1, { T01: pair }));
      expect([result.state, result.primary, result.secondary], String(pair)).toEqual([RESULT, "T01", null]);
    }
  });

  it("one_missing_answer_is_an_error_not_filled_in: 빠진 답을 0점이나 3점으로 채우지 않는다", () => {
    expect(() => run(answers(1, { T02: [5, null], T06: [5, 5] }))).toThrow(ScoringError);
    const withoutKey = answers(1, { T06: [5, 5] });
    delete withoutKey.Q03;
    expect(() => run(withoutKey)).toThrow(ScoringError);
  });

  it("everything_high_does_not_pick_one", () => {
    const result = run(answers(5));
    expect(result.state).toBe(CHOOSE);
    expect(result.primary).toBeNull();
    expect(result.candidates).toHaveLength(12);
  });

  it.each([0, 6, "5", 4.5, true, undefined, NaN])("bad_scale_value_is_rejected: %s", (bad) => {
    expect(() => run(answers(1, { T01: [bad, 3] }))).toThrow(ScoringError);
  });

  it("other_questions_do_not_affect_scores", () => {
    const given = { ...answers(1, { T06: [5, 5] }), P_AGE: 60, P_GENDER: "female", Q_FREE: "글" };
    expect(run(given).scores).toEqual(run(answers(1, { T06: [5, 5] })).scores);
  });

  it("all_lowest_lets_the_user_choose_any_type: 전부 최저여도 본인이 고른 유형이 대표가 된다", () => {
    const result = run(answers(1), "T12");
    expect([result.state, result.primary, result.secondary]).toEqual([RESULT, "T12", null]);
    expect(result.secondaryCandidates).toEqual([]);
  });

  it("priority_outside_the_top_is_ignored", () => {
    const result = run(answers(1, { T06: [3, 3] }), "T12");
    expect([result.state, result.primary]).toEqual([RESULT, "T06"]);
  });

  it("stale_priority_is_ignored: 답을 고쳐 후보에서 빠진 예전 선택은 버린다", () => {
    const result = run(answers(1, { T06: [5, 5], T07: [4, 4] }), "T07");
    expect([result.state, result.primary, result.secondary]).toEqual([RESULT, "T06", "T07"]);
  });

  it("tied_second_place_is_not_picked_automatically", () => {
    const result = run(answers(1, { T06: [5, 5], T07: [4, 4], T09: [4, 4] }));
    expect(result.primary).toBe("T06");
    expect(result.secondary).toBeNull();
    expect(result.secondaryCandidates).toEqual(["T07", "T09"]);
  });

  it("second_place_below_high_is_not_shown", () => {
    const result = run(answers(1, { T06: [5, 5], T07: [4, 3] }));
    expect(result.secondary).toBeNull();
    expect(result.secondaryCandidates).toEqual([]);
  });

  it("점수표는 유형 파일에 적힌 순서를 따른다", () => {
    expect(Object.keys(run(answers(3)).scores)).toEqual(Object.keys(PAIRS));
  });

  it("문항 연결표가 비었거나 문항 없는 유형이 있으면 멈춘다", () => {
    expect(() => score(answers(3), {}, 8)).toThrow(ScoringError);
    expect(() => score(answers(3), { T01: [] }, 8)).toThrow(ScoringError);
  });
});
