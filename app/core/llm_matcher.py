"""AI 추가 추천: 지시문 조립 → AI 호출 → 답 검증.

기본 결과는 AI 없이 candidates.py가 만든다. 여기서는 주관식(Q_FREE)을 적은 사람에게만,
코드가 걸러준 후보(candidates.ai_pool) 안에서 글과 관련된 곳을 골라 이유와 함께 덧붙인다.
AI가 준 id는 후보 목록과 대조하고, 없는 id는 버린다. 유형은 AI가 정하지 않는다.
결과 상태:
  ok      : 글에 맞는 곳을 찾음
  partial : 일부(또는 전부)에 맞는 후보가 없음 → 찾은 것과 일반 창구를 함께 보여줌
  fail    : AI 호출이나 답 형식이 실패함 → 기본 결과만 보여줌
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Callable

from .privacy import scrub

NO_TYPE = "(정하지 않음)"
NOTHING = "(없음)"
NO_KEY = "API 키 없음"

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


@dataclass
class AiResult:
    status: str
    matches: list[dict] = field(default_factory=list)     # [{"id": 프로그램 id, "reason": 추천 이유}] 순서대로
    unmatched: list[str] = field(default_factory=list)    # 맞는 후보를 찾지 못한 내용
    error: str = ""                                       # fail의 원인 종류 (점검용, 사용자 글은 담지 않음)


def build_prompt(template: str, type_infos: list[dict], wish_examples: list[str], wish_text: str,
                 pool: list[dict], max_n: int) -> str:
    """지시문의 자리표시자를 채운다. 사용자 글은 전화번호·이메일을 지운 뒤에만 들어간다."""
    lines = []
    for p in pool:
        lines.append(
            f"- id: {p['id']}\n  이름: {p['프로그램명']} ({p['기관명']})\n  소개: {p['한줄설명']}\n"
            f"  자세한 내용: {p['상세설명']}\n  키워드: {p['키워드']}\n"
            f"  대상: {p['대상']} / 시간: {p['시간대']} / 비용: {p['비용']}"
        )
    values = {
        "{type_name}": ", ".join(t["name"] for t in type_infos) or NO_TYPE,
        "{type_summary}": " / ".join(t["statement"] for t in type_infos) or NO_TYPE,
        "{wish_examples}": ", ".join(wish_examples) or NOTHING,
        "{wish_text}": scrub(wish_text).strip() or NOTHING,
        "{candidates}": "\n".join(lines),
        "{max_n}": str(max_n),
    }
    # 한 번에 바꾼다. 사용자 글에 자리표시자 모양의 글자가 있어도 다시 바뀌지 않는다.
    pattern = re.compile("|".join(re.escape(key) for key in values))
    return pattern.sub(lambda m: values[m.group(0)], template)


def error_kind(err: Exception) -> str:
    """오류의 종류만 남긴다. API 오류면 상태 코드(예: 429)를 붙인다. 오류 메시지는 담지 않는다."""
    code = getattr(err, "code", None)
    status = getattr(err, "status_code", None) or getattr(err, "status", None)
    return type(err).__name__ + (f":{code}" if code else "") + (f":{status}" if status else "")


def recommend(template: str, type_infos: list[dict], wish_examples: list[str], wish_text: str,
              pool: list[dict], max_n: int, call_llm: Callable[[str], str] | None) -> AiResult:
    """주관식에 맞는 곳을 후보(pool) 안에서 고른다. call_llm은 지시문을 받아 AI의 답(글)을 돌려주는 함수다.

    call_llm이 None이면(API 키 없음) fail이다. 어떤 예외가 나도 밖으로 던지지 않고 fail로 돌려준다.
    """
    if not pool:
        return AiResult("partial")
    if call_llm is None:
        return AiResult("fail", error=NO_KEY)
    try:
        prompt = build_prompt(template, type_infos, wish_examples, wish_text, pool, max_n)
        matches, unmatched = parse_answer(call_llm(prompt), [p["id"] for p in pool], max_n)
    except Exception as err:  # 어떤 실패든 기본 결과는 그대로 보여줘야 한다
        return AiResult("fail", error=error_kind(err))
    if matches and not unmatched:
        return AiResult("ok", matches=matches)
    return AiResult("partial", matches=matches, unmatched=unmatched)


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
