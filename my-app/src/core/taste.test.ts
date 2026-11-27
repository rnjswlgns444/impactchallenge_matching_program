import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import { tasteHref } from "@/lib/routes";

import { tasteOf } from "./taste";

describe("집에서 먼저 체험하기", () => {
  const live = appData.programs.filter((program) => program["매칭가능"] === "Y");

  it("현재 안내 중인 32개 항목은 각각 실제 콘텐츠를 연다", () => {
    expect(live).toHaveLength(32);
    for (const program of live) {
      const taste = tasteOf(program);
      expect(taste.ready, program.id).toBe(true);
      expect(taste.action.kind, program.id).toBe("screen");
      expect(taste.title?.trim(), program.id).toBeTruthy();
      expect(taste.activity !== null || taste.videos.length > 0, program.id).toBe(true);
    }
  });

  it("영상은 해당 항목에서 확인한 공식 채널의 삽입 주소로만 연다", () => {
    const videoIds: Record<string, string> = {
      JOB12: "PUKIzp4S0WY", JOB13: "8iueW55vZp4", L09: "KhUG65dyeD8",
      L10: "Jrd_NVP8e7U", L12: "gaCX5MeK60M", F01: "fzxzcd2p4MQ",
      F02: "2Zfn0gs5JAo", F20: "lU3zRUk4WiA", F21: "4ggyIntmx-0",
      F22: "s3QFbjhQXB4", H19: "npUkukEEtHM", H21: "C4rra31STNk", G01: "Va7WYisxmlo",
    };
    for (const program of live) {
      const { activity, videos } = tasteOf(program);
      const id = videoIds[program.id];
      if (!id) {
        expect(activity, program.id).toBeTruthy();
        expect(videos, program.id).toHaveLength(0);
        continue;
      }
      expect(videos, program.id).toHaveLength(1);
      const video = videos[0];
      const url = new URL(video.url);
      expect(url.origin).toBe("https://www.youtube-nocookie.com");
      expect(url.pathname).toBe(`/embed/${id}`);
      expect(url.searchParams.get("playsinline")).toBe("1");
      expect(url.searchParams.get("rel")).toBe("0");
      expect(video.title.trim()).not.toBe("");
      expect(video.by.trim()).not.toBe("");
    }
  });

  it("비활성 기관과 등록되지 않은 기관에 다른 곳의 체험을 붙이지 않는다", () => {
    const program = live.find((row) => row.id === "JOB01")!;
    for (const row of [{ ...program, 매칭가능: "N" }, { ...program, id: "UNKNOWN" }]) {
      expect(tasteOf(row)).toMatchObject({ ready: false, videos: [], activity: null });
    }
  });

  it("활동마다 공식 안내와 서로 구별되는 선택지가 있다", () => {
    for (const program of live) {
      const { activity } = tasteOf(program);
      if (!activity) continue;
      expect(activity.sourceUrl, program.id).toMatch(/^https?:\/\//);
      expect(activity.prompt.trim(), program.id).not.toBe("");
      const labels = activity.options.map((option) => option.label);
      expect(new Set(labels).size, program.id).toBe(labels.length);
      expect(labels.length, program.id).toBeGreaterThan(1);
      for (const option of activity.options) {
        expect(option.detail.trim(), program.id).not.toBe("");
        if (option.url) expect(option.linkLabel?.trim(), program.id).toBeTruthy();
      }
    }
  });

  it("체험 화면의 주소는 기관 화면과 같은 꼬리를 단다", () => {
    expect(tasteHref("JOB01", null)).toBe("/place/JOB01/taste");
    expect(tasteHref("JOB01", "T05")).toBe("/place/JOB01/taste?type=T05");
    expect(tasteHref("JOB01", "T05", true)).toBe("/place/JOB01/taste?type=T05&from=places");
  });
});
