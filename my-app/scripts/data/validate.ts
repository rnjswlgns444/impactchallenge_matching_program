// 자료 파일의 형식 검사. app/core/loader.py의 규칙을 그대로 옮긴 것이다.
// 안내 문장은 파일을 고치는 팀원이 읽는 한국어 문장이고, 파이썬 쪽과 같게 둔다.
// 규칙을 고칠 때는 loader.py와 이 파일을 함께 고친다.
//
// 옮기지 않은 것: 화면 문구 검사(TEXT_KEYS). 새 앱은 문구를 src/content/text.ts에 둔다.

type Dict = Record<string, unknown>;

import {
  AGE_MAX_COLUMN,
  AGE_MIN_COLUMN,
  AGE_Q,
  BARRIER_Q,
  CANDIDATE_TYPES,
  FREE_Q,
  GENDER_Q,
  KIND_ALWAYS,
  KIND_LIST,
  KIND_PERIOD,
  NATIONWIDE,
  PRIORITY_Q,
  PROFILE_CHOICES,
  SCALE_MAX,
  SCALE_MIN,
  UNCONFIRMED,
  WORK_Q,
  splitMulti,
} from "../../src/core/table";

// 이름과 칸의 값은 src/core/table.ts에 한 번만 적는다. 여기서는 가져다 쓰고, 쓰던 곳을 위해 다시 내보낸다.
export { BARRIER_Q, splitMulti };

export const QUESTION_IDS = [BARRIER_Q, PRIORITY_Q, FREE_Q, GENDER_Q, AGE_Q, WORK_Q];

// 척도 값. 범위는 table.ts가 정한다
export const SCALE_VALUES = Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i);
export const ITEMS_PER_TYPE = 2; // 유형마다 척도 문항 수. 점수 기준(high)이 이 수를 전제한다
export const FEATURE_MAX = 160;

// 코드가 읽는 열. 재확인일·운영근거·비고는 팀 점검용이라 없어도 되고, 앱에 싣지 않는다.
export const REQUIRED_COLUMNS = [
  "id", "기관명", "프로그램명", "종류", "범위", "한줄설명", "상세설명", "키워드", "유형태그", "세부태그", "첫상담",
  "55~64세참여", "대상", "대상성별", "최소나이", "최대나이", "대상재직상태",
  "확인필요", "보수", "운영상태", "매칭가능", "표시종료일", "종료시각",
  "시간대", "기간", "비용", "장소", "신청방법", "공식연락처", "홈페이지URL", "상세페이지URL", "신청URL",
  "진행방식", "첫방문안내", "혼자참여", "초보참여", "첫연락문장",
  "체험유형", "체험제목", "체험URL", "체험내용", "확인날짜", "출처URL",
];
export const PIN_COLUMN = "핀그림"; // 없어도 되는 열
export const PIN_WORDS = ["건강", "상담", "일", "가게", "배움", "문화", "운동", "모임", "봉사", "돌봄", "돈", "혜택", "전화", "온라인"];
export const PLACEHOLDERS = ["{type_name}", "{type_summary}", "{wish_examples}", "{wish_text}", "{candidates}", "{max_n}"];

const SELECTIONS = ["single", "multi", "number", "scale", "text"];
const OPTION_SOURCES = [CANDIDATE_TYPES];
const KINDS = [KIND_ALWAYS, KIND_PERIOD, KIND_LIST];
const AGE_VALUES = ["가능", "불가", UNCONFIRMED];
const SCOPES = ["안산", NATIONWIDE];
const PAY_VALUES = ["해당없음", "유급", "활동비", "무보수", UNCONFIRMED];
const TASTE_KINDS = ["", "영상", "공개강좌", "앱체험"];
const FALLBACK_KEYS = ["name", "org", "description", "phone", "say"]; // url은 없어도 된다

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ICON = /^:material\/[a-z0-9_]+:$/;
const CLOCK_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/; // 09:00, 16:30 (24시간, 한국 시각)
const AGE_NUMBER = /^[0-9]{1,3}$/;

