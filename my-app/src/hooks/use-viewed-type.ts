"use client";

import { useSearchParams } from "next/navigation";

import { CHOOSE } from "@/core/scoring";
import { getType } from "@/data";
import type { TypeInfo } from "@/data/types";
import { isComplete, judge, resumeHref } from "@/lib/session";

import { useSurvey } from "./use-survey";

// 기관 세부와 다른 곳 목록 화면이 '어느 유형을 보고 있는지' 알아낸다.
// - 주소에 type이 있으면 둘러보기에서 온 것이다(설문 답을 보지 않는다).
// - 없으면 설문 결과에서 온 것이다. 답에서 대표 유형을 다시 판정한다.
// 보여 줄 수 없으면 갈 곳(to)을 돌려준다. useSurvey를 쓰므로 <Suspense> 안에서 부른다.

export type Viewed =
  | { ok: true; type: TypeInfo; browse: boolean }
  | { ok: false; to: string };

export function useViewedType(): Viewed {
  const answers = useSurvey((state) => state.answers);
  const browseId = useSearchParams().get("type");

  if (browseId !== null) {
    const type = getType(browseId);
    return type ? { ok: true, type, browse: true } : { ok: false, to: "/browse" };
  }
  if (!isComplete(answers)) return { ok: false, to: resumeHref(answers) };
  const judged = judge(answers);
  const type = judged.primary ? getType(judged.primary) : undefined;
  if (judged.state === CHOOSE || !type) return { ok: false, to: "/pick" };
  return { ok: true, type, browse: false };
}
