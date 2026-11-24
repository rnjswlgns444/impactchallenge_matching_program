"""문항 구성, 후보 거르기, AI 답 검증, 개인정보 지우기, 기록, 데이터 검사 테스트.

문항과 유형은 실제 데이터 파일을 쓰고, 프로그램은 이 파일 안의 가짜 행을 쓴다.
그래서 팀원이 프로그램 정보표를 고쳐도 테스트가 깨지지 않는다. 날짜는 인자로 넘긴다.
'검증 사례 n'과 '규칙 Rnn'은 예전 전달 자료(2026-11-16, 01_질문_유형_분류규칙.json)의 번호다.
채점 규칙 자체의 테스트는 test_scoring.py에 있다.
실행: 프로젝트 루트에서  python -m pytest app/tests
"""
import copy
import json
import re
from datetime import date, datetime, timezone

import pytest

from app.core import clock, loader, logger, privacy
from app.core.candidates import ai_pool, build_result, eligible, first_consult, for_type, unconfirmed_columns
from app.core.llm_matcher import NO_KEY, NO_TYPE, REASON_LIMIT, build_prompt, has_wish, parse_answer, recommend
from app.core.scoring import CHOOSE, EXPLORE, RESULT, score
from app.core.selection import (DEFER, barrier_guides, chosen_detail_options, detail_of, next_question, options_of,
                                question, scale_questions, toggle, type_questions)

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


# ── 문항 구성과 유형 연결 ──

def high(data, *type_ids, base=1):
    """실제 문항으로 만든 답. 적어 준 유형의 두 문항만 5점, 나머지는 base점."""
    pairs = type_questions(data.questions, data.types)
    answers = {q["id"]: base for q in scale_questions(data.questions)}
    answers.update({qid: 5 for tid in type_ids for qid in pairs[tid]})
    return answers


def judge(data, answers, priority=None):
    scoring = data.settings["scoring"]
    return score(answers, type_questions(data.questions, data.types), scoring["high"], scoring["confirm"], priority)


def test_every_type_has_two_scale_questions(data):
    pairs = type_questions(data.questions, data.types)
    assert list(pairs) == list(data.types)                       # types.yaml 순서
    assert all(len(qids) == 2 for qids in pairs.values()) and len(scale_questions(data.questions)) == 24
    # 전달 자료의 '유형별 연결표'와 같은지 몇 개만 본다
    assert pairs["T01"] == ["Q01", "Q14"] and pairs["T06"] == ["Q06", "Q24"] and pairs["T12"] == ["Q08", "Q21"]


def test_two_questions_of_a_type_are_not_adjacent(data):
    order = [q["type"] for q in scale_questions(data.questions)]
    assert all(a != b for a, b in zip(order, order[1:]))


def test_scale_has_five_labels(data):
    assert [opt["value"] for opt in data.scale] == [5, 4, 3, 2, 1] and all(opt["label"] for opt in data.scale)


def test_survey_asks_profile_then_scale_then_barrier(data):
    answers, asked = {}, []
    while (q := next_question(answers, data.questions)) is not None:
        asked.append(q["id"])
        answers[q["id"]] = 3             # 답이 들어가면 다음 문항으로 넘어간다
    assert asked == ["P_GENDER", "P_AGE", "P_WORK"] + [f"Q{n:02d}" for n in range(1, 25)] + ["Q_BARRIER"]


def test_real_questions_lead_to_one_type(data):
    result = judge(data, high(data, "T06"))
    assert (result.state, result.primary, result.secondary) == (RESULT, "T06", None)
    assert judge(data, high(data, base=3)).state == EXPLORE


def test_profile_and_barrier_do_not_change_type(data):   # 검증 사례 4
    answers = high(data, "T07")
    answers.update({"P_GENDER": "female", "P_AGE": 60, "P_WORK": "not_working", "Q_BARRIER": ["alone"]})
    assert judge(data, answers).primary == "T07"
    guides = barrier_guides(answers, data.questions)
    assert [g["id"] for g in guides] == ["alone"] and guides[0]["ask"]


