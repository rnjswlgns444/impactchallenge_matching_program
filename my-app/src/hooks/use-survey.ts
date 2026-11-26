"use client";

import { use } from "react";
import { browser } from "react-dom";

import { useSurveyStore, type SurveyState } from "@/stores/survey-store";

// 화면이 그리는 중에 답을 읽는 유일한 길.
// 답은 브라우저에만 있으므로, 빌드(서버)에서는 여기서 멈추고
// 가장 가까운 <Suspense>의 fallback(뼈대 그림)이 대신 그려진다.
// 그래서 이 훅을 쓰는 부품은 꼭 <Suspense> 안에 둔다.
//
// selector는 원시값이나 저장소에 이미 있는 참조만 돌려준다(새 객체·배열 금지).
export function useSurvey<T>(selector: (state: SurveyState) => T): T {
  use(browser("설문 답은 브라우저의 sessionStorage에만 있다"));
  return useSurveyStore(selector);
}
