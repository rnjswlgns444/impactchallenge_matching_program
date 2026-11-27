// '집에서 먼저 체험하기'에 무엇을 보여 줄지 정한다. 화면과 무관한 순수 함수만 둔다.
//
// 체험으로 치는 것은 둘뿐이다(11/28 결정).
// - 해 볼 것(tools): 기관·운영기관·정부가 만든, 집에서 직접 눌러 보는 공식 도구나 맛보기 강의
// - 영상(videos): 그 기관·운영기관·정부의 공식 채널이 올린 영상
// "설명 글 조금 + 사이트 주소"는 체험이 아니다. 둘 다 없는 기관은 ready가 false이고, 화면에 체험 카드를 그리지 않는다.
// 내용(제목·설명·주소)은 content/text.ts의 tasteTools·tasteFilms에 있다. 지어낸 장면과 방문연습은 넣지 않는다.

import { tasteFilms, tasteTools } from "@/content/text";
import type { Program } from "@/data/types";

export type TasteVideo = {
  title: string;
  url: string; // 앱 안에서 재생하는 주소
  by: string; // 올린 곳
};

export type TasteTool = {
  title: string;
  body: string; // 눌러서 무엇을 해 볼 수 있는지
  linkLabel: string; // 여는 단추의 글
  url: string;
  by: string; // 만든 곳
};

export type Taste = {
  ready: boolean; // 보여 줄 것이 하나라도 있는가
  tools: TasteTool[];
  videos: TasteVideo[];
};

const tools: Readonly<Partial<Record<string, readonly TasteTool[]>>> = tasteTools;
const films: Readonly<Partial<Record<string, { id: string; title: string; by: string }>>> = tasteFilms;

// 기관 한 줄로만 정한다(설문 답·사는 동은 받지 않는다). 영상 주소에는 고정된 공개 영상 번호만 넣는다.
export function tasteOf(program: Program): Taste {
  const active = program["매칭가능"] === "Y";
  const film = active ? films[program.id] : undefined;
  const found = active ? [...(tools[program.id] ?? [])] : [];
  const videos = film
    ? [{ title: film.title, by: film.by, url: `https://www.youtube-nocookie.com/embed/${film.id}?playsinline=1&rel=0` }]
    : [];
  return { ready: found.length > 0 || videos.length > 0, tools: found, videos };
}