def test_tie_is_settled_by_the_user(data):
    answers = high(data, "T05", "T07")
    tied = judge(data, answers)
    assert tied.state == CHOOSE and tied.candidates == ["T05", "T07"]
    options = options_of(question(data.questions, "Q_PRIORITY"), data.types, tied.candidates)
    assert [o["id"] for o in options] == ["T05", "T07", DEFER]
    assert options[0]["label"] == data.types["T05"]["statement"]   # 유형 이름이 아니라 쉬운 설명 문장으로 묻는다
    chosen = judge(data, answers, "T07")
    assert (chosen.primary, chosen.secondary) == ("T07", "T05")
    assert judge(data, answers, DEFER).state == CHOOSE           # '아직 고르지 않을게요'는 대표를 만들지 않는다


def test_exclusive_option_cannot_mix(data):
    options = options_of(question(data.questions, "Q_BARRIER"), data.types)
    assert toggle(["alone", "cost"], "none", options) == ["none"]        # 없어요를 누르면 나머지가 풀림
    assert toggle(["none"], "alone", options) == ["alone"]               # 다른 것을 누르면 없어요가 풀림
    assert toggle(["alone"], "cost", options) == ["alone", "cost"]
    assert toggle(["alone", "cost"], "alone", options) == ["cost"]       # 다시 누르면 해제


def test_disabled_detail_is_not_asked(data):
    # 11/22부터 실제 유형은 세부 질문을 모두 묻는다. 꺼 두는 기능(enabled: false)은 꺼 둔 복사본으로 확인한다
    off = copy.deepcopy(data.types["T08"])
    off["detail"]["enabled"] = False
    assert detail_of(off) is None
    assert detail_of(data.types["T08"])["id"] == "D08" and detail_of(data.types["T12"])["id"] == "D12"
    assert detail_of(data.types["T01"])["id"] == "D01"
    assert chosen_detail_options(off, ["stress"]) == []
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


def test_end_time_hides_a_row_on_its_last_day():
    """종료일 당일에는 종료시각부터 빠진다. 시각을 모르면(날짜만 주면) 그날 끝까지 보인다."""
    programs = [row("talk", "T01", 표시종료일="2026-11-17", 종료시각="14:00"), row("allday", "T01", 표시종료일="2026-11-17")]
    at = lambda day, hour, minute: datetime(2026, 11, day, hour, minute, tzinfo=clock.KST)   # noqa: E731
    assert ids(eligible(programs, at(17, 13, 59))) == ["talk", "allday"]
    assert ids(eligible(programs, at(17, 14, 0))) == ["allday"]
    assert ids(eligible(programs, at(16, 23, 0))) == ["talk", "allday"]       # 전날에는 시각과 상관없이 보인다
    assert ids(eligible(programs, at(18, 0, 0))) == []
    assert ids(eligible(programs, TODAY)) == ["talk", "allday"]               # 날짜만 주면 시각을 보지 않는다
    # 서버가 다른 시간대여도 한국 시각으로 바꿔서 본다: UTC 05:00 = 한국 14:00
    assert ids(eligible(programs, datetime(2026, 11, 17, 5, 0, tzinfo=timezone.utc))) == ["allday"]


def test_end_time_needs_an_end_date_and_clock_format(data):
    types_list = list(data.types.values())
    assert loader.validate_programs([row("a", "T01", 표시종료일="2026-11-19", 종료시각="14:00")], types_list) == []
    for bad in (dict(종료시각="14:00"), dict(표시종료일="2026-11-19", 종료시각="오후 2시"),
                dict(표시종료일="2026-11-19", 종료시각="24:00")):
        assert any("종료시각" in line for line in loader.validate_programs([row("a", "T01", **bad)], types_list)), bad


