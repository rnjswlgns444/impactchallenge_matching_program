import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import { tasteHref } from "@/lib/routes";

import { tasteOf } from "./taste";

describe("집에서 먼저 체험하기", () => {
  const live = appData.programs.filter((program) => program["매칭가능"] === "Y");

  it("안내 중인 기관마다 체험 자리가 있다", () => {
    expect(live.length).toBeGreaterThan(0);
    for (const program of live) {
      const taste = tasteOf(program);
      if (taste.action.kind === "link") expect(taste.action.url).toMatch(/^https:\/\//);
      // 영상은 올린 곳을 꼭 적는다
      for (const video of taste.videos) {
        expect(video.url).toMatch(/^https:\/\//);
        expect(video.title.trim()).not.toBe("");
        expect(video.by.trim()).not.toBe("");
      }
    }
  });

  it("체험 화면의 주소는 기관 화면과 같은 꼬리를 단다", () => {
    expect(tasteHref("JOB01", null)).toBe("/place/JOB01/taste");
    expect(tasteHref("JOB01", "T05")).toBe("/place/JOB01/taste?type=T05");
    expect(tasteHref("JOB01", "T05", true)).toBe("/place/JOB01/taste?type=T05&from=places");
  });
});
