"""유형 선택, 후보 거르기, AI 답 검증, 개인정보 지우기, 기록, 데이터 검사 테스트.

문항과 유형은 실제 데이터 파일을 쓰고, 프로그램은 이 파일 안의 가짜 행을 쓴다.
그래서 팀원이 프로그램 정보표를 고쳐도 테스트가 깨지지 않는다. 날짜는 인자로 넘긴다.
'검증 사례 n'은 전달 자료(01_질문_유형_분류규칙.json)의 acceptance_cases 번호다.
실행: 프로젝트 루트에서  python -m pytest app/tests
"""
import copy
import json
from datetime import date

import pytest

from app.core import loader, logger, privacy
from app.core.candidates import build_result, eligible, first_consult, for_type, unconfirmed_columns
from app.core.llm_matcher import parse_answer
from app.core.selection import (barrier_guides, card_part_to_open, chosen_detail_options, detail_of,
                                next_question, options_of, ordered_types, question, selected_types, toggle)

TODAY = date(2026, 11, 17)


@pytest.fixture(scope="module")
def data():
    return loader.load_all()


def row(pid, tags, **changes):
    """가짜 프로그램 행. 기본값은 '지금 문의할 수 있는 상시 서비스'다."""
    base = {column: "" for column in loader.REQUIRED_COLUMNS}
    base.update({
        "id": pid, "기관명": "가짜 기관", "프로그램명": f"가짜 프로그램 {pid}", "종류": "상시서비스", "범위": "안산",
        "한줄설명": "설명", "유형태그": tags, "첫상담": "N", "55~64세참여": "가능", "보수": "해당없음",
        "운영상태": "상시운영", "매칭가능": "Y", "확인날짜": "2026-11-17", "출처URL": "https://example.com/",
    })
    base.update(changes)
    return base


def ids(programs):
    return [p["id"] for p in programs]


# ── 유형 선택 (규칙 R01~R04) ──

def test_first_question_offers_every_type_and_unknown(data):
    options = options_of(question(data.questions, "Q_NEEDS"), data.types)
    assert [o["id"] for o in options] == list(data.types) + ["unknown"]
    assert options[0]["label"] == data.types["T01"]["statement"]


@pytest.mark.parametrize("chosen", [["T05", "T07"], ["T09", "T10"], ["T01", "T04"]])   # 검증 사례 1, 2, 3
def test_all_chosen_types_are_kept(data, chosen):
    assert selected_types({"Q_NEEDS": chosen}, data.types) == chosen


def test_types_come_in_file_order_not_click_order(data):
    assert selected_types({"Q_NEEDS": ["T07", "T02"]}, data.types) == ["T02", "T07"]


def test_barrier_does_not_change_type(data):   # 검증 사례 4
    answers = {"Q_NEEDS": ["T07"], "Q_BARRIER": ["alone"]}
    assert selected_types(answers, data.types) == ["T07"]
    guides = barrier_guides(answers, data.questions)
    assert [g["id"] for g in guides] == ["alone"] and guides[0]["ask"]


@pytest.mark.parametrize("answer", [["unknown"], [], None])   # 검증 사례 6
def test_unknown_or_empty_gives_no_type(data, answer):
    assert selected_types({"Q_NEEDS": answer}, data.types) == []


def test_exclusive_option_cannot_mix(data):
    options = options_of(question(data.questions, "Q_NEEDS"), data.types)
    assert toggle(["T01", "T05"], "unknown", options) == ["unknown"]     # 모르겠어요를 누르면 나머지가 풀림
    assert toggle(["unknown"], "T01", options) == ["T01"]                # 유형을 누르면 모르겠어요가 풀림
    assert toggle(["T01"], "T05", options) == ["T01", "T05"]
    assert toggle(["T01", "T05"], "T01", options) == ["T05"]             # 다시 누르면 해제


def test_survey_asks_three_questions_in_order(data):
    answers, asked = {}, []
    while (q := next_question(answers, data.questions)) is not None:
        asked.append(q["id"])
        answers[q["id"]] = None          # 건너뛰어도 다음으로 넘어간다
    assert asked == ["Q_NEEDS", "Q_BARRIER", "Q_START"]   # 결과 화면에서 묻는 문항은 빠진다


