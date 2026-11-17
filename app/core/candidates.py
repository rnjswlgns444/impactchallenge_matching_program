"""프로그램 정보표에서 유형별 후보를 거르고 순서를 정한다. 화면과 무관한 순수 함수만 둔다.

거르기는 반드시 여기서만 한다. 운영이 끝났거나, 55~64세가 참여할 수 없거나, 날짜가 지난 프로그램이
화면이나 AI에게 넘어가지 않게 하기 위해서다. AI 없이 이 파일만으로 기본 결과가 나온다.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone

from .loader import split_multi
from .selection import chosen_detail_options, detail_of

LIST_KIND = "목록"
KIND_ORDER = {"상시서비스": 0, "기간프로그램": 1}   # 언제든 문의할 수 있는 곳을 먼저
UNCONFIRMED = "미확인"
NATIONWIDE = "전국"
KST = timezone(timedelta(hours=9))


def today_kst() -> date:
    """한국 시각의 오늘 날짜."""
    return datetime.now(KST).date()


@dataclass
class TypeResult:
    """유형 하나의 기본 결과."""
    type_id: str
    contacts: list[dict] = field(default_factory=list)   # 지금 문의할 수 있는 곳 (순서대로)
    lists: list[dict] = field(default_factory=list)      # 목록에서 직접 찾아볼 곳


def eligible(programs: list[dict], today: date) -> list[dict]:
    """지금 보여줘도 되는 프로그램: 매칭가능 Y, 55~64세 참여 불가가 아님, 표시종료일이 지나지 않음."""
    limit = today.isoformat()
    return [
        p for p in programs
        if p["매칭가능"] == "Y" and p["55~64세참여"] != "불가" and (not p["표시종료일"] or p["표시종료일"] >= limit)
    ]


def _matches(program: dict, rule: dict | None) -> bool:
    """규칙 {열 이름: [값]} 가운데 하나라도 프로그램에 해당하는지."""
    return any(program.get(column) in values for column, values in (rule or {}).items())


def for_type(programs: list[dict], type_info: dict, detail_answer, today: date) -> TypeResult:
    """유형 하나의 후보를 '문의할 곳'과 '목록'으로 나눠 돌려준다.

    세부 질문의 규칙: 고른 선택지의 exclude에 해당하면 빼고, first에 해당하면 앞으로 가져온다.
    세부 질문의 last에 해당하는 프로그램은 (first로 가져오지 않는 한) 맨 뒤로 보낸다. 답하지 않아도 적용된다.
    순서: 앞으로 가져온 것 → 안산에 있는 곳 → 세부태그가 많이 겹치는 순 → 상시서비스 → id. 인기순이 아니다.
    """
    detail = detail_of(type_info)
    chosen = chosen_detail_options(type_info, detail_answer)
    chosen_tags = {f"{detail['id']}.{opt['id']}" for opt in chosen} if detail else set()

    def place(program: dict) -> int:
        if any(_matches(program, opt.get("first")) for opt in chosen):
            return -1
        return 1 if detail and _matches(program, detail.get("last")) else 0

    def sort_key(program: dict):
        overlap = len(chosen_tags & set(split_multi(program["세부태그"])))
        nationwide = program["범위"] == NATIONWIDE     # 전국 전화 창구는 안산 기관 뒤에
        return (place(program), nationwide, -overlap, KIND_ORDER.get(program["종류"], 2), program["id"])

    candidates = [
        p for p in eligible(programs, today)
        if type_info["id"] in split_multi(p["유형태그"])
        and not any(_matches(p, opt.get("exclude")) for opt in chosen)
    ]
    candidates.sort(key=sort_key)
    return TypeResult(
        type_info["id"],
        contacts=[p for p in candidates if p["종류"] != LIST_KIND],
        lists=[p for p in candidates if p["종류"] == LIST_KIND],
    )


def build_result(programs: list[dict], types: dict[str, dict], type_ids: list[str],
                 details: dict, today: date) -> list[TypeResult]:
    """고른 유형마다 기본 결과를 만든다. details는 {유형 id: 세부 질문의 답}이다."""
    return [for_type(programs, types[tid], details.get(tid), today) for tid in type_ids]


def unconfirmed_columns(program: dict, type_info: dict) -> list[str]:
    """이 유형의 세부 규칙이 보는 열 가운데 값이 '미확인'인 열.

    예) 보탬활동형은 보수를 본다. 보수가 미확인인 프로그램은 빼지 않고 '확인이 필요하다'고 표시한다.
    """
    detail = detail_of(type_info)
    if not detail:
        return []
    columns = set(detail.get("last") or {})
    for opt in detail["options"]:
        columns |= set(opt.get("exclude") or {}) | set(opt.get("first") or {})
    return sorted(c for c in columns if program.get(c) == UNCONFIRMED)


def first_consult(programs: list[dict], today: date) -> list[dict]:
    """무엇이 맞을지 함께 찾아 주는 일반 창구(첫상담 = Y). 유형과 상관없이 안내할 수 있는 곳이다."""
    return [p for p in eligible(programs, today) if p["첫상담"] == "Y"]
