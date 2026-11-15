"""AI 매칭: 지시문 조립 → AI 호출 → 답 검증 → 추천 단계 전체 결정.

AI는 코드가 걸러준 후보 안에서만 고른다. AI가 준 id는 후보 목록과 대조하고, 없는 id는 버린다.
결과 상태:
  ok     : 맞춤 찾기 성공
  A      : AI 호출이나 답 형식이 실패함 → 유형만으로 찾은 추천을 보여줌
  B      : 일부 희망에 맞는 후보가 없음 → 찾은 것과 상담 창구를 함께 보여줌
  C      : 후보가 0개 → 기본 창구 카드
  unsure : '잘 모르겠어요' → AI를 부르지 않고 상담 창구를 보여줌
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Callable

from .candidates import filter_candidates, first_consult, rank_default
from .loader import AppData
from .privacy import scrub

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
class Recommendation:
    status: str
    programs: list[dict] = field(default_factory=list)   # 추천 프로그램 (순서대로)
    reasons: dict[str, str] = field(default_factory=dict)  # 프로그램 id → AI가 쓴 추천 이유
    consults: list[dict] = field(default_factory=list)   # 함께 보여줄 상담 창구
    unmatched: list[str] = field(default_factory=list)   # 맞는 후보를 못 찾은 희망


def build_prompt(template: str, type_info: dict, wish_examples: list[str], wish_text: str,
                 candidates: list[dict], max_n: int) -> str:
    lines = []
    for p in candidates:
        lines.append(
            f"- id: {p['id']}\n  이름: {p['프로그램명']}\n  소개: {p['한줄설명']}\n"
            f"  자세한 내용: {p['상세설명']}\n  키워드: {p['키워드']}\n"
            f"  시간: {p['시간대']} / 비용: {p['비용']}"
        )
    values = {
        "{type_name}": type_info["name"],
        "{type_summary}": type_info["summary"],
        "{wish_examples}": ", ".join(wish_examples) or "(없음)",
        "{wish_text}": scrub(wish_text).strip() or "(없음)",
        "{candidates}": "\n".join(lines),
        "{max_n}": str(max_n),
    }
    prompt = template
    for placeholder, value in values.items():
        prompt = prompt.replace(placeholder, value)
    return prompt


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


def recommend(data: AppData, type_code: str, wish_examples: list[str], wish_text: str, unsure: bool,
              call_llm: Callable[[str], str] | None, on_error: Callable[[str], None] = lambda kind: None,
              ) -> Recommendation:
    """추천 단계 전체. call_llm은 지시문을 받아 AI의 답(글)을 돌려주는 함수다. 없으면 실패 A가 된다."""
    type_info = data.types[type_code]
    top_n = int(data.settings.get("top_n", 3))
    candidates = filter_candidates(data.programs, type_info["tags"])
    consults = first_consult(data.programs, candidates)

    if not candidates:
        return Recommendation("C")
    if unsure:
        rest = [p for p in rank_default(candidates, type_info["tags"], [], top_n) if p not in consults]
        return Recommendation("unsure", programs=(consults + rest)[:top_n])

    default = rank_default(candidates, type_info["tags"], wish_examples, top_n)
    by_id = {p["id"]: p for p in candidates}
    try:
        if call_llm is None:
            raise RuntimeError("API 키 없음")
        prompt = build_prompt(data.prompt, type_info, wish_examples, wish_text, candidates, top_n)
        matches, unmatched = parse_answer(call_llm(prompt), list(by_id), top_n)
        if not matches and not unmatched:
            raise ValueError("고른 프로그램이 없음")
    except Exception as err:  # 어떤 실패든 사용자에게는 실패 A로 알린다
        on_error(type(err).__name__)
        return Recommendation("A", programs=default)

    programs = [by_id[m["id"]] for m in matches]
    reasons = {m["id"]: m["reason"] for m in matches}
    if unmatched:
        extra = [p for p in consults if p not in programs]
        return Recommendation("B", programs=programs, reasons=reasons, consults=extra, unmatched=unmatched)
    return Recommendation("ok", programs=programs, reasons=reasons)


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
