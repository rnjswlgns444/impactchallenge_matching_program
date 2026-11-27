"use client";

import { appData } from "@/data";
import type { Dong } from "@/data/types";

import { useSurvey } from "./use-survey";

// 고른 동의 자료(기준점과 경계). 고르지 않았거나 자료에 없는 이름이면 null.
// 동은 기기 안에서 지도 그림과 거리에만 쓴다. 서버로 보내지 않는다.
// useSurvey를 쓰므로 <Suspense> 안에서 부른다.
export function useDong(): Dong | null {
  const name = useSurvey((state) => state.dong);
  return appData.dongs.find((dong) => dong.name === name) ?? null;
}
