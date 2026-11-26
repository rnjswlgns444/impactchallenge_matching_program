// 검사 규칙 테스트. 실제 자료가 아니라 이 파일 안의 작은 견본을 쓴다.
// (그래서 문항·정보표를 고쳐도 깨지지 않는다)

import { describe, expect, it } from "vitest";

import {
  REQUIRED_COLUMNS,
  splitMulti,
  validateAll,
  validatePrograms,
  validatePrompt,
  validateQuestions,
  validateScale,
  validateScoring,
  validateSettings,
  validateTypes,
  type RawFiles,
} from "./validate";

// ── 견본: 유형 하나, 척도 문항 둘, 프로그램 한 행 ──
const areas = () => [{ id: "work", label: "일자리" }];
const types = () => [
  {
    id: "T01",
    area: "work",
    name: "일터찾기형",
    statement: "꾸준히 다닐 직장을 찾고 싶어요.",
    feature: "특징 글",
    detail: {
      id: "D01",
      text: "어떤 일을 찾고 계세요?",
      selection: "single",
      options: [
        { id: "a", label: "가" },
        { id: "b", label: "나", exclude: { 보수: ["무보수"] } },
      ],
    },
  },
];
const scale = () => [5, 4, 3, 2, 1].map((value) => ({ value, label: `답 ${value}` }));
const questions = () => [
  { id: "P_GENDER", text: "성별", selection: "single", options: [{ id: "male", label: "남성" }, { id: "female", label: "여성" }] },
  { id: "P_AGE", text: "태어난 해", selection: "number", min: 1920, max: 2010 },
  {
    id: "P_WORK", text: "일 여부", selection: "single",
    options: [
      { id: "employed", label: "일해요" },
      { id: "self_employed", label: "사업해요" },
      { id: "not_working", label: "쉬어요" },
    ],
  },
  { id: "Q01", type: "T01", selection: "scale", text: "문항 1" },
  { id: "Q02", type: "T01", selection: "scale", text: "문항 2" },
  { id: "Q_BARRIER", text: "걸림돌", selection: "multi", options: [{ id: "cost", label: "비용", show: ["비용"] }, { id: "none", label: "없음", exclusive: true }] },
  { id: "Q_PRIORITY", where: "result", text: "무엇부터", selection: "single", options_from: "candidate_types" },
  { id: "Q_FREE", where: "result", text: "더 바라는 점", selection: "text" },
];
const row = (over: Record<string, string> = {}): Record<string, string> => ({
  ...Object.fromEntries(REQUIRED_COLUMNS.map((column) => [column, ""])),
  id: "P1", 기관명: "기관", 프로그램명: "프로그램", 종류: "상시서비스", 범위: "안산",
  유형태그: "T01", 첫상담: "N", "55~64세참여": "가능", 보수: "해당없음", 매칭가능: "Y",
  확인날짜: "2026-11-18", 출처URL: "https://example.org",
  ...over,
});
const settings = () => ({
  scoring: { high: 8 },
  ai_top_n: 3,
  free_empty_words: ["없어요"],
  worries: [{ id: "cost", label: "비용이 드나요?", show: ["비용"] }],
  fallback_card: { name: "상담", org: "센터", description: "설명", phone: "031-000-0000", say: "안녕하세요." },
});
const prompt = () => "{type_name} {type_summary} {wish_examples} {wish_text} {candidates} {max_n}";
const raw = (over: Partial<RawFiles> = {}): RawFiles => ({
  areas: areas(), types: types(), questions: questions(), scale: scale(),
  settings: settings(), programs: [row()], prompt: prompt(), ...over,
});

describe("견본 자료", () => {
  it("문제가 없다", () => {
    expect(validateAll(raw())).toEqual([]);
  });
});

