import type { Locator, Page } from "@playwright/test";

import { tasteSimulations } from "../src/content/text";
import type { SimStep, Simulation } from "../src/core/simulation";
import { appData } from "../src/data";
import { expect, expectNoOverflow, seen, test } from "./fixtures";

const simulations: readonly Simulation[] = Object.values(tasteSimulations);
const hostIds: Record<string, string> = { C_BOOK: "L15", C_ECO: "JOB08" };
// 돌봄 유형은 세부 대상을 선택해야 해당 기관이 화면에 나타난다.
const careDetails: Record<string, string> = { H20_INFO: "self", H22: "adult", H10: "child" };

async function openSimulation(page: Page, id: string) {
  const hostId = hostIds[id] ?? id;
  const program = appData.programs.find(row => row.id === hostId);
  if (!program) throw new Error(`기관 정보를 찾을 수 없음: ${hostId}`);
  const type = program["유형태그"].split("|")[0];
  const detail = careDetails[hostId];
  if (detail) {
    await page.addInitScript(({ type, detail }) => {
      sessionStorage.setItem("anti-survey", JSON.stringify({
        state: { browseDetails: { [type]: detail } }, version: 4,
      }));
    }, { type, detail });
  }
  await page.goto(`/place/${hostId}?type=${type}`);
  await seen(page.locator(`a[href*="/place/${hostId}/taste"]`)).click();
  if (id !== hostId) await seen(page.locator(`[data-related-sim="${id}"] > summary`)).click();
  const panel = seen(page.locator(`[data-sim="${id}"]`));
  await panel.locator("[data-sim-start]").click();
  return panel;
}

async function performTask(panel: Locator, step: SimStep): Promise<string[]> {
  const option = (index: number) => panel.locator(`[data-sim-option="${index}"]`);
  switch (step.mode) {
    case "pick":
      await option(0).click();
      return [step.options[0].label];
    case "pack": {
      const picked = step.options.slice(0, step.min);
      for (let i = 0; i < picked.length; i++) await option(i).click();
      return picked.map(item => item.label);
    }
    case "sort": {
      const group = (index: number) => panel.locator(`[data-sim-group="${index}"]`);
      const first = step.items[0];
      await group((first.group + 1) % step.groups.length).click();
      await expect(panel.getByRole("status").filter({ hasText: first.hint })).toBeVisible();
      for (const item of step.items) await group(item.group).click();
      return step.items.map(item => item.label);
    }
    case "order":
      await option(1).click();
      await expect(panel.getByRole("status").filter({ hasText: step.hint })).toBeVisible();
      for (let i = 0; i < step.items.length; i++) await option(i).click();
      return [...step.items];
    case "quantity": {
      const item = step.items[0];
      const increase = item.initial < item.max;
      await panel.locator(increase ? '[data-sim-more="0"]' : '[data-sim-less="0"]').click();
      const value = item.initial + (increase ? item.step : -item.step);
      return [item.label, `${Number(value.toFixed(4))}${item.unit}`];
    }
  }
}

for (const width of [320, 390]) {
  for (const simulation of simulations) {
    test(`${width}px에서 ${simulation.id} 활동을 마치고 결과물을 수정·초기화한다`, async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-11-27T03:00:00Z"));
      await page.setViewportSize({ width, height: 844 });
      const panel = await openSimulation(page, simulation.id);
      const next = panel.locator("[data-sim-next]");
      const lines: string[] = [];
      for (const [index, step] of simulation.steps.entries()) {
        await expect(panel.locator("[data-step-index]")).toHaveAttribute("data-step-index", String(index));
        await expect(next).toBeDisabled();
        lines.push(...await performTask(panel, step));
        await expectNoOverflow(page);
        await next.click();
      }
      const result = panel.locator("[data-sim-result]");
      await expect(result.getByRole("heading", { name: simulation.artifact })).toBeVisible();
      for (const line of lines) await expect(result.locator("dl")).toContainText(line);
      await expect(result.getByRole("link")).toHaveAttribute("href", simulation.sourceUrl);
      await expectNoOverflow(page);
      await result.locator("[data-sim-edit]").click();
      for (let i = 0; i < simulation.steps.length; i++) await next.click();
      await result.locator("[data-sim-restart]").click();
      await panel.locator("[data-sim-start]").click();
      await expect(next).toBeDisabled();
    });
  }
}
