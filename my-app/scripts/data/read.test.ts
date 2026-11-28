// 실제 자료 파일(app/data 등)을 읽어 보는 테스트.
// 자료를 고친 뒤 이 테스트가 깨지면: `npm run data`를 돌리고 src/generated/를 함께 커밋한다.

import { mkdtempSync, readFileSync, rmSync, writeFileSync, cpSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { DataError, defaultSources, readAll, readDongs, readVenues } from "./read";
import { readMap } from "./read-map";
import { BARRIER_Q, PIN_COLUMN, REQUIRED_COLUMNS } from "./validate";

const myAppDir = path.resolve(import.meta.dirname, "..", "..");
const sources = defaultSources(myAppDir);
const generated = (name: string) =>
  JSON.parse(readFileSync(path.join(myAppDir, "src", "generated", name), "utf8"));

describe("실제 자료 파일", () => {
  const { app, server } = readAll(sources);

  it("검사를 통과하고 정해 둔 수만큼 있다", () => {
    expect(app.types).toHaveLength(12);
    // 설문 12문항 = 기본정보 3 + 유형 찾기 9 (보기 고르기)
    const survey = app.questions.filter((q) => q.where !== "result");
    expect(survey.map((q) => q.id)).toEqual([
      "P_GENDER", "P_AGE", "P_WORK", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09",
    ]);
    expect(app.questions.filter((q) => q.where === "result").map((q) => q.id)).toEqual(["Q_PRIORITY", "Q_FREE"]);
    expect(app.tiebreak).toBe("C03");
  });

  it("척도 문항과 걸림돌 문항은 새 앱에 싣지 않는다", () => {
    expect(app.questions.some((q) => q.id === BARRIER_Q)).toBe(false);
    expect(app.questions.some((q) => q.selection === "scale")).toBe(false);
  });

  it("유형 찾기 문항은 하나만 고르는 문항이고, 보기마다 점수가 있다", () => {
    for (const q of app.questions.filter((q) => q.id.startsWith("C"))) {
      expect(q.selection, q.id).toBe("single");
      for (const option of q.options ?? []) expect(Object.keys(option.scores ?? {}).length, `${q.id}.${option.id}`).toBeGreaterThan(0);
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
    expect(generated("map.json")).toEqual(readAll(sources).map);
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

  it("보기 점수를 하나 바꿔 유형마다 최대 점수가 달라지면 알려 준다", () => {
    const broken = brokenCopy("choice_questions.yaml", (text) =>
      text.replace('scores: {T04: 2, T01: 1}', 'scores: {T04: 3, T01: 1}')
    );
    const problems = problemsOf(() => readAll(broken));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/가장 높은 점수가 같아야 합니다.*T04 10\.5/);
  });

  it("유형 찾기 문항 파일이 없으면 알려 준다", () => {
    const broken = brokenCopy("choice_questions.yaml", (text) => text);
    rmSync(path.join(broken.dataDir, "choice_questions.yaml"));
    expect(problemsOf(() => readAll(broken))).toEqual(["choice_questions.yaml: 파일이 없습니다."]);
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

describe("동 자료", () => {
  const { app } = readAll(sources);

  it("안산 25개 동이 이름·구·기준점과 함께 실린다", () => {
    expect(app.dongs).toHaveLength(25);
    expect(new Set(app.dongs.map((dong) => dong.name)).size).toBe(25);
    for (const dong of app.dongs) {
      expect(Object.keys(dong)).toEqual(["name", "gu", "lat", "lon"]);
      expect(["상록구", "단원구"]).toContain(dong.gu);
    }
  });

  it("출처·전화 같은 칸은 싣지 않는다", () => {
    const text = JSON.stringify(app.dongs);
    for (const word of ["findby", "http", "031-", "verifiedOn"]) expect(text).not.toContain(word);
  });

  it("파일이 없으면 빈 목록이고 앱은 멈추지 않는다", () => {
    expect(readDongs("없는-파일.json")).toEqual([]);
  });

  it("안산 밖의 좌표와 겹친 동 이름을 알린다", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "anti-dong-"));
    const points = [
      { name: "가동", gu: "상록구", lat: 37.305, lon: 126.805 },
      { name: "가동", gu: "상록구", lat: 37.305, lon: 126.805 },
      { name: "나동", gu: "단원구", lat: 35.1, lon: 129.0 },
    ];
    writeFileSync(path.join(dir, "p.json"), JSON.stringify(points));
    const problems: string[] = [];
    const dongs = readDongs(path.join(dir, "p.json"), problems);
    expect(dongs.map((dong) => dong.name)).toEqual(["가동"]);
    expect(problems).toHaveLength(2);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe("지도 자료", () => {
  const { app, map } = readAll(sources);

  it("동 고르기에 나오는 25개 동이 모두 경계·색·이름 자리를 가진다", () => {
    expect(map).not.toBeNull();
    expect(map!.dongs.map((dong) => dong.name).sort()).toEqual(app.dongs.map((dong) => dong.name).sort());
    for (const dong of map!.dongs) {
      expect(Object.keys(dong)).toEqual(["name", "gu", "color", "label", "rings"]);
      expect(dong.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(dong.rings.length).toBeGreaterThan(0);
      for (const ring of dong.rings) expect(ring[0]).toEqual(ring[ring.length - 1]); // 닫힌 선
    }
  });

  it("구의 경계가 두 개 있고, 출처 주소 같은 칸은 싣지 않는다", () => {
    expect(map!.borders.map((border) => border.gu).sort()).toEqual(["단원구", "상록구"]);
    expect(JSON.stringify(map)).not.toContain("http");
  });

  it("경계 파일이 없으면 null이고 앱은 멈추지 않는다", () => {
    const none = { areasPath: "없는-파일.json", stylesPath: "없는-파일.json", districtsPath: "없는-파일.json" };
    expect(readMap(none, ["일동"])).toBeNull();
  });

  it("닫히지 않은 경계, 색이 없는 동, 경계가 없는 동을 알린다", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "anti-map-"));
    const square = [[126.8, 37.3], [126.81, 37.3], [126.81, 37.31], [126.8, 37.31], [126.8, 37.3]];
    const open = square.slice(0, 4);
    const feature = (name: string, ring: number[][]) => ({
      properties: { name, gu: "상록구" },
      geometry: { type: "Polygon", coordinates: [ring] },
    });
    writeFileSync(
      path.join(dir, "a.json"),
      JSON.stringify({ features: [feature("가동", square), feature("나동", open), feature("다동", square)] })
    );
    writeFileSync(path.join(dir, "s.json"), JSON.stringify({ 가동: { lon: 126.805, lat: 37.305, color: "#bfd2b8" } }));
    const problems: string[] = [];
    const found = readMap(
      { areasPath: path.join(dir, "a.json"), stylesPath: path.join(dir, "s.json"), districtsPath: "없는-파일.json" },
      ["가동", "라동"],
      problems
    );
    expect(found!.dongs.map((dong) => dong.name)).toEqual(["가동"]);
    expect(found!.borders).toEqual([]);
    expect(problems).toHaveLength(3); // 나동(안 닫힘), 다동(색 없음), 라동(경계 없음)
    rmSync(dir, { recursive: true, force: true });
  });
});