describe("유형", () => {
  it("이름·설명·특징이 없으면 알려 준다", () => {
    const broken = types();
    broken[0].feature = "";
    expect(validateTypes(areas(), broken)).toEqual(["types.yaml: 유형 'T01'에 feature가 없습니다."]);
  });

  it("특징 글이 160자를 넘으면 알려 준다(한글도 한 글자로 센다)", () => {
    const ok = types();
    ok[0].feature = "가".repeat(160);
    expect(validateTypes(areas(), ok)).toEqual([]);
    const long = types();
    long[0].feature = "가".repeat(161);
    expect(validateTypes(areas(), long)[0]).toContain("160자를 넘습니다");
  });

  it("세부 질문의 규칙에 정보표에 없는 열을 쓰면 알려 준다", () => {
    const broken = types();
    broken[0].detail.options[1].exclude = { 없는열: ["값"] } as never;
    expect(validateTypes(areas(), broken)[0]).toContain("'없는열'은 programs.csv에 없는 열입니다.");
  });
});

describe("척도와 점수 기준", () => {
  it("척도 값은 1~5를 한 번씩 써야 한다", () => {
    expect(validateScale(scale())).toEqual([]);
    expect(validateScale(scale().slice(1))).toHaveLength(1);
    expect(validateScale([...scale().slice(1), { value: 4, label: "겹침" }])).toHaveLength(1);
    expect(validateScale([...scale().slice(1), { value: "5", label: "글자" }])).toHaveLength(1);
  });

  it("점수 기준은 2~10 사이의 정수여야 한다", () => {
    expect(validateScoring({ scoring: { high: 2 } })).toEqual([]);
    expect(validateScoring({ scoring: { high: 10 } })).toEqual([]);
    expect(validateScoring({ scoring: { high: 11 } })[0]).toContain("2 이상 10 이하");
    expect(validateScoring({ scoring: { high: 7.5 } })[0]).toContain("숫자로");
    expect(validateScoring({})[0]).toContain("숫자로");
  });
});

describe("문항", () => {
  it("코드가 id로 찾는 문항이 없으면 알려 준다", () => {
    const broken = questions().filter((q) => q.id !== "Q_FREE");
    expect(validateQuestions(broken, types())).toEqual([
      "questions.yaml: 문항 'Q_FREE'가 없습니다. 이 id는 코드가 쓰므로 지우거나 바꾸면 안 됩니다.",
    ]);
  });

  it("유형마다 척도 문항이 정확히 두 개여야 한다", () => {
    const one = questions().filter((q) => q.id !== "Q02");
    expect(validateQuestions(one, types())[0]).toContain("2개여야 합니다. (지금: 1개)");
    const three = [...questions(), { id: "Q03", type: "T01", selection: "scale", text: "문항 3" }];
    // 덧붙인 문항은 결과 쪽 문항 뒤에 있어 '척도 사이에 끼었다'는 안내도 함께 나온다
    expect(validateQuestions(three, types()).some((p) => p.includes("(지금: 3개)"))).toBe(true);
  });

  it("척도 문항 사이에 다른 문항이 끼면 알려 준다", () => {
    const list = questions();
    const mixed = [list[0], list[3], list[1], list[4], list[2], ...list.slice(5)];
    expect(validateQuestions(mixed, types())).toEqual([
      "questions.yaml: 문항 'P_AGE'가 척도 문항 사이에 끼어 있습니다. 척도 문항들의 앞이나 뒤로 옮겨 주세요.",
    ]);
  });

  it("기본정보의 선택지 id는 정보표의 대상 조건 칸과 같아야 한다", () => {
    const broken = questions();
    broken[0].options = [{ id: "man", label: "남성" }, { id: "female", label: "여성" }];
    expect(validateQuestions(broken, types())[0]).toContain("선택지 id는 male / female여야 합니다.");
  });

  it("척도 문항의 유형이 유형 목록에 없으면 알려 준다", () => {
    const broken = questions();
    broken[3].type = "T99";
    const problems = validateQuestions(broken, types());
    expect(problems).toContain("questions.yaml: 척도 문항의 type 'T99'가 types.yaml에 없습니다.");
  });
});

