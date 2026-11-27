import { fill, text } from "../src/content/text";

import { SURVEY_IDS, answersFor, expect, expectNoOverflow, seen, storedState, test, typeName } from "./fixtures";

// 큰 흐름: 처음 온 사람이 끝까지 가는 길과, 둘러보기 길.

test("설문 27문항을 눌러 결과까지 간다", async ({ page, ai }) => {
  await page.goto("/");
  await seen(page.getByRole("link", { name: text.startButton })).click();

  expect(SURVEY_IDS).toHaveLength(27);
  for (const [index, id] of SURVEY_IDS.entries()) {
    await expect(page).toHaveURL(new RegExp(`/survey\\?q=${index + 1}$`));
    await expect(seen(page.getByText(fill(text.progress, { number: index + 1, total: 27 })))).toBeVisible();
    const next = seen(page.getByRole("button", { name: text.next }));
    if (id === "P_AGE") {
      // 빈칸으로는 넘어가지 않는다. '66'은 1966으로 받는다
      await next.click();
      await expect(seen(page.getByRole("status").getByText(text.numberRequired))).toBeVisible();
      await seen(page.getByRole("textbox")).fill("66");
    } else {
      // 고르기 전에는 '다음'이 잠겨 있다
      await expect(next).toBeDisabled();
      // 척도는 위에서부터 5점 → 1점이다. 취미발견형(Q02·Q16)만 5점, 나머지는 1점
      const high = id === "Q02" || id === "Q16";
      const pick = id.startsWith("P_") ? 0 : high ? 0 : 4;
      await seen(page.getByRole("radiogroup")).locator("label").nth(pick).click();
    }
    await next.click();
  }

  // 가장 높은 유형이 하나라 고르는 화면 없이 '조금 더 맞춰 보기'로 간다
  await expect(page).toHaveURL(/\/tune$/);
  await expect(seen(page.getByRole("heading", { name: text.tuneHeading }))).toBeVisible();
  await expectNoOverflow(page);
  await seen(page.getByRole("link", { name: text.tuneSkip })).click();

  await expect(page).toHaveURL(/\/result$/);
  await expect(seen(page.getByRole("heading", { name: typeName("T05"), exact: true }))).toBeVisible();
  await expect(seen(page.getByText(text.typeLabel, { exact: true }))).toBeVisible();
  await expectNoOverflow(page);

  const state = await storedState(page);
  expect(state.answers.P_AGE).toBe(1966);
  expect(state.tuned).toBe(true);
  // 글을 적지 않았으니 AI를 부르지 않는다
  expect(ai.requests).toHaveLength(0);
});

test("설문 중에 '이전으로'를 누르면 앞 문항으로 가고 답이 남아 있다", async ({ page }) => {
  await page.goto("/survey?q=1");
  await seen(page.getByRole("radiogroup")).locator("label").nth(1).click();
  await seen(page.getByRole("button", { name: text.next })).click();
  await expect(page).toHaveURL(/q=2$/);
  await seen(page.getByRole("link", { name: text.back })).click();
  await expect(page).toHaveURL(/q=1$/);
  await expect(seen(page.getByRole("radio", { checked: true }))).toHaveCount(1);
  // 휴대폰 뒤로 가기도 문항을 따라간다
  await seen(page.getByRole("button", { name: text.next })).click();
  await expect(page).toHaveURL(/q=2$/);
  await page.goBack();
  await expect(page).toHaveURL(/q=1$/);
});

test("가장 높은 유형이 여럿이면 고른 뒤 '조금 더 맞춰 보기'로 간다", async ({ page, seed }) => {
  await seed({ answers: answersFor("all"), tuned: false });
  await page.goto("/result");
  await expect(page).toHaveURL(/\/pick$/);
  await expect(seen(page.getByText(text.tieMany))).toBeVisible();
  await expect(seen(page.getByRole("radio"))).toHaveCount(12);
  const next = seen(page.getByRole("button", { name: text.next }));
  await expect(next).toBeDisabled();
  await seen(page.getByRole("radiogroup")).locator("label").nth(4).click();
  await next.click();
  // 고른 뒤에는 결과 화면을 거치지 않고 바로 맞춰 보기로 간다
  await expect(page).toHaveURL(/\/tune$/);
  await seen(page.getByRole("link", { name: text.tuneSkip })).click();
  await expect(page).toHaveURL(/\/result$/);
  // 본인이 고른 유형이 대표 유형이 된다
  const picked = (await storedState(page)).answers.Q_PRIORITY as string;
  await expect(seen(page.getByRole("heading", { name: typeName(picked), exact: true }))).toBeVisible();
  // 골랐던 사람에게만 '다시 고르기'가 나온다
  await seen(page.getByRole("button", { name: text.moreToggle })).click();
  await expect(seen(page.getByRole("link", { name: text.repickButton }))).toBeVisible();
});