def test_profile_filters_by_gender_age_and_work(data):
    """답한 성별·나이·일 여부가 대상 조건에 안 맞는 곳은 뺀다. 빈칸은 조건 없음, 답이 없으면 거르지 않는다."""
    programs = [row("all", "T01", 첫상담="Y"), row("women", "T01", 대상성별="female", 첫상담="Y"),
                row("mid", "T01", 최소나이="50", 최대나이="69"),
                row("rest", "T01", 대상재직상태="not_working|self_employed")]
    who = lambda gender, age, work: {"P_GENDER": gender, "P_AGE": age, "P_WORK": work, "Q01": 5}   # noqa: E731

    assert ids(eligible(programs, TODAY, who("female", 61, "not_working"))) == ["all", "women", "mid", "rest"]
    assert ids(eligible(programs, TODAY, who("male", 61, "not_working"))) == ["all", "mid", "rest"]
    assert ids(eligible(programs, TODAY, who("female", 70, "self_employed"))) == ["all", "women", "rest"]   # 최대나이 초과
    assert ids(eligible(programs, TODAY, who("female", 49, "employed"))) == ["all", "women"]                # 최소나이 미만, 재직 중
    assert ids(eligible(programs, TODAY, who("female", 50, "not_working"))) == ["all", "women", "mid", "rest"]  # 경계 나이는 포함
    assert ids(eligible(programs, TODAY)) == ["all", "women", "mid", "rest"]             # 설문 없이 볼 때는 거르지 않는다
    assert ids(eligible(programs, TODAY, {})) == ["all", "women", "mid", "rest"]

    # 유형 결과, AI 후보, 일반 창구 모두 같은 거르기를 거친다
    man = who("male", 61, "not_working")
    assert ids(for_type(programs, data.types["T01"], None, TODAY, man).contacts) == ["all", "mid", "rest"]
    assert ids(ai_pool(programs, data.types, ["T01"], {}, TODAY, man)) == ["all", "mid", "rest"]
    assert ids(ai_pool(programs, data.types, [], {}, TODAY, man)) == ["all", "mid", "rest"]
    assert ids(first_consult(programs, TODAY, man)) == ["all"]


def test_chosen_detail_keeps_only_matching_places(data):
    """match_tags인 세부 질문: 고른 주제의 세부태그가 붙은 곳만 남긴다. 고르지 않으면 모두 보여준다."""
    health = data.types["T12"]
    programs = [row("quit", "T12", 세부태그="D12.smoking"), row("check", "T12", 세부태그="D12.check|D12.habits"),
                row("plain", "T12"), row("book", "T12", 종류="목록", 세부태그="D12.smoking")]
    everything = for_type(programs, health, None, TODAY)
    assert ids(everything.contacts) == ["check", "plain", "quit"] and ids(everything.lists) == ["book"]
    assert not everything.widened and not everything.needs_choice

    smoking = for_type(programs, health, "smoking", TODAY)
    assert ids(smoking.contacts) == ["quit"] and ids(smoking.lists) == ["book"] and not smoking.widened
    # AI 후보는 주제로 좁히지 않는다. 글에 다른 주제를 적어도 같은 유형 안에서는 찾을 수 있어야 한다
    assert ids(ai_pool(programs, data.types, ["T12"], {"T12": "smoking"}, TODAY)) == ["quit", "check", "plain"]

    # 고른 주제에 맞는 곳이 하나도 없으면 빼지 않고 이 유형의 곳을 그대로 보여주고, 그 사실을 알린다
    chronic = for_type(programs, health, "chronic", TODAY)
    assert ids(chronic.contacts) == ["check", "plain", "quit"] and chronic.widened
    assert ids(for_type([row("job", "T01")], health, "chronic", TODAY).contacts) == []      # 다른 유형의 곳은 섞지 않는다

    # match_tags가 아닌 세부 질문(일터찾기형)은 고른 뒤에도 빼지 않고 순서만 바꾼다
    jobs = [row("a", "T01", 세부태그="D01.new_work"), row("b", "T01")]
    picked = for_type(jobs, data.types["T01"], "new_work", TODAY)
    assert ids(picked.contacts) == ["a", "b"] and not picked.widened


def test_care_asks_who_before_showing_places(data):
    """돌봄(require_choice): 누구의 돌봄인지 고르기 전에는 곳을 보여주지 않는다."""
    care = data.types["T11"]
    assert care["detail"]["require_choice"] is True and care["detail"]["match_tags"] is True
    programs = [row("mine", "T11", 세부태그="D11.self"), row("parent", "T11", 세부태그="D11.adult")]
    before = for_type(programs, care, None, TODAY)
    assert before.needs_choice and not before.contacts and not before.lists
    assert ai_pool(programs, data.types, ["T11"], {}, TODAY) == []
    after = for_type(programs, care, "adult", TODAY)
    assert ids(after.contacts) == ["parent"] and not after.needs_choice
    assert any("require_choice" in line for line in loader.validate_types(
        [{"id": care["area"]}], [dict(care, detail=dict(care["detail"], require_choice="yes"))]))


