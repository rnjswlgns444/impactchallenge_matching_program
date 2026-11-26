// 문항 순서와 선택지를 다룬다. 화면과 무관한 순수 함수만 둔다.
// 원본: app/core/selection.py (걸림돌 안내 barrier_guides는 새 앱에 문항이 없어 옮기지 않았다)
//
// 유형은 척도 문항(selection: scale) 점수로 정한다. 점수 계산과 대표 유형 판정은 scoring.ts가 한다.
// 이 파일은 어느 문항이 어느 유형에 속하는지(typeQuestions)만 알려 준다.
//
// answers는 { 문항 id: 답 }이다. 설문 문항은 모두 답해야 넘어가므로 빈 답은 없다.
//   single → 선택지 id 하나 / scale → 1~5 정수 / number → 정수(P_AGE는 태어난 해)

import type { Detail, Option, Question, TypeInfo } from "@/data/types";

import { CANDIDATE_TYPES, SCALE } from "./table";

// 숫자 문항에 적은 값을 답으로 쓸 수 있게 다듬는다. 쓸 수 없으면 null.
//
// 태어난 해를 '66'처럼 두 자리로 적는 사람이 많다. 문항에 short_base(예: 1900)가 있으면 두 자리 수에 더해 준다.
// 그 뒤에도 min~max 밖이면 답으로 받지 않는다(가까운 값으로 바꾸지 않는다).
export function fullNumber(question: Pick<Question, "min" | "max" | "short_base">, value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  let full = value;
  if (question.short_base && value >= 0 && value <= 99) full += question.short_base;
  const min = question.min ?? -Infinity;
  const max = question.max ?? Infinity;
  return full >= min && full <= max ? full : null;
}

// 태어난 해(P_AGE의 답)로 알 수 있는 만 나이 두 가지: [올해 생일 전, 올해 생일 뒤].
//
// 설문은 태어난 해만 묻는다. 생일이 지났는지 모르므로 만 나이는 한 살 차이 나는 둘 중 하나다.
// 정보표의 나이 조건과 견줄 때는 둘 중 하나라도 맞으면 맞는 것으로 본다(candidates.ts의 fitsProfile).
// 받을 수 있는 사람을 빼는 것보다, 한 살 모자란 사람에게 한 곳을 더 보여 주는 편이 낫기 때문이다.
export function agesFromBirthYear(birthYear: number, thisYear: number): [number, number] {
  const older = thisYear - birthYear;
  return [older - 1, older];
}

export function question(questions: Question[], questionId: string): Question {
  const found = questions.find((q) => q.id === questionId);
  if (!found) throw new Error(`문항 '${questionId}'가 없습니다.`);
  return found;
}

// 척도 문항만, 파일에 적힌 순서대로
export function scaleQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => q.selection === SCALE);
}

// { 유형 id: [그 유형의 척도 문항 id] }. 유형은 파일에 적힌 순서다. scoring.ts의 score()에 그대로 넘긴다.
export function typeQuestions(questions: Question[], types: TypeInfo[]): Record<string, string[]> {
  const scale = scaleQuestions(questions);
  return Object.fromEntries(
    types.map((type) => [type.id, scale.filter((q) => q.type === type.id).map((q) => q.id)])
  );
}

// 문항의 선택지. options_from이 candidate_types면 넘겨받은 유형의 설명 문장을 선택지로 만들어 앞에 붙인다.
export function optionsOf(q: Question, types: TypeInfo[], typeIds: string[] = []): Option[] {
  let made: Option[] = [];
  if (q.options_from === CANDIDATE_TYPES) {
    made = typeIds.map((typeId) => {
      const type = types.find((t) => t.id === typeId);
      if (!type) throw new Error(`유형 '${typeId}'가 없습니다.`);
      return { id: typeId, label: type.statement };
    });
  }
  return [...made, ...(q.options ?? [])];
}

// 설문 화면에서 차례로 묻는 문항. 결과 쪽에서 묻는 문항(where: result)은 뺀다.
export function surveyQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => q.where !== "result");
}

// 다음에 물을 문항. 다 물었으면 null. answers에 키가 있으면 답한 것으로 본다.
export function nextQuestion(answers: Record<string, unknown>, questions: Question[]): Question | null {
  return surveyQuestions(questions).find((q) => !(q.id in answers)) ?? null;
}

// 여러 개를 고르는 질문에서 선택지 하나를 눌렀을 때의 새 선택 목록.
// exclusive인 선택지는 다른 선택지와 함께 고를 수 없다.
export function toggle(selected: string[], optionId: string, options: Option[]): string[] {
  if (selected.includes(optionId)) return selected.filter((id) => id !== optionId);
  const exclusive = new Set(options.filter((opt) => opt.exclusive).map((opt) => opt.id));
  if (exclusive.has(optionId)) return [optionId];
  return [...selected.filter((id) => !exclusive.has(id)), optionId];
}

// 유형의 세부 질문. 없거나 꺼 두었으면(enabled: false) null.
export function detailOf(type: TypeInfo): Detail | null {
  const detail = type.detail;
  if (!detail || detail.enabled === false) return null;
  return detail;
}

// 세부 질문의 답: 선택지 id 하나, 여러 개, 또는 아직 고르지 않음
export type DetailAnswer = string | string[] | null | undefined;

// 세부 질문에서 고른 선택지. exclusive인 선택지는 고르지 않은 것으로 본다.
export function chosenDetailOptions(type: TypeInfo, detailAnswer: DetailAnswer): Option[] {
  const detail = detailOf(type);
  if (!detail || !detailAnswer || detailAnswer.length === 0) return [];
  const chosen = Array.isArray(detailAnswer) ? detailAnswer : [detailAnswer];
  return detail.options.filter((opt) => chosen.includes(opt.id) && !opt.exclusive);
}