def test_priority_only_reorders(data):
    assert ordered_types(["T01", "T05", "T07"], "T05") == ["T05", "T01", "T07"]
    assert ordered_types(["T01", "T05"], "none") == ["T01", "T05"]
    assert ordered_types(["T01", "T05"], None) == ["T01", "T05"]
    labels = [o["label"] for o in options_of(question(data.questions, "Q_PRIORITY"), data.types, ["T01", "T05"])]
    assert labels[:2] == [data.types["T01"]["name"], data.types["T05"]["name"]] and len(labels) == 3


def test_start_answer_picks_card_part(data):
    assert card_part_to_open({"Q_START": "prepare"}, data.questions) == "ask"
    assert card_part_to_open({"Q_START": "later"}, data.questions) is None
    assert card_part_to_open({}, data.questions) is None


def test_disabled_detail_is_not_asked(data):
    assert detail_of(data.types["T08"]) is None and detail_of(data.types["T12"]) is None
    assert detail_of(data.types["T01"])["id"] == "D01"
    assert chosen_detail_options(data.types["T08"], ["stress"]) == []
    assert [o["id"] for o in chosen_detail_options(data.types["T01"], ["explore", "unknown"])] == ["explore"]


# ── 후보 거르기 (규칙 R05~R09, R15) ──

def test_closed_blocked_and_expired_never_pass():   # 검증 사례 10
    programs = [
        row("ok", "T01"),
        row("closed", "T01", 매칭가능="N", 운영상태="모집마감"),
        row("too_old", "T01", **{"55~64세참여": "불가"}),
        row("past", "T01", 표시종료일="2026-11-16"),
        row("today", "T01", 표시종료일="2026-11-17"),
    ]
    assert ids(eligible(programs, TODAY)) == ["ok", "today"]      # 종료일 당일까지는 보인다
    assert ids(eligible(programs, date(2026, 11, 18))) == ["ok"]


def test_unknown_age_is_not_treated_as_blocked():   # 규칙 R05
    assert ids(eligible([row("a", "T01", **{"55~64세참여": "미확인"})], TODAY)) == ["a"]


def test_directory_goes_to_list_area_only(data):   # 검증 사례 12
    programs = [row("svc", "T05"), row("dir", "T05", 종류="목록"), row("event", "T05", 종류="기간프로그램")]
    result = for_type(programs, data.types["T05"], None, TODAY)
    assert ids(result.contacts) == ["svc", "event"] and ids(result.lists) == ["dir"]   # 상시서비스가 먼저


def test_each_type_gets_its_own_result(data):   # 검증 사례 1
    programs = [row("hobby", "T05"), row("club", "T07"), row("both", "T05|T07"), row("job", "T01")]
    results = build_result(programs, data.types, ["T05", "T07"], {}, TODAY)
    assert [r.type_id for r in results] == ["T05", "T07"]
    assert ids(results[0].contacts) == ["both", "hobby"] and ids(results[1].contacts) == ["both", "club"]


def test_wage_required_drops_unpaid_but_keeps_unconfirmed(data):   # 검증 사례 5, 규칙 R07
    t02 = data.types["T02"]
    programs = [row("paid", "T02", 보수="유급"), row("volunteer", "T02", 보수="무보수"),
                row("unknown_pay", "T02", 보수="미확인"), row("counsel", "T02")]
    result = for_type(programs, t02, "wage_required", TODAY)
    assert "volunteer" not in ids(result.contacts)
    assert set(ids(result.contacts)) == {"paid", "unknown_pay", "counsel"}
    assert unconfirmed_columns(programs[2], t02) == ["보수"]      # 빼지 않고 '확인 필요'로 표시
    assert unconfirmed_columns(programs[0], t02) == []


def test_unpaid_is_shown_first_only_when_wanted(data):
    t02 = data.types["T02"]
    programs = [row("a_volunteer", "T02", 보수="무보수"), row("b_paid", "T02", 보수="유급")]
    for answer in (None, "unknown", "allowance_ok"):
        assert ids(for_type(programs, t02, answer, TODAY).contacts) == ["b_paid", "a_volunteer"]   # 맨 뒤로
    assert ids(for_type(programs, t02, "unpaid_ok", TODAY).contacts) == ["a_volunteer", "b_paid"]  # 앞으로