def test_every_detail_topic_has_a_place_today(data):
    """지금 정보표로는 match_tags인 세부 질문의 모든 선택지에 맞는 곳이 한 곳 이상 있다(11/22 기준).

    정보표가 바뀌어 빈 주제가 생기면 이 테스트가 알려준다. 그때 화면은 빈 화면 대신 그 유형의 곳을 보여준다.
    """
    today = datetime(2026, 11, 22, 12, 0, tzinfo=clock.KST)
    empty = []
    for type_info in data.types.values():
        detail = detail_of(type_info)
        if not detail or not detail.get("match_tags"):
            continue
        for opt in detail["options"]:
            result = for_type(data.programs, type_info, opt["id"], today)
            if result.widened or not (result.contacts or result.lists):
                empty.append(f"{type_info['id']}.{opt['id']}")
    assert empty == []


def test_target_columns_are_checked(data):
    types_list = list(data.types.values())
    fine = row("a", "T01", 대상성별="female", 최소나이="50", 최대나이="69", 대상재직상태="not_working|employed")
    assert loader.validate_programs([fine], types_list) == []
    for column, bad in (("대상성별", dict(대상성별="여성")), ("대상재직상태", dict(대상재직상태="무직")),
                        ("최소나이", dict(최소나이="50세")), ("최소나이", dict(최소나이="70", 최대나이="60"))):
        assert any(column in line for line in loader.validate_programs([row("a", "T01", **bad)], types_list)), bad

    # 정보표의 조건 칸은 기본정보 문항의 선택지 id로 적으므로, 그 id를 바꾸면 알려준다
    questions = copy.deepcopy(data.questions)
    question(questions, "P_GENDER")["options"][0]["id"] = "man"
    assert any("P_GENDER" in line for line in loader.validate_questions(questions, types_list))


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


# ── AI에게 보낼 후보 ──

def test_ai_pool_has_only_showable_contacts(data):
    programs = [row("a", "T01"), row("b", "T04"), row("both", "T01|T04"), row("other", "T09"),
                row("closed", "T01", 매칭가능="N"), row("blocked", "T01", **{"55~64세참여": "불가"}),
                row("expired", "T01", 표시종료일="2026-11-16"), row("list", "T01", 종류="목록")]
    assert sorted(ids(ai_pool(programs, data.types, ["T01", "T04"], {}, TODAY))) == ["a", "b", "both"]
    # 유형을 정하지 않았으면 보여줘도 되는 곳 전체(목록 제외)
    assert sorted(ids(ai_pool(programs, data.types, [], {}, TODAY))) == ["a", "b", "both", "other"]


def test_ai_pool_follows_detail_exclude(data):
    programs = [row("paid", "T02", 보수="유급"), row("unpaid", "T02", 보수="무보수")]
    assert ids(ai_pool(programs, data.types, ["T02"], {"T02": "wage_required"}, TODAY)) == ["paid"]


# ── AI 답 검증 ──

def test_llm_ids_outside_candidates_are_dropped():
    raw = json.dumps({"matches": [{"id": "closed", "reason": "끝난 것"}, {"id": "없는id", "reason": "지어낸 것"},
                                  {"id": "ok", "reason": "맞는 것"}, {"id": "ok", "reason": "중복"}], "unmatched": ["해외여행"]})
    matches, unmatched = parse_answer(raw, ["ok", "other"], 3)
    assert matches == [{"id": "ok", "reason": "맞는 것"}] and unmatched == ["해외여행"]
    with pytest.raises(ValueError):
        parse_answer("죄송합니다", ["ok"], 3)


# ── AI 추가 추천 ──

POOL = [row("ok", "T01"), row("other", "T01")]


def answer(matches, unmatched=()):
    return json.dumps({"matches": [{"id": pid, "reason": f"{pid} 이유"} for pid in matches], "unmatched": list(unmatched)})


