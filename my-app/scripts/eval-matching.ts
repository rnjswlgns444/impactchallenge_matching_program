// 정답표(app/tests/matching_cases.yaml)로 새 앱의 AI 추가 추천을 잰다. 실제 AI를 부른다.
// 실행: my-app 폴더에서
//   npm run eval:ai            # 실제 AI로 잰다(무료 한도 때문에 호출 사이에 12초 쉰다. 4분쯤)
//   npm run eval:ai -- --check # AI를 부르지 않고 정답표가 지금 정보표와 맞는지만 본다
//   npm run eval:ai -- --only 김명수 --times 5 # 이름에 이 글자가 든 사례만, 여러 번 잰다
// 키는 my-app/.env.local의 GEMINI_API_KEY를 읽는다. 키 값은 출력하지 않는다.
//
// 파이썬의 app/tests/eval_matching.py와 같은 채점 규칙이다. 다른 점은 하나다:
// 서버 창구가 하는 일(src/server/recommend.ts의 answerRequest)을 그대로 거친다.
// 그래서 요청 검사, 글 지우기, 남기지 않는 세부 답 버리기, '없다는 말' 거르기까지 함께 잰다.
// 화면이 보내는 후보 id는 기본정보로 거르지 않은 전체 후보로 둔다(정답표에 성별·나이가 없다).
import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

import { aiPool } from "@/core/candidates";
import { now } from "@/core/clock";
import type { AiResult } from "@/core/matcher";
import { appData } from "@/data";
import { serverData } from "@/data/server";
import { makeGeminiCaller } from "@/server/gemini";
import { answerRequest, errorKind } from "@/server/recommend";

const PAUSE_MS = 12_000; // 무료 구간의 분당 호출 한도에 걸리지 않게 쉰다

type Detail = string | string[];
type Case = {
  name: string;
  types: string[];
  details?: Record<string, Detail>;
  text: string;
  first?: string[];
  include?: string[];
  exclude?: string[];
  none?: boolean;
  unmatched?: boolean;
  status?: string;
  reason_any?: string[];
};

// 정답표가 지금 자료와 맞지 않는 점
function stale(one: Case, poolIds: Set<string>): string[] {
  const problems: string[] = [];
  if (one.types.length !== 1) problems.push("새 앱은 유형 하나만 받는다(types가 하나여야 함)");
  for (const id of one.types) {
    if (!appData.types.some((type) => type.id === id)) problems.push(`유형 ${id}가 types.yaml에 없음`);
  }
  for (const field of ["first", "include"] as const) {
    for (const id of one[field] ?? []) {
      if (!poolIds.has(id)) problems.push(`${field}의 ${id}가 지금 후보에 없음`);
    }
  }
  for (const id of one.exclude ?? []) {
    if (!appData.programs.some((program) => program.id === id)) {
      problems.push(`exclude의 ${id}가 정보표에 없음(오타인지 확인)`);
    }
  }
  return problems;
}

