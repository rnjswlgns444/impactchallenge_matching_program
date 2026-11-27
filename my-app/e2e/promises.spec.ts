import { text } from "../src/content/text";

import { answersFor, expect, seen, storedState, test, typeName } from "./fixtures";

// 지켜야 할 약속: 무엇을 서버로 보내는지, 사진, 되묻는 창, 열리면 안 되는 화면.

test("AI에는 네 칸만 보내고, 개인정보 형태는 지워서 보낸다", async ({ page, seed, ai }) => {
  ai.reply((body) => ({
    status: "ok",
    matches: [{ id: body.candidates[0], reason: "그림을 배울 수 있는 곳이에요." }],
    unmatched: [],
  }));
  await seed({ answers: answersFor("T05"), tuned: false, dong: "고잔동" });
  await page.goto("/tune");
  await seen(page.getByRole("textbox")).fill("오전에 그림을 배우고 싶어요. 연락은 010-1234-5678");
  await seen(page.getByRole("button", { name: text.tuneDone })).click();

  await expect(page).toHaveURL(/\/result$/);
  // AI가 고른 곳에 별이 붙는다
  await expect(seen(page.getByText(text.aiStarNote))).toBeVisible();
  expect(ai.requests).toHaveLength(1);

  const body = ai.requests[0] as Record<string, unknown>;
  expect(Object.keys(body).sort()).toEqual(["candidates", "detail", "typeId", "wish"]);
  expect(body.typeId).toBe("T05");
  expect(body.wish).toContain("그림");
  expect(body.wish).not.toContain("1234");
  // 설문 답, 기본정보, 사는 동은 어디에도 없다
  const sent = JSON.stringify(body);
  for (const secret of ["female", "1966", "not_working", "고잔동", "P_GENDER", "Q02"]) {
    expect(sent).not.toContain(secret);
  }

  // AI가 고른 곳의 화면에 이유가 나온다
  await seen(page.locator('a[href^="/place/"]')).first().click();
  await expect(seen(page.getByText("그림을 배울 수 있는 곳이에요."))).toBeVisible();

  // 새로고침해도 다시 묻지 않는다
  await page.goto("/result");
  await expect(seen(page.getByText(text.aiStarNote))).toBeVisible();
  expect(ai.requests).toHaveLength(1);
});

test("AI가 지어낸 id는 서버가 걸러 주지 않아도 화면에 그려지지 않는다", async ({ page, seed, ai }) => {
  ai.reply({ status: "ok", matches: [{ id: "NOT_A_PLACE", reason: "지어낸 곳" }], unmatched: [] });
  await seed({ answers: answersFor("T05"), tuned: false });
  await page.goto("/tune");
  await seen(page.getByRole("textbox")).fill("그림을 배우고 싶어요");
  await seen(page.getByRole("button", { name: text.tuneDone })).click();
  await expect(page).toHaveURL(/\/result$/);
  await expect.poll(() => ai.requests.length).toBe(1);
  await expect(seen(page.locator('a[href*="NOT_A_PLACE"]'))).toHaveCount(0);
  await expect(seen(page.getByText("지어낸 곳"))).toHaveCount(0);
  // 기본 기관은 그대로 보인다
  await expect(seen(page.locator('a[href^="/place/"]')).first()).toBeVisible();
});

test("바라는 점이 없는 글과 실패한 AI: 부르지 않거나, 기본 기관을 그대로 보여 준다", async ({ page, seed, ai }) => {
  await seed({ answers: answersFor("T05"), tuned: false });
  await page.goto("/tune");
  await seen(page.getByRole("textbox")).fill("없어요");
  await seen(page.getByRole("button", { name: text.tuneDone })).click();
  await expect(seen(page.getByText(text.aiUnclear))).toBeVisible();
  expect(ai.requests).toHaveLength(0);

  // 다시 적으면 AI를 부르고, 실패해도 기관은 보인다
  await page.goto("/tune");
  await seen(page.getByRole("textbox")).fill("오전에만 할 수 있는 것");
  await seen(page.getByRole("button", { name: text.tuneDone })).click();
  await expect(seen(page.getByText(text.aiFail))).toBeVisible();
  expect(ai.requests).toHaveLength(1);
  await expect(seen(page.locator('a[href^="/place/"]')).first()).toBeVisible();
});