def test_detail_tag_overlap_moves_program_up(data):
    programs = [row("a", "T01"), row("b", "T01", 세부태그="D01.explore")]
    assert ids(for_type(programs, data.types["T01"], ["explore"], TODAY).contacts) == ["b", "a"]
    assert ids(for_type(programs, data.types["T01"], ["unknown"], TODAY).contacts) == ["a", "b"]


def test_nationwide_window_comes_after_local(data):
    programs = [row("a_call", "T10", 범위="전국"), row("b_local", "T10"), row("c_local_event", "T10", 종류="기간프로그램")]
    assert ids(for_type(programs, data.types["T10"], None, TODAY).contacts) == ["b_local", "c_local_event", "a_call"]


def test_conditions_are_kept_for_display_not_evaluated(data):   # 검증 사례 7
    programs = [row("care", "T11", 확인필요="돌봄받는 분의 나이|돌봄 필요 정도", 대상="65세 이상")]
    result = for_type(programs, data.types["T11"], ["adult"], TODAY)
    assert ids(result.contacts) == ["care"]      # 응답자 나이로 걸러 내지 않는다. 조건은 카드에 보여준다


def test_first_consult_is_general_window():
    programs = [row("general", "T01", 첫상담="Y"), row("closed_general", "T01", 첫상담="Y", 매칭가능="N"), row("x", "T01")]
    assert ids(first_consult(programs, TODAY)) == ["general"]


def test_same_input_same_result(data):
    programs = [row("a", "T01"), row("b", "T01|T04", 종류="목록"), row("c", "T04", 종류="기간프로그램")]
    results = {json.dumps([(r.type_id, ids(r.contacts), ids(r.lists))
                           for r in build_result(programs, data.types, ["T01", "T04"], {}, TODAY)]) for _ in range(5)}
    assert len(results) == 1


# ── 실제 데이터 파일 ──

def test_real_table_never_shows_unavailable_rows(data):
    blocked = {p["id"] for p in data.programs if p["매칭가능"] != "Y" or p["55~64세참여"] == "불가"}
    for day in (TODAY, date(2027, 6, 1)):
        for result in build_result(data.programs, data.types, list(data.types), {}, day):
            shown = set(ids(result.contacts + result.lists))
            assert not shown & blocked
            assert all(not p["표시종료일"] or p["표시종료일"] >= day.isoformat() for p in result.contacts + result.lists)


# ── AI 답 검증 ──

def test_llm_ids_outside_candidates_are_dropped():
    raw = json.dumps({"matches": [{"id": "closed", "reason": "끝난 것"}, {"id": "없는id", "reason": "지어낸 것"},
                                  {"id": "ok", "reason": "맞는 것"}, {"id": "ok", "reason": "중복"}], "unmatched": ["해외여행"]})
    matches, unmatched = parse_answer(raw, ["ok", "other"], 3)
    assert matches == [{"id": "ok", "reason": "맞는 것"}] and unmatched == ["해외여행"]
    with pytest.raises(ValueError):
        parse_answer("죄송합니다", ["ok"], 3)


# ── 개인정보 ──

@pytest.mark.parametrize("text", [
    "010-1234-5678", "01012345678", "031 123 4567", "02.123.4567", "abc.def@example.com",
])
def test_scrub_removes_contacts(text):
    assert privacy.scrub(f"연락처는 {text} 입니다") == f"연락처는 {privacy.REMOVED} 입니다"


def test_scrub_keeps_normal_text():
    assert privacy.scrub("주 3일, 하루 4시간 2026년") == "주 3일, 하루 4시간 2026년"


# ── 기록 ──

def test_log_has_no_free_text(tmp_path):
    logger.log_response("sid", ["T02", "T05"], ["alone"], "prepare", ["JOB01"], tmp_path)
    logger.log_event("sid", "detail", "T02", "wage_required", tmp_path)
    header, line = (tmp_path / "responses.csv").read_text(encoding="utf-8-sig").splitlines()
    assert header.split(",") == logger.RESPONSE_FIELDS
    assert "text" not in header and "T02|T05" in line
    assert (tmp_path / "events.csv").read_text(encoding="utf-8-sig").splitlines()[0].split(",") == logger.EVENT_FIELDS


