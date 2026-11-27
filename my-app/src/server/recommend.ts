// 서버의 AI 창구가 하는 일. 화면이 보낸 요청을 검사하고, 후보를 다시 만들고, AI에게 묻고, 답을 검증한다.
// 통신(route.ts)과 실제 AI 호출(gemini.ts)은 밖에 두고, 여기는 인자로 받은 것만 쓴다(테스트에서 가짜 AI를 넣는다).
//
// 지키는 것
// - 화면이 보낸 후보 id를 믿지 않는다. 서버가 자기 정보표로 후보를 다시 만들고, 겹치는 곳만 AI에 보낸다.
// - 요청에는 성별·태어난 해·일 여부를 받는 칸이 없다. 정해진 칸 말고 다른 것이 오면 받지 않는다.
// - 기록하지 않기로 한 세부 답(마음·건강)은 화면이 보냈더라도 버린다.
// - 글은 개인정보 형태를 한 번 더 지운 뒤에만 지시문에 넣는다.
// - 무엇이 실패해도 오류를 밖으로 던지지 않고 fail로 답한다.

import { z } from "zod";

import { aiPool } from "@/core/candidates";
import type { Moment } from "@/core/clock";
import { hasWish, recommend, type AiResult } from "@/core/matcher";
import { scrub } from "@/core/privacy";
import { chosenDetailOptions, detailOf } from "@/core/selection";
import type { AppData } from "@/data/types";

export const WISH_LIMIT = 500; // 적은 글의 최대 길이(자). questions.yaml의 Q_FREE와 같다

// 화면이 보내는 것. 이 네 칸뿐이다(strict: 다른 칸이 섞여 오면 받지 않는다)
const requestSchema = z.strictObject({
  typeId: z.string().max(20),
  // 세부 질문에서 고른 선택지 id. 마음·건강 유형은 화면이 보내지 않는다
  detail: z.union([z.string().max(60), z.array(z.string().max(60)).max(10), z.null()]).optional(),
  wish: z.string().max(WISH_LIMIT),
  candidates: z.array(z.string().max(40)).max(100), // 화면이 지금 보여 줄 수 있는 후보의 id
});

export type RecommendRequest = z.infer<typeof requestSchema>;

const FAIL: AiResult = { status: "fail", matches: [], unmatched: [] };

export async function answerRequest(
  body: unknown,
  deps: {
    data: AppData;
    template: string; // AI 지시문(app/prompts/matching.md)
    when: Moment; // 서버의 지금(한국 시각). 끝난 곳을 서버 기준으로 다시 거른다
    callLlm: ((prompt: string) => Promise<string>) | null; // 키가 없으면 null
    onError?: (error: unknown) => void; // 오류의 종류만 기록하는 데 쓴다
  }
): Promise<AiResult> {
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return FAIL;
  const { typeId, wish, candidates } = parsed.data;
  const { data } = deps;

  const type = data.types.find((one) => one.id === typeId);
  if (!type) return FAIL;

  // 남기지 않기로 한 세부 답은 쓰지 않는다
  const detail = detailOf(type);
  const detailAnswer = detail && detail.log_answer !== false ? (parsed.data.detail ?? null) : null;

  // 바라는 점이 있는지는 적은 글 그대로 본다(파이썬 앱과 같다). 지시문에는 지운 글만 넣는다
  const wishText = scrub(wish);
  if (!hasWish(wish, data.settings.free_empty_words)) {
    return { status: "unclear", matches: [], unmatched: [] };
  }

  // 서버가 다시 만든 후보(운영 중, 종료일·종료시각, 유형, 목록 아님) 가운데 화면도 가진 것만 남긴다.
  // 화면 쪽 후보는 성별·나이로 더 걸러져 있으므로, 겹치는 부분이 곧 그 사람에게 보여 줄 수 있는 후보다.
  const allowed = new Set(candidates);
  const pool = aiPool(data.programs, data.types, [type.id], { [type.id]: detailAnswer }, deps.when).filter(
    (program) => allowed.has(program.id)
  );

  const examples = chosenDetailOptions(type, detailAnswer).map((option) => option.label);
  return recommend(
    deps.template,
    [type],
    examples,
    wishText,
    pool,
    data.settings.ai_top_n,
    deps.callLlm,
    deps.onError
  );
}

// 오류의 종류만 남긴다. API 오류면 상태 코드(예: 429)를 붙인다. 오류 메시지는 담지 않는다(사용자 글이 섞일 수 있다).
export function errorKind(error: unknown): string {
  if (!(error instanceof Error)) return "UnknownError";
  const status = (error as { status?: unknown }).status;
  return error.name + (typeof status === "number" ? `:${status}` : "");
}
