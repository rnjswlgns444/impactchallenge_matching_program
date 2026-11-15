"""프로그램 정보표에서 추천 후보를 거른다. 화면과 무관한 순수 함수만 둔다.

거르기는 반드시 여기서만 한다. 운영이 끝났거나 55~64세가 참여할 수 없는 프로그램이
화면이나 AI에게 넘어가지 않게 하기 위해서다.
"""
from __future__ import annotations

from .loader import split_multi


def eligible(programs: list[dict]) -> list[dict]:
    """지금 운영 중이고 55~64세가 참여할 수 있는 프로그램."""
    return [p for p in programs if p["매칭가능"] == "Y" and p["55~64세참여"] != "불가"]


def filter_candidates(programs: list[dict], type_tags: list[str]) -> list[dict]:
    """참여 가능한 프로그램 중 유형 태그가 하나라도 겹치는 것."""
    tags = set(type_tags)
    return [p for p in eligible(programs) if tags & set(split_multi(p["유형태그"]))]


def first_consult(programs: list[dict], candidates: list[dict]) -> list[dict]:
    """처음 찾아가기 좋은 상담 창구. 후보 안에 있으면 그것을, 없으면 참여 가능한 전체에서 찾는다."""
    in_candidates = [p for p in candidates if p["첫상담"] == "Y"]
    return in_candidates or [p for p in eligible(programs) if p["첫상담"] == "Y"]


def rank_default(candidates: list[dict], type_tags: list[str], wishes: list[str], top_n: int) -> list[dict]:
    """AI 없이 유형과 고른 예시만으로 순서를 정한다.

    1) 유형 태그가 많이 겹치는 순 2) 키워드가 고른 예시와 많이 겹치는 순 3) id 순
    """
    tags = set(type_tags)
    wish_text = " ".join(wishes)

    def sort_key(program: dict):
        tag_overlap = len(tags & set(split_multi(program["유형태그"])))
        keyword_overlap = sum(1 for kw in split_multi(program["키워드"]) if kw in wish_text)
        return (-tag_overlap, -keyword_overlap, program["id"])

    return sorted(candidates, key=sort_key)[:top_n]
