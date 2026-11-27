import { tasteActivities, tasteFilms, text } from "@/content/text";
import type { Program } from "@/data/types";

export type TasteVideo = {
  title: string;
  url: string;
  by: string;
};

export type TasteOption = {
  label: string;
  detail: string;
  linkLabel?: string;
  url?: string;
  items?: readonly string[];
};

export type TasteActivity = {
  title: string;
  body: string;
  prompt: string;
  mode: "choose" | "check";
  options: readonly TasteOption[];
  sourceLabel: string;
  sourceUrl: string;
};

export type Taste = {
  ready: boolean;
  title: string | null;
  body: string | null;
  action: { kind: "screen" } | { kind: "link"; url: string };
  activity: TasteActivity | null;
  videos: TasteVideo[];
};

const activities: Readonly<Partial<Record<string, TasteActivity>>> = tasteActivities;
const films: Readonly<Partial<Record<string, { id: string; title: string; by: string }>>> = tasteFilms;

// 기관 한 줄로만 정한다. 영상 주소에는 고정된 공개 영상 번호만 넣는다.
export function tasteOf(program: Program): Taste {
  const active = program["매칭가능"] === "Y";
  const activity = active ? activities[program.id] ?? null : null;
  const film = active ? films[program.id] : undefined;
  const videos = film ? [{
    title: film.title,
    by: film.by,
    url: `https://www.youtube-nocookie.com/embed/${film.id}?playsinline=1&rel=0`,
  }] : [];
  return {
    ready: Boolean(activity || film),
    title: activity?.title ?? film?.title ?? null,
    body: activity?.body ?? (film ? text.tasteFilmBody : null),
    action: { kind: "screen" },
    activity,
    videos,
  };
}
