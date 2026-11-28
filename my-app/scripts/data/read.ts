// 자료 파일을 읽어 앱이 쓸 모양으로 만든다. 파일을 쓰지는 않는다(쓰는 것은 build-data.ts).
// 원본은 app/(Streamlit 앱 폴더)에 한 벌만 있다. 새 앱은 그 파일을 그대로 읽는다.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import Papa from "papaparse";
import { parse as parseYaml } from "yaml";

import type { AppData, Dong, MapData, Program, ServerData, Venue } from "../../src/data/types";
import { readMap, type MapSources } from "./read-map";
import { BARRIER_Q, CHOICE_FILE, PIN_COLUMN, REQUIRED_COLUMNS, validateAll, type RawFiles } from "./validate";

// 형식이 틀렸을 때 던진다. problems에 고칠 곳 목록이 들어 있다.
export class DataError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(problems.join("\n"));
    this.name = "DataError";
    this.problems = problems;
  }
}

export type Sources = {
  dataDir: string; // questions.yaml, types.yaml, settings.yaml, programs.csv
  promptPath: string; // prompts/matching.md
  venuesPath: string; // anti_map/venues.json
  dongPointsPath: string; // anti_map/neighborhoods.json (동의 기준점)
  map: MapSources; // 지도 그림의 도형(동 경계·색, 구 경계)
};

// my-app/ 옆의 app/ 폴더
export function defaultSources(myAppDir: string): Sources {
  const appDir = path.resolve(myAppDir, "..", "app");
  return {
    dataDir: path.join(appDir, "data"),
    promptPath: path.join(appDir, "prompts", "matching.md"),
    venuesPath: path.join(appDir, "anti_map", "venues.json"),
    dongPointsPath: path.join(appDir, "anti_map", "neighborhoods.json"),
    map: {
      areasPath: path.join(appDir, "anti_map", "neighborhood_areas.json"),
      stylesPath: path.join(appDir, "anti_map", "dong_styles.json"),
      districtsPath: path.join(appDir, "anti_map", "districts.geojson"),
    },
  };
}

type Dict = Record<string, unknown>;
const isDict = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function readText(file: string): string {
  // 글자가 깨진 파일은 조용히 넘어가지 않고 알린다
  const text = new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(file));
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // 엑셀이 붙이는 BOM을 뗀다
}

function readYaml(file: string, problems: string[]): Dict {
  const name = path.basename(file);
  if (!existsSync(file)) {
    problems.push(`${name}: 파일이 없습니다.`);
    return {};
  }
  try {
    // 파이썬 쪽(PyYAML)과 같은 규칙(YAML 1.1)으로 읽는다
    const parsed: unknown = parseYaml(readText(file), { version: "1.1" });
    return isDict(parsed) ? parsed : {};
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    problems.push(`${name}: 형식이 잘못됐습니다. 들여쓰기와 따옴표를 확인하세요. (${reason})`);
    return {};
  }
}

function readPrograms(file: string, problems: string[]): Record<string, string>[] {
  const name = path.basename(file);
  if (!existsSync(file)) {
    problems.push(`${name}: 파일이 없습니다.`);
    return [];
  }
  let text: string;
  try {
    text = readText(file);
  } catch {
    problems.push(`${name}: 글자가 깨졌습니다. 엑셀에서 'CSV UTF-8' 형식으로 저장하세요.`);
    return [];
  }
  const parsed = Papa.parse<Record<string, string | undefined>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  // 칸의 앞뒤 빈칸을 떼고, 이름 없는 열은 버린다(파이썬 쪽과 같다)
  return parsed.data.map((row) =>
    Object.fromEntries(
      Object.entries(row)
        .filter(([column]) => column)
        .map(([column, value]) => [column, (value ?? "").trim()])
    )
  );
}

// 이름과 좌표가 있는 곳만 남긴다. 파일이 없거나 읽지 못하면 빈 사전이다(길찾기 단추만 안 나온다).
// note는 싣지 않는다(다른 기관의 메모가 잘못 복사된 곳이 있다).
export function readVenues(file: string): Record<string, Venue[]> {
  let raw: unknown;
  try {
    raw = JSON.parse(readText(file));
  } catch {
    return {};
  }
  if (!isDict(raw)) return {};
  const found: Record<string, Venue[]> = {};
  for (const [programId, places] of Object.entries(raw)) {
    const good = (Array.isArray(places) ? places : [])
      .filter(isDict)
      .filter((place) => place.name && typeof place.lat === "number" && typeof place.lon === "number")
      .map((place) => ({
        name: String(place.name),
        address: typeof place.address === "string" ? place.address : "",
        lat: place.lat as number,
        lon: place.lon as number,
      }));
    if (good.length > 0) found[programId] = good;
  }
  return found;
}

// 안산을 넉넉히 감싸는 범위. 이 밖의 좌표는 잘못 적힌 것으로 본다
const ANSAN = { minLat: 37.0, maxLat: 37.45, minLon: 126.3, maxLon: 127.0 };
const inAnsan = (lon: unknown, lat: unknown): boolean =>
  typeof lon === "number" &&
  typeof lat === "number" &&
  lon >= ANSAN.minLon &&
  lon <= ANSAN.maxLon &&
  lat >= ANSAN.minLat &&
  lat <= ANSAN.maxLat;