// ── 작은 도우미 ──
const isDict = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isInt = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value);
// 파이썬의 `x or []`: 목록이 아니면 빈 목록
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const dicts = (value: unknown): Dict[] => list(value).filter(isDict);
// 파이썬의 참·거짓: 빈 글자, 0, None, 빈 목록·사전은 거짓
const truthy = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (isDict(value)) return Object.keys(value).length > 0;
  return Boolean(value);
};
// 파이썬의 sorted()와 같은 순서(글자 코드 순)
const sorted = (values: string[]) => [...values].sort();
const sameSet = (a: unknown[], b: unknown[]) => {
  const left = new Set(a);
  const right = new Set(b);
  return left.size === right.size && [...left].every((value) => right.has(value));
};

function checkOptions(where: string, options: Dict[], problems: string[]): void {
  const seen = new Set<unknown>();
  for (const opt of options) {
    if (!truthy(opt.id) || !truthy(opt.label)) {
      problems.push(`${where}의 선택지에 id와 label이 있어야 합니다.`);
    } else if (seen.has(opt.id)) {
      problems.push(`${where}에 선택지 id '${opt.id}'가 두 번 나옵니다.`);
    }
    seen.add(opt.id);
    if ("icon" in opt && !(typeof opt.icon === "string" && ICON.test(opt.icon))) {
      problems.push(`${where} 선택지 '${opt.id}'의 icon은 ":material/work:" 같은 꼴로 적습니다.`);
    }
  }
}

// exclude / first / last 규칙은 {programs.csv의 열 이름: [값]} 꼴이어야 한다
function checkRule(where: string, rule: unknown, problems: string[]): void {
  if (!isDict(rule) || !Object.values(rule).every(Array.isArray)) {
    problems.push(`${where}는 {열 이름: [값, 값]} 꼴로 적어야 합니다.`);
    return;
  }
  for (const column of Object.keys(rule)) {
    if (!REQUIRED_COLUMNS.includes(column)) {
      problems.push(`${where}의 '${column}'은 programs.csv에 없는 열입니다.`);
    }
  }
}

export function validateTypes(areas: unknown, typesList: unknown): string[] {
  const problems: string[] = [];
  const areaIds = new Set(dicts(areas).map((area) => area.id));
  const types = dicts(typesList);
  if (types.length === 0) problems.push("types.yaml: 유형이 하나도 없습니다.");

  const seen = new Set<unknown>();
  const detailIds = new Set<unknown>();
  types.forEach((t, index) => {
    const tid = t.id;
    if (!truthy(tid)) {
      problems.push(`types.yaml: ${index + 1}번째 유형에 id가 없습니다.`);
      return;
    }
    if (seen.has(tid)) problems.push(`types.yaml: 유형 id '${tid}'가 두 번 나옵니다.`);
    seen.add(tid);
    for (const field of ["name", "statement", "feature"]) {
      if (!truthy(t[field])) problems.push(`types.yaml: 유형 '${tid}'에 ${field}가 없습니다.`);
    }
    // 글자 수는 파이썬의 len()처럼 코드 포인트로 센다
    if ([...String(t.feature ?? "")].length > FEATURE_MAX) {
      problems.push(
        `types.yaml: 유형 '${tid}'의 feature가 ${FEATURE_MAX}자를 넘습니다. 결과 사진에 다 들어가지 않으니 줄여 주세요.`
      );
    }
    if (!areaIds.has(t.area)) {
      problems.push(`types.yaml: 유형 '${tid}'의 area '${t.area}'가 areas에 없습니다.`);
    }

    const detail = t.detail;
    if (!isDict(detail) || !truthy(detail)) return;
    const where = `types.yaml: 유형 '${tid}'의 세부 질문`;
    if (!truthy(detail.id) || !truthy(detail.text) || !["single", "multi"].includes(detail.selection as string)) {
      problems.push(`${where}에는 id, text, selection(single 또는 multi)이 있어야 합니다.`);
    }
    if (detailIds.has(detail.id)) {
      problems.push(`${where} id '${detail.id}'가 다른 유형과 겹칩니다.`);
    }
    detailIds.add(detail.id);
    const options = dicts(detail.options);
    if (options.length < 2) problems.push(`${where}에 선택지가 2개 이상 있어야 합니다.`);
    checkOptions(where, options, problems);
    if ("last" in detail) checkRule(`${where} last`, detail.last, problems);
    for (const flag of ["log_answer", "match_tags", "require_choice"]) {
      if (flag in detail && typeof detail[flag] !== "boolean") {
        problems.push(`${where}의 ${flag}는 true 또는 false로 적습니다.`);
      }
    }
    for (const opt of options) {
      for (const key of ["exclude", "first"]) {
        if (key in opt) checkRule(`${where} 선택지 '${opt.id}'의 ${key}`, opt[key], problems);
      }
    }
  });
  return problems;
}

