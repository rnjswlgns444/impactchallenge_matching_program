// 유형 찾기 문항(보기 고르기)의 답을 유형 점수로 바꾸고, 먼저 살펴볼 유형을 정한다. 화면과 무관한 순수 함수만 둔다.
//
// 규칙(팀 설계안 '중장년 12개 유형 질문지 및 가중치 설계안', 11/28 새 앱에 넣음):
// - 고른 보기의 점수(app/data/choice_questions.yaml의 scores)를 유형별로 모두 더한다.
// - 모든 문항은 답해야 한다. 답이 빠졌거나 없는 보기이면 아무 보기로 채우지 않고 오류로 멈춘다.
// - 성별·나이·일 여부는 받지 않는다. 점수에 넣지 않는다.
// - 가장 높은 유형이 하나면 그 유형을 대표로 보여 준다(점수가 낮아도).
// - 여럿이면 tiebreak 문항(지금 C03 '무엇이 가장 급한가요')에서 고른 보기가 점수를 준 유형만 남긴다.
//   남는 것이 없으면 그대로 둔다. 그래도 여럿이면 코드가 대신 정하지 않고 본인이 고른다.
// - 설계안의 '2위 유형 함께 보여 주기'는 하지 않는다(11/26 결정: 결과 화면은 대표 유형 하나만).
//
// Streamlit 앱(app/core/scoring.py)은 예전 24문항 규칙 그대로다. 이 파일은 파이썬과 대조하지 않는다.

import type { Question } from "@/data/types";

export const RESULT = "result"; // 대표 유형이 정해짐(단독 1위이거나, 본인이 후보 중 하나를 고름)
export const CHOOSE = "choose_priority"; // 가장 높은 점수의 유형이 여럿. 본인이 하나를 고른다

export type Score = {
  state: typeof RESULT | typeof CHOOSE;
  primary: string | null; // 대표 유형
  candidates: string[]; // 최고점 유형들(tiebreak로 좁힌 뒤, 유형 파일에 적힌 순서)
  scores: Record<string, number>; // 유형별 점수(유형 파일에 적힌 순서). 화면에는 보여 주지 않는다
};

// 답으로 점수를 낼 수 없을 때 던진다
export class ScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoringError";
  }
}

// answers는 { 문항 id: 보기 id }. 다른 문항(기본정보 등)이 섞여 있어도 choiceQuestions만 읽는다.
// typeIds는 유형 id 목록(유형 파일 순서). 점수를 받지 못한 유형도 0점으로 들어간다.
// priority는 본인이 고른 유형이다. 지금 후보에 없으면(답을 고친 경우) 없는 것으로 본다.
export function score(
  answers: Record<string, unknown>,
  choiceQuestions: Question[],
  typeIds: string[],
  tiebreakId: string,
  priority: string | null = null
): Score {
  if (choiceQuestions.length === 0 || typeIds.length === 0) {
    throw new ScoringError("유형 찾기 문항이나 유형 목록이 비어 있습니다.");
  }

  const scores: Record<string, number> = Object.fromEntries(typeIds.map((typeId) => [typeId, 0]));
  const picked: Record<string, Record<string, number>> = {}; // 문항 id → 고른 보기의 점수
  for (const question of choiceQuestions) {
    const value = answers[question.id];
    const option = (question.options ?? []).find((opt) => opt.id === value);
    if (typeof value !== "string" || !option) {
      throw new ScoringError("유형 찾기 문항은 모두 보기 하나를 골라야 합니다. 빠진 답을 다른 보기로 채우지 않습니다.");
    }
    picked[question.id] = option.scores ?? {};
    for (const [typeId, points] of Object.entries(option.scores ?? {})) {
      if (typeId in scores) scores[typeId] += points;
    }
  }

  const top = Math.max(...typeIds.map((typeId) => scores[typeId]));
  let candidates = typeIds.filter((typeId) => scores[typeId] === top);
  if (candidates.length > 1) {
    const field = picked[tiebreakId] ?? {};
    const narrowed = candidates.filter((typeId) => typeId in field);
    if (narrowed.length > 0) candidates = narrowed;
  }

  const chosen = priority !== null && candidates.includes(priority) ? priority : null;
  if (chosen !== null) return { state: RESULT, primary: chosen, candidates, scores };
  if (candidates.length > 1) return { state: CHOOSE, primary: null, candidates, scores };
  return { state: RESULT, primary: candidates[0], candidates, scores };
}
