"""척도 문항 답을 유형 점수로 바꾸고, 먼저 살펴볼 유형을 정한다. 화면과 무관한 순수 함수만 둔다.

규칙(전달 자료 '24문항 설문과 분류규칙' 2026-11-17 기준):
- 같은 유형의 문항 점수를 더한다(문항 2개면 2~10점). 유형끼리 점수를 빼거나 비교해 깎지 않는다.
- 한 유형의 문항 중 하나라도 답하지 않았으면 그 유형은 판단을 미룬다. 0점이나 3점으로 채우지 않는다.
- 성별·나이·일 여부는 받지 않는다. 점수에 넣지 않는다.
- high(8점)·confirm(7점) 기준은 운영 규칙이다. 검증된 검사 기준이 아니다.

상태(state):
- result            대표 유형이 정해짐(단독 1위이거나, 본인이 후보 중 하나를 고름)
- choose_priority   high 이상에서 동점. 본인이 하나를 고른다.
- confirm_interest  최고점이 confirm 이상 high 미만. 본인이 확인해야 대표가 된다.
- explore           모든 유형이 confirm 미만. 대표를 억지로 만들지 않는다.
- incomplete        문항을 다 답한 유형이 하나도 없음.
"""
from __future__ import annotations

from dataclasses import dataclass, field

RESULT = "result"
CHOOSE = "choose_priority"
CONFIRM = "confirm_interest"
EXPLORE = "explore"
INCOMPLETE = "incomplete"

SCALE_MIN, SCALE_MAX = 1, 5


@dataclass
class Score:
    state: str
    primary: str | None = None            # 대표 유형
    secondary: str | None = None          # 함께 살펴볼 유형(단독 다음 순위일 때만)
    candidates: list[str] = field(default_factory=list)            # 최고점 유형들(confirm 이상일 때)
    secondary_candidates: list[str] = field(default_factory=list)  # 대표 외 high 이상 중 가장 높은 유형들
    scores: dict[str, int] = field(default_factory=dict)           # 판단한 유형의 점수
    incomplete: list[str] = field(default_factory=list)            # 판단을 미룬 유형


def score(answers: dict, type_questions: dict[str, list[str]], high: int, confirm: int,
          priority: str | None = None) -> Score:
    """answers는 {문항 id: 1~5 또는 None}. type_questions는 {유형 id: [문항 id, ...]}.

    answers에 다른 문항(기본정보, 걸림돌 등)이 섞여 있어도 type_questions에 적힌 문항만 읽는다.
    priority는 본인이 고른 유형이다. 지금 후보에 없으면(답을 고친 경우) 없는 것으로 본다.
    """
    scores: dict[str, int] = {}
    incomplete: list[str] = []
    for type_id, question_ids in type_questions.items():
        values = [answers.get(qid) for qid in question_ids]
        if not values or any(v is None for v in values):
            incomplete.append(type_id)
            continue
        for v in values:
            if type(v) is not int or not SCALE_MIN <= v <= SCALE_MAX:
                raise ValueError("척도 답은 1~5 정수이거나 미응답(None)이어야 합니다.")
        scores[type_id] = sum(values)

    if not scores:
        return Score(INCOMPLETE, incomplete=incomplete)

    top = max(scores.values())
    if top < confirm:
        return Score(EXPLORE, scores=scores, incomplete=incomplete)

    candidates = [tid for tid, value in scores.items() if value == top]
    if priority not in candidates:
        priority = None

    primary = None
    if priority is not None:
        state, primary = RESULT, priority
    elif top < high:
        state = CONFIRM
    elif len(candidates) > 1:
        state = CHOOSE
    else:
        state, primary = RESULT, candidates[0]

    secondary, secondary_candidates = None, []
    if primary:
        others = {tid: value for tid, value in scores.items() if tid != primary and value >= high}
        if others:
            second = max(others.values())
            secondary_candidates = [tid for tid, value in others.items() if value == second]
            if len(secondary_candidates) == 1:
                secondary = secondary_candidates[0]

    return Score(state, primary, secondary, candidates, secondary_candidates, scores, incomplete)