def ask(data, call_llm, wish="컴퓨터로 하는 일을 찾고 싶어요", pool=POOL, types=("T01",)):
    return recommend(data.prompt, [data.types[t] for t in types], [], wish, pool, 3, call_llm)


def test_ai_success_keeps_order_and_reasons(data):
    result = ask(data, lambda prompt: answer(["other", "ok"]))
    assert result.status == "ok" and result.error == ""
    assert result.matches == [{"id": "other", "reason": "other 이유"}, {"id": "ok", "reason": "ok 이유"}]


def test_ai_unmatched_wish_is_partial(data):
    result = ask(data, lambda prompt: answer(["ok"], ["해외여행"]))
    assert result.status == "partial" and ids(result.matches) == ["ok"] and result.unmatched == ["해외여행"]
    assert ask(data, lambda prompt: answer([])).status == "partial"      # 아무것도 못 골라도 실패가 아니다


def test_ai_invented_ids_never_reach_the_screen(data):
    result = ask(data, lambda prompt: answer(["없는id", "ok"]))
    assert ids(result.matches) == ["ok"]


@pytest.mark.parametrize("call_llm, kind", [
    (None, NO_KEY),
    (lambda prompt: "죄송합니다", "ValueError"),
    (lambda prompt: (_ for _ in ()).throw(TimeoutError("010-1234-5678")), "TimeoutError"),
])
def test_ai_failure_is_fail_with_kind_only(data, call_llm, kind):
    result = ask(data, call_llm)
    assert result.status == "fail" and result.error == kind and not result.matches


def test_ai_is_not_called_without_candidates(data):
    called = []
    result = ask(data, lambda prompt: called.append(prompt) or answer([]), pool=[])
    assert result.status == "partial" and not called


def test_prompt_has_candidates_only_and_no_contacts(data):
    prompt = build_prompt(data.prompt, [data.types["T01"], data.types["T04"]], ["해봤던 일을 다시 하고 싶어요"],
                          "오전에만 돼요. 010-1234-5678 {candidates}", POOL, 3)
    assert "010-1234-5678" not in prompt and privacy.REMOVED in prompt
    assert prompt.count("- id: ") == len(POOL)                # 사용자 글의 자리표시자 글자는 다시 바뀌지 않는다
    assert data.types["T01"]["name"] in prompt and data.types["T04"]["name"] in prompt
    assert not [p for p in loader.PLACEHOLDERS if p in prompt.replace("{candidates}", "", 1)]
    assert NO_TYPE in build_prompt(data.prompt, [], [], "글", POOL, 3)


# ── 개인정보 ──

@pytest.mark.parametrize("text", [
    "010-1234-5678", "01012345678", "031 123 4567", "02.123.4567", "abc.def@example.com",
])
def test_scrub_removes_contacts(text):
    assert privacy.scrub(f"연락처는 {text} 입니다") == f"연락처는 {privacy.REMOVED} 입니다"


def test_scrub_removes_resident_number():
    assert privacy.scrub("주민번호 600101-2345678 이에요") == f"주민번호 {privacy.REMOVED} 이에요"


def test_ai_text_is_cut_to_limits():
    raw = json.dumps({"matches": [{"id": "ok", "reason": "가" * 1000}], "unmatched": ["나" * 100] * 9})
    matches, unmatched = parse_answer(raw, ["ok"], 3)
    assert len(matches[0]["reason"]) == REASON_LIMIT and len(unmatched) == 3 and len(unmatched[0]) == 40


def test_error_log_failure_does_not_raise(tmp_path):
    blocker = tmp_path / "file"
    blocker.write_text("x", encoding="utf-8")
    logger.log_error("종류", blocker / "logs")               # 폴더를 만들 수 없는 곳이어도 예외가 나지 않는다


def test_scrub_keeps_normal_text():
    assert privacy.scrub("주 3일, 하루 4시간 2026년") == "주 3일, 하루 4시간 2026년"


# ── 기록 ──

LOGGED = {"state": RESULT, "primary": "T02", "secondary": None, "candidates": ["T02", "T05"], "scores": "T02=10|T05=10",
          "answers": "Q01=1|Q02=", "barriers": ["alone"], "program_ids": ["JOB01"]}


