"use client";

import { useEffect } from "react";

import type { PlaceContext } from "@/core/places";
import { scrub } from "@/core/privacy";
import { detailOf } from "@/core/selection";
import type { TypeInfo } from "@/data/types";
import { useSurveyStore, type AiState } from "@/stores/survey-store";

import { useSurvey } from "./use-survey";

// 결과 화면이 뜰 때, '물어야 함'이 켜져 있으면 AI 창구(/api/recommend)를 한 번 부른다.
// 답이 오면 저장소에 넣고 '물어야 함'을 끈다. 실패해도 fail로 넣어 기본 결과가 그대로 보이게 한다.
//
// 보내는 것은 넷뿐이다: 유형 id, 고른 세부 항목(마음·건강 유형은 보내지 않음), 개인정보 형태를 지운 글, 지금 후보의 id.
// 성별·태어난 해·일 여부와 설문 답은 보내지 않는다(서버도 다른 칸이 오면 받지 않는다).

const FAIL: AiState = { status: "fail", matches: [], unmatched: [] };

// 같은 물음을 두 번 보내지 않게 막는다(화면이 두 번 그려져도 요청은 한 번이다)
let asking = false;

export function useAiRequest(type: TypeInfo, context: PlaceContext): boolean {
  const pending = useSurvey((state) => state.aiPending);
  const candidates = context.pool.map((program) => program.id).join("|");

  useEffect(() => {
    if (!pending || asking) return;
    asking = true;
    const { wish, details, setAi } = useSurveyStore.getState();
    const detail = detailOf(type);
    const body = {
      typeId: type.id,
      // 남기지 않기로 한 세부 답(마음·건강)은 보내지 않는다
      detail: detail && detail.log_answer !== false ? (details[type.id] ?? null) : null,
      wish: scrub(wish),
      candidates: candidates ? candidates.split("|") : [],
    };
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => (response.ok ? response.json() : FAIL))
      .then((result: AiState) => setAi(result))
      .catch(() => setAi(FAIL))
      .finally(() => {
        asking = false;
      });
  }, [pending, type, candidates]);

  return pending; // 기다리는 중인지
}
