// '집에서 먼저 체험하기'에 무엇을 보여 줄지 정한다. 화면과 무관한 순수 함수만 둔다.
//
// 체험으로 치는 것은 넷이다(11/28 결정).
// - 해 볼 것(tools): 기관·운영기관·정부가 만든, 집에서 직접 눌러 보는 공식 도구나 맛보기 강의
// - 연습(practice): 그 기관·프로그램이 실제로 하는 일을 본떠 팀이 만든 연습. 실제로 하지 않는 일은 넣지 않는다
// - 영상(videos): 그 기관·운영기관·정부의 공식 채널이 올린 영상
// - 사진(photos): 실제 수업·행사 사진이 보이는 공식 페이지
// "설명 글 조금 + 사이트 주소"는 체험이 아니다. 하나도 없는 기관은 ready가 false이고, 화면에 체험 카드를 그리지 않는다.
// 내용은 content/text.ts의 tasteTools·tastePractices·tasteFilms·tastePhotos에 있다.
// 연습의 본문(content/practice.ts)은 크기가 커서 여기서 읽지 않는다. 체험 화면이 연습을 열 때만 불러온다.

import { tasteFilms, tastePhotos, tastePractices, tasteTools } from "@/content/text";
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

// 팀이 만든 연습. 본문은 content/practice.ts의 같은 id에 있다
export type TastePractice = { id: string; title: string; body: string };

// 실제 활동 사진이 보이는 공식 페이지
export type TastePhoto = { title: string; body: string; url: string; by: string };

export type Taste = {
  ready: boolean; // 보여 줄 것이 하나라도 있는가
  tools: TasteTool[];
  practice: TastePractice | null;
  videos: TasteVideo[];
  photos: TastePhoto[];
};

const practices: Readonly<Partial<Record<string, { title: string; body: string }>>> = tastePractices;
const photoPages: Readonly<Partial<Record<string, readonly TastePhoto[]>>> = tastePhotos;

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
  const made = active ? practices[program.id] : undefined;
  const practice = made ? { id: program.id, ...made } : null;
  const photos = active ? [...(photoPages[program.id] ?? [])] : [];
  const ready = found.length > 0 || practice !== null || videos.length > 0 || photos.length > 0;
  return { ready, tools: found, practice, videos, photos };
}

// 체험을 무엇이라 부를지: 해 볼 것이나 연습이 있으면 'do', 영상만 있으면 'video', 사진만 있으면 'photo'
export function tasteKind(taste: Taste): "do" | "video" | "photo" {
  if (taste.tools.length > 0 || taste.practice) return "do";
  return taste.videos.length > 0 ? "video" : "photo";
}
