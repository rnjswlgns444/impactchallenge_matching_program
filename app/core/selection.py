"""응답을 유형과 안내로 바꾼다. 화면과 무관한 순수 함수만 둔다.

유형은 점수로 판정하지 않는다. 첫 질문(Q_NEEDS)에서 고른 문장이 그대로 유형이 되고, 고른 유형은 모두 유지한다.
걸림돌(Q_BARRIER)과 시작 방식(Q_START)은 유형을 바꾸지 않고, 결과 카드에서 무엇을 먼저 보여줄지만 정한다.

answers는 {문항 id: 답} 사전이다. 복수 선택은 선택지 id 목록, 단일 선택은 선택지 id 하나(건너뛰면 None)다.
"""
from __future__ import annotations

TYPE_Q = "Q_NEEDS"
BARRIER_Q = "Q_BARRIER"
START_Q = "Q_START"
PRIORITY_Q = "Q_PRIORITY"
FREE_Q = "Q_FREE"


def question(questions: list[dict], question_id: str) -> dict:
    return next(q for q in questions if q["id"] == question_id)


def options_of(q: dict, types: dict[str, dict], type_ids: list[str] | None = None) -> list[dict]:
    """문항의 선택지. options_from이 있으면 유형에서 만든 선택지를 앞에 붙인다."""
    made: list[dict] = []
    if q.get("options_from") == "types":
        made = [{"id": t["id"], "label": t["statement"], "area": t.get("area")} for t in types.values()]
    elif q.get("options_from") == "selected_types":
        made = [{"id": tid, "label": types[tid]["name"]} for tid in type_ids or []]
    return made + list(q.get("options") or [])


def survey_questions(questions: list[dict]) -> list[dict]:
    """설문 화면에서 차례로 묻는 문항. 결과 화면에서 묻는 문항(where: result)은 뺀다."""
    return [q for q in questions if q.get("where") != "result"]


def next_question(answers: dict, questions: list[dict]) -> dict | None:
    """다음에 물을 문항. 다 물었으면 None. 건너뛴 문항도 answers에 키가 있으면 물은 것으로 본다."""
    for q in survey_questions(questions):
        if q["id"] not in answers:
            return q
    return None


def toggle(selected: list[str], option_id: str, options: list[dict]) -> list[str]:
    """복수 선택에서 선택지 하나를 눌렀을 때의 새 선택 목록.

    '아직 모르겠어요' 같은 배타 선택지는 다른 선택지와 함께 고를 수 없다.
    """
    if option_id in selected:
        return [x for x in selected if x != option_id]
    exclusive = {opt["id"] for opt in options if opt.get("exclusive")}
    if option_id in exclusive:
        return [option_id]
    return [x for x in selected if x not in exclusive] + [option_id]


def selected_types(answers: dict, types: dict[str, dict]) -> list[str]:
    """고른 유형 id 목록(types.yaml에 적힌 순서). 비었거나 '아직 모르겠어요'면 빈 목록이다.

    빈 목록은 '유형을 정하지 않고 전체를 둘러본다'는 뜻이다. 임의로 유형을 붙이지 않는다.
    """
    chosen = set(answers.get(TYPE_Q) or [])
    return [tid for tid in types if tid in chosen]


def ordered_types(type_ids: list[str], priority: str | None) -> list[str]:
    """먼저 보겠다고 고른 유형을 맨 앞으로 옮긴다. 다른 유형은 지우지 않는다."""
    if priority in type_ids:
        return [priority] + [tid for tid in type_ids if tid != priority]
    return list(type_ids)


def barrier_guides(answers: dict, questions: list[dict]) -> list[dict]:
    """고른 걸림돌 가운데 카드에 안내할 것. 각 항목에 label, show(먼저 보여줄 열), ask(물어볼 문장)가 있다."""
    chosen = answers.get(BARRIER_Q) or []
    options = question(questions, BARRIER_Q).get("options") or []
    return [opt for opt in options if opt["id"] in chosen and (opt.get("show") or opt.get("ask"))]


def card_part_to_open(answers: dict, questions: list[dict]) -> str | None:
    """Q_START 답에 따라 카드에서 먼저 펼칠 곳(about / ask / contact). 정해지지 않으면 None."""
    chosen = answers.get(START_Q)
    for opt in question(questions, START_Q).get("options") or []:
        if opt["id"] == chosen:
            return opt.get("open")
    return None


def detail_of(type_info: dict) -> dict | None:
    """유형의 세부 질문. 없거나 꺼 두었으면(enabled: false) None."""
    detail = type_info.get("detail")
    if not detail or detail.get("enabled") is False:
        return None
    return detail


def chosen_detail_options(type_info: dict, detail_answer) -> list[dict]:
    """세부 질문에서 고른 선택지. '아직 모르겠어요'(배타 선택지)는 고르지 않은 것으로 본다."""
    detail = detail_of(type_info)
    if not detail or not detail_answer:
        return []
    chosen = detail_answer if isinstance(detail_answer, list) else [detail_answer]
    return [opt for opt in detail["options"] if opt["id"] in chosen and not opt.get("exclusive")]
