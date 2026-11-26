// 척도 문항 답을 유형 점수로 바꾸고, 먼저 살펴볼 유형을 정한다. 화면과 무관한 순수 함수만 둔다.
// 원본: app/core/scoring.py (이 파일과 답이 달라지면 이 파일을 고친다. 파이썬이 기준이다)
//
// 규칙(전달 자료 '24문항 설문과 분류규칙' 2026-11-17 기준):
// - 같은 유형의 문항 점수를 더한다(문항 2개면 2~10점). 유형끼리 점수를 빼거나 비교해 깎지 않는다.
// - 모든 척도 문항은 답해야 한다. 답이 빠져 있으면 0점이나 3점으로 채우지 않고 오류로 멈춘다.
// - 성별·나이·일 여부는 받지 않는다. 점수에 넣지 않는다.
// - 점수가 낮아도 가장 높은 유형을 대표로 보여 준다(11/25 결정).
//   그래서 전부 '아니에요'라고 답한 사람도 유형을 받는다. 검증된 검사가 아니라는 한계와 함께 적는다.
// - 가장 높은 유형이 여럿이면 코드가 대신 정하지 않고 본인이 고른다.
// - high(8점)는 '함께 살펴볼 유형'을 붙이는 기준으로만 쓴다. 운영 규칙이며 검증된 검사 기준이 아니다.

import { SCALE_MAX, SCALE_MIN } from "./table";

export const RESULT = "result"; // 대표 유형이 정해짐(단독 1위이거나, 본인이 후보 중 하나를 고름)
export const CHOOSE = "choose_priority"; // 가장 높은 점수의 유형이 여럿. 본인이 하나를 고른다

export type Score = {
  state: typeof RESULT | typeof CHOOSE;
  primary: string | null; // 대표 유형
  secondary: string | null; // 함께 살펴볼 유형(단독 다음 순위일 때만)
  candidates: string[]; // 최고점 유형들
  secondaryCandidates: string[]; // 대표 외 high 이상 중 가장 높은 유형들
  scores: Record<string, number>; // 유형별 점수(유형 파일에 적힌 순서)
};

// 답으로 점수를 낼 수 없을 때 던진다(파이썬의 ValueError)
export class ScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoringError";
  }
}

// answers는 { 문항 id: 1~5 }. typeQuestions는 { 유형 id: [문항 id, ...] }.
//
// answers에 다른 문항(기본정보 등)이 섞여 있어도 typeQuestions에 적힌 문항만 읽는다.
// priority는 본인이 고른 유형이다. 지금 후보에 없으면(답을 고친 경우) 없는 것으로 본다.
// typeQuestions에 적힌 문항의 답이 하나라도 없거나 1~5 정수가 아니면 ScoringError를 낸다.
export function score(
  answers: Record<string, unknown>,
  typeQuestions: Record<string, string[]>,
  high: number,
  priority: string | null = null
): Score {
  const pairs = Object.entries(typeQuestions);
  if (pairs.length === 0) throw new ScoringError("유형과 문항의 연결표가 비어 있습니다.");

  const scores: Record<string, number> = {};
  for (const [typeId, questionIds] of pairs) {
    if (questionIds.length === 0) {
      throw new ScoringError(`${typeId} 유형에 연결된 척도 문항이 없습니다.`);
    }
    let sum = 0;
    for (const questionId of questionIds) {
      const value = answers[questionId];
      // "5"(글자), 4.5, true는 받지 않는다
      if (typeof value !== "number" || !Number.isInteger(value) || value < SCALE_MIN || value > SCALE_MAX) {
        throw new ScoringError(
          "척도 문항은 모두 1~5 정수로 답해야 합니다. 빠진 답을 다른 값으로 채우지 않습니다."
        );
      }
      sum += value;
    }
    scores[typeId] = sum;
  }

  const entries = Object.entries(scores);
  const top = Math.max(...entries.map(([, value]) => value));
  const candidates = entries.filter(([, value]) => value === top).map(([typeId]) => typeId);
  const chosen = priority !== null && candidates.includes(priority) ? priority : null;

  let state: Score["state"];
  let primary: string | null = null;
  if (chosen !== null) {
    state = RESULT;
    primary = chosen;
  } else if (candidates.length > 1) {
    state = CHOOSE;
  } else {
    state = RESULT;
    primary = candidates[0];
  }

  let secondary: string | null = null;
  let secondaryCandidates: string[] = [];
  if (primary) {
    const others = entries.filter(([typeId, value]) => typeId !== primary && value >= high);
    if (others.length > 0) {
      const second = Math.max(...others.map(([, value]) => value));
      secondaryCandidates = others.filter(([, value]) => value === second).map(([typeId]) => typeId);
      if (secondaryCandidates.length === 1) secondary = secondaryCandidates[0];
    }
  }

  return { state, primary, secondary, candidates, secondaryCandidates, scores };
}