describe("프로그램 정보표", () => {
  it("필수 열이 없으면 그 열 이름을 알려 주고 멈춘다", () => {
    const rest = row();
    delete rest["출처URL"];
    expect(validatePrograms([rest], types())).toEqual(["programs.csv: 다음 열이 없습니다: 출처URL"]);
  });

  it("매칭가능이 Y면 출처URL이 있어야 한다", () => {
    expect(validatePrograms([row({ 출처URL: "" })], types())[0]).toContain("출처URL이 있어야 합니다");
    expect(validatePrograms([row({ 출처URL: "", 매칭가능: "N" })], types())).toEqual([]);
  });

  it("정해진 값만 적는 칸에 다른 값을 적으면 알려 준다", () => {
    const problems = validatePrograms([row({ 종류: "상시" })], types());
    expect(problems).toEqual([
      "programs.csv 2행(P1): '종류' 칸은 기간프로그램 / 목록 / 상시서비스 중 하나여야 합니다. (지금: '상시')",
    ]);
  });

  it("종료시각은 표시종료일과 함께, HH:MM으로만 적는다", () => {
    expect(validatePrograms([row({ 표시종료일: "2026-11-30", 종료시각: "14:00" })], types())).toEqual([]);
    expect(validatePrograms([row({ 종료시각: "14:00" })], types())).toHaveLength(1);
    expect(validatePrograms([row({ 표시종료일: "2026-11-30", 종료시각: "24:00" })], types())).toHaveLength(1);
    expect(validatePrograms([row({ 표시종료일: "2026/11/30" })], types())).toHaveLength(1);
  });

  it("유형태그와 세부태그는 유형 파일에 있는 값이어야 한다", () => {
    expect(validatePrograms([row({ 유형태그: "T01|T77" })], types())[0]).toContain("유형태그 'T77'");
    expect(validatePrograms([row({ 세부태그: "D01.a" })], types())).toEqual([]);
    expect(validatePrograms([row({ 세부태그: "D01.zzz" })], types())[0]).toContain("세부태그 'D01.zzz'");
  });

  it("유형태그는 일반 창구(첫상담 Y)만 비울 수 있다", () => {
    expect(validatePrograms([row({ 유형태그: "" })], types())[0]).toContain("유형태그가 비었습니다");
    expect(validatePrograms([row({ 유형태그: "", 첫상담: "Y" })], types())).toEqual([]);
  });

  it("대상 조건 칸은 정해진 값과 숫자만 받는다", () => {
    expect(validatePrograms([row({ 대상성별: "female", 최소나이: "50", 최대나이: "69" })], types())).toEqual([]);
    expect(validatePrograms([row({ 대상성별: "여성" })], types())).toHaveLength(1);
    expect(validatePrograms([row({ 최소나이: "50세" })], types())).toHaveLength(1);
    expect(validatePrograms([row({ 최소나이: "70", 최대나이: "60" })], types())[0]).toContain("최소나이가 최대나이보다 큽니다");
  });

  it("id가 겹치면 알려 준다", () => {
    expect(validatePrograms([row(), row()], types())).toEqual(["programs.csv 3행: id가 비었거나 중복입니다."]);
  });
});

describe("설정과 지시문", () => {
  it("걱정 단추의 칸 이름이 정보표에 없으면 알려 준다", () => {
    const broken = { ...settings(), worries: [{ id: "x", label: "걱정", show: ["없는칸"] }] };
    expect(validateSettings(broken)[0]).toContain("정보표에 없는 칸 '없는칸'");
  });

  it("맞는 곳이 없을 때의 카드에 빠진 칸이 있으면 알려 준다(url은 없어도 된다)", () => {
    expect(validateSettings(settings())).toEqual([]);
    const card: Record<string, string> = { ...settings().fallback_card };
    delete card.phone;
    expect(validateSettings({ ...settings(), fallback_card: card })).toEqual([
      "settings.yaml: fallback_card에 'phone'가 없습니다.",
    ]);
  });

  it("지시문에서 자리표시자를 지우면 알려 준다", () => {
    expect(validatePrompt(prompt())).toEqual([]);
    expect(validatePrompt(prompt().replace("{wish_text}", ""))).toEqual([
      "prompts/matching.md: 자리표시자 {wish_text}가 없습니다. 지우지 마세요.",
    ]);
  });
});

describe("도우미", () => {
  it("'|'로 나눈 칸을 목록으로 바꾼다", () => {
    expect(splitMulti("T01| T02 |")).toEqual(["T01", "T02"]);
    expect(splitMulti("")).toEqual([]);
    expect(splitMulti(undefined)).toEqual([]);
  });
});
