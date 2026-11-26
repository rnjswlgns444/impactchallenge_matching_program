// 자료 파일을 읽어 검사한 뒤 src/generated/에 써 둔다.
// `npm run dev`와 `npm run build` 앞에 저절로 돈다(package.json의 predev, prebuild).
// 손으로 돌릴 때: npm run data
//
// 원본(app/data 등)을 고치면 이 스크립트가 다시 만든다. src/generated/의 파일을 손으로 고치지 않는다.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DataError, defaultSources, readAll } from "./data/read";

const myAppDir = path.resolve(import.meta.dirname, "..");
const outDir = path.join(myAppDir, "src", "generated");
const appFile = path.join(outDir, "data.json");
const serverFile = path.join(outDir, "server.json");

// 내용이 같으면 다시 쓰지 않는다(개발 서버가 괜히 새로 고치지 않게)
function writeIfChanged(file: string, value: unknown): boolean {
  const next = JSON.stringify(value, null, 2) + "\n";
  if (existsSync(file) && readFileSync(file, "utf8") === next) return false;
  writeFileSync(file, next, "utf8");
  return true;
}

const sources = defaultSources(myAppDir);

// 원본 폴더가 보이지 않는 곳(배포 서버가 my-app/ 바깥을 주지 않을 때)에서는
// 저장소에 올려 둔 src/generated/를 그대로 쓴다.
if (!existsSync(sources.dataDir)) {
  if (existsSync(appFile) && existsSync(serverFile)) {
    console.warn(`자료 원본 폴더가 없어 올려 둔 자료를 그대로 씁니다: ${sources.dataDir}`);
    process.exit(0);
  }
  console.error(`자료 원본 폴더가 없고, 만들어 둔 자료도 없습니다: ${sources.dataDir}`);
  process.exit(1);
}

try {
  const { app, server } = readAll(sources);
  mkdirSync(outDir, { recursive: true });
  const changed = [writeIfChanged(appFile, app), writeIfChanged(serverFile, server)].some(Boolean);
  const open = app.programs.filter((row) => row["매칭가능"] === "Y").length;
  console.log(
    `자료를 읽었습니다: 문항 ${app.questions.length}개, 유형 ${app.types.length}개, ` +
      `프로그램 ${app.programs.length}행(안내 중 ${open}행), 좌표가 있는 곳 ${Object.keys(app.venues).length}곳` +
      (changed ? "" : " (바뀐 것 없음)")
  );
} catch (err) {
  if (err instanceof DataError) {
    console.error("자료 파일에 고칠 곳이 있습니다. 고친 뒤 다시 실행해 주세요.\n");
    for (const problem of err.problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  throw err;
}
