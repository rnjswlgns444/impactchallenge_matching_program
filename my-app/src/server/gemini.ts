// Google Gemini를 부르는 함수를 만든다. 서버에서만 쓴다(키가 브라우저로 가면 안 된다).
// 원본: app/core/llm_matcher.py의 make_gemini_caller
import "server-only";

import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";

import { ANSWER_SCHEMA } from "@/core/matcher";

const RETRY_WAIT_MS = 3000;

const LEVELS: Record<string, ThinkingLevel> = {
  minimal: ThinkingLevel.MINIMAL,
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
  high: ThinkingLevel.HIGH,
};

// 지시문을 받아 AI의 답(JSON 글)을 돌려주는 함수. 답은 JSON 형식으로 강제한다.
// 실패하면 오류를 던진다. 부르는 쪽(core/matcher.ts의 recommend)이 fail로 바꾼다.
export function makeGeminiCaller(
  apiKey: string,
  model: string,
  effort: string,
  timeoutSeconds: number
): (prompt: string) => Promise<string> {
  const client = new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutSeconds * 1000 } });

  const generate = (prompt: string) =>
    client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: ANSWER_SCHEMA,
        // 생각하는 깊이. 기본값(medium)은 답이 늦어 시간 초과가 났다
        thinkingConfig: { thinkingLevel: LEVELS[effort] ?? ThinkingLevel.LOW },
      },
    });

  return async (prompt) => {
    let response;
    try {
      response = await generate(prompt);
    } catch (error) {
      // 503(서버가 잠시 바쁨)은 몇 초 만에 돌아오므로 한 번만 다시 부른다. 그 밖의 오류는 다시 부르지 않는다
      if (!(error instanceof ApiError) || error.status !== 503) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_WAIT_MS));
      response = await generate(prompt);
    }
    const answer = response.text;
    if (!answer) throw new Error("빈 답");
    return answer;
  };
}
