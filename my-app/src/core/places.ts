// 화면에 놓을 곳을 고르고, 기관 한 곳의 칸을 화면에 보일 모양으로 다듬는다. 화면과 무관한 순수 함수만 둔다.
// 원본: app/main.py의 result_context, app/ui/components.py의 phones·place_name·worry_lines·place_facts·place_actions
//
// 여기서는 새로 거르지 않는다. candidates.ts가 걸러 준 것의 순서만 정한다.
// 화면 문구는 이 파일에 두지 않는다. 필요한 문장은 인자(labels)로 받는다.

import type { Program, TypeInfo, Venue, Worry } from "@/data/types";

import { buildResult, firstConsult, unconfirmedColumns, type Profile, type TypeResult } from "./candidates";
import type { Moment } from "./clock";
import type { DetailAnswer } from "./selection";
import { KIND_LIST, UNCONFIRMED, splitMulti } from "./table";
import { routeUrl } from "./venues";

// 결과 화면에 카드로 놓는 곳의 수. 더 있으면 '다른 곳 n곳'으로 묶는다
export const SHOWN_PLACES = 3;

// 찾아가지 않고 이용하는 곳의 '장소' 칸에 적힌 말
const REMOTE_PLACES = new Set([
  "전화 문의",
  "전화 상담",
  "전화·온라인 상담",
  "온라인 상담",
  "온라인",
  "비대면",
  "집으로 방문하는 서비스",
]);

// 찾아가지 않고 전화·온라인으로 이용하거나, 집으로 찾아오는 곳인지
export function noVisit(place: string): boolean {
  return REMOTE_PLACES.has(place) || place.startsWith("전화 안내.");
}

// 크게 보여 줄 기관 이름. 괄호 안의 풀이(운영 주체·부서)만 뺀다
export function placeName(program: Program): string {
  const full = program["기관명"];
  return full.replace(/\([^)]*\)/g, "").trim() || full;
}

const RANGE = /~\s*\p{Nd}+/gu; // '1619~21'의 '~21'
// 031-481-2919 / 1666-1234 / 129
const NUMBER = /\p{Nd}{2,4}-\p{Nd}{3,4}-\p{Nd}{4}|\p{Nd}{4}-\p{Nd}{4}|\p{Nd}{3,4}/u;

export type Phone = { number: string; shown: string }; // 걸 번호, 화면에 보일 글

// 연락처 칸에서 전화번호를 뽑는다. 번호가 없으면 빈 목록.
// '031-439-1619~21'은 첫 번호(0314391619)로 건다. '/'로 나눠 적은 번호는 각각 하나가 된다.
export function phones(contact: string): Phone[] {
  const found: Phone[] = [];
  for (const part of contact.split("/")) {
    const match = NUMBER.exec(part.replace(RANGE, ""));
    if (match) found.push({ number: match[0].replaceAll("-", ""), shown: part.trim() });
  }
  return found;
}

// 본인이 먼저 확인할 점에 쓰는 문장
export type CheckLabels = {
  ageUnconfirmed: string; // 55~64세 참여가 미확인일 때
  unconfirmed: (column: string) => string; // 세부 규칙이 보는 칸이 미확인일 때
};

// 본인이 먼저 확인할 점. 개인 자격은 앱이 판정하지 않고 여기에 적어 준다.
export function checks(program: Program, labels: CheckLabels, type: TypeInfo | null): string[] {
  const found = splitMulti(program["확인필요"]);
  if (program["55~64세참여"] === UNCONFIRMED) found.push(labels.ageUnconfirmed);
  if (type) found.push(...unconfirmedColumns(program, type).map(labels.unconfirmed));
  return found;
}

// 걱정 한 줄을 눌렀을 때 보여 줄 이 기관의 내용. 정보표에 확인된 것만 낸다(비었거나 '미확인'이면 뺀다).
// 빈 목록이면 화면이 '아직 확인하지 못했어요'라고 알린다. 지어내지 않는다.
export function worryLines(program: Program, worry: Worry, labels: CheckLabels, type: TypeInfo | null): string[] {
  const lines = (worry.show ?? [])
    .filter((column) => program[column] && program[column] !== UNCONFIRMED)
    .map((column) => program[column].replaceAll("|", ", "));
  if (worry.checks) lines.push(...checks(program, labels, type));
  return [...new Set(lines)];
}

