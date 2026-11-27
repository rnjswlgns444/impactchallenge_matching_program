import { describe, expect, it } from "vitest";

import { tasteFilms, tasteTools } from "@/content/text";
import { appData } from "@/data";
import { tasteHref } from "@/lib/routes";

import { tasteOf } from "./taste";

describe("집에서 먼저 체험하기", () => {
  const live = appData.programs.filter((program) => program["매칭가능"] === "Y");
  const liveIds = new Set(live.map((program) => program.id));

  it("해 볼 것이나 영상이 있는 기관만 체험을 연다", () => {
    for (const program of live) {
      const taste = tasteOf(program);
      const has = program.id in tasteTools || program.id in tasteFilms;
      expect(taste.ready, program.id).toBe(has);
      expect(taste.tools.length + taste.videos.length > 0, program.id).toBe(has);
    }
    // 찾지 못한 기관에는 체험 카드를 그리지 않는다(11/28)
    for (const id of ["JOB07", "H13", "L16"]) {
      const program = live.find((row) => row.id === id);
      if (program) expect(tasteOf(program).ready, id).toBe(false);
    }
  });

  it("체험 자료는 안내 중인 기관에만 붙어 있다", () => {
    for (const id of [...Object.keys(tasteTools), ...Object.keys(tasteFilms)]) {
      expect(liveIds.has(id), id).toBe(true);
    }
  });

  it("해 볼 것에는 무엇을 하는지, 여는 주소, 만든 곳이 있다", () => {
    for (const program of live) {
      const { tools } = tasteOf(program);
      // 같은 주소로 가는 것은 하나로 합친다
      expect(new Set(tools.map((tool) => tool.url)).size, program.id).toBe(tools.length);
      for (const tool of tools) {
        expect(tool.url, program.id).toMatch(/^https:\/\//);
        for (const field of [tool.title, tool.body, tool.linkLabel, tool.by]) {
          expect(field.trim(), program.id).not.toBe("");
        }
      }
    }
  });

  it("영상은 정해 둔 영상 번호의 앱 안 재생 주소로만 연다", () => {
    const films: Record<string, { id: string }> = tasteFilms;
    for (const program of live) {
      const { videos } = tasteOf(program);
      const film = films[program.id];
      if (!film) {
        expect(videos, program.id).toHaveLength(0);
        continue;
      }
      expect(videos, program.id).toHaveLength(1);
      const url = new URL(videos[0].url);
      expect(url.origin).toBe("https://www.youtube-nocookie.com");
      expect(url.pathname).toBe(`/embed/${film.id}`);
      expect(url.searchParams.get("playsinline")).toBe("1");
      expect(url.searchParams.get("rel")).toBe("0");
      expect(videos[0].title.trim()).not.toBe("");
      expect(videos[0].by.trim()).not.toBe("");
    }
  });

  it("끝난 기관과 등록되지 않은 기관에 다른 곳의 체험을 붙이지 않는다", () => {
    const program = live.find((row) => row.id === "L13")!;
    for (const row of [{ ...program, 매칭가능: "N" }, { ...program, id: "UNKNOWN" }]) {
      expect(tasteOf(row)).toEqual({ ready: false, tools: [], videos: [] });
    }
  });

  it("체험 화면의 주소는 기관 화면과 같은 꼬리를 단다", () => {
    expect(tasteHref("JOB01", null)).toBe("/place/JOB01/taste");
    expect(tasteHref("JOB01", "T05")).toBe("/place/JOB01/taste?type=T05");
    expect(tasteHref("JOB01", "T05", true)).toBe("/place/JOB01/taste?type=T05&from=places");
  });
});
