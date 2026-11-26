// 자료 파일을 읽어 앱이 쓸 모양으로 만든다. 파일을 쓰지는 않는다(쓰는 것은 build-data.ts).
// 원본은 app/(Streamlit 앱 폴더)에 한 벌만 있다. 새 앱은 그 파일을 그대로 읽는다.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import Papa from "papaparse";
import { parse as parseYaml } from "yaml";

import type { AppData, Program, ServerData, Venue } from "../../src/data/types";
import { BARRIER_Q, PIN_COLUMN, REQUIRED_COLUMNS, validateAll, type RawFiles } from "./validate";

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
};

// my-app/ 옆의 app/ 폴더
export function defaultSources(myAppDir: string): Sources {
  const appDir = path.resolve(myAppDir, "..", "app");
  return {
    dataDir: path.join(appDir, "data"),
    promptPath: path.join(appDir, "prompts", "matching.md"),
    venuesPath: path.join(appDir, "anti_map", "venues.json"),
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

// 파일을 읽고 검사한다. 문제가 있으면 DataError를 던진다.
export function readAll(sources: Sources): { app: AppData; server: ServerData; raw: RawFiles } {
  const problems: string[] = [];
  const questionsFile = readYaml(path.join(sources.dataDir, "questions.yaml"), problems);
  const typesFile = readYaml(path.join(sources.dataDir, "types.yaml"), problems);
  const settings = readYaml(path.join(sources.dataDir, "settings.yaml"), problems);
  const programs = readPrograms(path.join(sources.dataDir, "programs.csv"), problems);
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
  };
  // 읽지 못한 파일이 있으면 그것부터 알린다(파이썬 쪽과 같다)
  const found = problems.length > 0 ? problems : validateAll(raw);
  if (found.length > 0) throw new DataError(found);

  // 여기부터는 검사를 통과한 값이라 모양을 믿고 옮긴다
  const columns = [...REQUIRED_COLUMNS, PIN_COLUMN];
  const s = settings as AppData["settings"] & { llm?: Partial<ServerData["llm"]> };
  const app: AppData = {
    // 걸림돌 문항은 새 앱에서 묻지 않는다(파일에는 남겨 둔다. 지우면 Streamlit 앱이 켜지지 않는다)
    questions: (raw.questions as AppData["questions"]).filter((q) => q.id !== BARRIER_Q),
    scale: raw.scale as AppData["scale"],
    areas: raw.areas as AppData["areas"],
    types: raw.types as AppData["types"],
    // 앱이 읽는 열만 싣는다. 팀 점검용 열(재확인일·운영근거·비고)은 싣지 않는다
    programs: programs.map((row): Program =>
      Object.fromEntries(columns.map((column) => [column, row[column] ?? ""]))
    ),
    venues: readVenues(sources.venuesPath),
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
  return { app, server, raw };
}