// 틀린 점 목록. 비어 있으면 통과
function check(one: Case, result: AiResult, kind: string | null): string[] {
  if (result.status === "fail") return [`AI 호출 실패(${kind ?? "알 수 없음"})`];
  const ids = result.matches.map((match) => match.id);
  const wrong: string[] = [];
  if (one.status && result.status !== one.status) {
    wrong.push(`상태가 ${one.status}여야 하는데 ${result.status}`);
  }
  if (one.first && (ids.length === 0 || !one.first.includes(ids[0]))) {
    wrong.push(`1순위가 [${one.first}] 중 하나여야 하는데 [${ids.slice(0, 1)}]`);
  }
  for (const id of one.include ?? []) if (!ids.includes(id)) wrong.push(`${id}가 빠짐`);
  for (const id of one.exclude ?? []) if (ids.includes(id)) wrong.push(`${id}가 나오면 안 됨`);
  if (one.none && ids.length > 0) wrong.push(`아무것도 고르지 않아야 하는데 [${ids}]`);
  if (one.unmatched === true && result.unmatched.length === 0) {
    wrong.push("맞는 것이 없는 희망이 표시되지 않음");
  }
  if (one.unmatched === false && result.unmatched.length > 0) {
    wrong.push(`없는 희망으로 잘못 표시: ${result.unmatched.join(" / ")}`);
  }
  if (one.reason_any && ids.length > 0) {
    const reason = result.matches[0].reason;
    if (!one.reason_any.some((word) => reason.includes(word))) {
      wrong.push(`추천 이유에 [${one.reason_any}] 중 하나가 없음`);
    }
  }
  return wrong;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const file = path.join(process.cwd(), "..", "app", "tests", "matching_cases.yaml");
  const every = (parse(readFileSync(file, "utf-8")) as { cases: Case[] }).cases;
  const option = (name: string) => {
    const at = process.argv.indexOf(name);
    return at >= 0 ? process.argv[at + 1] : undefined;
  };
  const only = option("--only");
  const times_ = Math.max(1, Number(option("--times") ?? 1));
  const chosen = only ? every.filter((one) => one.name.includes(only)) : every;
  const cases = Array.from({ length: times_ }, () => chosen).flat();
  const when = now();
  const everyId = appData.programs.map((program) => program.id);

  let broken = 0;
  for (const one of cases) {
    const typeId = one.types[0];
    const pool = aiPool(appData.programs, appData.types, [typeId], { [typeId]: one.details?.[typeId] ?? null }, when);
    const problems = stale(one, new Set(pool.map((program) => program.id)));
    if (problems.length > 0) broken += 1;
    for (const line of problems) console.log(`정답표를 고쳐야 함 | ${one.name}: ${line}`);
  }
  if (broken > 0) {
    console.log(`정답표 ${broken}건이 지금 자료와 맞지 않습니다. matching_cases.yaml을 먼저 고쳐 주세요.`);
    process.exit(1);
  }
  if (checkOnly) {
    console.log(`정답표 ${cases.length}건이 지금 정보표와 맞습니다. (AI는 부르지 않았습니다)`);
    return;
  }

  const { llm } = serverData;
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key || llm.provider !== "gemini") {
    console.log("GEMINI_API_KEY가 없거나 제공자가 gemini가 아닙니다. my-app/.env.local을 확인해 주세요.");
    process.exit(1);
  }
  const callLlm = makeGeminiCaller(key, llm.model, llm.effort, llm.timeout_seconds);

  console.log(`${llm.provider} / 모델 ${llm.model} / 생각 깊이 ${llm.effort} / 기준일 ${when.day} ${when.time}`);
  let passed = 0;
  let called = 0;
  const times: number[] = [];
  for (const [index, one] of cases.entries()) {
    const typeId = one.types[0];
    let kind: string | null = null;
    let asked = false;
    const start = performance.now();
    const result = await answerRequest(
      { typeId, detail: one.details?.[typeId] ?? null, wish: one.text, candidates: everyId },
      {
        data: appData,
        template: serverData.prompt,
        when,
        callLlm: (prompt) => {
          asked = true;
          return callLlm(prompt);
        },
        onError: (error) => {
          kind = errorKind(error);
        },
      }
    );
    const seconds = (performance.now() - start) / 1000;
    if (asked) {
      called += 1;
      times.push(seconds);
    }
    const wrong = check(one, result, kind);
    if (wrong.length === 0) passed += 1;
    const ids = result.matches.map((match) => match.id);
    const mark = wrong.length === 0 ? "통과" : "틀림";
    const how = asked ? `${seconds.toFixed(1).padStart(5)}초` : "AI 안 부름";
    console.log(
      `${index + 1}. ${mark} ${how} | ${one.name} → [${ids}] 상태=${result.status} 없는희망=[${result.unmatched.join(" / ")}]`
    );
    for (const line of wrong) console.log(`     - ${line}`);
    if (ids.length > 0) console.log(`     이유: ${result.matches[0].reason}`);
    if (asked && index < cases.length - 1) await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
  }
  const average = times.length > 0 ? times.reduce((sum, value) => sum + value, 0) / times.length : 0;
  console.log(
    `결과: ${passed}/${cases.length} 통과 | AI 호출 ${called}회, 평균 ${average.toFixed(1)}초, 가장 느린 것 ${Math.max(0, ...times).toFixed(1)}초`
  );
}

main();
