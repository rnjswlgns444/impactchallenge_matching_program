"""유형 판정, 후보 거르기, AI 매칭, 개인정보 지우기, 데이터 검사 테스트.

AI는 가짜 답을 돌려주는 함수로 바꿔서 테스트한다. 실제 API는 부르지 않는다.
실행: 프로젝트 루트에서  python -m pytest app/tests
"""
import copy
import itertools
import json

import pytest

from app.core import loader, logger, privacy
from app.core.candidates import eligible, filter_candidates
from app.core.llm_matcher import build_prompt, recommend
from app.core.rules_engine import active_questions, decide_type, next_question


@pytest.fixture(scope="module")
def data():
    return loader.load_all()


def answer_all(data, picks):
    """picks: 축마다 고를 pole. 기본 문항과 추가 문항을 차례로 답한다."""
    answers = {}
    while (q := next_question(answers, data.questions, data.rules)) is not None:
        for opt in q["options"]:
            effect = data.rules["scores"].get(opt["id"], {})
            if all(picks[axis] == pole for axis, pole in effect.items()):
                answers[q["id"]] = opt["id"]
                break
    return answers


# ── 유형 판정 ──

def test_every_axis_combination_gives_its_type(data):
    axes = data.rules["axes"]
    for combo in itertools.product(*[[p["code"] for p in a["poles"]] for a in axes]):
        picks = {a["id"]: code for a, code in zip(axes, combo)}
        result = decide_type(answer_all(data, picks), data.questions, data.rules)
        assert result["code"] == "".join(combo)
        assert result["code"] in data.types


def test_tie_with_ask_shows_extra_question(data):
    answers = {"q1": "q1_a", "q2": "q2_b", "q3": "q3_a", "q4": "q4_a", "q5": "q5_a", "q6": "q6_a"}
    nxt = next_question(answers, data.questions, data.rules)
    assert nxt["id"] == "qt_purpose"           # 목적 축이 1:1 동점 → 추가 문항
    answers["qt_purpose"] = "qt_purpose_b"
    assert next_question(answers, data.questions, data.rules) is None
    assert decide_type(answers, data.questions, data.rules)["code"] == "JTR"


def test_tie_with_fixed_pole(data):
    answers = {"q1": "q1_a", "q2": "q2_a", "q3": "q3_a", "q4": "q4_a", "q5": "q5_a", "q6": "q6_b"}
    assert next_question(answers, data.questions, data.rules) is None   # 시작 축은 묻지 않음
    assert decide_type(answers, data.questions, data.rules)["code"] == "MTW"  # 동점이면 W


def test_no_tie_question_when_not_tied(data):
    answers = {"q1": "q1_a", "q2": "q2_a", "q3": "q3_a", "q4": "q4_a", "q5": "q5_a", "q6": "q6_a"}
    assert len(active_questions(answers, data.questions, data.rules)) == 6


def test_override_wins_over_score(data):
    rules = copy.deepcopy(data.rules)
    rules["overrides"] = [{"if": {"q6": "q6_b"}, "then": {"start": "W", "purpose": "J"}}]
    answers = {"q1": "q1_a", "q2": "q2_a", "q3": "q3_a", "q4": "q4_a", "q5": "q5_a", "q6": "q6_b"}
    assert decide_type(answers, data.questions, rules)["code"] == "JTW"   # 점수는 M이지만 예외가 먼저


def test_weighted_score(data):
    rules = copy.deepcopy(data.rules)
    rules["scores"]["q1_b"] = {"purpose": {"J": 3}}
    answers = {"q1": "q1_b", "q2": "q2_a", "q3": "q3_a", "q4": "q4_a", "q5": "q5_a", "q6": "q6_a"}
    assert decide_type(answers, data.questions, rules)["code"] == "JTR"


def test_same_input_same_result(data):
    answers = {"q1": "q1_b", "q2": "q2_b", "q3": "q3_b", "q4": "q4_b", "q5": "q5_b", "q6": "q6_b"}
    results = {json.dumps(decide_type(answers, data.questions, data.rules), sort_keys=True) for _ in range(5)}
    assert len(results) == 1


def test_two_axes_work_without_code_change(data):
    rules = copy.deepcopy(data.rules)
    rules["axes"] = rules["axes"][:2]
    answers = {"q1": "q1_a", "q2": "q2_a", "q3": "q3_b", "q4": "q4_b"}
    questions = [q for q in data.questions if q["id"] in ("q1", "q2", "q3", "q4")]
    assert decide_type(answers, questions, rules)["code"] == "MS"


# ── 후보 거르기 ──

def test_closed_and_age_blocked_programs_never_pass(data):
    ids = {p["id"] for p in eligible(data.programs)}
    assert "P14" not in ids      # 55~64세 참여 불가
    assert "P15" not in ids      # 매칭가능 N (종료)
    for t in data.types.values():
        for p in filter_candidates(data.programs, t["tags"]):
            assert p["매칭가능"] == "Y" and p["55~64세참여"] != "불가"


def test_every_type_has_candidates(data):
    for code, t in data.types.items():
        assert filter_candidates(data.programs, t["tags"]), f"{code} 유형에 후보가 없음"


# ── AI 매칭 ──