def test_old_format_log_is_set_aside(tmp_path):
    old = tmp_path / "responses.csv"
    old.write_text("session_id,hour,option_ids,axis_scores\nold,x,y,z\n", encoding="utf-8-sig")
    logger.log_response("sid", ["T01"], [], None, [], tmp_path)
    lines = old.read_text(encoding="utf-8-sig").splitlines()
    assert lines[0].split(",") == logger.RESPONSE_FIELDS and len(lines) == 2      # 새 파일로 시작
    kept = [p for p in tmp_path.iterdir() if "이전형식" in p.name]
    assert len(kept) == 1 and "old,x,y,z" in kept[0].read_text(encoding="utf-8-sig")   # 예전 기록은 보관


# ── 데이터 파일 검사 ──

def test_bad_files_give_korean_messages(data):
    types_list = copy.deepcopy(list(data.types.values()))
    types_list[0]["area"] = "없는영역"
    types_list[1]["detail"]["options"][0]["exclude"] = {"없는열": ["무보수"]}
    questions = [q for q in copy.deepcopy(data.questions) if q["id"] != "Q_START"]
    question(questions, "Q_BARRIER")["options"][0]["show"] = ["없는칸"]
    programs = [
        row("a", "T99"), row("a", "T01"),
        row("b", "T01", 세부태그="D01.없는선택지", 확인날짜="11/15", 종류="행사", 표시종료일="내일"),
        row("c", "T01", 출처URL=""),
    ]
    text = "\n".join(loader.validate(data.areas, types_list, questions, programs, "자리표시자 없음"))
    for expected in ("없는영역", "없는열", "'Q_START'가 없습니다", "없는칸", "'T99'", "중복", "D01.없는선택지",
                     "확인날짜", "'종류' 칸은", "표시종료일", "출처URL이 있어야", "{candidates}"):
        assert expected in text, expected


def test_general_window_may_have_no_type_tag(data):
    types_list = list(data.types.values())
    assert loader.validate_programs([row("g", "", 첫상담="Y")], types_list) == []
    assert any("유형태그가 비었습니다" in line for line in loader.validate_programs([row("x", "")], types_list))


def test_good_fake_rows_pass_validation(data):
    assert loader.validate_programs([row("a", "T01|T02", 세부태그="D02.wage_required")], list(data.types.values())) == []


# ── 전화 걸기 ──

def test_phone_dials_first_number_only():
    from app.ui.components import phones
    assert phones("031-439-1619~21") == [("0314391619", "031-439-1619~21")]
    assert phones("031-369-1590~1591") == [("0313691590", "031-369-1590~1591")]
    assert [n for n, _ in phones("1666-1234")] == ["16661234"]
    assert [n for n, _ in phones("129")] == ["129"]
    assert [n for n, _ in phones("1332")] == ["1332"]
    assert phones("") == []


def test_phone_with_two_offices_gives_two_buttons():
    from app.ui.components import phones
    found = phones("031-481-5795 (상록수) / 031-481-6541 (단원)")
    assert found == [("0314815795", "031-481-5795 (상록수)"), ("0314816541", "031-481-6541 (단원)")]


def test_log_failure_does_not_break_screen(tmp_path, monkeypatch):
    """기록 파일이 잠겨 있어도(엑셀로 열어 둔 경우 등) 예외가 화면까지 올라오지 않는다."""
    def locked(*args):
        raise PermissionError("잠김")
    monkeypatch.setattr(logger, "_write", locked)
    logger.log_response("s1", ["T01"], [], "", ["JOB01"], log_dir=tmp_path)
    logger.log_event("s1", "detail", "T01", "new_work", log_dir=tmp_path)
    assert "기록 실패" in (tmp_path / "errors.log").read_text(encoding="utf-8")


def test_log_switch_off_writes_nothing(tmp_path, monkeypatch):
    """settings.yaml의 save_log가 false면 기록 파일을 만들지 않는다."""
    monkeypatch.setattr(logger, "ENABLED", True)
    logger.set_enabled(False)
    logger.log_response("s1", ["T01"], [], "", ["JOB01"], log_dir=tmp_path)
    logger.log_event("s1", "detail", "T01", "new_work", log_dir=tmp_path)
    assert not list(tmp_path.iterdir())
