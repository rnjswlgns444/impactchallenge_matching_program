// 프로그램 정보표에서 유형별 후보를 거르고 순서를 정한다. 화면과 무관한 순수 함수만 둔다.
// 원본: app/core/candidates.py (이 파일과 답이 달라지면 이 파일을 고친다. 파이썬이 기준이다)
//
// 거르기는 반드시 여기서만 한다. 운영이 끝났거나, 55~64세가 참여할 수 없거나, 날짜가 지났거나,
// 답한 성별·나이·일 여부가 대상 조건에 맞지 않는 프로그램이 화면이나 AI에게 넘어가지 않게 하기 위해서다.
// AI 없이 이 파일만으로 기본 결과가 나온다.
//
// '때'(when)는 인자로 받는다. 이 파일 안에서 시계를 읽지 않는다.

import type { Program, Rule, TypeInfo } from "@/data/types";

import type { Moment } from "./clock";
import { agesFromBirthYear, chosenDetailOptions, detailOf, type DetailAnswer } from "./selection";
import {
  AGE_MAX_COLUMN,
  AGE_MIN_COLUMN,
  AGE_Q,
  KIND_ALWAYS,
  KIND_LIST,
  KIND_PERIOD,
  NATIONWIDE,
  PROFILE_CHOICES,
  UNCONFIRMED,
  splitMulti,
} from "./table";

// 설문 답({ 문항 id: 답 }). 기본정보만 읽는다. 그 자리에서 견주기만 하고 어디에도 남기지 않는다.
export type Profile = Record<string, unknown> | null | undefined;

// 유형 하나의 기본 결과
export type TypeResult = {
  typeId: string;
  contacts: Program[]; // 지금 문의할 수 있는 곳 (순서대로)
  lists: Program[]; // 목록에서 직접 찾아볼 곳
  needsChoice: boolean; // 세부 질문을 먼저 골라야 해서 아직 아무것도 고르지 않았다 (require_choice)
  widened: boolean; // 고른 세부 주제에 맞는 곳이 없어, 빼지 않고 이 유형의 곳을 그대로 담았다
};

// 언제든 문의할 수 있는 곳을 먼저
const KIND_ORDER: Record<string, number> = { [KIND_ALWAYS]: 0, [KIND_PERIOD]: 1 };

// 표시종료일(과 종료시각)이 아직 지나지 않았는지
function stillOpen(program: Program, when: Moment): boolean {
  const end = program["표시종료일"];
  if (!end || end > when.day) return true;
  if (end < when.day) return false;
  // 종료일 당일: 시각을 모르거나 종료시각이 비어 있으면 그날 끝까지 보여 준다
  return !(when.time && program["종료시각"] && when.time >= program["종료시각"]);
}

// 답한 성별·태어난 해·일 여부가 이 프로그램의 대상 조건에 맞는지.
//
// 조건 칸이 비어 있으면 '조건 없음'이고, 답이 없으면(설문 없이 둘러볼 때) 거르지 않는다.
// 나이는 태어난 해를 올해(thisYear)로 만 나이로 바꿔서 본다. 생일 전후로 한 살이 다를 수 있으므로,
// 두 나이 가운데 하나라도 조건(최소나이·최대나이)에 맞으면 빼지 않는다.
export function fitsProfile(program: Program, profile: Profile, thisYear: number): boolean {
  const answers = profile ?? {};
  for (const [questionId, column, ] of PROFILE_CHOICES) {
    const allowed = splitMulti(program[column]);
    const answer = answers[questionId];
    if (allowed.length > 0 && answer !== undefined && answer !== null && !allowed.includes(answer as string)) {
      return false;
    }
  }
  const born = answers[AGE_Q];
  if (typeof born === "number" && Number.isInteger(born)) {
    const low = program[AGE_MIN_COLUMN];
    const high = program[AGE_MAX_COLUMN];
    const fits = agesFromBirthYear(born, thisYear).some(
      (age) => (!low || age >= Number(low)) && (!high || age <= Number(high))
    );
    if (!fits) return false;
  }
  return true;
}