// 척도 선택지는 value 1~5를 한 번씩 쓰고 label이 있어야 한다
export function validateScale(scale: unknown): string[] {
  const all = list(scale);
  const options = dicts(scale);
  const values = options.map((opt) => opt.value);
  const ints = values.filter(isInt).sort((a, b) => a - b);
  const complete = ints.length === SCALE_VALUES.length && ints.every((value, i) => value === SCALE_VALUES[i]);
  if (values.length !== all.length || !complete || values.length !== SCALE_VALUES.length) {
    return ["questions.yaml: scale에는 value 1, 2, 3, 4, 5가 한 번씩 있어야 합니다. label만 고쳐 주세요."];
  }
  if (!options.every((opt) => truthy(opt.label))) {
    return ["questions.yaml: scale의 선택지마다 label이 있어야 합니다."];
  }
  return [];
}

// '함께 살펴볼 유형' 기준. 유형 점수 범위(문항 수 × 1~5) 안이어야 한다
export function validateScoring(settings: unknown): string[] {
  const scoring = isDict(settings) && isDict(settings.scoring) ? settings.scoring : {};
  const high = scoring.high;
  const low = ITEMS_PER_TYPE * SCALE_VALUES[0];
  const top = ITEMS_PER_TYPE * SCALE_VALUES[SCALE_VALUES.length - 1];
  if (!isInt(high)) return ["settings.yaml: scoring에 high를 숫자로 적어야 합니다. 예) high: 8"];
  if (high < low || high > top) {
    return [`settings.yaml: scoring의 high는 ${low} 이상 ${top} 이하여야 합니다. (지금: ${high})`];
  }
  return [];
}

// 새 앱이 쓰는 설정: 걱정 단추, 맞는 곳이 없을 때의 카드, AI가 고를 개수, 뜻 없는 말 목록
export function validateSettings(settings: unknown): string[] {
  const problems: string[] = [];
  const s = isDict(settings) ? settings : {};

  let worries: unknown = s.worries ?? [];
  if (!Array.isArray(worries)) {
    problems.push("settings.yaml: worries는 목록이어야 합니다.");
    worries = [];
  }
  const seen = new Set<string>();
  for (const worry of worries as unknown[]) {
    if (!isDict(worry) || typeof worry.id !== "string" || typeof worry.label !== "string") {
      problems.push("settings.yaml: worries의 각 줄에는 id와 label이 있어야 합니다.");
      continue;
    }
    if (seen.has(worry.id)) problems.push(`settings.yaml: worries에 id '${worry.id}'가 두 번 나옵니다.`);
    seen.add(worry.id);
    for (const column of list(worry.show)) {
      if (!REQUIRED_COLUMNS.includes(column as string)) {
        problems.push(`settings.yaml: worries '${worry.id}'의 show에 정보표에 없는 칸 '${column}'이 있습니다.`);
      }
    }
  }

  const card = s.fallback_card;
  for (const key of FALLBACK_KEYS) {
    if (!isDict(card) || typeof card[key] !== "string" || !card[key]) {
      problems.push(`settings.yaml: fallback_card에 '${key}'가 없습니다.`);
    }
  }

  // 아래 둘은 파이썬에 없는 검사다. 새 앱은 빌드 때 값을 굳히므로 미리 본다.
  if (!isInt(s.ai_top_n) || s.ai_top_n < 1) {
    problems.push("settings.yaml: ai_top_n을 1 이상의 숫자로 적어야 합니다. 예) ai_top_n: 3");
  }
  if (!Array.isArray(s.free_empty_words) || !s.free_empty_words.every((word) => typeof word === "string")) {
    problems.push("settings.yaml: free_empty_words는 글자 목록이어야 합니다.");
  }
  return problems;
}

