"use client";

import { useState } from "react";

import { now } from "@/core/clock";
import { placeContext, type PlaceContext } from "@/core/places";
import { appData } from "@/data";

import { useSurvey } from "./use-survey";

// 유형 하나의 화면(결과, 유형 소개, 기관 세부, 다른 곳 목록)이 쓰는 곳 목록.
// 저장해 두지 않고 그릴 때마다 답과 정보표에서 다시 만든다. 거르기는 모두 core/candidates.ts가 한다.
//
// browse가 참이면 둘러보기다: 설문 답이 없으니 성별·나이·일 여부로 거르지 않고, 둘러보기에서 고른 세부 답을 쓴다.
// useSurvey를 쓰므로 이 훅을 부르는 부품은 <Suspense> 안에 둔다.
export function usePlaceContext(typeId: string, browse: boolean): PlaceContext {
  const answers = useSurvey((state) => state.answers);
  const details = useSurvey((state) => (browse ? state.browseDetails : state.details));
  // 지금(한국 시각). 시각까지 넘겨야 종료시각이 지난 곳이 빠진다. 화면이 처음 그려질 때 한 번 읽는다
  const [when] = useState(now);
  return placeContext(appData.programs, appData.types, typeId, details, when, browse ? undefined : answers);
}
