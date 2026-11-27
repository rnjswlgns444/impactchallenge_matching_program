// AI 추가 추천의 판단 부분: 글에 바라는 점이 있는지, 지시문 조립, AI 답 검증. 화면·통신과 무관한 순수 함수만 둔다.
// 원본: app/core/llm_matcher.py (이 파일과 답이 달라지면 이 파일을 고친다. 파이썬이 기준이다)
//
// 기본 결과는 AI 없이 candidates.ts가 만든다. AI는 직접 적은 글이 있는 사람에게만,
// 코드가 걸러 준 후보(aiPool) 안에서 글과 관련된 곳을 골라 이유와 함께 덧붙인다.
// AI가 준 id는 후보 목록과 대조하고, 없는 id는 버린다. 유형은 AI가 정하지 않는다.
// 결과 상태:
//   ok      : 글에 맞는 곳을 찾음
//   partial : 일부(또는 전부)에 맞는 후보가 없음
//   fail    : AI 호출이나 답 형식이 실패함 → 기본 결과만 보여 준다
//   unclear : 글에 원하는 점이 없음("ㅇ", "없어") → AI를 부르지 않고 더 적어 달라고 한다

import type { Program, TypeInfo } from "@/data/types";

import { scrub } from "./privacy";

export type AiStatus = "ok" | "partial" | "fail" | "unclear";
export type AiMatch = { id: string; reason: string };
export type AiResult = {
  status: AiStatus;
  matches: AiMatch[]; // 고른 곳과 추천 이유, 잘 맞는 순서대로
  unmatched: string[]; // 맞는 후보를 찾지 못한 내용
};

const NO_TYPE = "(정하지 않음)";
const NOTHING = "(없음)";
const REASON_LIMIT = 200; // AI가 쓴 이유 글의 최대 길이(자)
const UNMATCHED_LIMIT = 40;
const UNMATCHED_COUNT = 3;

// AI에게 요구하는 답의 모양(JSON Schema)
export const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, reason: { type: "string" } },
        required: ["id", "reason"],
      },
    },
    unmatched: { type: "array", items: { type: "string" } },
  },
  required: ["matches", "unmatched"],
} as const;

// 완성된 한글 글자·영문·숫자만 남긴다. 공백, 문장부호, 'ㅇ' 같은 낱자는 뺀다.
function letters(text: string): string {
  return text.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

// 적은 글에 원하는 점이 있어 보이는지. false면 AI를 부르지 않는다.
// 남는 글자가 없거나("ㅇ", "ㅋㅋ", "..."), 글 전체가 '없다는 뜻의 말'(settings.yaml의 free_empty_words)이면 false다.
// 글자 수로는 거르지 않는다. "요가"처럼 짧아도 뜻이 있는 답이 있다.
export function hasWish(text: string, emptyWords: string[]): boolean {
  const kept = letters(text);
  return kept !== "" && !emptyWords.some((word) => letters(word) === kept);
}

// 유형의 문장과 구분 기준. 구분 기준에는 '공연을 모임으로 추천하지 않음' 같은 주의가 들어 있다.
function typeLine(type: TypeInfo): string {
  return type.definition ? `${type.statement} (구분 기준: ${type.definition})` : type.statement;
}

// 지시문의 자리 6개를 채운다. 사용자 글은 전화번호·이메일·주민번호 형태를 지운 뒤에만 들어간다.
// wishExamples는 세부 질문에서 고른 선택지의 글이다(마음·건강처럼 남기지 않는 것은 넣지 않는다).
export function buildPrompt(
  template: string,
  types: TypeInfo[],
  wishExamples: string[],
  wishText: string,
  pool: Program[],
  maxN: number
): string {
  const lines = pool.map(
    (p) =>
      `- id: ${p.id}\n  이름: ${p["프로그램명"]} (${p["기관명"]})\n  소개: ${p["한줄설명"]}\n` +
      `  자세한 내용: ${p["상세설명"]}\n  키워드: ${p["키워드"]}\n` +
      `  대상: ${p["대상"]} / 시간: ${p["시간대"]} / 비용: ${p["비용"]}`
  );
  const values: Record<string, string> = {
    "{type_name}": types.map((t) => t.name).join(", ") || NO_TYPE,
    "{type_summary}": types.map(typeLine).join(" / ") || NO_TYPE,
    "{wish_examples}": wishExamples.join(", ") || NOTHING,
    "{wish_text}": scrub(wishText).trim() || NOTHING,
    "{candidates}": lines.join("\n"),
    "{max_n}": String(maxN),
  };
  // 한 번에 바꾼다. 사용자 글에 자리표시자 모양의 글자가 있어도 다시 바뀌지 않는다.
  return template.replace(
    /\{type_name\}|\{type_summary\}|\{wish_examples\}|\{wish_text\}|\{candidates\}|\{max_n\}/g,
    (key) => values[key]
  );
}

// AI 답의 형식이 틀렸을 때 던진다
export class AnswerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnswerError";
  }
}

