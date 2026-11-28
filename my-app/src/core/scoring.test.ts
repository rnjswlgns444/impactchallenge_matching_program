// 채점·대표 유형 판정 테스트(9문항 보기 고르기, 11/28).
// 앞부분은 이 파일 안의 작은 견본 문항을 쓰고, 뒷부분은 실제 문항 파일(choice_questions.yaml)의 성질을 본다.

import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import type { Question } from "@/data/types";

import { CHOOSE, RESULT, ScoringError, score } from "./scoring";
import { choiceQuestions } from "./selection";

// ── 견본: 유형 셋, 문항 둘. F는 분야를 묻는 문항(동점일 때 본다) ──
const TYPES = ["T01", "T02", "T03"];
const QUESTIONS: Question[] = [
  {
    id: "F",
    text: "분야",
    selection: "single",
    options: [
      { id: "a", label: "일", scores: { T01: 1, T02: 1 } },
      { id: "b", label: "생활", scores: { T03: 1 } },
    ],
  },
  {
    id: "S",
    text: "상황",
    selection: "single",
    options: [
      { id: "a", label: "가", scores: { T01: 1 } },
      { id: "c", label: "다", scores: { T03: 1 } },
      { id: "d", label: "라", scores: { T01: 2, T02: 2 } },
      { id: "e", label: "마", scores: { T01: 1.5 } },
    ],
  },
];
const run = (f: unknown, s: unknown, priority: string | null = null, extra: Record<string, unknown> = {}) =>
  score({ F: f, S: s, ...extra }, QUESTIONS, TYPES, "F", priority);

describe("채점", () => {
  it("고른 보기의 점수를 더하고, 단독 1위가 대표 유형이다", () => {
    const result = run("a", "a");
    expect(result).toEqual({ state: RESULT, primary: "T01", candidates: ["T01"], scores: { T01: 2, T02: 1, T03: 0 } });
  });

  it("1.5점 같은 소수 점수도 더한다", () => {
    expect(run("b", "e").scores).toEqual({ T01: 1.5, T02: 0, T03: 1 });
    expect(run("b", "e").primary).toBe("T01");
  });

  it("분야가 다른 동점은 분야 문항에서 고른 쪽으로 정한다", () => {
    // T01 1점(상황), T03 1점(분야) → 분야 문항에서 '생활'을 골랐으므로 T03
    const result = run("b", "a");
    expect([result.state, result.primary, result.candidates]).toEqual([RESULT, "T03", ["T03"]]);
  });

  it("같은 분야 안의 동점은 코드가 정하지 않고 본인이 고른다", () => {
    // T01·T02·T03 모두 1점 → 분야 '일'의 T01·T02만 남는다
    const result = run("a", "c");
    expect([result.state, result.primary, result.candidates]).toEqual([CHOOSE, null, ["T01", "T02"]]);
  });

  it("동점 중에 분야 문항의 유형이 없으면 그대로 본인이 고른다", () => {
    // T01·T02 2점, T03 1점. 분야는 '생활'(T03)이라 좁힐 수 없다
    const result = run("b", "d");
    expect([result.state, result.candidates]).toEqual([CHOOSE, ["T01", "T02"]]);
  });

  it("본인이 고른 유형은 지금 후보 안에 있을 때만 대표가 된다", () => {
    expect(run("a", "c", "T02").primary).toBe("T02");
    expect(run("a", "c", "T02").state).toBe(RESULT);
    // T03은 좁힌 후보 밖이다(답을 고친 뒤 남은 예전 선택)
    expect(run("a", "c", "T03").state).toBe(CHOOSE);
    expect(run("a", "a", "T02").primary).toBe("T01");
  });

  it("다른 문항의 답(기본정보 등)은 점수에 넣지 않는다", () => {
    expect(run("a", "a", null, { P_GENDER: "female", P_AGE: 1966 }).scores).toEqual(run("a", "a").scores);
  });

  it("답이 빠졌거나, 없는 보기이거나, 글자가 아니면 오류로 멈춘다", () => {
    expect(() => score({ F: "a" }, QUESTIONS, TYPES, "F")).toThrow(ScoringError);
    expect(() => run("a", "z")).toThrow(ScoringError);
    expect(() => run("a", 1)).toThrow(ScoringError);
    expect(() => score({}, [], TYPES, "F")).toThrow(ScoringError);
  });
});

describe("실제 문항(choice_questions.yaml)", () => {
  const choice = choiceQuestions(appData.questions);
  const typeIds = appData.types.map((type) => type.id);

  it("9문항이고 동점 문항은 그중 하나다", () => {
    expect(choice.map((q) => q.id)).toEqual(["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09"]);
    expect(choice.map((q) => q.id)).toContain(appData.tiebreak);
  });

  it("12유형 모두 단독 1위로 나올 수 있다(모든 답 조합을 다 넣어 봄)", () => {
    const reached = new Set<string>();
    const picks = new Array(choice.length).fill(0);
    const sizes = choice.map((q) => (q.options ?? []).length);
    for (;;) {
      const answers = Object.fromEntries(choice.map((q, i) => [q.id, q.options![picks[i]].id]));
      const result = score(answers, choice, typeIds, appData.tiebreak);
      if (result.state === RESULT && result.primary) reached.add(result.primary);
      // 다음 조합으로(마지막 문항부터 하나씩 올린다)
      let i = picks.length - 1;
      while (i >= 0 && ++picks[i] === sizes[i]) picks[i--] = 0;
      if (i < 0) break;
    }
    expect([...reached].sort()).toEqual(typeIds);
  });
});
