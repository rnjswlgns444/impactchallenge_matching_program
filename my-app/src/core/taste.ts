// '집에서 먼저 체험하기'에 무엇을 보여 줄지 정한다. 체험 기능을 잇는 곳은 이 파일 하나다.
//
// 지금은 모든 기관이 '준비 중'이다. 체험 기능은 동료가 만들어 넘겨주기로 했다(11/27).
// 받으면 tasteOf만 고친다.
// - 바깥 주소로 가는 체험이면 action을 { kind: "link", url }로 준다. 카드의 단추가 그 주소를 새 창으로 연다.
// - 우리 앱 안에서 하는 체험이면 action은 { kind: "screen" } 그대로 두고 ready만 true로 준다.
//   내용은 체험 화면(components/features/place/taste.tsx)에 끼운다.
//
// 지킬 것(11/27 결정):
// - 영상은 그 기관·운영기관·정부 채널이 올린 것만 넣고, 하나씩 다시 확인한다.
// - 공식 안내에 분명히 적힌 내용만 쓴다. 지어낸 인물·장면과 방문연습은 넣지 않는다.
// - 설문 답과 사는 동은 체험으로 넘기지 않는다. 받는 것은 기관 한 줄뿐이다.

import type { Program } from "@/data/types";

export type TasteVideo = {
  title: string;
  url: string;
  by: string; // 올린 곳(기관·운영기관·정부 채널)
};

export type Taste = {
  ready: boolean; // 체험할 것이 실제로 있는지. 없으면 체험 화면이 '준비 중'을 보여 준다
  title: string | null; // 없으면 공통 제목을 쓴다
  body: string | null; // 없으면 공통 설명을 쓴다
  action: { kind: "screen" } | { kind: "link"; url: string };
  videos: TasteVideo[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 체험이 들어오면 기관마다 다른 값을 준다
export function tasteOf(program: Program): Taste {
  return { ready: false, title: null, body: null, action: { kind: "screen" }, videos: [] };
}
