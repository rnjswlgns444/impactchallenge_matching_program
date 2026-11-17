"""AI 매칭에 쓰는 부품: AI 답 검증과 AI 호출 함수.

AI는 코드가 걸러준 후보 안에서만 고른다. AI가 준 id는 후보 목록과 대조하고, 없는 id는 버린다.
기본 결과는 AI 없이 candidates.py가 만든다. 주관식을 적은 사람에게만 하는 AI 추가 추천은
다음 단계에서 이 파일에 더한다(지시문 조립과 추천 흐름).
"""
from __future__ import annotations

import json
from typing import Callable

ANSWER_SCHEMA = {
    "type": "object",
    "properties": {
        "matches": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"id": {"type": "string"}, "reason": {"type": "string"}},
                "required": ["id", "reason"],
                "additionalProperties": False,
            },
        },
        "unmatched": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["matches", "unmatched"],
    "additionalProperties": False,
}


def parse_answer(raw: str, candidate_ids: list[str], max_n: int):
    """AI 답을 읽고 후보에 없는 id를 버린다. 형식이 틀리면 ValueError."""
    start, end = raw.find("{"), raw.rfind("}")
    if start < 0 or end < 0:
        raise ValueError("JSON이 없음")
    data = json.loads(raw[start:end + 1])
    matches, seen = [], set()
    for item in data.get("matches") or []:
        pid = str(item.get("id", "")).strip()
        if pid in candidate_ids and pid not in seen:
            seen.add(pid)
            matches.append({"id": pid, "reason": str(item.get("reason", "")).strip()})
    unmatched = [str(x).strip() for x in data.get("unmatched") or [] if str(x).strip()]
    return matches[:max_n], unmatched


def make_anthropic_caller(api_key: str, model: str, effort: str, timeout: float) -> Callable[[str], str]:
    """Claude API를 부르는 함수를 만든다. 답은 JSON 형식으로 강제한다."""
    import anthropic

    client = anthropic.Anthropic(api_key=api_key, timeout=timeout, max_retries=1)

    def call(prompt: str) -> str:
        response = client.beta.messages.create(
            model=model,
            max_tokens=8000,
            # 안전 분류기가 요청을 거절하면 다른 모델로 자동으로 다시 시도한다
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": effort, "format": {"type": "json_schema", "schema": ANSWER_SCHEMA}},
            messages=[{"role": "user", "content": prompt}],
        )
        if response.stop_reason in ("refusal", "max_tokens"):
            raise RuntimeError(f"stop_reason={response.stop_reason}")
        return next(block.text for block in response.content if block.type == "text")

    return call


def make_gemini_caller(api_key: str, model: str, effort: str, timeout: float) -> Callable[[str], str]:
    """Google Gemini API를 부르는 함수를 만든다. 답은 JSON 형식으로 강제한다."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=int(timeout * 1000)))
    schema = {
        "type": "object",
        "properties": {
            "matches": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"id": {"type": "string"}, "reason": {"type": "string"}},
                    "required": ["id", "reason"],
                },
            },
            "unmatched": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["matches", "unmatched"],
    }

    def call(prompt: str) -> str:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": schema,
                # 생각하는 깊이. 기본값(medium)은 답이 늦어 시간 초과가 났다
                "thinking_config": {"thinking_level": effort},
            },
        )
        if not response.text:
            raise RuntimeError("빈 답")
        return response.text

    return call


def make_caller(provider: str, api_key: str, model: str, effort: str, timeout: float) -> Callable[[str], str]:
    """settings.yaml의 llm.provider에 맞는 호출 함수를 만든다."""
    if provider == "gemini":
        return make_gemini_caller(api_key, model, effort, timeout)
    return make_anthropic_caller(api_key, model, effort, timeout)