def test_log_has_no_free_text(tmp_path):
    logger.log_response("sid", {**LOGGED, "free_text": "직접 적은 글", "age": 61, "gender": "female",
                                "age_band": "60~64세", "work": "not_working"}, tmp_path)
    logger.log_event("sid", "detail", "T02", "wage_required", tmp_path)
    header, line = (tmp_path / "responses.csv").read_text(encoding="utf-8-sig").splitlines()
    assert header.split(",") == logger.RESPONSE_FIELDS
    assert "text" not in header and "T02|T05" in line
    # 정해진 열 밖의 값은 파일에 들어가지 않는다. 기본정보(성별·나이·일 여부)를 담는 열도 없다
    assert "직접 적은 글" not in line and "61" not in line
    assert not {"gender", "age", "age_band", "work"} & set(header.split(","))
    assert "female" not in line and "60~64세" not in line and "not_working" not in line
    assert (tmp_path / "events.csv").read_text(encoding="utf-8-sig").splitlines()[0].split(",") == logger.EVENT_FIELDS


def test_response_row_has_no_profile_and_no_free_text(tmp_path):
    """기록할 값은 화면이 아니라 logger가 만든다. 기본정보(성별·나이·일 여부)와 직접 적은 글은 들어가지 않는다."""
    answers = {"Q01": 5, "Q13": 4, "Q02": 2, "Q14": 1, "P_GENDER": "female", "P_AGE": 61, "P_WORK": "not_working",
               "Q_BARRIER": ["alone", "cost"], "Q_FREE": "직접 적은 글"}
    judged = score(answers, {"T01": ["Q01", "Q13"], "T05": ["Q02", "Q14"]}, 8, 7)
    fields = logger.response_fields(judged, answers, ["Q13", "Q01", "Q02", "Q14"], ["JOB01"])
    assert set(fields) == set(logger.RESPONSE_FIELDS[2:])           # 정해진 열만, 빠짐없이
    assert (fields["state"], fields["primary"], fields["scores"]) == (RESULT, "T01", "T01=9|T05=3")
    assert fields["answers"] == "Q01=5|Q02=2|Q13=4|Q14=1"
    assert not {"gender", "age", "age_band", "work"} & set(fields)
    assert fields["barriers"] == ["alone", "cost"] and fields["program_ids"] == ["JOB01"]
    logger.log_response("sid", fields, tmp_path)
    line = (tmp_path / "responses.csv").read_text(encoding="utf-8-sig").splitlines()[1]
    assert "61" not in line and "직접 적은 글" not in line
    assert "female" not in line and "not_working" not in line


def test_old_format_log_is_set_aside(tmp_path):
    old = tmp_path / "responses.csv"
    old.write_text("session_id,hour,type_ids,barriers,start,program_ids\nold,x,y,z,w,v\n", encoding="utf-8-sig")
    logger.log_response("sid", LOGGED, tmp_path)
    lines = old.read_text(encoding="utf-8-sig").splitlines()
    assert lines[0].split(",") == logger.RESPONSE_FIELDS and len(lines) == 2      # 새 파일로 시작
    kept = [p for p in tmp_path.iterdir() if "이전형식" in p.name]
    assert len(kept) == 1 and "old,x,y,z,w,v" in kept[0].read_text(encoding="utf-8-sig")   # 예전 기록은 보관


# ── 데이터 파일 검사 ──

def test_bad_files_give_korean_messages(data):
    types_list = copy.deepcopy(list(data.types.values()))
    types_list[0]["area"] = "없는영역"
    types_list[1]["detail"]["options"][0]["exclude"] = {"없는열": ["무보수"]}
    questions = [q for q in copy.deepcopy(data.questions) if q["id"] != "Q_FREE"]
    question(questions, "Q_BARRIER")["options"][0]["show"] = ["없는칸"]
    programs = [
        row("a", "T99"), row("a", "T01"),
        row("b", "T01", 세부태그="D01.없는선택지", 확인날짜="11/15", 종류="행사", 표시종료일="내일"),
        row("c", "T01", 출처URL=""),
    ]
    text = "\n".join(loader.validate(data.areas, types_list, questions, programs, "자리표시자 없음", data.scale, data.settings))
    for expected in ("없는영역", "없는열", "'Q_FREE'가 없습니다", "없는칸", "'T99'", "중복", "D01.없는선택지",
                     "확인날짜", "'종류' 칸은", "표시종료일", "출처URL이 있어야", "{candidates}"):
        assert expected in text, expected


