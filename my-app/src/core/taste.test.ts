import { describe, expect, it } from "vitest";

import { tasteSimulations } from "@/content/text";
import { appData } from "@/data";
import { tasteHref } from "@/lib/routes";
import type { Simulation, SimStep } from "./simulation";
import { tasteOf } from "./taste";

const live = appData.programs.filter((program) => program["매칭가능"] === "Y");

function expectDistinctLabels(labels: readonly string[], context: string) {
  expect(labels.every(label => label.trim().length > 0), context).toBe(true);
  expect(new Set(labels.map(label => label.trim())).size, context).toBe(labels.length);
}

function checkStep(step: SimStep, id: string) {
  const context = `${id} / ${step.title}`;
  for (const content of [step.title, step.instruction, step.caption]) {
    expect(content.trim(), context).toBeTruthy();
  }
  switch (step.mode) {
    case "pick":
    case "pack":
      expect(step.options.length, context).toBeGreaterThan(1);
      expectDistinctLabels(step.options.map(option => option.label), context);
      expect(step.options.every(option => option.note.trim()), context).toBe(true);
      if (step.mode === "pack") {
        expect(Number.isInteger(step.min) && Number.isInteger(step.limit), context).toBe(true);
        expect(step.min >= 1 && step.min <= step.limit && step.limit <= step.options.length, context).toBe(true);
      }
      break;
    case "sort":
      expect(step.groups.length, context).toBeGreaterThan(1);
      expectDistinctLabels(step.groups, context);
      expect(step.items.length, context).toBeGreaterThan(1);
      expectDistinctLabels(step.items.map(item => item.label), context);
      for (const item of step.items) {
        expect(Number.isInteger(item.group) && item.group >= 0 && item.group < step.groups.length, context).toBe(true);
        expect(item.hint.trim(), context).toBeTruthy();
      }
      break;
    case "order":
      expect(step.items.length, context).toBeGreaterThan(1);
      expectDistinctLabels(step.items, context);
      expect(step.hint.trim(), context).toBeTruthy();
      break;
    case "quantity":
      expect(step.items.length, context).toBeGreaterThan(0);
      expectDistinctLabels(step.items.map(item => item.label), context);
      for (const item of step.items) {
        expect(item.unit.trim(), context).toBeTruthy();
        expect([item.min, item.max, item.initial, item.step].every(Number.isFinite), context).toBe(true);
        expect(item.min < item.max && item.step > 0 && item.step <= item.max - item.min, context).toBe(true);
        expect(item.initial >= item.min && item.initial <= item.max, context).toBe(true);
      }
      break;
  }
}

