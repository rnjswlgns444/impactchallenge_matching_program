"""채점·대표 유형 판정 테스트.

전달 자료(02_채점_참고코드.py)의 자체 점검을 옮기고, 앱에서 달라진 점(다른 문항이 섞인 답, 고친 뒤 남은 우선 선택)을 더했다.
데이터 파일을 읽지 않고 이 파일 안의 가짜 문항 연결표를 쓴다.
실행: 프로젝트 루트에서  python -m pytest app/tests/test_scoring.py
"""
import pytest

from app.core.scoring import CHOOSE, RESULT, score

# 유형 12개, 유형마다 문항 2개 (T01: Q01·Q02, T02: Q03·Q04, ...)
PAIRS = {f"T{n:02d}": [f"Q{2 * n - 1:02d}", f"Q{2 * n:02d}"] for n in range(1, 13)}
ALL_QUESTIONS = [qid for pair in PAIRS.values() for qid in pair]


def answers(default=1, **by_type):
    """모든 문항에 default로 답하고, 적어 준 유형만 두 문항 값을 바꾼다. 예: answers(T06=(5, 5))"""
    result = {qid: default for qid in ALL_QUESTIONS}
    for type_id, values in by_type.items():
        result.update(zip(PAIRS[type_id], values))
    return result


def run(given, priority=None):
    return score(given, PAIRS, high=8, priority=priority)


def test_all_neutral_asks_the_user_to_choose():
    """전부 '보통'이면 모든 유형이 동점이다. 코드가 정하지 않고 본인이 12개 중에서 고른다."""
    result = run(answers(3))
    assert result.state == CHOOSE and result.primary is None and len(result.candidates) == 12


def test_no_answers_is_an_error():
    """모든 문항은 답해야 한다. 답이 없으면 유형을 지어내지 않고 멈춘다."""
    with pytest.raises(ValueError):
        run({})


def test_single_top_becomes_primary():
    result = run(answers(T06=(5, 5)))
    assert (result.state, result.primary, result.secondary) == (RESULT, "T06", None)
    assert result.scores["T06"] == 10 and result.scores["T01"] == 2


def test_tie_asks_the_user_to_choose():
    result = run(answers(T06=(5, 5), T07=(5, 5)))
    assert result.state == CHOOSE and result.primary is None
    assert result.candidates == ["T06", "T07"]


def test_chosen_priority_becomes_primary_and_other_is_secondary():
    result = run(answers(T06=(5, 5), T07=(5, 5)), priority="T07")
    assert (result.state, result.primary, result.secondary) == (RESULT, "T07", "T06")


def test_low_single_top_still_becomes_primary():
    """11/25: 점수가 낮아도 가장 높은 유형이 하나면 확인 없이 대표가 된다(유형이 없는 결과를 만들지 않는다)."""
    for pair in ((4, 3), (3, 3), (2, 1)):
        result = run(answers(T01=pair))
        assert (result.state, result.primary, result.secondary) == (RESULT, "T01", None), pair


def test_one_missing_answer_is_an_error_not_filled_in():
    """빠진 답을 0점이나 3점으로 채워서 계산하지 않는다."""
    with pytest.raises(ValueError):
        run(answers(T02=(5, None), T06=(5, 5)))
    without_key = answers(T06=(5, 5))
    del without_key["Q03"]
    with pytest.raises(ValueError):
        run(without_key)


def test_everything_high_does_not_pick_one():
    result = run(answers(5))
    assert result.state == CHOOSE and result.primary is None and len(result.candidates) == 12


@pytest.mark.parametrize("bad", [0, 6, "5", 4.0, True])
def test_bad_scale_value_is_rejected(bad):
    with pytest.raises(ValueError):
        run(answers(T01=(bad, 3)))


def test_other_questions_do_not_affect_scores():
    given = answers(T06=(5, 5))
    given.update({"P_AGE": 60, "P_GENDER": "female", "Q_BARRIER": ["alone"]})
    assert run(given).scores == run(answers(T06=(5, 5))).scores


def test_all_lowest_lets_the_user_choose_any_type():
    """전부 '전혀 아니에요'여도 동점이므로 본인이 고른 유형이 대표가 된다. 함께 볼 유형은 붙지 않는다(8점 미만)."""
    result = run(answers(1), priority="T12")
    assert (result.state, result.primary, result.secondary) == (RESULT, "T12", None)
    assert result.secondary_candidates == []


def test_priority_outside_the_top_is_ignored():
    result = run(answers(T06=(3, 3)), priority="T12")
    assert (result.state, result.primary) == (RESULT, "T06")


def test_stale_priority_is_ignored():
    """동점에서 T07을 골랐다가 답을 고쳐 T06만 최고점이 되면, 예전 선택은 버린다."""
    result = run(answers(T06=(5, 5), T07=(4, 4)), priority="T07")
    assert (result.state, result.primary, result.secondary) == (RESULT, "T06", "T07")


def test_tied_second_place_is_not_picked_automatically():
    result = run(answers(T06=(5, 5), T07=(4, 4), T09=(4, 4)))
    assert result.primary == "T06" and result.secondary is None
    assert result.secondary_candidates == ["T07", "T09"]


def test_second_place_below_high_is_not_shown():
    result = run(answers(T06=(5, 5), T07=(4, 3)))
    assert result.secondary is None and result.secondary_candidates == []