def test_bad_scale_setup_gives_korean_messages(data):
    types_list = list(data.types.values())
    questions = [q for q in copy.deepcopy(data.questions) if q["id"] != "Q24"]      # T06 문항이 하나만 남음
    question(questions, "Q01")["type"] = "T99"                                      # 없는 유형, T01도 하나만 남음
    del question(questions, "Q02")["type"]
    question(questions, "P_AGE")["max"] = "백이십"
    question(questions, "P_WORK")["type"] = "T01"
    text = "\n".join(loader.validate_questions(questions, types_list))
    for expected in ("유형 'T06'의 척도 문항은 2개여야 합니다. (지금: 1개)", "type 'T99'가 types.yaml에 없습니다",
                     "유형 'T01'의 척도 문항은 2개여야", "문항 'Q02'은 척도 문항이므로 type", "문항 'P_AGE'에는 min과 max",
                     "문항 'P_WORK'의 type은 척도 문항"):
        assert expected in text, expected
    assert loader.validate_questions(data.questions, types_list) == []

    assert loader.validate_scale(data.scale) == []
    assert "한 번씩" in loader.validate_scale(data.scale[:4])[0]
    assert "한 번씩" in loader.validate_scale(data.scale + [{"value": 5, "label": "또"}])[0]
    assert "label" in loader.validate_scale([{"value": v} for v in (5, 4, 3, 2, 1)])[0]

    assert loader.validate_scoring(data.settings) == []
    for bad in ({}, {"scoring": {"high": 8}}, {"scoring": {"high": 7, "confirm": 7}},
                {"scoring": {"high": 11, "confirm": 7}}, {"scoring": {"high": 8, "confirm": 1}},
                {"scoring": {"high": "8", "confirm": 7}}):
        assert loader.validate_scoring(bad), bad


def test_question_between_scale_questions_is_reported(data):
    questions = copy.deepcopy(data.questions)
    barrier = question(questions, "Q_BARRIER")
    questions.remove(barrier)
    questions.insert(questions.index(question(questions, "Q05")), barrier)      # 척도 문항 사이로 옮김
    text = "\n".join(loader.validate_questions(questions, list(data.types.values())))
    assert "문항 'Q_BARRIER'가 척도 문항 사이에 끼어 있습니다" in text


def test_missing_screen_text_is_reported_at_start(data):
    assert loader.validate_text(data.settings) == []
    settings = copy.deepcopy(data.settings)
    del settings["text"]["ai_stale"]                      # 드물게 나오는 문구
    settings["text"]["more_button"] = "더 보기 ({num}곳)"   # 코드가 채워 주지 않는 자리표시자
    settings["text"]["ai_unmatched"] = "못 찾음 {items"   # 중괄호 짝이 안 맞음
    del settings["fallback_card"]["phone"]
    del settings["app_title"]
    text = "\n".join(loader.validate_text(settings))
    for expected in ("'ai_stale' 문구가 없습니다", "'more_button'에는 중괄호를 {count} 꼴로만", "'ai_unmatched'에는 중괄호를",
                     "fallback_card에 'phone'", "app_title"):
        assert expected in text, expected
    assert loader.validate_text({}) != []


def test_text_keys_match_the_screen_code():
    """loader가 검사하는 문구 목록이 화면 코드가 실제로 쓰는 문구와 같아야 한다."""
    source = "".join((loader.APP_DIR / name).read_text(encoding="utf-8") for name in ("main.py", "ui/components.py"))
    used = set(re.findall(r'text\["(\w+)"\]', source))
    filled = set(re.findall(r'text\["(\w+)"\]\.format', source))
    assert used == set(loader.TEXT_KEYS) | set(loader.TEXT_FIELDS)
    assert filled == set(loader.TEXT_FIELDS)
    assert not set(loader.TEXT_KEYS) & set(loader.TEXT_FIELDS)