describe("집에서 먼저 체험하기", () => {
  it("활성 32곳에서 자체 체험 18개, 공식 영상 13개, 공식 실습 1개가 하나씩 연결된다", () => {
    expect(live).toHaveLength(32);
    const tastes = live.map(tasteOf);
    expect(tastes.filter(taste => taste.activity)).toHaveLength(18);
    expect(tastes.filter(taste => taste.videos.length)).toHaveLength(13);
    expect(tastes.filter(taste => taste.action.kind === "link")).toHaveLength(1);
    for (const program of live) {
      const taste = tasteOf(program);
      expect(taste.ready, program.id).toBe(true);
      expect(taste.title?.trim(), program.id).toBeTruthy();
      expect(taste.body?.trim(), program.id).toBeTruthy();
      const kinds = [taste.activity !== null, taste.videos.length > 0, taste.action.kind === "link"];
      expect(kinds.filter(Boolean), program.id).toHaveLength(1);
      if (taste.activity) expect(taste.activity.id, program.id).toBe(program.id);
    }
  });

  it("디지털배움터는 원 운영기관의 시뮬레이션으로 연결한다", () => {
    const program = live.find(row => row.id === "L13")!;
    expect(tasteOf(program)).toMatchObject({
      ready: true,
      action: { kind: "link", url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/1/dtl.do" },
      activity: null, relatedActivity: null, videos: [],
    });
    expect("L13" in tasteSimulations).toBe(false);
  });

  it("공식 영상 13개의 ID와 모바일 삽입 주소를 유지한다", () => {
    const videoIds: Record<string, string> = {
      JOB12: "PUKIzp4S0WY", JOB13: "8iueW55vZp4", L09: "KhUG65dyeD8",
      L10: "Jrd_NVP8e7U", L12: "gaCX5MeK60M", F01: "fzxzcd2p4MQ",
      F02: "2Zfn0gs5JAo", F20: "lU3zRUk4WiA", F21: "4ggyIntmx-0",
      F22: "s3QFbjhQXB4", H19: "npUkukEEtHM", H21: "C4rra31STNk", G01: "Va7WYisxmlo",
    };
    for (const program of live) {
      const taste = tasteOf(program);
      const id = videoIds[program.id];
      if (!id) {
        expect(taste.videos, program.id).toHaveLength(0);
        continue;
      }
      expect(taste.action.kind, program.id).toBe("screen");
      expect(taste.videos, program.id).toHaveLength(1);
      const video = taste.videos[0];
      expect(video.url).toBe(`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`);
      expect(video.title.trim(), program.id).toBeTruthy();
      expect(video.by.trim(), program.id).toBeTruthy();
    }
  });

  it("동네 체험 두 개는 관련 기관에서 열리고 자체 체험 20개 모두에 접근할 수 있다", () => {
    const related: Record<string, string> = { L15: "C_BOOK", JOB08: "C_ECO" };
    const reachable = new Set<string>();
    for (const program of live) {
      const taste = tasteOf(program);
      expect(taste.relatedActivity?.id, program.id).toBe(related[program.id]);
      if (taste.activity) reachable.add(taste.activity.id);
      if (taste.relatedActivity) reachable.add(taste.relatedActivity.id);
    }
    expect(reachable.size).toBe(20);
    expect(Object.keys(tasteSimulations).sort()).toEqual([...reachable].sort());
  });

  it("각 자체 체험은 공식 자료, 완성품, 조작 방식이 다른 세 단계 이상을 갖는다", () => {
    const catalog: Readonly<Record<string, Simulation>> = tasteSimulations;
    for (const [id, sim] of Object.entries(catalog)) {
      expect(sim.id).toBe(id);
      for (const content of [sim.title, sim.intro, sim.artifact, sim.sourceLabel]) {
        expect(content.trim(), id).toBeTruthy();
      }
      expect(new URL(sim.sourceUrl).protocol, id).toBe("https:");
      expect(sim.steps.length, id).toBeGreaterThan(2);
      expectDistinctLabels(sim.steps.map(step => step.title), id);
      expect(new Set(sim.steps.map(step => step.mode)).size, id).toBeGreaterThan(1);
      for (const step of sim.steps) checkStep(step, id);
    }
  });

  it("비활성 기관과 등록되지 않은 기관에 다른 곳의 체험을 붙이지 않는다", () => {
    const program = live.find(row => row.id === "JOB01")!;
    for (const id of ["JOB01", "L15", "JOB08", "L13", "L09"]) {
      expect(tasteOf({ ...program, id, 매칭가능: "N" })).toMatchObject({
        ready: false, activity: null, relatedActivity: null, videos: [], action: { kind: "screen" },
      });
    }
    expect(tasteOf({ ...program, id: "UNKNOWN" })).toMatchObject({
      ready: false, activity: null, relatedActivity: null, videos: [], action: { kind: "screen" },
    });
  });

  it("체험 화면의 주소는 기관 화면과 같은 꼬리를 단다", () => {
    expect(tasteHref("JOB01", null)).toBe("/place/JOB01/taste");
    expect(tasteHref("JOB01", "T05")).toBe("/place/JOB01/taste?type=T05");
    expect(tasteHref("JOB01", "T05", true)).toBe("/place/JOB01/taste?type=T05&from=places");
  });
});