// 파이썬의 str(값)과 같은 글자를 만든다(AI가 글자가 아닌 값을 줬을 때를 위해)
function pyText(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  return typeof value === "string" ? value : JSON.stringify(value);
}

// 글자 수(코드 포인트)로 자른다. 이모지가 반으로 잘리지 않는다
const cut = (value: string, limit: number) => Array.from(value).slice(0, limit).join("");

// AI 답을 읽고 후보에 없는 id를 버린다. 형식이 틀리면 AnswerError(또는 JSON 오류)를 던진다.
export function parseAnswer(
  raw: string,
  candidateIds: string[],
  maxN: number
): { matches: AiMatch[]; unmatched: string[] } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new AnswerError("JSON이 없음");
  const data: unknown = JSON.parse(raw.slice(start, end + 1));
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new AnswerError("객체가 아님");
  const answer = data as Record<string, unknown>;

  const matches: AiMatch[] = [];
  const seen = new Set<string>();
  const items = answer.matches || [];
  if (!Array.isArray(items)) throw new AnswerError("matches가 목록이 아님");
  for (const item of items) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) throw new AnswerError("항목이 객체가 아님");
    const one = item as Record<string, unknown>;
    const id = ("id" in one ? pyText(one.id) : "").trim();
    if (candidateIds.includes(id) && !seen.has(id)) {
      seen.add(id);
      matches.push({ id, reason: cut(("reason" in one ? pyText(one.reason) : "").trim(), REASON_LIMIT) });
    }
  }

  const rest = answer.unmatched || [];
  if (!Array.isArray(rest)) throw new AnswerError("unmatched가 목록이 아님");
  const unmatched = rest
    .map((value) => pyText(value).trim())
    .filter(Boolean)
    .map((value) => cut(value, UNMATCHED_LIMIT));

  return { matches: matches.slice(0, maxN), unmatched: unmatched.slice(0, UNMATCHED_COUNT) };
}

// 주관식에 맞는 곳을 후보(pool) 안에서 고른다. callLlm은 지시문을 받아 AI의 답(글)을 돌려주는 함수다.
// callLlm이 null이면(API 키 없음) fail이다. 어떤 오류가 나도 밖으로 던지지 않고 fail로 돌려준다.
// onError에는 오류만 넘긴다. 받는 쪽은 오류의 종류만 남기고, 글이나 오류 메시지는 남기지 않는다.
export async function recommend(
  template: string,
  types: TypeInfo[],
  wishExamples: string[],
  wishText: string,
  pool: Program[],
  maxN: number,
  callLlm: ((prompt: string) => Promise<string>) | null,
  onError?: (error: unknown) => void
): Promise<AiResult> {
  if (pool.length === 0) return { status: "partial", matches: [], unmatched: [] };
  if (callLlm === null) return { status: "fail", matches: [], unmatched: [] };
  try {
    const prompt = buildPrompt(template, types, wishExamples, wishText, pool, maxN);
    const { matches, unmatched } = parseAnswer(
      await callLlm(prompt),
      pool.map((p) => p.id),
      maxN
    );
    if (matches.length > 0 && unmatched.length === 0) return { status: "ok", matches, unmatched: [] };
    return { status: "partial", matches, unmatched };
  } catch (error) {
    onError?.(error); // 어떤 실패든 기본 결과는 그대로 보여 줘야 한다
    return { status: "fail", matches: [], unmatched: [] };
  }
}