test("결과 → 기관 → 체험 → 돌아가기", async ({ page, seed }) => {
  await seed({ answers: answersFor("T05") });
  await page.goto("/result");
  await expect(seen(page.getByRole("heading", { name: typeName("T05"), exact: true }))).toBeVisible();

  // 산책길 그림의 첫 건물
  await seen(page.locator('a[href^="/place/"]')).first().click();
  await expect(page).toHaveURL(/\/place\/[A-Z0-9_]+$/);
  const placeUrl = page.url();
  await expect(seen(page.getByText(fill(text.placeForType, { name: typeName("T05") })))).toBeVisible();
  await expect(seen(page.getByText(text.tasteLabel))).toBeVisible();
  await expectNoOverflow(page);

  await seen(page.getByRole("link", { name: text.tasteButton })).click();
  await expect(page).toHaveURL(/\/place\/[A-Z0-9_]+\/taste$/);
  await expect(seen(page.locator('button[aria-pressed], iframe[src*="youtube-nocookie.com/embed/"]')).first()).toBeVisible();
  await expectNoOverflow(page);

  await seen(page.getByRole("link", { name: text.tasteBack })).click();
  await expect(page).toHaveURL(placeUrl);
  await seen(page.getByRole("link", { name: text.backBottom })).click();
  await expect(page).toHaveURL(/\/result$/);
});

test("목록으로 보기 → 기관 → 뒤로 가면 목록으로 돌아온다", async ({ page, seed }) => {
  await seed({ answers: answersFor("T05") });
  await page.goto("/result");
  await seen(page.locator('a[href="/places"]')).click();
  await expect(page).toHaveURL(/\/places$/);
  await expect(
    seen(page.getByRole("heading", { name: fill(text.allPlacesHeading, { type: typeName("T05") }) }))
  ).toBeVisible();
  await seen(page.locator('a[href^="/place/"]')).first().click();
  await expect(page).toHaveURL(/from=places$/);
  await seen(page.getByRole("link", { name: text.backBottom })).click();
  await expect(page).toHaveURL(/\/places$/);
});

test("질문 없이 둘러보기: 12개 유형 → 유형 소개 → 기관", async ({ page, ai }) => {
  await page.goto("/");
  await seen(page.getByRole("link", { name: text.startBrowse })).click();
  await expect(page).toHaveURL(/\/browse$/);
  await expect(seen(page.locator('a[href^="/type/"]'))).toHaveCount(12);
  await expectNoOverflow(page);

  await seen(page.locator('a[href="/type/T05"]')).click();
  await expect(seen(page.getByRole("heading", { name: typeName("T05"), exact: true }))).toBeVisible();
  // 둘러보기에는 저장·공유·다시 하기가 없다
  await expect(seen(page.getByRole("button", { name: text.saveHeading }))).toHaveCount(0);
  await expect(seen(page.getByRole("button", { name: text.restartButton }))).toHaveCount(0);

  await seen(page.locator('a[href^="/place/"]')).first().click();
  await expect(page).toHaveURL(/\/place\/[A-Z0-9_]+\?type=T05$/);
  await expect(seen(page.getByText(text.tasteLabel))).toBeVisible();
  expect(ai.requests).toHaveLength(0);
});

test("목록만 있는 동네친구형도 결과 화면이 뜬다", async ({ page, seed }) => {
  await seed({ answers: answersFor("T07") });
  await page.goto("/result");
  await expect(seen(page.getByRole("heading", { name: typeName("T07"), exact: true }))).toBeVisible();
  await expect(seen(page.locator('a[href^="/place/"]')).first()).toBeVisible();
  await expectNoOverflow(page);
});
