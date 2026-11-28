import { readFileSync } from "node:fs";
import path from "node:path";

import { test as base, expect, type Locator, type Page } from "@playwright/test";

// 화면 흐름 테스트가 함께 쓰는 것.
// - ai: AI 창구(/api/recommend)를 가짜 답으로 막고, 화면이 보낸 요청을 모아 둔다. 모든 테스트에 저절로 걸린다.
//   그래서 테스트는 실제 AI를 부르지 않는다.
// - seed: 설문을 다 끝낸 사람의 답을 기기 저장소(sessionStorage)에 미리 넣는다.

const data = JSON.parse(
  // 테스트는 my-app 폴더에서 돌린다
  readFileSync(path.join(process.cwd(), "src/generated/data.json"), "utf-8")
) as {
  questions: { id: string; selection: string }[];
  types: { id: string; name: string }[];
};

export const typeName = (id: string) => data.types.find((type) => type.id === id)!.name;

// 설문 문항(기본정보 3 + 유형 찾기 C01~C09 = 12문항)의 순서
export const SURVEY_IDS = data.questions
  .filter((question) => ["single", "number"].includes(question.selection))
  .map((question) => question.id)
  .filter((id) => id.startsWith("P_") || /^C\d+$/.test(id));

// 유형 찾기 9문항(C01~C09)에 고른 보기. 글자 하나가 문항 하나다(a = 첫 보기)
// 점수는 app/data/choice_questions.yaml에서 셈했다. 문항이나 점수를 고치면 다시 맞춘다
export const PICKS = {
  T05: "bbbccabca", // 취미발견형 9.5점 단독 1위
  T07: "bbbadbbca", // 동네친구형 9.5점 단독 1위
  tie: "aaaaaabac", // 일터찾기·보탬활동·내일사장 6.5점 동점(같은 분야라 본인이 고름)
} as const;

export function answersFor(key: keyof typeof PICKS): Record<string, string | number> {
  const answers: Record<string, string | number> = {
    P_GENDER: "female",
    P_AGE: 1966,
    P_WORK: "not_working",
  };
  [...PICKS[key]].forEach((letter, i) => (answers[`C${String(i + 1).padStart(2, "0")}`] = letter));
  return answers;
}

export type Stored = {
  answers: Record<string, string | number>;
  tuned?: boolean;
  wish?: string;
  dong?: string | null;
};

type AiReply = { status: string; matches: { id: string; reason: string }[]; unmatched: string[] };

// 가짜 답. 함수가 Promise를 돌려주면 그것이 풀릴 때까지 답을 미룬다(기다리는 화면을 볼 때)
type AiAnswer = AiReply | ((body: { candidates: string[] }) => AiReply | Promise<AiReply>);

type Fixtures = {
  ai: { requests: unknown[]; reply: (answer: AiAnswer) => void };
  seed: (stored: Stored) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  ai: [
    async ({ page }, use) => {
      const requests: unknown[] = [];
      let answer: AiAnswer = {
        status: "fail",
        matches: [],
        unmatched: [],
      };
      await page.route("**/api/recommend", async (route) => {
        const body = route.request().postDataJSON() as { candidates: string[] };
        requests.push(body);
        await route.fulfill({ json: typeof answer === "function" ? await answer(body) : answer });
      });
      await use({
        requests,
        reply: (next) => {
          answer = next;
        },
      });
    },
    { auto: true },
  ],

  seed: async ({ page }, use) => {
    await use(async (stored) => {
      const state = {
        answers: stored.answers,
        details: {},
        browseDetails: {},
        dong: stored.dong ?? null,
        tuned: stored.tuned ?? true,
        wish: stored.wish ?? "",
        ai: null,
        aiPending: false,
      };
      // 처음 열 때만 넣는다(새로고침하거나 다시 시작한 뒤의 값을 덮지 않게)
      await page.addInitScript((value) => {
        if (sessionStorage.getItem("anti-survey") === null) sessionStorage.setItem("anti-survey", value);
      }, JSON.stringify({ state, version: 5 }));
    });
  },
});

export { expect };

// 지나온 화면도 숨긴 채 남아 있으므로(<Activity>), 늘 보이는 것만 고른다
export const seen = (locator: Locator) => locator.filter({ visible: true });

// 가로로 넘치는지
export async function expectNoOverflow(page: Page) {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(over).toBeLessThanOrEqual(0);
}

// 기기 저장소에 든 답
export async function storedState(page: Page) {
  return page.evaluate(() => JSON.parse(sessionStorage.getItem("anti-survey") ?? "{}").state);
}
