// AI 추가 추천 창구. 화면이 '직접 적은 글'과 유형, 후보 id를 보내면 그 후보 안에서 맞는 곳을 골라 돌려준다.
// 하는 일은 src/server/recommend.ts에 있다. 여기서는 요청을 읽고, 키와 설정을 넘기고, 답을 보낼 뿐이다.
//
// 키(GEMINI_API_KEY)는 서버 환경 변수에만 둔다(로컬은 my-app/.env.local, 배포는 Vercel 설정).
// 서버 기록에는 오류의 종류만 남긴다. 사용자 글과 오류 메시지는 남기지 않는다.

import { now } from "@/core/clock";
import { appData } from "@/data";
import { serverData } from "@/data/server";
import { makeGeminiCaller } from "@/server/gemini";
import { answerRequest, errorKind } from "@/server/recommend";

// AI가 답하는 데 길면 1분쯤 걸린다
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // 읽지 못한 요청은 아래에서 fail이 된다
  }

  const { llm } = serverData;
  const key = process.env.GEMINI_API_KEY ?? "";
  // 지금은 gemini만 옮겼다. 다른 제공자가 적혀 있거나 키가 없으면 AI를 부르지 않고 fail로 답한다
  const callLlm =
    key && llm.provider === "gemini"
      ? makeGeminiCaller(key, llm.model, llm.effort, llm.timeout_seconds)
      : null;
  if (!callLlm) console.error("AI 추가 추천 실패: 키 또는 제공자 설정 없음");

  const result = await answerRequest(body, {
    data: appData,
    template: serverData.prompt,
    when: now(),
    callLlm,
    onError: (error) => console.error(`AI 추가 추천 실패: ${errorKind(error)}`),
  });
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