test("결과 사진은 기기 안에서 그리고, 파일로 내려받을 수 있다", async ({ page, seed, ai }) => {
  await seed({ answers: answersFor("T05"), dong: "고잔동" });
  await page.goto("/result");
  await expect(seen(page.getByRole("heading", { name: typeName("T05"), exact: true }))).toBeVisible();

  // 사진을 그리는 동안 나가는 요청을 모은다
  const sent: { method: string; url: string }[] = [];
  page.on("request", (request) => sent.push({ method: request.method(), url: request.url() }));

  await seen(page.getByRole("button", { name: text.saveHeading })).click();
  const picture = seen(page.getByRole("img", { name: text.saveImageAlt }));
  await expect(picture).toBeVisible();
  const size = await picture.evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight]);
  expect(size).toEqual([1080, 1350]);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    seen(page.getByRole("link", { name: text.saveButton })).click(),
  ]);
  expect(download.suggestedFilename()).toBe("anti-result.png");

  // 서버로 보낸 것이 없다(받아 온 것은 그림·글꼴뿐이다)
  expect(sent.filter((request) => request.method !== "GET")).toEqual([]);
  expect(sent.filter((request) => request.url.includes("/api/"))).toEqual([]);
  expect(ai.requests).toHaveLength(0);

  // 다시 누르면 접히고 사진을 버린다
  await seen(page.getByRole("button", { name: text.saveHeading })).click();
  await expect(page.getByRole("img", { name: text.saveImageAlt })).toHaveCount(0);
});

test("'처음부터 다시 하기'는 되묻는 창을 거쳐야 답을 지운다", async ({ page, seed }) => {
  await seed({ answers: answersFor("T05") });
  await page.goto("/result");
  await seen(page.getByRole("button", { name: text.restartButton })).click();
  await expect(page.getByText(text.restartAskBody)).toBeVisible();
  await page.getByRole("button", { name: text.restartKeep }).click();
  await expect(page.getByText(text.restartAskBody)).toHaveCount(0);
  expect((await storedState(page)).answers.Q02).toBe(5);

  await seen(page.getByRole("button", { name: text.restartButton })).click();
  await page.getByRole("button", { name: text.restartGo }).click();
  await expect(page).toHaveURL(/localhost:3000\/$/);
  await expect(seen(page.getByRole("heading", { name: text.startHeading }))).toBeVisible();
  expect((await storedState(page)).answers).toEqual({});
});

test("띠의 ANTI도 되묻는 창을 거친다", async ({ page, seed }) => {
  await seed({ answers: answersFor("T05") });
  await page.goto("/result");
  await expect(seen(page.getByRole("heading", { name: typeName("T05"), exact: true }))).toBeVisible();
  await seen(page.getByRole("link", { name: text.toStart })).click();
  await expect(page.getByText(text.restartAskBody)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText(text.restartAskBody)).toHaveCount(0);
  await expect(page).toHaveURL(/\/result$/);
});

test("열리면 안 되는 화면은 열리지 않는다", async ({ page, seed }) => {
  await seed({ answers: answersFor("T05") });
  // 이 사람의 후보에 없는 기관: 결과로 돌려보낸다
  await page.goto("/place/JOB02");
  await expect(page).toHaveURL(/\/result$/);
  await page.goto("/place/JOB02/taste");
  await expect(page).toHaveURL(/\/result$/);
  // 끝난 프로그램과 없는 id
  for (const address of ["/place/JOB04", "/place/JOB04/taste", "/place/NOPE", "/type/T99"]) {
    await page.goto(address);
    await expect(seen(page.getByText(text.notFoundTitle))).toBeVisible();
  }
});

test("설문을 덜 한 사람은 결과·맞춰 보기 주소를 쳐도 설문으로 간다", async ({ page }) => {
  for (const address of ["/result", "/tune", "/pick", "/places"]) {
    await page.goto(address);
    await expect(page).not.toHaveURL(new RegExp(`${address}$`));
  }
});
