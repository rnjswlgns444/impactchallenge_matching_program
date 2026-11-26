// 파이썬 앱(app/core)과 새 앱(src/core)이 같은 입력에 같은 답을 내는지 견준다.
// 정답(cases.json)은 파이썬이 만든 것이다:
//     프로젝트 맨 위에서  .venv\Scripts\python app\tests\make_parity_cases.py
//
// 이 테스트가 깨지면
//   - "정답 파일을 다시 만드세요": 자료(app/data)가 바뀌었다. `npm run data`를 돌리고 위 명령으로 정답을 다시 만든다.
//   - 그 밖: 새 코드가 파이썬과 다르게 판단한다. 파이썬이 기준이므로 src/core를 고친다.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import type { Option, Program } from "@/data/types";

import { aiPool, eligible, firstConsult, forType, unconfirmedColumns, type Profile } from "../candidates";
import type { Moment } from "../clock";
import { scrub } from "../privacy";
import { score } from "../scoring";
import {
  agesFromBirthYear,
  chosenDetailOptions,
  fullNumber,
  nextQuestion,
  optionsOf,
  question,
  scaleQuestions,
  toggle,
  typeQuestions,
  type DetailAnswer,
} from "../selection";
import { AGE_Q, PRIORITY_Q } from "../table";
import { routeUrl } from "../venues";

type TypeRow = {
  answer: DetailAnswer;
  contacts: string[];
  lists: string[];
  needsChoice: boolean;
  widened: boolean;
  aiPool: string[];
};
type Cases = {
  fingerprint: string;
  high: number;
  scaleIds: string[];
  scoring: { values: number[]; priority: string | null; expect: unknown }[];
  candidates: {
    when: Moment;
    profile: Profile;
    eligible: string[];
    firstConsult: string[];
    aiPoolAll: string[];
    aiPoolTwo: string[];
    byType: Record<string, TypeRow[]>;
  }[];
  unconfirmed: Record<string, Record<string, string[]>>;
  privacy: { text: string; expect: string }[];
  selection: {
    typeQuestions: Record<string, string[]>;
    surveyOrder: (string | null)[];
    fullNumber: { value: number; expect: number | null }[];
    ages: { born: number; year: number; expect: [number, number] }[];
    toggleOptions: Option[];
    toggle: { selected: string[]; option: string; expect: string[] }[];
    priorityOptions: { candidates: string[]; expect: Option[] }[];
    chosenDetail: { type: string; answer: DetailAnswer; expect: string[] }[];
  };
  routes: { program: string; name: string; lat: number; lon: number; expect: string }[];
};

const cases: Cases = JSON.parse(readFileSync(path.join(import.meta.dirname, "cases.json"), "utf8"));
const { questions, types, programs, settings } = appData;
const ids = (rows: Program[]) => rows.map((p) => p.id);
const typeOf = (id: string) => types.find((t) => t.id === id)!;