// 지금 보여 줘도 되는 프로그램: 매칭가능 Y, 55~64세 참여 불가가 아님, 표시종료일·종료시각이 지나지 않음,
// 그리고 profile(설문 답)을 주면 성별·태어난 해·일 여부가 대상 조건에 맞음.
//
// when.time이 빈 글자면 날짜로만 판단한다. 시각이 있으면 종료일 당일의 종료시각부터 뺀다.
export function eligible(programs: Program[], when: Moment, profile?: Profile): Program[] {
  return programs.filter(
    (p) =>
      p["매칭가능"] === "Y" &&
      p["55~64세참여"] !== "불가" &&
      stillOpen(p, when) &&
      fitsProfile(p, profile, when.year)
  );
}

// 규칙 { 열 이름: [값] } 가운데 하나라도 프로그램에 해당하는지
function matches(program: Program, rule: Rule | undefined): boolean {
  return Object.entries(rule ?? {}).some(([column, values]) => values.includes(program[column]));
}

// 글자 코드 순 비교(파이썬의 글자 비교와 같다. localeCompare를 쓰지 않는다)
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// 유형 하나의 후보를 '문의할 곳'과 '목록'으로 나눠 돌려준다.
//
// 세부 질문의 규칙: 고른 선택지의 exclude에 해당하면 빼고, first에 해당하면 앞으로 가져온다.
// 세부 질문의 last에 해당하는 프로그램은 (first로 가져오지 않는 한) 맨 뒤로 보낸다. 답하지 않아도 적용된다.
// match_tags인 세부 질문은 고른 선택지의 세부태그가 붙은 곳만 남긴다. 그런 곳이 하나도 없으면 빼지 않고
// 이 유형의 곳을 그대로 돌려주고 widened로 알린다(다른 유형의 곳은 섞지 않는다).
// require_choice인 세부 질문은 고르기 전에는 아무것도 돌려주지 않고 needsChoice로 알린다.
// narrow가 false면 match_tags로 좁히지 않는다(AI 후보용). exclude와 require_choice는 그대로 적용된다.
// 순서: 앞으로 가져온 것 → 안산에 있는 곳 → 세부태그가 많이 겹치는 순 → 상시서비스 → id. 인기순이 아니다.
export function forType(
  programs: Program[],
  type: TypeInfo,
  detailAnswer: DetailAnswer,
  when: Moment,
  profile?: Profile,
  narrow = true
): TypeResult {
  const detail = detailOf(type);
  const chosen = chosenDetailOptions(type, detailAnswer);
  const chosenTags = new Set(detail ? chosen.map((opt) => `${detail.id}.${opt.id}`) : []);
  if (detail?.require_choice && chosenTags.size === 0) {
    return { typeId: type.id, contacts: [], lists: [], needsChoice: true, widened: false };
  }
  const requiredTags = narrow && detail?.match_tags ? chosenTags : new Set<string>();

  const place = (program: Program): number => {
    if (chosen.some((opt) => matches(program, opt.first))) return -1;
    return detail && matches(program, detail.last) ? 1 : 0;
  };
  const sortKey = (program: Program): [number, number, number, number, string] => {
    const overlap = new Set(splitMulti(program["세부태그"]).filter((tag) => chosenTags.has(tag))).size;
    const nationwide = program["범위"] === NATIONWIDE ? 1 : 0; // 전국 전화 창구는 안산 기관 뒤에
    return [place(program), nationwide, -overlap, KIND_ORDER[program["종류"]] ?? 2, program.id];
  };

  let candidates = eligible(programs, when, profile).filter(
    (p) => splitMulti(p["유형태그"]).includes(type.id) && !chosen.some((opt) => matches(p, opt.exclude))
  );
  const narrowed = candidates.filter((p) => splitMulti(p["세부태그"]).some((tag) => requiredTags.has(tag)));
  const widened = requiredTags.size > 0 && candidates.length > 0 && narrowed.length === 0;
  if (requiredTags.size > 0 && narrowed.length > 0) candidates = narrowed;

  // 정렬 열쇠를 한 번씩만 만들고, 앞 칸부터 차례로 견준다(같으면 원래 순서를 지킨다)
  const sorted = candidates
    .map((program) => ({ program, key: sortKey(program) }))
    .sort((a, b) => {
      for (let i = 0; i < 4; i += 1) {
        const diff = (a.key[i] as number) - (b.key[i] as number);
        if (diff !== 0) return diff;
      }
      return compareText(a.key[4], b.key[4]);
    })
    .map(({ program }) => program);

  return {
    typeId: type.id,
    contacts: sorted.filter((p) => p["종류"] !== KIND_LIST),
    lists: sorted.filter((p) => p["종류"] === KIND_LIST),
    needsChoice: false,
    widened,
  };
}

