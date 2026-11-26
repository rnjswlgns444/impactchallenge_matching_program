// 화면이 쓰는 자료. 원본은 app/data/의 파일이고, `npm run data`가 src/generated/data.json으로 만든다.
// 공개 정보뿐이라 브라우저에 실어도 된다. AI 지시문 같은 서버용 자료는 ./server.ts에 있다.

import raw from "@/generated/data.json";

import type { AppData, Program, TypeInfo } from "./types";

// 빌드 때 검사를 통과한 파일이라 모양을 믿고 쓴다(scripts/data/validate.ts)
export const appData = raw as unknown as AppData;

const typesById = new Map(appData.types.map((type) => [type.id, type]));
const programsById = new Map(appData.programs.map((program) => [program.id, program]));

export function getType(id: string): TypeInfo | undefined {
  return typesById.get(id);
}

// 정보표의 한 행. 지금 안내해도 되는 곳인지는 여기서 따지지 않는다(후보 거르기가 한다).
export function getProgram(id: string): Program | undefined {
  return programsById.get(id);
}

export type { AppData, Program, TypeInfo } from "./types";