// 키를 정렬한 한 줄 JSON. 파이썬의 json.dumps(sort_keys=True, separators=(",", ":"))와 같은 글자가 나온다
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([key, inner]) => `${JSON.stringify(key)}:${canonical(inner)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

describe("자료", () => {
  it("정답을 만들 때의 자료와 지금 자료가 같다", () => {
    const fingerprint = createHash("sha256")
      .update(canonical({ questions, scale: appData.scale, types, programs, high: settings.scoring.high }), "utf8")
      .digest("hex");
    expect(
      fingerprint,
      "자료가 바뀌었습니다. 정답 파일을 다시 만드세요: .venv\\Scripts\\python app\\tests\\make_parity_cases.py"
    ).toBe(cases.fingerprint);
  });
});

describe("파이썬과 같은 답: 채점", () => {
  const pairs = typeQuestions(questions, types);

  it("유형과 문항의 연결표가 같다", () => {
    expect(pairs).toEqual(cases.selection.typeQuestions);
    expect(Object.keys(pairs)).toEqual(Object.keys(cases.selection.typeQuestions));
    expect(scaleQuestions(questions).map((q) => q.id)).toEqual(cases.scaleIds);
  });

  it(`${cases.scoring.length}건의 답에 같은 유형과 점수를 낸다`, () => {
    for (const [index, one] of cases.scoring.entries()) {
      const answers = Object.fromEntries(cases.scaleIds.map((qid, i) => [qid, one.values[i]]));
      const result = score(answers, pairs, cases.high, one.priority);
      expect(result, `채점 ${index}번 (우선 선택 ${one.priority})`).toEqual(one.expect);
      // 점수표의 순서(유형 파일 순서)도 같아야 한다
      expect(Object.keys(result.scores)).toEqual(Object.keys((one.expect as { scores: object }).scores));
    }
  });
});

describe("파이썬과 같은 답: 후보 거르기", () => {
  const total = cases.candidates.reduce(
    (sum, group) => sum + Object.values(group.byType).reduce((n, rows) => n + rows.length, 0),
    0
  );

  it(`${cases.candidates.length}묶음(때 × 기본정보)에서 보여 줄 수 있는 곳, 일반 창구, AI 후보가 같다`, () => {
    for (const group of cases.candidates) {
      const label = `${group.when.day} ${group.when.time || "(날짜만)"} / ${JSON.stringify(group.profile)}`;
      expect(ids(eligible(programs, group.when, group.profile)), `eligible: ${label}`).toEqual(group.eligible);
      expect(ids(firstConsult(programs, group.when, group.profile)), `firstConsult: ${label}`).toEqual(group.firstConsult);
      expect(ids(aiPool(programs, types, [], {}, group.when, group.profile)), `aiPool 전체: ${label}`).toEqual(group.aiPoolAll);
      expect(
        ids(aiPool(programs, types, ["T01", "T02"], { T02: "wage_required" }, group.when, group.profile)),
        `aiPool 두 유형: ${label}`
      ).toEqual(group.aiPoolTwo);
    }
  });

  it(`유형 × 세부 선택 ${total}건에서 곳과 순서가 같다`, () => {
    for (const group of cases.candidates) {
      for (const [typeId, rows] of Object.entries(group.byType)) {
        for (const row of rows) {
          const label = `${group.when.day} ${group.when.time || "(날짜만)"} / ${JSON.stringify(group.profile)} / ${typeId} / ${JSON.stringify(row.answer)}`;
          const result = forType(programs, typeOf(typeId), row.answer, group.when, group.profile);
          expect(
            { contacts: ids(result.contacts), lists: ids(result.lists), needsChoice: result.needsChoice, widened: result.widened },
            label
          ).toEqual({ contacts: row.contacts, lists: row.lists, needsChoice: row.needsChoice, widened: row.widened });
          expect(
            ids(aiPool(programs, types, [typeId], { [typeId]: row.answer }, group.when, group.profile)),
            `aiPool: ${label}`
          ).toEqual(row.aiPool);
        }
      }
    }
  });

  it("'확인이 필요한 칸'이 같다", () => {
    for (const type of types) {
      const found = Object.fromEntries(
        programs.map((p) => [p.id, unconfirmedColumns(p, type)] as const).filter(([, columns]) => columns.length > 0)
      );
      expect(found, type.id).toEqual(cases.unconfirmed[type.id]);
    }
  });
});

describe("파이썬과 같은 답: 개인정보 지우기", () => {
  it.each(cases.privacy)("$text", ({ text, expect: expected }) => {
    expect(scrub(text)).toBe(expected);
  });
});

describe("파이썬과 같은 답: 문항과 선택지", () => {
  const selection = cases.selection;

  it("설문에서 묻는 순서가 같다", () => {
    const answered: Record<string, unknown> = {};
    const order: (string | null)[] = [];
    for (let i = 0; i < selection.surveyOrder.length; i += 1) {
      const next = nextQuestion(answered, questions);
      order.push(next ? next.id : null);
      if (next) answered[next.id] = 1;
    }
    expect(order).toEqual(selection.surveyOrder);
  });

  it("태어난 해 다듬기와 만 나이가 같다", () => {
    const age = question(questions, AGE_Q);
    for (const one of selection.fullNumber) expect(fullNumber(age, one.value), String(one.value)).toBe(one.expect);
    for (const one of selection.ages) expect(agesFromBirthYear(one.born, one.year), `${one.born}/${one.year}`).toEqual(one.expect);
  });

  it("선택지를 눌렀을 때의 결과가 같다", () => {
    for (const one of selection.toggle) {
      expect(toggle(one.selected, one.option, selection.toggleOptions), `${one.selected} + ${one.option}`).toEqual(one.expect);
    }
  });

  it("동점일 때 고를 선택지가 같다", () => {
    for (const one of selection.priorityOptions) {
      expect(optionsOf(question(questions, PRIORITY_Q), types, one.candidates)).toEqual(one.expect);
    }
  });

  it("세부 질문에서 고른 것으로 치는 선택지가 같다", () => {
    for (const one of selection.chosenDetail) {
      expect(
        chosenDetailOptions(typeOf(one.type), one.answer).map((opt) => opt.id),
        `${one.type} / ${JSON.stringify(one.answer)}`
      ).toEqual(one.expect);
    }
  });
});

describe("파이썬과 같은 답: 길찾기 주소", () => {
  it(`${cases.routes.length}곳의 주소가 같다`, () => {
    for (const one of cases.routes) expect(routeUrl(one), one.name).toBe(one.expect);
    // 정답에 쓴 곳과 새 앱이 읽은 곳이 같은지도 본다
    const mine = Object.entries(appData.venues).flatMap(([program, places]) => places.map((v) => `${program}:${v.name}`));
    expect(mine).toEqual(cases.routes.map((one) => `${one.program}:${one.name}`));
  });
});
