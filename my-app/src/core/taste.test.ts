import { describe, expect, it } from "vitest";

import { tasteSimulations } from "@/content/practice";
import { tasteFilms, tastePhotos, tastePractices, tasteTools } from "@/content/text";
import { appData } from "@/data";
import { tasteHref } from "@/lib/routes";

import { tasteKind, tasteOf } from "./taste";

describe("집에서 먼저 체험하기", () => {
  const live = appData.programs.filter((program) => program["매칭가능"] === "Y");
  const liveIds = new Set(live.map((program) => program.id));

  it("해 볼 것이나 영상이 있는 기관만 체험을 연다", () => {
    for (const program of live) {
      const taste = tasteOf(program);
      const has = [tasteTools, tastePractices, tasteFilms, tastePhotos].some((group) => program.id in group);
      expect(taste.ready, program.id).toBe(has);
      const count = taste.tools.length + (taste.practice ? 1 : 0) + taste.videos.length + taste.photos.length;
      expect(count > 0, program.id).toBe(has);
    }
  });

  it("연습은 본문이 있는 것만 열고, 우리가 안내하지 않는 곳의 연습은 열지 않는다", () => {
    const bodies: Record<string, { title: string; intro: string }> = tasteSimulations;
    for (const [id, card] of Object.entries(tastePractices)) {
      expect(bodies[id], id).toBeDefined();
      // 카드의 제목·소개는 연습 본문의 것과 같다
      expect(card.title, id).toBe(bodies[id].title);
      expect(card.body, id).toBe(bodies[id].intro);
    }
    // 마을상점생활관(C_BOOK)과 안산환경운동연합(C_ECO)은 우리 정보표에 없는 곳이다
    for (const id of Object.keys(tastePractices)) expect(id.startsWith("C_"), id).toBe(false);
  });

  it("해 볼 것이나 연습이 있으면 '체험', 영상만 있으면 '영상', 사진만 있으면 '사진'이라 부른다", () => {
    const base = { ready: true, tools: [], practice: null, videos: [], photos: [] };
    const tool = { title: "가", body: "나", linkLabel: "다", url: "https://example.com", by: "라" };
    const video = { title: "가", url: "https://example.com", by: "라" };
    const photo = { title: "가", body: "나", url: "https://example.com", by: "라" };
    expect(tasteKind({ ...base, tools: [tool], videos: [video] })).toBe("do");
    expect(tasteKind({ ...base, practice: { id: "X", title: "가", body: "나" }, photos: [photo] })).toBe("do");
    expect(tasteKind({ ...base, videos: [video], photos: [photo] })).toBe("video");
    expect(tasteKind({ ...base, photos: [photo] })).toBe("photo");
  });

  it("사진 페이지에는 무엇의 사진인지, 주소, 올린 곳이 있다", () => {
    const pages: Record<string, readonly { title: string; body: string; url: string; by: string }[]> = tastePhotos;
    for (const [id, list] of Object.entries(pages)) {
      for (const photo of list) {
        expect(photo.url, id).toMatch(/^https:\/\//);
        for (const field of [photo.title, photo.body, photo.by]) expect(field.trim(), id).not.toBe("");
      }
    }
  });

  it("체험 자료는 안내 중인 기관에만 붙어 있다", () => {
    const groups = [tasteTools, tastePractices, tasteFilms, tastePhotos];
    for (const id of groups.flatMap((group) => Object.keys(group))) {
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
      expect(tasteOf(row)).toEqual({ ready: false, tools: [], practice: null, videos: [], photos: [] });
    }
  });

  it("체험 화면의 주소는 기관 화면과 같은 꼬리를 단다", () => {
    expect(tasteHref("JOB01", null)).toBe("/place/JOB01/taste");
    expect(tasteHref("JOB01", "T05")).toBe("/place/JOB01/taste?type=T05");
    expect(tasteHref("JOB01", "T05", true)).toBe("/place/JOB01/taste?type=T05&from=places");
  });
});