export type Fact = { kind: "where" | "whereRemote" | "who" | "how" | "contact"; value: string };

// '지원을 처음 경험할 때' 안의 줄. 비어 있거나 '미확인'인 줄은 내지 않는다.
export function placeFacts(program: Program): Fact[] {
  const place = program["장소"] || program["진행방식"];
  const rows: Fact[] = [
    { kind: noVisit(place) ? "whereRemote" : "where", value: place },
    { kind: "who", value: program["대상"] },
    { kind: "how", value: program["첫방문안내"] || program["신청방법"] },
    { kind: "contact", value: program["공식연락처"] },
  ];
  return rows.filter((row) => row.value && row.value !== UNCONFIRMED);
}

// 단추 줄의 단추 하나. note는 단추 이름 뒤에 붙이는 글(어느 번호인지, 어느 곳인지)이다
export type PlaceLink = { kind: "guide" | "list" | "apply" | "phone" | "route"; note: string; url: string };

// 기관 세부 화면의 단추 줄: 공식 안내 → (신청 페이지) → 전화 → 길찾기.
// 공식 안내는 상세 안내 → 신청 페이지 → 기관 홈페이지 순서로 처음 있는 주소를 연다(목록 행은 신청 페이지가 먼저다).
// 전화번호가 둘이면 단추도 둘이다. 길찾기는 좌표가 있는 곳(venues)에만 나온다.
export function placeLinks(program: Program, venues: Venue[]): PlaceLink[] {
  const links: PlaceLink[] = [];
  const isList = program["종류"] === KIND_LIST;
  const columns = isList ? ["신청URL", "상세페이지URL", "홈페이지URL"] : ["상세페이지URL", "신청URL", "홈페이지URL"];
  const first = columns.map((column) => program[column]).find(Boolean) ?? "";
  if (first) links.push({ kind: isList ? "list" : "guide", note: "", url: first });
  if (!isList && program["신청URL"] && program["신청URL"] !== first) {
    links.push({ kind: "apply", note: "", url: program["신청URL"] });
  }
  const numbers = phones(program["공식연락처"]);
  for (const { number, shown } of numbers) {
    const note = numbers.length > 1 ? ` ${shown.split("(")[0].trim()}` : "";
    links.push({ kind: "phone", note, url: `tel:${number}` });
  }
  for (const venue of venues) {
    const note = venues.length > 1 ? ` (${venue.name})` : "";
    links.push({ kind: "route", note, url: routeUrl(venue) });
  }
  return links;
}

// 이 유형에 안내할 곳이 하나도 없는가. (먼저 골라야 해서 아직 안 보여 주는 경우는 아니다)
export function noPlace(result: TypeResult): boolean {
  return !result.needsChoice && result.contacts.length === 0 && result.lists.length === 0;
}

// 유형 하나의 화면(결과, 유형 소개, 기관 세부, 다른 곳 목록)이 함께 쓰는 것
export type PlaceContext = {
  result: TypeResult; // 그 유형의 기본 결과
  consults: Program[]; // 무엇이 맞을지 함께 찾아 주는 곳(일반 창구)
  places: Program[]; // 화면에 놓을 곳 전체. 문의할 곳 → 목록 순서이고, 둘 다 없으면 일반 창구다
};

// 저장해 두지 않고 화면을 그릴 때마다 답과 정보표에서 다시 만든다.
// profile을 주지 않으면(둘러보기) 성별·나이·일 여부로 거르지 않는다. 운영 중·종료일·유형 거르기는 똑같이 한다.
// 먼저 골라야 하는 유형(돌봄)은 고르기 전에 일반 창구로 대신하지 않는다.
export function placeContext(
  programs: Program[],
  types: TypeInfo[],
  typeId: string,
  details: Record<string, DetailAnswer>,
  when: Moment,
  profile?: Profile
): PlaceContext {
  const [result] = buildResult(programs, types, [typeId], details, when, profile);
  const consults = firstConsult(programs, when, profile);
  let places = [...result.contacts, ...result.lists];
  if (places.length === 0 && !result.needsChoice) places = consults;
  return { result, consults, places };
}