// typesList를 주면 척도 문항이 유형마다 정해진 수만큼 있는지도 본다
export function validateQuestions(questionsValue: unknown, typesList?: unknown): string[] {
  const problems: string[] = [];
  const questions = dicts(questionsValue);
  const seen = new Set<unknown>();
  const perType = new Map<string, number>();

  questions.forEach((q, index) => {
    const qid = q.id;
    if (!truthy(qid) || !truthy(q.text)) {
      problems.push(`questions.yaml: ${index + 1}번째 문항에는 id와 text가 있어야 합니다.`);
      return;
    }
    if (seen.has(qid)) problems.push(`questions.yaml: 문항 id '${qid}'가 두 번 나옵니다.`);
    seen.add(qid);
    const where = `questions.yaml: 문항 '${qid}'`;

    if (!SELECTIONS.includes(q.selection as string)) {
      problems.push(`${where}의 selection은 single, multi, number, scale, text 중 하나여야 합니다.`);
    }
    if (truthy(q.options_from) && !OPTION_SOURCES.includes(q.options_from as string)) {
      problems.push(`${where}의 options_from은 candidate_types여야 합니다.`);
    }
    if (q.selection === "scale") {
      if (!truthy(q.type)) {
        problems.push(`${where}은 척도 문항이므로 type에 유형 번호(T01 등)를 적어야 합니다.`);
      } else {
        const type = String(q.type);
        perType.set(type, (perType.get(type) ?? 0) + 1);
      }
      if (q.where === "result") {
        problems.push(`${where}은 척도 문항이므로 where: result를 쓸 수 없습니다.`);
      }
    } else if ("type" in q) {
      problems.push(`${where}의 type은 척도 문항(selection: scale)에만 적습니다.`);
    }
    if (q.selection === "number") {
      if (!isInt(q.min) || !isInt(q.max) || q.min > q.max) {
        problems.push(`${where}에는 min과 max를 숫자로 적어야 합니다. 예) min: 1920, max: 2010`);
      }
    }
    const options = dicts(q.options);
    if (["single", "multi"].includes(q.selection as string) && !truthy(q.options_from) && options.length < 2) {
      problems.push(`${where}에 선택지가 2개 이상 있어야 합니다.`);
    }
    checkOptions(where, options, problems);
    for (const opt of options) {
      for (const column of list(opt.show)) {
        if (!REQUIRED_COLUMNS.includes(column as string)) {
          problems.push(`${where} 선택지 '${opt.id}'의 show에 적힌 '${column}'은 programs.csv에 없는 열입니다.`);
        }
      }
    }
  });

  // 척도 문항은 한 덩어리로 붙어 있어야 한다(진행 표시가 '척도 앞 / 척도 / 척도 뒤'로 센다)
  const survey = questions.filter((q) => q.where !== "result");
  const scaleAt = survey.flatMap((q, i) => (q.selection === "scale" ? [i] : []));
  if (scaleAt.length > 0) {
    for (const q of survey.slice(scaleAt[0], scaleAt[scaleAt.length - 1] + 1)) {
      if (q.selection !== "scale") {
        problems.push(
          `questions.yaml: 문항 '${q.id}'가 척도 문항 사이에 끼어 있습니다. 척도 문항들의 앞이나 뒤로 옮겨 주세요.`
        );
      }
    }
  }
  for (const qid of QUESTION_IDS) {
    if (!seen.has(qid)) {
      problems.push(
        `questions.yaml: 문항 '${qid}'가 없습니다. 이 id는 코드가 쓰므로 지우거나 바꾸면 안 됩니다.`
      );
    }
  }
  // 정보표의 대상 조건 칸이 이 선택지 id로 적혀 있다
  for (const [qid, column, allowed] of PROFILE_CHOICES) {
    const found = questions.find((q) => q.id === qid);
    if (found && !sameSet(dicts(found.options).map((opt) => opt.id), allowed)) {
      problems.push(
        `questions.yaml: 문항 '${qid}'의 선택지 id는 ${allowed.join(" / ")}여야 합니다. programs.csv의 '${column}' 칸이 이 값으로 적혀 있습니다.`
      );
    }
  }
  if (typesList !== undefined) {
    const typeIds = dicts(typesList)
      .map((t) => t.id)
      .filter(truthy)
      .map(String);
    for (const tid of perType.keys()) {
      if (!typeIds.includes(tid)) {
        problems.push(`questions.yaml: 척도 문항의 type '${tid}'가 types.yaml에 없습니다.`);
      }
    }
    for (const tid of typeIds) {
      const count = perType.get(tid) ?? 0;
      if (count !== ITEMS_PER_TYPE) {
        problems.push(
          `questions.yaml: 유형 '${tid}'의 척도 문항은 ${ITEMS_PER_TYPE}개여야 합니다. (지금: ${count}개)`
        );
      }
    }
  }
  return problems;
}

