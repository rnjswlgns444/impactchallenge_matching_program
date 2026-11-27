import { tasteSimulations, tasteFilms, text } from "@/content/text";
import type { Simulation } from "./simulation";
import type { Program } from "@/data/types";

export type TasteVideo = {
  title: string;
  url: string;
  by: string;
};

export type Taste = {
  ready: boolean;
  title: string | null;
  body: string | null;
  action: { kind: "screen" } | { kind: "link"; url: string; label?: string };
  activity: Simulation | null;
  relatedActivity: Simulation | null;
  videos: TasteVideo[];
};

const activities: Readonly<Partial<Record<string, Simulation>>> = tasteSimulations;
// 기존 추천 대상에는 없는 두 동네 활동을 관련 기관의 체험 화면 안에서 연다.
const related: Readonly<Partial<Record<string, keyof typeof tasteSimulations>>> = {
  L15: "C_BOOK",
  JOB08: "C_ECO",
};
const films: Readonly<Partial<Record<string, { id: string; title: string; by: string }>>> = tasteFilms;

// 기관 한 줄로만 정한다. 영상 주소에는 고정된 공개 영상 번호만 넣는다.
export function tasteOf(program: Program): Taste {
  const active = program["매칭가능"] === "Y";
  if (active && program.id === "L13") {
    return {
      ready: true,
      title: text.officialDigitalTitle,
      body: text.officialDigitalBody,
      action: { kind: "link", url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/1/dtl.do", label: text.officialDigitalButton },
      activity: null,
      relatedActivity: null,
      videos: [],
    };
  }
  const activity = active ? activities[program.id] ?? null : null;
  const relatedId = activity && related[program.id];
  const film = active ? films[program.id] : undefined;
  const videos = film ? [{
    title: film.title,
    by: film.by,
    url: `https://www.youtube-nocookie.com/embed/${film.id}?playsinline=1&rel=0`,
  }] : [];
  return {
    ready: Boolean(activity || film),
    title: activity?.title ?? film?.title ?? null,
    body: activity?.intro ?? (film ? text.tasteFilmBody : null),
    action: { kind: "screen" },
    activity,
    relatedActivity: relatedId ? tasteSimulations[relatedId] : null,
    videos,
  };
}
