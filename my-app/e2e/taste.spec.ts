import type { Page } from "@playwright/test";

import { tasteTools, text } from "../src/content/text";
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
    const enter = seen(page.getByRole("link", { name: text.tasteVideoButton }));
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

  test(`${width}px에서 해 볼 것은 공식 화면을 새 창으로 열고, 우리 쪽에는 아무것도 남기지 않는다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/place/L13?type=T06");
    await expect(seen(page.getByText(text.tasteLabel))).toBeVisible();
    const before = await browserStorage(page);
    const writes: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/_next/") || request.headers().rsc === "1") return;
      if (["xhr", "fetch", "ping"].includes(request.resourceType()) || request.method() !== "GET") {
        writes.push(request.url());
      }
    });

    await seen(page.getByRole("link", { name: text.tasteButton })).click();
    await expect(page).toHaveURL(/\/place\/L13\/taste\?type=T06$/);
    for (const tool of tasteTools.L13) {
      const link = seen(page.getByRole("link", { name: tool.linkLabel }));
      await expect(link).toHaveAttribute("href", tool.url);
      await expect(link).toHaveAttribute("target", "_blank");
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(62);
    }
    await expect(page.locator("iframe")).toHaveCount(0);
    await expectNoOverflow(page);
    expect(await browserStorage(page)).toEqual(before);
    expect(writes).toEqual([]);

    await seen(page.getByRole("link", { name: text.tasteBack })).click();
    await expect(page).toHaveURL(/\/place\/L13\?type=T06$/);
  });

  test(`${width}px에서 체험 자료가 없는 기관은 카드가 없고, 체험 주소를 쳐도 기관 화면으로 돌아간다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/place/JOB07?type=T01");
    await expect(seen(page.getByRole("link", { name: text.backBottom }))).toBeVisible();
    await expect(page.getByText(text.tasteLabel)).toHaveCount(0);
    await expect(page.getByText(text.tasteVideos)).toHaveCount(0);

    await page.goto("/place/JOB07/taste?type=T01");
    await expect(page).toHaveURL(/\/place\/JOB07\?type=T01$/);
  });
}
