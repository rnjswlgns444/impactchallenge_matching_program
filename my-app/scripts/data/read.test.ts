// 실제 자료 파일(app/data 등)을 읽어 보는 테스트.
// 자료를 고친 뒤 이 테스트가 깨지면: `npm run data`를 돌리고 src/generated/를 함께 커밋한다.

import { mkdtempSync, readFileSync, writeFileSync, cpSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { DataError, defaultSources, readAll, readVenues } from "./read";
import { BARRIER_Q, PIN_COLUMN, REQUIRED_COLUMNS } from "./validate";

const myAppDir = path.resolve(import.meta.dirname, "..", "..");
const sources = defaultSources(myAppDir);
const generated = (name: string) =>
  JSON.parse(readFileSync(path.join(myAppDir, "src", "generated", name), "utf8"));

describe("실제 자료 파일", () => {
  const { app, server } = readAll(sources);

  it("검사를 통과하고 정해 둔 수만큼 있다", () => {
    expect(app.types).toHaveLength(12);
    expect(app.scale.map((option) => option.value)).toEqual([5, 4, 3, 2, 1]);
    // 설문 27문항 = 기본정보 3 + 척도 24
    const survey = app.questions.filter((q) => q.where !== "result");
    expect(survey).toHaveLength(27);
    expect(survey.filter((q) => q.selection === "scale")).toHaveLength(24);
  });

  it("걸림돌 문항은 새 앱에 싣지 않는다", () => {
    expect(app.questions.some((q) => q.id === BARRIER_Q)).toBe(false);
  });

  it("유형마다 척도 문항이 두 개다", () => {
    for (const type of app.types) {
      expect(app.questions.filter((q) => q.type === type.id), type.id).toHaveLength(2);
    }
  });

  it("프로그램 행에는 앱이 읽는 열만 있다(팀 점검용 열은 없다)", () => {
    const columns = [...REQUIRED_COLUMNS, PIN_COLUMN];
    for (const row of app.programs) {
      expect(Object.keys(row)).toEqual(columns);
    }
    expect(app.programs[0]).not.toHaveProperty("비고");
    expect(app.programs[0]).not.toHaveProperty("운영근거");
  });

  it("위치 자료에는 이름·주소·좌표만 있고, 곳은 정보표에 있는 id에만 붙는다", () => {
    const ids = new Set(app.programs.map((row) => row.id));
    for (const [programId, places] of Object.entries(app.venues)) {
      expect(ids.has(programId), programId).toBe(true);
      for (const place of places) {
        expect(Object.keys(place)).toEqual(["name", "address", "lat", "lon"]);
      }
    }
  });

  it("AI 지시문과 모델 설정은 화면용 자료에 없고 서버용 자료에만 있다", () => {
    expect(JSON.stringify(app)).not.toContain("{wish_text}");
    expect(app.settings).not.toHaveProperty("llm");
    expect(server.prompt).toContain("{wish_text}");
    expect(server.prompt).not.toContain("\r"); // 줄 끝은 컴퓨터와 상관없이 \n
    expect(server.llm.provider).toBeTruthy();
  });

  it("올려 둔 src/generated/가 지금 원본과 같다", () => {
    expect(generated("data.json")).toEqual(app);
    expect(generated("server.json")).toEqual(server);
  });
});

describe("틀린 자료", () => {
  // 실제 자료를 임시 폴더에 복사한 뒤 한 파일만 망가뜨린다
  function brokenCopy(file: string, change: (text: string) => string) {
    const dir = mkdtempSync(path.join(os.tmpdir(), "anti-data-"));
    cpSync(sources.dataDir, dir, { recursive: true });
    const target = path.join(dir, file);
    writeFileSync(target, change(readFileSync(target, "utf8")), "utf8");
    return { ...sources, dataDir: dir };
  }
  const problemsOf = (run: () => unknown): string[] => {
    try {
      run();
    } catch (err) {
      if (err instanceof DataError) return err.problems;
      throw err;
    }
    return [];
  };

  it("척도 문항을 하나 지우면 어느 유형이 모자란지 알려 준다", () => {
    const broken = brokenCopy("questions.yaml", (text) =>
      text.replace(/^.*id: Q01,.*\r?\n/m, "")
    );
    const problems = problemsOf(() => readAll(broken));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/척도 문항은 2개여야 합니다\. \(지금: 1개\)/);
  });

  it("들여쓰기가 틀린 YAML은 파일 이름과 함께 알려 준다", () => {
    const broken = brokenCopy("types.yaml", (text) => text.replace("areas:", "areas: [oops"));
    const problems = problemsOf(() => readAll(broken));
    expect(problems.some((p) => p.startsWith("types.yaml: 형식이 잘못됐습니다."))).toBe(true);
  });

  it("없는 위치 파일은 오류가 아니라 빈 자료다", () => {
    expect(readVenues(path.join(os.tmpdir(), "anti-no-such-file.json"))).toEqual({});
  });
});
