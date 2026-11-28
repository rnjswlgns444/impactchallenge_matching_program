// 화면에 놓을 곳 고르기. 정보표는 실제 자료가 아니라 이 파일의 견본을 쓴다.
import { describe, expect, it } from "vitest";

import type { Program, TypeInfo } from "@/data/types";

import { dayOnly } from "./clock";
import { noPlace, noVisit, phoneLabel, placeContext, placeName } from "./places";

const today = dayOnly("2026-11-27");

function row(id: string, fields: Record<string, string> = {}): Program {
  return {
    id,
    기관명: `${id} 기관`,
    프로그램명: `${id} 프로그램`,
    종류: "상시서비스",
    범위: "안산",
    유형태그: "T01",
    세부태그: "",
    첫상담: "N",
    "55~64세참여": "가능",
    매칭가능: "Y",
    표시종료일: "",
    종료시각: "",
    대상성별: "",
    최소나이: "",
    최대나이: "",
    대상재직상태: "",
    ...fields,
  };
}

const plain: TypeInfo = { id: "T01", area: "work", name: "일터찾기형", statement: "", feature: "" };
const care: TypeInfo = {
  id: "T11",
  area: "life",
  name: "돌봄동행형",
  statement: "",
  feature: "",
  detail: {
    id: "D11",
    text: "누구에게 도움이 필요하세요?",
    selection: "single",
    require_choice: true,
    match_tags: true,
    options: [{ id: "me", label: "나" }],
  },
};
const types = [plain, care];

describe("placeContext", () => {
  it("문의할 곳을 먼저, 목록을 뒤에 놓는다", () => {
    const programs = [row("L1", { 종류: "목록" }), row("A1"), row("C1", { 유형태그: "T02", 첫상담: "Y" })];
    const context = placeContext(programs, types, "T01", {}, today);
    expect(context.places.map((p) => p.id)).toEqual(["A1", "L1"]);
    expect(context.consults.map((p) => p.id)).toEqual(["C1"]);
    expect(noPlace(context.result)).toBe(false);
  });

  it("이 유형의 곳이 없으면 일반 창구를 놓는다", () => {
    const programs = [row("C1", { 유형태그: "T02", 첫상담: "Y" }), row("X1", { 매칭가능: "N" })];
    const context = placeContext(programs, types, "T01", {}, today);
    expect(noPlace(context.result)).toBe(true);
    expect(context.places.map((p) => p.id)).toEqual(["C1"]);
  });

  it("먼저 골라야 하는 유형은 고르기 전에 일반 창구로 대신하지 않는다", () => {
    const programs = [row("K1", { 유형태그: "T11", 세부태그: "D11.me" }), row("C1", { 첫상담: "Y" })];
    const before = placeContext(programs, types, "T11", {}, today);
    expect(before.result.needsChoice).toBe(true);
    expect(before.places).toEqual([]);
    const after = placeContext(programs, types, "T11", { T11: "me" }, today);
    expect(after.places.map((p) => p.id)).toEqual(["K1"]);
  });

  it("끝난 곳과 대상이 아닌 곳은 놓지 않는다(거르기는 candidates가 한다)", () => {
    const programs = [row("OLD", { 표시종료일: "2026-11-26" }), row("W1", { 대상성별: "female" }), row("A1")];
    expect(placeContext(programs, types, "T01", {}, today, { P_GENDER: "male" }).places.map((p) => p.id)).toEqual(["A1"]);
    // 둘러보기(답 없음)에서는 성별로 거르지 않는다
    expect(placeContext(programs, types, "T01", {}, today).places.map((p) => p.id)).toEqual(["A1", "W1"]);
  });
});

describe("placeContext: AI가 고른 곳", () => {
  const programs = [row("A1"), row("A2"), row("A3"), row("L1", { 종류: "목록" }), row("X1", { 유형태그: "T02" })];

  it("고른 곳을 맨 앞으로 옮기고 이유를 돌려준다", () => {
    const picks = [
      { id: "A3", reason: "셋째가 맞아요" },
      { id: "A2", reason: "둘째도 맞아요" },
    ];
    const context = placeContext(programs, types, "T01", {}, today, {}, picks);
    expect(context.places.map((p) => p.id)).toEqual(["A3", "A2", "A1", "L1"]);
    expect(context.reasons).toEqual({ A3: "셋째가 맞아요", A2: "둘째도 맞아요" });
  });

  it("지금 AI 후보에 없는 id(다른 유형, 목록, 없는 곳)는 쓰지 않는다", () => {
    const picks = [
      { id: "X1", reason: "다른 유형" },
      { id: "L1", reason: "목록" },
      { id: "NOPE", reason: "없는 곳" },
      { id: "A2", reason: "맞아요" },
      { id: "A2", reason: "중복" },
    ];
    const context = placeContext(programs, types, "T01", {}, today, {}, picks);
    expect(context.places.map((p) => p.id)).toEqual(["A2", "A1", "A3", "L1"]);
    expect(context.reasons).toEqual({ A2: "맞아요" });
  });

  it("고른 것이 없거나(null) 둘러보기면 순서가 그대로다", () => {
    const none = placeContext(programs, types, "T01", {}, today, {}, null);
    expect(none.places.map((p) => p.id)).toEqual(["A1", "A2", "A3", "L1"]);
    expect(none.pool.map((p) => p.id)).toEqual(["A1", "A2", "A3"]);
    const browse = placeContext(programs, types, "T01", {}, today);
    expect(browse.pool).toEqual([]);
    expect(browse.reasons).toEqual({});
  });
});

describe("기관 이름과 이용 방식", () => {
  it("괄호 풀이만 뺀다", () => {
    expect(placeName(row("A", { 기관명: "안산시 일자리센터(노동일자리과)" }))).toBe("안산시 일자리센터");
    expect(placeName(row("A", { 기관명: "(재)안산" }))).toBe("안산");
    expect(placeName(row("A", { 기관명: "(전체가 괄호)" }))).toBe("(전체가 괄호)");
  });

  it("전화·온라인으로 이용하는 곳을 가린다", () => {
    expect(noVisit("전화 상담")).toBe(true);
    expect(noVisit("전화 안내. 평일 9~18시")).toBe(true);
    expect(noVisit("안산시청 1층")).toBe(false);
  });
});

describe("전화 단추에 붙일 곳 이름", () => {
  it("괄호 안의 글을 쓴다", () => {
    expect(phoneLabel("031-481-5899 (상록수)")).toBe("상록수");
  });

  it("쉼표가 있으면 그 앞까지만 쓴다", () => {
    expect(phoneLabel("1800-0096 (AI디지털배움터 콜센터, 평일 9~22시·주말 9~18시)")).toBe("AI디지털배움터 콜센터");
  });

  it("괄호가 없으면 빈 글이다", () => {
    expect(phoneLabel("031-481-2919")).toBe("");
    expect(phoneLabel("031-439-1619~21")).toBe("");
  });
});
