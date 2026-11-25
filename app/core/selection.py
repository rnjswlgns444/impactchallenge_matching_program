"""문항 순서, 선택지, 걸림돌 안내를 다룬다. 화면과 무관한 순수 함수만 둔다.

유형은 척도 문항(selection: scale) 점수로 정한다. 점수 계산과 대표 유형 판정은 scoring.py가 한다.
이 파일은 어느 문항이 어느 유형에 속하는지(type_questions)만 알려 준다.
기본정보(P_*)와 걸림돌(Q_BARRIER)은 유형을 바꾸지 않는다. 걸림돌은 결과 카드에서 무엇을 먼저 보여줄지만 정한다.

answers는 {문항 id: 답} 사전이다. 설문 문항은 모두 답해야 넘어가므로 빈 답은 없다.
  multi → 선택지 id 목록 / single → 선택지 id 하나 / scale → 1~5 정수 / number → 정수
"""
from __future__ import annotations

BARRIER_Q = "Q_BARRIER"
PRIORITY_Q = "Q_PRIORITY"
FREE_Q = "Q_FREE"
GENDER_Q, AGE_Q, WORK_Q = "P_GENDER", "P_AGE", "P_WORK"   # 기본정보. 유형은 바꾸지 않는다. 후보 거르기에만 쓰고 저장하지 않는다
# 기본정보 답과 견주는 정보표 열: (문항 id, 열 이름, 그 열에 적을 수 있는 선택지 id). 빈칸은 '조건 없음'이다
PROFILE_CHOICES = (
    (GENDER_Q, "대상성별", ("male", "female")),
    (WORK_Q, "대상재직상태", ("employed", "self_employed", "not_working")),
)
AGE_MIN_COLUMN, AGE_MAX_COLUMN = "최소나이", "최대나이"     # 만 나이. 빈칸은 '제한 없음'이다
SCALE = "scale"
CANDIDATE_TYPES = "candidate_types"   # options_from에 적는 값. 넘겨받은 유형들이 선택지가 된다


def question(questions: list[dict], question_id: str) -> dict:
    return next(q for q in questions if q["id"] == question_id)


def scale_questions(questions: list[dict]) -> list[dict]:
    """척도 문항만, 파일에 적힌 순서대로."""
    return [q for q in questions if q.get("selection") == SCALE]


def type_questions(questions: list[dict], types: dict[str, dict]) -> dict[str, list[str]]:
    """{유형 id: [그 유형의 척도 문항 id]}. 유형은 types.yaml에 적힌 순서다. scoring.score()에 그대로 넘긴다."""
    return {tid: [q["id"] for q in scale_questions(questions) if q.get("type") == tid] for tid in types}


def options_of(q: dict, types: dict[str, dict], type_ids: list[str] | None = None) -> list[dict]:
    """문항의 선택지. options_from이 candidate_types면 넘겨받은 유형의 설명 문장을 선택지로 만들어 앞에 붙인다."""
    made: list[dict] = []
    if q.get("options_from") == CANDIDATE_TYPES:
        made = [{"id": tid, "label": types[tid]["statement"]} for tid in type_ids or []]
    return made + list(q.get("options") or [])


def survey_questions(questions: list[dict]) -> list[dict]:
    """설문 화면에서 차례로 묻는 문항. 결과 화면에서 묻는 문항(where: result)은 뺀다."""
    return [q for q in questions if q.get("where") != "result"]


def next_question(answers: dict, questions: list[dict]) -> dict | None:
    """다음에 물을 문항. 다 물었으면 None. answers에 키가 있으면 답한 것으로 본다."""
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


def barrier_guides(answers: dict, questions: list[dict]) -> list[dict]:
    """고른 걸림돌 가운데 카드에 안내할 것. 각 항목에 label, show(먼저 보여줄 열), ask(물어볼 문장)가 있다."""
    chosen = answers.get(BARRIER_Q) or []
    options = question(questions, BARRIER_Q).get("options") or []
    return [opt for opt in options if opt["id"] in chosen and (opt.get("show") or opt.get("ask"))]


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
