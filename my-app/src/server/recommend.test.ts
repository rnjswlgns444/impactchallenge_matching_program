// 서버의 AI 창구. 실제 AI는 부르지 않고 가짜 AI를 넣어 본다. 자료는 이 파일의 견본을 쓴다.
import { describe, expect, it } from "vitest";

import { dayOnly } from "@/core/clock";
import type { AppData, Program, TypeInfo } from "@/data/types";

import { answerRequest, errorKind } from "./recommend";

function row(id: string, fields: Record<string, string> = {}): Program {
  return {
    id,
    기관명: `${id} 기관`,
    프로그램명: `${id} 프로그램`,
    한줄설명: "",
    상세설명: "",
    키워드: "",
    대상: "",
    시간대: "",
    비용: "",
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

const work: TypeInfo = {
  id: "T01",
  area: "work",
  name: "일터찾기형",
  statement: "직장을 찾고 싶어요.",
  feature: "",
  detail: {
    id: "D01",
    text: "어떤 일?",
    selection: "single",
    options: [{ id: "old", label: "예전에 하던 일" }],
  },
};
const mind: TypeInfo = {
  id: "T08",
  area: "leisure",
  name: "마음쉼표형",
  statement: "상담하고 싶어요.",
  feature: "",
  detail: {
    id: "D08",
    text: "어떤 상담?",
    selection: "single",
    log_answer: false,
    options: [{ id: "family", label: "가족 문제 상담" }],
  },
};

const data = {
  questions: [],
  scale: [],
  areas: [],
  types: [work, mind],
  programs: [
    row("A1"),
    row("A2"),
    row("WOMEN", { 대상성별: "female" }),
    row("OLD", { 표시종료일: "2026-11-20" }),
    row("LIST", { 종류: "목록" }),
    row("M1", { 유형태그: "T08" }),
  ],
  venues: {},
  dongs: [],
  settings: {
    scoring: { high: 8 },
    ai_top_n: 3,
    worries: [],
    free_empty_words: ["없어요"],
    fallback_card: { name: "", org: "", description: "", phone: "", say: "" },
  },
} satisfies AppData;

const TEMPLATE = "유형:{type_name}\n고른 것:{wish_examples}\n글:{wish_text}\n후보:\n{candidates}\n최대:{max_n}";

function setup(answer: string | Error = '{"matches":[],"unmatched":[]}') {
  const prompts: string[] = [];
  const errors: unknown[] = [];
  const deps = {
    data,
    template: TEMPLATE,
    when: dayOnly("2026-11-27"),
    callLlm: async (prompt: string) => {
      prompts.push(prompt);
      if (answer instanceof Error) throw answer;
      return answer;
    },
    onError: (error: unknown) => errors.push(error),
  };
  return { deps, prompts, errors };
}

const request = (extra: Record<string, unknown> = {}) => ({
  typeId: "T01",
  wish: "오전에 할 수 있는 일",
  candidates: ["A1", "A2"],
  ...extra,
});

describe("answerRequest", () => {
  it("AI가 고른 곳과 이유를 돌려준다", async () => {
    const { deps } = setup('{"matches":[{"id":"A2","reason":"오전에 상담할 수 있어요."}],"unmatched":[]}');
    expect(await answerRequest(request(), deps)).toEqual({
      status: "ok",
      matches: [{ id: "A2", reason: "오전에 상담할 수 있어요." }],
      unmatched: [],
    });
  });

  it("AI가 후보에 없는 id를 주면 버린다", async () => {
    const { deps } = setup('{"matches":[{"id":"NOPE","reason":"지어낸 곳"},{"id":"A1","reason":"맞아요"}],"unmatched":[]}');
    const result = await answerRequest(request(), deps);
    expect(result.matches.map((match) => match.id)).toEqual(["A1"]);
  });

  it("화면이 보낸 엉뚱한 id, 끝난 곳, 목록, 다른 유형의 곳은 AI로 가지 않는다", async () => {
    const { deps, prompts } = setup();
    await answerRequest(request({ candidates: ["A1", "OLD", "LIST", "M1", "NOPE"] }), deps);
    expect(prompts[0]).toContain("id: A1");
    for (const id of ["OLD", "LIST", "M1", "NOPE", "A2"]) expect(prompts[0]).not.toContain(`id: ${id}`);
  });

  it("화면이 보내지 않은 곳은 서버 후보에 있어도 AI로 가지 않는다(성별·나이로 걸러진 곳)", async () => {
    const { deps, prompts } = setup();
    await answerRequest(request({ candidates: ["A1"] }), deps);
    expect(prompts[0]).not.toContain("id: WOMEN");
    // AI가 그 곳을 골라도 받지 않는다
    const second = setup('{"matches":[{"id":"WOMEN","reason":"x"}],"unmatched":[]}');
    expect((await answerRequest(request({ candidates: ["A1"] }), second.deps)).matches).toEqual([]);
  });

  it("글의 전화번호·이메일·주민번호는 지운 뒤에만 지시문에 들어간다", async () => {
    const { deps, prompts } = setup();
    await answerRequest(request({ wish: "010-1234-5678 a@b.co 600101-2345678 오전 일" }), deps);
    expect(prompts[0]).toContain("오전 일");
    for (const secret of ["010-1234-5678", "a@b.co", "600101-2345678"]) expect(prompts[0]).not.toContain(secret);
  });

  it("고른 세부 항목은 지시문에 들어가고, 남기지 않기로 한 세부 답(마음·건강)은 보내도 버린다", async () => {
    const first = setup();
    await answerRequest(request({ detail: "old" }), first.deps);
    expect(first.prompts[0]).toContain("고른 것:예전에 하던 일");

    const second = setup();
    await answerRequest({ typeId: "T08", detail: "family", wish: "가족 이야기", candidates: ["M1"] }, second.deps);
    expect(second.prompts[0]).toContain("고른 것:(없음)");
    expect(second.prompts[0]).not.toContain("가족 문제 상담");
  });

  it("바라는 점이 없는 글이면 AI를 부르지 않는다", async () => {
    for (const wish of ["없어요", " 없어요. ", "ㅇ", "..."]) {
      const { deps, prompts } = setup();
      expect((await answerRequest(request({ wish }), deps)).status, wish).toBe("unclear");
      expect(prompts).toEqual([]);
    }
  });

  it("성별·태어난 해·일 여부 같은 다른 칸이 섞여 오면 받지 않는다", async () => {
    const { deps, prompts } = setup();
    for (const extra of [{ P_GENDER: "female" }, { P_AGE: 1964 }, { P_WORK: "employed" }, { answers: {} }]) {
      expect((await answerRequest(request(extra), deps)).status).toBe("fail");
    }
    expect(prompts).toEqual([]);
  });

  it("모양이 틀린 요청, 없는 유형, 너무 긴 글은 fail이다", async () => {
    const { deps, prompts } = setup();
    const bad = [null, "글", {}, request({ typeId: "T99" }), request({ wish: "가".repeat(501) }), request({ candidates: "A1" })];
    for (const body of bad) expect((await answerRequest(body, deps)).status).toBe("fail");
    expect(prompts).toEqual([]);
  });

  it("키가 없으면(callLlm이 null) fail이고, 후보가 없으면 AI를 부르지 않고 partial이다", async () => {
    const { deps, prompts } = setup();
    expect((await answerRequest(request(), { ...deps, callLlm: null })).status).toBe("fail");
    expect((await answerRequest(request({ candidates: [] }), deps)).status).toBe("partial");
    expect(prompts).toEqual([]);
  });

  it("AI 호출이 실패하거나 답의 형식이 틀리면 오류를 던지지 않고 fail로 답한다", async () => {
    const broken = setup(new Error("서버 오류: 사용자 글이 섞인 메시지"));
    expect(await answerRequest(request(), broken.deps)).toEqual({ status: "fail", matches: [], unmatched: [] });
    expect(broken.errors).toHaveLength(1);

    const garbled = setup("JSON이 아닌 답");
    expect((await answerRequest(request(), garbled.deps)).status).toBe("fail");
  });

  it("맞는 후보가 없는 내용이 있으면 partial이다", async () => {
    const { deps } = setup('{"matches":[{"id":"A1","reason":"맞아요"}],"unmatched":["무료"]}');
    expect(await answerRequest(request(), deps)).toEqual({
      status: "partial",
      matches: [{ id: "A1", reason: "맞아요" }],
      unmatched: ["무료"],
    });
  });
});

describe("errorKind", () => {
  it("오류의 종류와 상태 코드만 남기고 메시지는 담지 않는다", () => {
    const error = Object.assign(new Error("사용자 글이 섞인 메시지"), { status: 429 });
    expect(errorKind(error)).toBe("Error:429");
    expect(errorKind(new TypeError("x"))).toBe("TypeError");
    expect(errorKind("글자")).toBe("UnknownError");
  });
});