def fake_llm(answer):
    return lambda prompt: json.dumps(answer, ensure_ascii=False)


def test_llm_success(data):
    rec = recommend(data, "JTR", ["당일치기 여행·나들이"], "", False,
                    fake_llm({"matches": [{"id": "P07", "reason": "나들이를 원하셔서요."}], "unmatched": []}))
    assert rec.status == "ok"
    assert [p["id"] for p in rec.programs] == ["P07"]
    assert rec.reasons["P07"]


def test_llm_ids_outside_candidates_are_dropped(data):
    answer = {"matches": [{"id": "P15", "reason": "종료된 것"}, {"id": "없는id", "reason": "지어낸 것"},
                          {"id": "P02", "reason": "다른 유형 것"}, {"id": "P07", "reason": "맞는 것"}], "unmatched": []}
    rec = recommend(data, "JTR", ["당일치기 여행·나들이"], "", False, fake_llm(answer))
    assert [p["id"] for p in rec.programs] == ["P07"]


def test_failure_a_when_llm_errors(data):
    def broken(prompt):
        raise TimeoutError
    errors = []
    rec = recommend(data, "JTR", ["걷기·운동"], "", False, broken, errors.append)
    assert rec.status == "A"
    assert rec.programs and errors == ["TimeoutError"]


def test_failure_a_when_no_key_bad_json_or_only_invalid_ids(data):
    no_key = recommend(data, "JTR", ["걷기·운동"], "", False, None)
    assert no_key.status == "A" and no_key.error == "API 키 없음"
    assert recommend(data, "JTR", ["걷기·운동"], "", False, lambda p: "죄송합니다").status == "A"
    only_invalid = fake_llm({"matches": [{"id": "P15", "reason": "x"}], "unmatched": []})
    assert recommend(data, "JTR", ["걷기·운동"], "", False, only_invalid).status == "A"


def test_failure_b_shows_consult(data):
    rec = recommend(data, "JTR", ["걷기·운동"], "해외여행", False,
                    fake_llm({"matches": [{"id": "P08", "reason": "걷기를 원하셔서요."}], "unmatched": ["해외여행"]}))
    assert rec.status == "B"
    assert rec.unmatched == ["해외여행"]
    assert [p["id"] for p in rec.consults] == ["P01"]


def test_failure_c_when_no_candidates(data):
    empty = copy.copy(data)
    empty.programs = [p for p in data.programs if p["매칭가능"] != "Y"]
    assert recommend(empty, "JTR", ["걷기·운동"], "", False, fake_llm({})).status == "C"


def test_unsure_skips_llm_and_shows_consult_first(data):
    def must_not_call(prompt):
        raise AssertionError("AI를 부르면 안 됨")
    for code in ("JTR", "MTW"):
        rec = recommend(data, code, [], "", True, must_not_call)
        assert rec.status == "unsure"
        assert rec.programs[0]["첫상담"] == "Y"


def test_prompt_has_scrubbed_text_and_only_candidates(data):
    t = data.types["JTR"]
    cands = filter_candidates(data.programs, t["tags"])
    prompt = build_prompt(data.prompt, t, ["걷기·운동"], "010-1234-5678로 연락 주세요", cands, 3)
    assert "010-1234-5678" not in prompt and privacy.REMOVED in prompt
    assert "P15" not in prompt and "P14" not in prompt and "{" + "candidates}" not in prompt


# ── 개인정보 ──

@pytest.mark.parametrize("text", [
    "010-1234-5678", "01012345678", "031 123 4567", "02.123.4567", "abc.def@example.com",
])
def test_scrub_removes_contacts(text):
    assert privacy.scrub(f"연락처는 {text} 입니다") == f"연락처는 {privacy.REMOVED} 입니다"


def test_scrub_keeps_normal_text():
    assert privacy.scrub("주 3일, 하루 4시간 2026년") == "주 3일, 하루 4시간 2026년"


def test_log_has_no_free_text(tmp_path):
    logger.log_response("sid", ["q1_a"], {"purpose": {"M": 1}}, "MTR", ["앉아서 하는 일"], True, False, "ok", ["P02"], tmp_path)
    logger.log_event("sid", "taste_start", "P08", tmp_path)
    header = (tmp_path / "responses.csv").read_text(encoding="utf-8-sig").splitlines()[0]
    assert header.split(",") == logger.RESPONSE_FIELDS
    assert "text" not in header.replace("wrote_text", "")


# ── 데이터 파일 검사 ──

def test_bad_files_give_korean_messages(data):
    rules = copy.deepcopy(data.rules)
    rules["scores"]["없는선택지"] = {"purpose": "M"}
    rules["scores"]["q1_a"] = {"purpose": "X"}
    types_list = [t for t in data.types.values() if t["code"] != "MTR"]
    programs = copy.deepcopy(data.programs)
    programs[0]["유형태그"] = "없는태그"
    programs[1]["확인날짜"] = "11/15"
    problems = loader.validate(data.questions, rules, types_list, programs, "자리표시자 없음")
    text = "\n".join(problems)
    for expected in ("없는선택지", "'X'", "유형 'MTR'가 없습니다", "없는태그", "확인날짜", "{candidates}"):
        assert expected in text
