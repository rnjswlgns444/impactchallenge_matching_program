import type { Page } from "@playwright/test";

import { text } from "../src/content/text";
import { expect, expectNoOverflow, seen, test } from "./fixtures";

function browserStorage(page: Page) {
  return page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
}

for (const width of [320, 390]) {
  test(`${width}px에서 기관 안내 안에 있는 영상을 체험 화면에서 재생한다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    // 실제 영상 연결은 별도로 확인한다. 화면 테스트는 유튜브 접속 환경에 영향을 받지 않는다.
    const players: string[] = [];
    await page.route("https://www.youtube-nocookie.com/embed/**", async (route) => {
      players.push(route.request().url());
      await route.fulfill({ contentType: "text/html", body: "<html><body></body></html>" });
    });
    const placeUrl = "/place/L09?type=T05&from=places";
    await page.goto(placeUrl);
    const enter = seen(page.getByRole("link", { name: text.tasteButton }));
    await expect(enter).toBeVisible();
    expect(players).toHaveLength(0);
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
    await enter.click();
    const player = seen(page.locator('iframe[src*="/embed/KhUG65dyeD8"]'));
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute("title", /\S/);
    await expect.poll(() => new Set(players).size).toBe(1);
    await expectNoOverflow(page);
    await seen(page.getByRole("link", { name: text.tasteBack })).click();
    await expect(page).toHaveURL(/\/place\/L09\?type=T05&from=places$/);
    // 캐시가 체험 화면을 숨겨 두어도 영상을 재생하는 프레임은 사라져야 한다.
    await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/"]')).toHaveCount(0);
    const previousRequests = players.length;
    await enter.click();
    await expect(player).toBeVisible();
    await expect.poll(() => players.length).toBeGreaterThan(previousRequests);
  });

  test(`${width}px에서 기관 체험 선택은 화면 안에서 끝난다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/place/JOB01/taste?type=T01");
    const start = seen(page.locator('[data-sim="JOB01"] [data-sim-start]'));
    await start.click();
    const choices = seen(page.locator('[data-sim="JOB01"] button[data-sim-option]'));
    await expect(choices.first()).toBeVisible();
    const original = await choices.evaluateAll((buttons) => buttons.map((b) => b.getAttribute("aria-pressed")));
    const pickIndex = original.indexOf("false");
    expect(pickIndex).toBeGreaterThanOrEqual(0);
    const before = await browserStorage(page);
    const writes: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/_next/") || request.headers().rsc === "1") return;
      if (["xhr", "fetch", "ping"].includes(request.resourceType()) || request.method() !== "GET") {
        writes.push(request.url());
      }
    });

    const option = choices.nth(pickIndex);
    const box = await option.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(62);
    await option.click();
    await expect(option).toHaveAttribute("aria-pressed", "true");
    await expectNoOverflow(page);
    expect(await browserStorage(page)).toEqual(before);
    expect(writes).toEqual([]);

    await seen(page.getByRole("link", { name: text.tasteBack })).click();
    await expect(page).toHaveURL(/\/place\/JOB01\?type=T01$/);
    // 캐시된 경로를 다시 열어도 지난번에 고른 항목은 남지 않는다.
    await seen(page.getByRole("link", { name: text.tasteButton })).click();
    await expect(page).toHaveURL(/\/place\/JOB01\/taste\?type=T01$/);
    await expect(start).toBeVisible();
    await start.click();
    await expect(choices.nth(pickIndex)).toHaveAttribute("aria-pressed", "false");
    await expect(seen(page.locator('button[aria-pressed="true"]'))).toHaveCount(0);
    await expectNoOverflow(page);
  });
}