def test_every_type_needs_a_feature_that_fits_the_card(data):
    """유형마다 특징 글(feature)이 있어야 하고, 결과 사진에 들어가는 길이를 넘으면 알려 준다."""
    types_list = list(data.types.values())
    areas = [{"id": t["area"]} for t in types_list]
    assert not loader.validate_types(areas, types_list)
    first = types_list[0]
    missing = loader.validate_types(areas, [{k: v for k, v in first.items() if k != "feature"}])
    assert any("feature가 없습니다" in line for line in missing)
    too_long = loader.validate_types(areas, [dict(first, feature="가" * (loader.FEATURE_MAX + 1))])
    assert any("넘습니다" in line for line in too_long)


def test_every_type_has_a_character_for_each_gender(data):
    """유형마다 성별 선택지 수만큼 캐릭터 그림 파일이 있다. 그림이 없는 경우에는 None이라 화면이 그림 없이 그려진다."""
    from app.ui.components import CHARACTER_DIR, character_image
    genders = [option["id"] for option in question(data.questions, "P_GENDER")["options"]]
    for type_id in data.types:
        for gender in genders:
            assert character_image(type_id, gender) == CHARACTER_DIR / f"{type_id.lower()}-{gender}.webp"
    assert len(list(CHARACTER_DIR.glob("*.webp"))) == len(data.types) * len(genders)   # 쓰지 않는 그림도 없다
    assert character_image("T01", None) is None                  # 성별 답이 없을 때(질문 없이 둘러보기)
    assert character_image("T99", genders[0]) is None            # 그림을 아직 넣지 않은 유형


def test_home_characters_have_picture_files(data):
    """시작 화면에 세우는 캐릭터는 모두 실제 유형·성별 선택지이고 그림 파일이 있다. 없으면 그 칸이 비어 상자가 어긋난다."""
    from app.ui.components import HOME_CHARACTERS, character_image
    genders = [option["id"] for option in question(data.questions, "P_GENDER")["options"]]
    assert len(HOME_CHARACTERS) == 3                             # home.css의 그림 상자가 세 칸이다
    for type_id, gender in HOME_CHARACTERS:
        assert type_id in data.types and gender in genders
        assert character_image(type_id, gender) is not None


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
    logger.log_response("s1", LOGGED, log_dir=tmp_path)
    logger.log_event("s1", "detail", "T01", "new_work", log_dir=tmp_path)
    assert "기록 실패" in (tmp_path / "errors.log").read_text(encoding="utf-8")


def test_log_switch_off_writes_nothing(tmp_path, monkeypatch):
    """settings.yaml의 save_log가 false면 기록 파일을 만들지 않는다."""
    monkeypatch.setattr(logger, "ENABLED", True)
    logger.set_enabled(False)
    logger.log_response("s1", LOGGED, log_dir=tmp_path)
    logger.log_event("s1", "detail", "T01", "new_work", log_dir=tmp_path)
    assert not list(tmp_path.iterdir())


# ── 뜻 없는 주관식 거르기 ──

EMPTY_WORDS = ["없어", "없어요", "딱히 없어요", "몰라요"]


@pytest.mark.parametrize("text", ["ㅇ", "ㅇㅇ", "ㅋㅋㅋ", "...", " ? ", "없어", "없어요.", " 딱히  없어요 ", "몰라요~"])
def test_has_wish_rejects_meaningless_text(text):
    assert not has_wish(text, EMPTY_WORDS)


@pytest.mark.parametrize("text", ["요가", "수영", "오전에 할 일", "허리 아픈 데 없어요", "일자리는 몰라요 알려 주세요", "PC 배우기"])
def test_has_wish_keeps_short_but_real_wishes(text):
    assert has_wish(text, EMPTY_WORDS)


def test_real_empty_words_do_not_block_real_wishes():
    """settings.yaml의 목록이 정답표의 글(실제 희망)을 막지 않는다."""
    words = loader.load_all().settings["free_empty_words"]
    assert not has_wish("없어", words) and not has_wish("ㅇ", words)
    assert has_wish("요가", words) and has_wish("같이 걷기 운동 할 동네 친구들 모임을 찾고 싶어요.", words)