function typeById(types: TypeInfo[], typeId: string): TypeInfo {
  const type = types.find((t) => t.id === typeId);
  if (!type) throw new Error(`유형 '${typeId}'가 없습니다.`);
  return type;
}

// 고른 유형마다 기본 결과를 만든다. details는 { 유형 id: 세부 질문의 답 }, profile은 설문 답이다.
export function buildResult(
  programs: Program[],
  types: TypeInfo[],
  typeIds: string[],
  details: Record<string, DetailAnswer>,
  when: Moment,
  profile?: Profile,
  narrow = true
): TypeResult[] {
  return typeIds.map((typeId) =>
    forType(programs, typeById(types, typeId), details[typeId], when, profile, narrow)
  );
}

// AI에게 보낼 후보. AI는 이 목록 안에서만 고를 수 있다.
//
// 유형을 골랐으면 그 유형들의 '문의할 곳'을 합친 것이다(세부 질문의 exclude로 뺀 것은 여기서도 빠진다).
// 세부 주제(match_tags)로는 좁히지 않는다. 직접 적은 글이 주제 단추보다 구체적이므로, 글에 다른 주제를
// 적어도 같은 유형 안에서는 찾아 줄 수 있어야 한다. 먼저 골라야 하는 유형(돌봄)은 고르기 전에는 비어 있다.
// 유형을 정하지 않았으면 지금 보여 줘도 되는 곳 전체다. 목록(강좌 목록 등)은 넣지 않는다.
export function aiPool(
  programs: Program[],
  types: TypeInfo[],
  typeIds: string[],
  details: Record<string, DetailAnswer>,
  when: Moment,
  profile?: Profile
): Program[] {
  if (typeIds.length === 0) {
    return eligible(programs, when, profile).filter((p) => p["종류"] !== KIND_LIST);
  }
  const pool = new Map<string, Program>();
  for (const result of buildResult(programs, types, typeIds, details, when, profile, false)) {
    for (const program of result.contacts) {
      if (!pool.has(program.id)) pool.set(program.id, program);
    }
  }
  return [...pool.values()];
}

// 이 유형의 세부 규칙이 보는 열 가운데 값이 '미확인'인 열.
// 예) 보탬활동형은 보수를 본다. 보수가 미확인인 프로그램은 빼지 않고 '확인이 필요하다'고 표시한다.
export function unconfirmedColumns(program: Program, type: TypeInfo): string[] {
  const detail = detailOf(type);
  if (!detail) return [];
  const columns = new Set(Object.keys(detail.last ?? {}));
  for (const opt of detail.options) {
    for (const column of [...Object.keys(opt.exclude ?? {}), ...Object.keys(opt.first ?? {})]) {
      columns.add(column);
    }
  }
  return [...columns].filter((column) => program[column] === UNCONFIRMED).sort(compareText);
}

// 무엇이 맞을지 함께 찾아 주는 일반 창구(첫상담 = Y). 유형과 상관없이 안내할 수 있는 곳이다.
export function firstConsult(programs: Program[], when: Moment, profile?: Profile): Program[] {
  return eligible(programs, when, profile).filter((p) => p["첫상담"] === "Y");
}
