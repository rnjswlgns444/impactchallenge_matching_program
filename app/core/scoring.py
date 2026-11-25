"""척도 문항 답을 유형 점수로 바꾸고, 먼저 살펴볼 유형을 정한다. 화면과 무관한 순수 함수만 둔다.

규칙(전달 자료 '24문항 설문과 분류규칙' 2026-11-17 기준):
- 같은 유형의 문항 점수를 더한다(문항 2개면 2~10점). 유형끼리 점수를 빼거나 비교해 깎지 않는다.
- 모든 척도 문항은 답해야 한다(화면에서 건너뛸 수 없다). 답이 빠져 있으면 0점이나 3점으로 채우지 않고 오류로 멈춘다.
- 성별·나이·일 여부는 받지 않는다. 점수에 넣지 않는다.
- 점수가 낮아도 가장 높은 유형을 대표로 보여 준다(11/25 결정. 그전에는 7점 미만이면 대표를 만들지 않았다).
  그래서 전부 '아니에요'라고 답한 사람도 유형을 받는다. 검증된 검사가 아니라는 한계와 함께 적는다.
- 가장 높은 유형이 여럿이면 코드가 대신 정하지 않고 본인이 고른다.
- high(8점)는 '함께 살펴볼 유형'을 붙이는 기준으로만 쓴다. 운영 규칙이며 검증된 검사 기준이 아니다.

상태(state):
- result            대표 유형이 정해짐(단독 1위이거나, 본인이 후보 중 하나를 고름)
- choose_priority   가장 높은 점수의 유형이 여럿. 본인이 하나를 고른다.
"""
from __future__ import annotations

from dataclasses import dataclass, field

RESULT = "result"
CHOOSE = "choose_priority"

SCALE_MIN, SCALE_MAX = 1, 5


@dataclass
class Score:
    state: str
    primary: str | None = None            # 대표 유형
    secondary: str | None = None          # 함께 살펴볼 유형(단독 다음 순위일 때만)
    candidates: list[str] = field(default_factory=list)            # 최고점 유형들
    secondary_candidates: list[str] = field(default_factory=list)  # 대표 외 high 이상 중 가장 높은 유형들
    scores: dict[str, int] = field(default_factory=dict)           # 유형별 점수


def score(answers: dict, type_questions: dict[str, list[str]], high: int,
          priority: str | None = None) -> Score:
    """answers는 {문항 id: 1~5}. type_questions는 {유형 id: [문항 id, ...]}.

    answers에 다른 문항(기본정보, 걸림돌 등)이 섞여 있어도 type_questions에 적힌 문항만 읽는다.
    priority는 본인이 고른 유형이다. 지금 후보에 없으면(답을 고친 경우) 없는 것으로 본다.
    type_questions에 적힌 문항의 답이 하나라도 없거나 1~5 정수가 아니면 ValueError를 낸다.
    """
    if not type_questions:
        raise ValueError("유형과 문항의 연결표가 비어 있습니다.")
    scores: dict[str, int] = {}
    for type_id, question_ids in type_questions.items():
        values = [answers.get(qid) for qid in question_ids]
        if not values:
            raise ValueError(f"{type_id} 유형에 연결된 척도 문항이 없습니다.")
        for v in values:
            if type(v) is not int or not SCALE_MIN <= v <= SCALE_MAX:
                raise ValueError("척도 문항은 모두 1~5 정수로 답해야 합니다. 빠진 답을 다른 값으로 채우지 않습니다.")
        scores[type_id] = sum(values)

    top = max(scores.values())
    candidates = [tid for tid, value in scores.items() if value == top]
    if priority not in candidates:
        priority = None

    primary = None
    if priority is not None:
        state, primary = RESULT, priority
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

    return Score(state, primary, secondary, candidates, secondary_candidates, scores)