// programs.csv의 세부태그에 쓸 수 있는 값. '세부질문id.선택지id' 꼴
export function detailTags(typesList: unknown): Set<string> {
  const tags = new Set<string>();
  for (const t of dicts(typesList)) {
    if (!isDict(t.detail)) continue;
    for (const opt of dicts(t.detail.options)) {
      if (!truthy(opt.exclusive)) tags.add(`${t.detail.id}.${opt.id}`);
    }
  }
  return tags;
}

export function validatePrograms(programs: Record<string, string>[], typesList: unknown): string[] {
  if (programs.length === 0) return ["programs.csv: 프로그램이 하나도 없습니다."];
  const missing = REQUIRED_COLUMNS.filter((column) => !(column in programs[0]));
  if (missing.length > 0) return [`programs.csv: 다음 열이 없습니다: ${missing.join(", ")}`];

  const problems: string[] = [];
  const typeIds = new Set(dicts(typesList).map((t) => t.id));
  const knownDetails = detailTags(typesList);
  const seenIds = new Set<string>();

  programs.forEach((row, index) => {
    const rowNo = index + 2; // 1행은 제목이므로 2부터
    const pid = row.id;
    const where = `programs.csv ${rowNo}행(${pid})`;
    if (!pid || seenIds.has(pid)) problems.push(`programs.csv ${rowNo}행: id가 비었거나 중복입니다.`);
    seenIds.add(pid);

    const tags = splitMulti(row["유형태그"]);
    // 일반 창구(첫상담 Y)는 유형과 상관없이 안내하므로 비워도 된다
    if (tags.length === 0 && row["첫상담"] !== "Y") {
      problems.push(`${where}: 유형태그가 비었습니다. T01 같은 유형 번호를 적어 주세요.`);
    }
    for (const tag of tags) {
      if (!typeIds.has(tag)) problems.push(`${where}: 유형태그 '${tag}'가 types.yaml에 없습니다.`);
    }
    for (const tag of splitMulti(row["세부태그"])) {
      if (!knownDetails.has(tag)) {
        problems.push(`${where}: 세부태그 '${tag}'가 types.yaml에 없습니다. 'D02.wage_required'처럼 적습니다.`);
      }
    }

    const choices: [string, string[]][] = [
      ["종류", KINDS], ["범위", SCOPES], ["매칭가능", ["Y", "N"]], ["55~64세참여", AGE_VALUES], ["보수", PAY_VALUES],
    ];
    for (const [column, allowed] of choices) {
      if (!allowed.includes(row[column])) {
        problems.push(
          `${where}: '${column}' 칸은 ${sorted(allowed).join(" / ")} 중 하나여야 합니다. (지금: '${row[column]}')`
        );
      }
    }
    if (!DATE.test(row["확인날짜"])) {
      problems.push(`${where}: 확인날짜는 2026-11-15 같은 형식이어야 합니다.`);
    }
    if (row["표시종료일"] && !DATE.test(row["표시종료일"])) {
      problems.push(`${where}: 표시종료일은 비워 두거나 2026-11-20 같은 형식으로 적습니다.`);
    }
    if (row["종료시각"] && !(row["표시종료일"] && CLOCK_TIME.test(row["종료시각"]))) {
      problems.push(
        `${where}: 종료시각은 표시종료일과 함께, 16:00 같은 형식(한국 시각)으로 적습니다. 모르면 비워 둡니다.`
      );
    }
    for (const [, column, allowed] of PROFILE_CHOICES) {
      if (splitMulti(row[column]).some((value) => !allowed.includes(value))) {
        problems.push(
          `${where}: '${column}' 칸은 비워 두거나 ${allowed.join(" / ")} 중에서 적습니다. (지금: '${row[column]}')`
        );
      }
    }
    const limits = [row[AGE_MIN_COLUMN], row[AGE_MAX_COLUMN]];
    if (limits.some((value) => value && !AGE_NUMBER.test(value))) {
      problems.push(`${where}: 최소나이·최대나이는 만 나이를 숫자로만 적습니다. 제한이 없으면 비워 둡니다.`);
    } else if (limits.every(Boolean) && Number(limits[0]) > Number(limits[1])) {
      problems.push(`${where}: 최소나이가 최대나이보다 큽니다.`);
    }
    if (row[PIN_COLUMN] && !PIN_WORDS.includes(row[PIN_COLUMN])) {
      problems.push(
        `${where}: '${PIN_COLUMN}' 칸은 비워 두거나 ${PIN_WORDS.join(" / ")} 중 하나로 적습니다. (지금: '${row[PIN_COLUMN]}')`
      );
    }
    if (row["매칭가능"] === "Y" && !row["출처URL"]) {
      problems.push(
        `${where}: 매칭가능이 Y이면 출처URL이 있어야 합니다. 확인한 공식 페이지 주소를 적어 주세요.`
      );
    }

    if (!TASTE_KINDS.includes(row["체험유형"])) {
      problems.push(`${where}: 체험유형은 영상/공개강좌/앱체험 중 하나이거나 비워 둡니다.`);
    }
    if (row["체험유형"] === "앱체험" && splitMulti(row["체험내용"]).length === 0) {
      problems.push(`${where}: 체험유형이 앱체험이면 체험내용에 단계를 적어야 합니다.`);
    }
    if (["영상", "공개강좌"].includes(row["체험유형"]) && !row["체험URL"]) {
      problems.push(`${where}: 체험유형이 ${row["체험유형"]}이면 체험URL이 있어야 합니다.`);
    }
  });
  return problems;
}

export function validatePrompt(prompt: string): string[] {
  return PLACEHOLDERS.filter((placeholder) => !prompt.includes(placeholder)).map(
    (placeholder) => `prompts/matching.md: 자리표시자 ${placeholder}가 없습니다. 지우지 마세요.`
  );
}

export type RawFiles = {
  areas: unknown;
  types: unknown;
  questions: unknown;
  scale: unknown;
  settings: unknown;
  programs: Record<string, string>[];
  prompt: string;
};

// 모든 검사를 파이썬과 같은 순서로 돈다. 문제가 없으면 빈 목록이다.
export function validateAll(raw: RawFiles): string[] {
  return [
    ...validateTypes(raw.areas, raw.types),
    ...validateScale(raw.scale),
    ...validateQuestions(raw.questions, raw.types),
    ...validateScoring(raw.settings),
    ...validateSettings(raw.settings),
    ...validatePrograms(raw.programs, raw.types),
    ...validatePrompt(raw.prompt),
  ];
}
