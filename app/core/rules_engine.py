"""rules.yaml의 규칙을 적용해 응답을 유형으로 바꾼다. 화면과 무관한 순수 함수만 둔다.

answers는 {문항 id: 선택지 id} 사전이다.
판정 순서: 예외 규칙(overrides) → 점수가 높은 쪽 → 동점 규칙(tie_break).
동점 규칙이 ask면 그 축의 추가 문항을 보여주고, 그 답까지 더해 다시 계산한다.
추가 문항 뒤에도 동점이면 축의 첫 번째 pole로 정한다.
"""
from __future__ import annotations


def _axis_poles(rules: dict) -> dict[str, list[str]]:
    return {axis["id"]: [p["code"] for p in axis["poles"]] for axis in rules["axes"]}


def _tie_axis(question: dict) -> str | None:
    return (question.get("show_when") or {}).get("tie")


def compute_scores(option_ids, rules: dict) -> dict[str, dict[str, int]]:
    """고른 선택지들로 축마다 양쪽 점수를 더한다."""
    scores = {axis: {pole: 0 for pole in poles} for axis, poles in _axis_poles(rules).items()}
    table = rules.get("scores") or {}
    for opt_id in option_ids:
        for axis, value in (table.get(opt_id) or {}).items():
            points = value if isinstance(value, dict) else {value: 1}
            for pole, n in points.items():
                scores[axis][pole] += n
    return scores


def apply_overrides(answers: dict, rules: dict) -> dict[str, str]:
    """조건이 모두 맞는 예외 규칙의 결과를 모은다."""
    fixed: dict[str, str] = {}
    for rule in rules.get("overrides") or []:
        if all(answers.get(qid) == opt for qid, opt in (rule.get("if") or {}).items()):
            fixed.update(rule.get("then") or {})
    return fixed


def _base_questions(questions: list[dict]) -> list[dict]:
    return [q for q in questions if not _tie_axis(q)]


def axes_needing_ask(answers: dict, questions: list[dict], rules: dict) -> list[str]:
    """기본 문항 답만으로 계산했을 때 동점이고, 동점 규칙이 ask인 축."""
    base = _base_questions(questions)
    if any(q["id"] not in answers for q in base):
        return []
    scores = compute_scores([answers[q["id"]] for q in base], rules)
    fixed = apply_overrides(answers, rules)
    result = []
    for axis, poles in _axis_poles(rules).items():
        tied = scores[axis][poles[0]] == scores[axis][poles[1]]
        if tied and axis not in fixed and (rules.get("tie_break") or {}).get(axis) == "ask":
            result.append(axis)
    return result


def active_questions(answers: dict, questions: list[dict], rules: dict) -> list[dict]:
    """지금까지의 답을 기준으로 물어야 하는 문항 전체(기본 문항 + 필요한 추가 문항)."""
    ask_axes = axes_needing_ask(answers, questions, rules)
    return [q for q in questions if not _tie_axis(q) or _tie_axis(q) in ask_axes]


def next_question(answers: dict, questions: list[dict], rules: dict) -> dict | None:
    """다음에 물을 문항. 다 물었으면 None."""
    for q in active_questions(answers, questions, rules):
        if q["id"] not in answers:
            return q
    return None


def decide_type(answers: dict, questions: list[dict], rules: dict) -> dict:
    """유형 코드, 축별로 정해진 쪽, 축별 점수를 돌려준다."""
    active_ids = {q["id"] for q in active_questions(answers, questions, rules)}
    scores = compute_scores([opt for qid, opt in answers.items() if qid in active_ids], rules)
    fixed = apply_overrides(answers, rules)
    tie_break = rules.get("tie_break") or {}
    poles_chosen: dict[str, str] = {}
    for axis, poles in _axis_poles(rules).items():
        first, second = scores[axis][poles[0]], scores[axis][poles[1]]
        if axis in fixed:
            poles_chosen[axis] = fixed[axis]
        elif first != second:
            poles_chosen[axis] = poles[0] if first > second else poles[1]
        elif tie_break.get(axis) in poles:
            poles_chosen[axis] = tie_break[axis]
        else:
            poles_chosen[axis] = poles[0]
    code = "".join(poles_chosen[axis["id"]] for axis in rules["axes"])
    return {"code": code, "poles": poles_chosen, "scores": scores}


def pole_label(rules: dict, axis_id: str, pole_code: str) -> str:
    for axis in rules["axes"]:
        if axis["id"] == axis_id:
            for pole in axis["poles"]:
                if pole["code"] == pole_code:
                    return pole.get("label", pole_code)
    return pole_code
