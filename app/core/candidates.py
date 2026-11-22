"""프로그램 정보표에서 유형별 후보를 거르고 순서를 정한다. 화면과 무관한 순수 함수만 둔다.

거르기는 반드시 여기서만 한다. 운영이 끝났거나, 55~64세가 참여할 수 없거나, 날짜가 지났거나,
답한 성별·나이·일 여부가 대상 조건에 맞지 않는 프로그램이 화면이나 AI에게 넘어가지 않게 하기 위해서다.
AI 없이 이 파일만으로 기본 결과가 나온다.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime

from . import clock
from .loader import KIND_ALWAYS, KIND_LIST, KIND_PERIOD, NATIONWIDE, UNCONFIRMED, split_multi
from .selection import AGE_MAX_COLUMN, AGE_MIN_COLUMN, AGE_Q, PROFILE_CHOICES, chosen_detail_options, detail_of

KIND_ORDER = {KIND_ALWAYS: 0, KIND_PERIOD: 1}   # 언제든 문의할 수 있는 곳을 먼저


def today_kst() -> date:
    """한국 시각의 오늘 날짜."""
    return clock.now().date()


@dataclass
class TypeResult:
    """유형 하나의 기본 결과."""
    type_id: str
    contacts: list[dict] = field(default_factory=list)   # 지금 문의할 수 있는 곳 (순서대로)
    lists: list[dict] = field(default_factory=list)      # 목록에서 직접 찾아볼 곳


def _still_open(program: dict, day: str, time: str) -> bool:
    """표시종료일(과 종료시각)이 아직 지나지 않았는지. day는 '2026-11-19', time은 '14:00' 꼴이거나 빈 글자다."""
    end = program["표시종료일"]
    if not end or end > day:
        return True
    if end < day:
        return False
    # 종료일 당일: 시각을 모르거나(날짜만 넘겨받음) 종료시각이 비어 있으면 그날 끝까지 보여준다
    return not (time and program["종료시각"] and time >= program["종료시각"])


def fits_profile(program: dict, profile: dict | None) -> bool:
    """답한 성별·나이·일 여부가 이 프로그램의 대상 조건에 맞는지.

    profile은 설문 답({문항 id: 답})이다. 그 자리에서 견주기만 하고 어디에도 남기지 않는다.
    조건 칸이 비어 있으면 '조건 없음'이고, 답이 없으면(설문 없이 둘러볼 때) 거르지 않는다.
    """
    answers = profile or {}
    for question_id, column, _ in PROFILE_CHOICES:
        allowed = split_multi(program[column])
        if allowed and answers.get(question_id) is not None and answers[question_id] not in allowed:
            return False
    age = answers.get(AGE_Q)
    if type(age) is int:
        low, high = program[AGE_MIN_COLUMN], program[AGE_MAX_COLUMN]
        if (low and age < int(low)) or (high and age > int(high)):
            return False
    return True


def eligible(programs: list[dict], today: date | datetime, profile: dict | None = None) -> list[dict]:
    """지금 보여줘도 되는 프로그램: 매칭가능 Y, 55~64세 참여 불가가 아님, 표시종료일·종료시각이 지나지 않음,
    그리고 profile(설문 답)을 주면 성별·나이·일 여부가 대상 조건에 맞음.

    today에 날짜만 주면 날짜로만 판단한다. 시각까지 주면(clock.now()) 종료일 당일의 종료시각부터 뺀다.
    시각은 clock.now()처럼 시간대가 붙은 것을 넘긴다. 시간대가 없는 시각은 바꾸지 않고 한국 시각으로 본다.
    """
    time = ""
    if isinstance(today, datetime):
        local = today.astimezone(clock.KST) if today.tzinfo else today
        time, today = local.strftime("%H:%M"), local.date()
    day = today.isoformat()
    return [
        p for p in programs
        if p["매칭가능"] == "Y" and p["55~64세참여"] != "불가" and _still_open(p, day, time)
        and fits_profile(p, profile)
    ]


def _matches(program: dict, rule: dict | None) -> bool:
    """규칙 {열 이름: [값]} 가운데 하나라도 프로그램에 해당하는지."""
    return any(program.get(column) in values for column, values in (rule or {}).items())


def for_type(programs: list[dict], type_info: dict, detail_answer, today: date,
             profile: dict | None = None) -> TypeResult:
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
        p for p in eligible(programs, today, profile)
        if type_info["id"] in split_multi(p["유형태그"])
        and not any(_matches(p, opt.get("exclude")) for opt in chosen)
    ]
    candidates.sort(key=sort_key)
    return TypeResult(
        type_info["id"],
        contacts=[p for p in candidates if p["종류"] != KIND_LIST],
        lists=[p for p in candidates if p["종류"] == KIND_LIST],
    )


def build_result(programs: list[dict], types: dict[str, dict], type_ids: list[str],
                 details: dict, today: date, profile: dict | None = None) -> list[TypeResult]:
    """고른 유형마다 기본 결과를 만든다. details는 {유형 id: 세부 질문의 답}, profile은 설문 답이다."""
    return [for_type(programs, types[tid], details.get(tid), today, profile) for tid in type_ids]


def ai_pool(programs: list[dict], types: dict[str, dict], type_ids: list[str],
            details: dict, today: date, profile: dict | None = None) -> list[dict]:
    """AI에게 보낼 후보. AI는 이 목록 안에서만 고를 수 있다.

    유형을 골랐으면 그 유형들의 '문의할 곳'을 합친 것이다(세부 질문으로 뺀 것은 여기서도 빠진다).
    유형을 정하지 않았으면 지금 보여줘도 되는 곳 전체다. 목록(강좌 목록 등)은 넣지 않는다.
    """
    if not type_ids:
        return [p for p in eligible(programs, today, profile) if p["종류"] != KIND_LIST]
    pool: dict[str, dict] = {}
    for result in build_result(programs, types, type_ids, details, today, profile):
        for program in result.contacts:
            pool.setdefault(program["id"], program)
    return list(pool.values())


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


def first_consult(programs: list[dict], today: date, profile: dict | None = None) -> list[dict]:
    """무엇이 맞을지 함께 찾아 주는 일반 창구(첫상담 = Y). 유형과 상관없이 안내할 수 있는 곳이다."""
    return [p for p in eligible(programs, today, profile) if p["첫상담"] == "Y"]