// 동의 기준점(행정복지센터 좌표)을 읽는다. 원본은 동료가 만든 파일이다(출처는 파일 안에 있다).
// 파일이 없거나 읽지 못하면 빈 목록이다(동 고르기와 '가까운 곳' 딱지만 안 나온다). 모양이 틀린 동은 problems에 적는다.
// 출처·전화·메모 칸은 싣지 않는다. 동의 경계는 지도 그림만 쓰므로 따로 읽는다(read-map.ts).
export function readDongs(pointsFile: string, problems: string[] = []): Dong[] {
  let points: unknown;
  try {
    points = JSON.parse(readText(pointsFile).replace(/^\uFEFF/, ""));
  } catch {
    return [];
  }
  if (!Array.isArray(points)) return [];

  const found: Dong[] = [];
  const seen = new Set<string>();
  for (const point of points.filter(isDict)) {
    const name = String(point.name ?? "");
    if (!name) continue;
    if (seen.has(name)) {
      problems.push(`neighborhoods.json: 동 이름 '${name}'이 두 번 있습니다.`);
      continue;
    }
    seen.add(name);
    if (!inAnsan(point.lon, point.lat)) {
      problems.push(`neighborhoods.json: '${name}'의 좌표가 없거나 안산 밖입니다.`);
    } else {
      found.push({ name, gu: String(point.gu ?? ""), lat: point.lat as number, lon: point.lon as number });
    }
  }
  return found;
}

// 파일을 읽고 검사한다. 문제가 있으면 DataError를 던진다.
// map은 지도 그림의 도형이다. 화면용 자료(app)와 따로 둔다(지도를 그리는 화면만 받아 가게).
export function readAll(sources: Sources): {
  app: AppData;
  server: ServerData;
  map: MapData | null;
  raw: RawFiles;
} {
  const problems: string[] = [];
  const questionsFile = readYaml(path.join(sources.dataDir, "questions.yaml"), problems);
  const choiceFile = readYaml(path.join(sources.dataDir, CHOICE_FILE), problems);
  const typesFile = readYaml(path.join(sources.dataDir, "types.yaml"), problems);
  const settings = readYaml(path.join(sources.dataDir, "settings.yaml"), problems);
  const programs = readPrograms(path.join(sources.dataDir, "programs.csv"), problems);
  const dongs = readDongs(sources.dongPointsPath, problems);
  const map = readMap(sources.map, dongs.map((dong) => dong.name), problems);
  let prompt = "";
  if (existsSync(sources.promptPath)) {
    // 줄 끝을 \n으로 맞춘다. 윈도우에서 받은 파일은 \r\n이라, 그대로 두면 컴퓨터마다 결과가 달라진다
    prompt = readText(sources.promptPath).replace(/\r\n?/g, "\n");
  } else {
    problems.push("prompts/matching.md: 파일이 없습니다.");
  }

  const raw: RawFiles = {
    areas: typesFile.areas ?? [],
    types: typesFile.types ?? [],
    questions: questionsFile.questions ?? [],
    scale: questionsFile.scale ?? [],
    settings,
    programs,
    prompt,
    choice: choiceFile,
  };
  // 읽지 못한 파일이 있으면 그것부터 알린다(파이썬 쪽과 같다)
  const found = problems.length > 0 ? problems : validateAll(raw);
  if (found.length > 0) throw new DataError(found);

  // 여기부터는 검사를 통과한 값이라 모양을 믿고 옮긴다
  const columns = [...REQUIRED_COLUMNS, PIN_COLUMN];
  const s = settings as AppData["settings"] & { llm?: Partial<ServerData["llm"]> };
  // 새 앱의 설문: questions.yaml의 기본정보 → choice_questions.yaml의 유형 찾기 문항 → 결과 쪽 문항.
  // 척도 문항(Q01~Q24)과 걸림돌 문항은 새 앱에서 묻지 않는다(파일에는 남겨 둔다. Streamlit 앱이 쓴다)
  const kept = (raw.questions as AppData["questions"]).filter(
    (q) => q.id !== BARRIER_Q && q.selection !== "scale"
  );
  const choice = (choiceFile.questions as AppData["questions"]).map(
    (q): AppData["questions"][number] => ({ ...q, selection: "single" })
  );
  const app: AppData = {
    questions: [...kept.filter((q) => q.where !== "result"), ...choice, ...kept.filter((q) => q.where === "result")],
    tiebreak: String(choiceFile.tiebreak),
    scale: raw.scale as AppData["scale"],
    areas: raw.areas as AppData["areas"],
    types: raw.types as AppData["types"],
    // 앱이 읽는 열만 싣는다. 팀 점검용 열(재확인일·운영근거·비고)은 싣지 않는다
    programs: programs.map((row): Program =>
      Object.fromEntries(columns.map((column) => [column, row[column] ?? ""]))
    ),
    venues: readVenues(sources.venuesPath),
    dongs,
    settings: {
      scoring: { high: s.scoring.high },
      ai_top_n: s.ai_top_n,
      worries: s.worries ?? [],
      free_empty_words: s.free_empty_words,
      fallback_card: s.fallback_card,
    },
  };
  const server: ServerData = {
    prompt,
    llm: {
      provider: String(s.llm?.provider ?? "gemini"),
      model: String(s.llm?.model ?? ""),
      effort: String(s.llm?.effort ?? "low"),
      timeout_seconds: Number(s.llm?.timeout_seconds ?? 60),
    },
  };
  return { app, server, map, raw };
}
