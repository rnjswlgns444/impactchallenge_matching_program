"""화면 테스트. 실제 데이터 파일로 앱을 끝까지 눌러 보고, 오류와 기록 행 수를 확인한다. 실제 AI는 부르지 않는다.

설문은 28문항(기본정보 3, 척도 24, 걸림돌 1)을 실제로 하나씩 눌러서 지나간다.
"""
from __future__ import annotations

import csv
import json
from html import escape
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from app.core import candidates, llm_matcher, loader, logger
from app.core import selection as sel

MAIN = str(Path(__file__).resolve().parents[1] / "main.py")


@pytest.fixture
def app(monkeypatch, tmp_path):
    monkeypatch.setattr(logger, "LOG_DIR", tmp_path)      # 테스트가 실제 기록(app/logs)을 건드리지 않게 한다
    monkeypatch.setattr(logger, "ENABLED", True)
    monkeypatch.setattr(logger, "set_enabled", lambda on: None)   # settings.yaml에서 꺼 두어도 기록 동작을 확인한다
    at = AppTest.from_file(MAIN, default_timeout=30)
    at.run()
    assert not at.exception
    return at


def click(at: AppTest, key: str) -> None:
    at.button(key=key).click().run()
    assert not at.exception


def page_text(at: AppTest) -> str:
    return " ".join(m.value for m in at.markdown)


def rows(tmp_path: Path, name: str) -> list[dict]:
    with (tmp_path / name).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def take_survey(at: AppTest, base: int | None = 1, barrier: str | None = None, profile: bool = True, **by_type) -> None:
    """시작 화면에서 결과 화면까지 눌러서 간다.

    척도 문항은 모두 base점으로 답하고(None이면 건너뜀), 적어 준 유형의 두 문항만 그 값으로 답한다.
    예) take_survey(at, T01=(5, 5))  /  take_survey(at, base=3)  /  take_survey(at, base=None, profile=False)
    """
    data = loader.load_all()
    values = {q["id"]: base for q in sel.scale_questions(data.questions)}
    for type_id, pair in by_type.items():
        values.update(zip(sel.type_questions(data.questions, data.types)[type_id], pair))

    click(at, "start")
    if profile:
        click(at, "opt_P_GENDER_female")
        at.number_input(key="num_P_AGE").set_value(61)
        click(at, "next_P_AGE")
        click(at, "opt_P_WORK_not_working")
    else:
        for key in ("next_P_GENDER", "skip_P_AGE", "next_P_WORK"):
            click(at, key)
    for qid, value in values.items():
        click(at, f"next_{qid}" if value is None else f"opt_{qid}_{value}")
    if barrier:
        click(at, f"opt_Q_BARRIER_{barrier}")
    click(at, "next_Q_BARRIER")


# ── 설문 ──

def test_survey_shows_one_question_at_a_time_without_type_names(app):
    """척도 문항은 단추 5개와 진행 표시가 나오고, 유형 이름은 보이지 않는다. 돌아가면 앞서 고른 답이 표시된다."""
    data = loader.load_all()
    text = data.settings["text"]
    for key in ("start", "next_P_GENDER", "skip_P_AGE", "next_P_WORK"):
        click(app, key)
    page = page_text(app)
    assert text["progress_scale"].format(number=1, total=24) in page and text["scale_help"] in page
    assert [b.label for b in app.button][:5] == [opt["label"] for opt in data.scale]
    assert not [t["name"] for t in data.types.values() if t["name"] in page]

    click(app, "opt_Q01_4")
    assert text["progress_scale"].format(number=2, total=24) in page_text(app)
    click(app, "back_survey")
    assert "✓ " + data.scale[1]["label"] in [b.label for b in app.button]      # 4점 = '그래요'
    click(app, "opt_Q01_2")                                                      # 고쳐서 답할 수 있다
    assert app.session_state.answers["Q01"] == 2


# ── 결과: 판정 상태별 ──

def test_one_type_to_the_end(app, tmp_path):
    """일터찾기형만 높음: 대표 유형 하나가 나오고, 숨긴 프로그램은 없고, 기록은 한 행이다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, barrier="alone", T01=(5, 5))

    page = page_text(app)
    assert text["type_label"] in page and data.types["T01"]["name"] in page
    assert data.types["T04"]["name"] not in page               # 다른 유형은 첫 화면에 늘어놓지 않는다
    assert "혼자 가도 괜찮을까요?" in page                      # 걸림돌이 물어볼 문장으로 이어진다
    assert text["call_button"] in page                         # 전화 단추는 접지 않고 보인다
    shown = {p["프로그램명"] for p in data.programs if p["매칭가능"] == "Y"}
    hidden = {p["프로그램명"] for p in data.programs if p["매칭가능"] != "Y"} - shown
    assert not [name for name in hidden if name in page]

    click(app, "detail_T01_previous_work")                     # 세부 답은 물어볼 문장에 들어간다
    assert "해봤던 일을 다시 하고 싶어요" in page_text(app)

    click(app, "more_types")                                   # 다른 유형은 본인이 눌러야 열린다
    click(app, "browse_T04")
    page = page_text(app)
    assert data.types["T04"]["name"] in page and text["type_label_other"] in page
    # 두 유형에 모두 해당하는 곳은 카드를 되풀이하지 않고 한 줄로 알린다
    assert escape(text["seen_note"].format(type=data.types["T01"]["name"])) in page

    logged = rows(tmp_path, "responses.csv")
    assert len(logged) == 1                                    # 유형을 더 열어도 행은 늘지 않는다
    row = logged[0]
    assert (row["state"], row["primary"], row["secondary"], row["barriers"]) == ("result", "T01", "", "alone")
    assert "T01=10" in row["scores"] and "Q01=5" in row["answers"] and "Q02=1" in row["answers"]
    assert (row["gender"], row["age_band"], row["work"]) == ("female", "60~64세", "not_working")
    assert "age" not in row                                    # 나이 숫자를 담는 열이 없다
    assert [e["target"] for e in rows(tmp_path, "events.csv") if e["event"] == "browse"] == ["T04"]


def test_second_place_is_offered_as_one_button(app):
    """대표 외에 8점 이상이 하나 더 있으면 단추 하나로 권하고, 누르면 그 아래에 안내가 나온다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T09=(5, 5), T10=(4, 4))
    page = page_text(app)
    assert data.types["T09"]["name"] in page and text["secondary_heading"] in page
    assert data.types["T10"]["statement"] not in page
    click(app, "browse_T10")
    assert data.types["T10"]["statement"] in page_text(app)


def test_tie_lets_the_user_choose(app, tmp_path):
    """최고점이 같으면 자동으로 정하지 않고 묻는다. 고른 뒤에 바꾸거나, 고르지 않고 둘러볼 수 있다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T05=(5, 5), T07=(5, 5))

    page = page_text(app)
    assert text["tie_two"] in page and text["type_label"] not in page
    assert [b.label for b in app.button][:2] == [data.types["T05"]["statement"], data.types["T07"]["statement"]]
    row = rows(tmp_path, "responses.csv")[0]
    assert (row["state"], row["primary"], row["candidates"]) == ("choose_priority", "", "T05|T07")

    click(app, "priority_T07")
    page = page_text(app)
    assert text["type_label"] in page and data.types["T07"]["name"] in page
    assert text["secondary_heading"] in page                   # 고르지 않은 쪽은 '함께 살펴보세요'로 남는다
    assert app.button(key="browse_T05")

    click(app, "repick")
    assert text["tie_two"] in page_text(app)
    click(app, f"priority_{sel.DEFER}")
    page = page_text(app)
    assert text["unknown_intro"] in page and text["also_heading"] in page and text["type_label"] not in page

    assert len(rows(tmp_path, "responses.csv")) == 1           # 고르는 것은 답을 바꾼 것이 아니다
    events = rows(tmp_path, "events.csv")
    assert [e["target"] for e in events if e["event"] == "priority"] == ["T07", sel.DEFER]
    assert not [e for e in events if e["event"] == "answers_changed"]


def test_seven_points_is_confirmed_by_the_user(app):
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T01=(4, 3))
    page = page_text(app)
    assert text["confirm_one"] in page and text["type_label"] not in page
    click(app, "priority_T01")
    page = page_text(app)
    assert text["type_label"] in page and data.types["T01"]["name"] in page


def test_low_scores_browse_all_types(app, tmp_path):
    """모두 '보통': 유형을 붙이지 않고 일반 창구와 둘러보기를 보여준다. 누른 유형만 연다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, base=3)

    page = page_text(app)
    assert text["low_interest"] in page and text["consult_heading"] in page
    assert text["type_label"] not in page                      # 대표 유형이 없다
    row = rows(tmp_path, "responses.csv")[0]
    assert (row["state"], row["primary"], row["candidates"]) == ("explore", "", "")

    click(app, "browse_T07")                                   # 안내할 곳이 없는 유형도 막다른 화면이 아니다
    assert text["no_program"] in page_text(app)
    click(app, "browse_T09")
    assert data.types["T09"]["statement"] in page_text(app)
    click(app, "browse_T09")                                   # 다시 누르면 닫힌다
    assert data.types["T09"]["statement"] not in page_text(app)
    assert len(rows(tmp_path, "responses.csv")) == 1


def test_everything_skipped_is_not_judged(app, tmp_path):
    """전부 건너뛰어도 끝까지 가고, 답하지 않은 것을 0점이나 3점으로 채우지 않는다."""
    text = loader.load_all().settings["text"]
    take_survey(app, base=None, profile=False)
    page = page_text(app)
    assert text["incomplete_all"] in page and text["consult_heading"] in page
    row = rows(tmp_path, "responses.csv")[0]
    assert (row["state"], row["scores"], row["gender"], row["age_band"], row["work"]) == ("incomplete", "", "", "", "")
    assert "Q01=|" in row["answers"]


def test_one_skipped_question_holds_only_that_type(app, tmp_path):
    take_survey(app, T01=(5, 5), T09=(5, None))
    text = loader.load_all().settings["text"]
    page = page_text(app)
    assert text["type_label"] in page and text["incomplete_note"] in page
    row = rows(tmp_path, "responses.csv")[0]
    assert row["primary"] == "T01" and "T09" not in row["scores"]


def test_changed_answer_is_an_event_not_a_new_row(app, tmp_path):
    """결과에서 돌아가 답을 바꾸면 행을 늘리지 않고 이벤트로 남긴다."""
    take_survey(app, T01=(5, 5))
    click(app, "back_result")
    click(app, "opt_Q_BARRIER_cost")
    click(app, "next_Q_BARRIER")
    assert len(rows(tmp_path, "responses.csv")) == 1
    changed = [e for e in rows(tmp_path, "events.csv") if e["event"] == "answers_changed"]
    assert len(changed) == 1 and changed[0]["value"] == "cost"


def test_type_without_places_does_not_say_confirmed_places(monkeypatch, tmp_path):
    """대표 유형에 안내할 곳이 없으면 '확인한 곳이에요'라고 말하지 않고, 함께 찾아 주는 창구로 잇는다."""
    real_load = loader.load_all

    def load_without_t01():
        # 실제 정보표에 기대지 않도록, 일터찾기형에 해당하는 곳을 모두 뺀다(일반 창구는 남긴다)
        data = real_load()
        data.programs[:] = [p for p in data.programs if "T01" not in p["유형태그"] or p["첫상담"] == "Y"]
        for program in data.programs:
            program["유형태그"] = "|".join(tag for tag in program["유형태그"].split("|") if tag != "T01")
        return data

    monkeypatch.setattr(loader, "load_all", load_without_t01)
    monkeypatch.setattr(logger, "LOG_DIR", tmp_path)
    monkeypatch.setattr(logger, "set_enabled", lambda on: None)   # 앱이 기록 설정을 바꿔 다른 테스트에 남지 않게 한다
    at = AppTest.from_file(MAIN, default_timeout=30)
    at.run()
    assert not at.exception
    text = real_load().settings["text"]
    take_survey(at, T01=(5, 5))
    page = page_text(at)
    assert text["type_label"] in page and text["no_program"] in page
    assert text["result_intro"] not in page
    assert text["consult_heading"] in page or text["call_button"] in page


def test_type_with_places_keeps_the_intro(app):
    take_survey(app, T01=(5, 5))
    assert loader.load_all().settings["text"]["result_intro"] in page_text(app)


def test_start_screen_warns_that_refresh_clears_answers(app):
    assert escape(loader.load_all().settings["text"]["start_refresh"]) in page_text(app)


def test_start_screen_tells_the_truth_about_saving(app):
    """시작 화면의 저장 안내가 settings.yaml의 save_log 값과 맞는다."""
    settings = loader.load_all().settings
    key = "start_privacy_saving" if settings.get("save_log", False) else "start_privacy"
    assert settings["text"][key] in page_text(app)


# ── 직접 적기와 AI 추가 추천 (AI는 가짜 함수로 바꾼다) ──

WISH = "오전에 할 수 있는 사무 일을 찾고 싶어요 010-1234-5678"


@pytest.fixture
def fake_ai(monkeypatch):
    """실제 AI 대신 쓰는 가짜. prompts에 보낸 지시문이 쌓이고, reply를 바꾸면 답이 바뀐다."""
    box = {"prompts": [], "reply": None}

    def make_caller(provider, api_key, model, effort, timeout):
        def call(prompt: str) -> str:
            box["prompts"].append(prompt)
            if isinstance(box["reply"], Exception):
                raise box["reply"]
            return json.dumps(box["reply"], ensure_ascii=False)
        return call

    monkeypatch.setattr(llm_matcher, "make_caller", make_caller)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    return box


def to_result_with_t01(at: AppTest) -> None:
    take_survey(at, T01=(5, 5))


def write_wish(at: AppTest, wish: str) -> None:
    at.text_area(key="free_text").set_value(wish).run()
    click(at, "free_find")


def test_free_text_adds_ai_picks_with_reasons(app, fake_ai, tmp_path):
    """글을 적고 찾아보기를 누르면 AI가 고른 곳과 이유가 나온다. 지어낸 id는 나오지 않고, 글은 남지 않는다."""
    data = loader.load_all()
    settings = data.settings["text"]
    pool = candidates.ai_pool(data.programs, data.types, ["T01"], {}, candidates.today_kst())
    fake_ai["reply"] = {"matches": [{"id": pool[-1]["id"], "reason": "오전에 사무 일을 찾으신다고 해서 골랐어요."},
                                    {"id": "없는id", "reason": "지어낸 곳이에요."}], "unmatched": []}
    to_result_with_t01(app)
    assert settings["ai_heading"] not in page_text(app) and not fake_ai["prompts"]   # 적기 전에는 부르지 않는다

    write_wish(app, WISH)
    text = page_text(app)
    assert settings["ai_heading"] in text and "오전에 사무 일을 찾으신다고 해서 골랐어요." in text
    assert "지어낸 곳이에요." not in text
    assert len(fake_ai["prompts"]) == 1

    # AI에게는 걸러진 후보만, 전화번호를 지운 글만 간다. 기본정보(성별·나이·일 여부)는 가지 않는다
    prompt = fake_ai["prompts"][0]
    assert prompt.count("- id: ") == len(pool) and "010-1234-5678" not in prompt
    assert data.types["T01"]["name"] in prompt
    assert "female" not in prompt and "not_working" not in prompt and "61세" not in prompt
    blocked = [p["프로그램명"] for p in data.programs if p["매칭가능"] != "Y"]
    assert not [name for name in blocked if name in prompt]

    # 기록에는 상태와 고른 id만 남는다
    event = [e for e in rows(tmp_path, "events.csv") if e["event"] == "ai"]
    assert event == [{**event[0], "target": "ok", "value": pool[-1]["id"]}]
    saved = "".join(path.read_text(encoding="utf-8-sig") for path in tmp_path.iterdir())
    assert "사무 일" not in saved and "010-1234-5678" not in saved

    click(app, "detail_T01_previous_work")                   # 다른 단추를 눌러도 AI를 다시 부르지 않는다
    assert len(fake_ai["prompts"]) == 1 and settings["ai_heading"] in page_text(app)


def test_opened_type_joins_the_ai_candidates(app, fake_ai):
    """본인이 연 유형의 프로그램도 AI 후보에 들어간다. 열지 않은 유형은 들어가지 않는다."""
    data = loader.load_all()
    fake_ai["reply"] = {"matches": [], "unmatched": []}
    to_result_with_t01(app)
    click(app, "more_types")
    click(app, "browse_T09")
    write_wish(app, "연금도 궁금해요")
    pool = candidates.ai_pool(data.programs, data.types, ["T01", "T09"], {}, candidates.today_kst())
    prompt = fake_ai["prompts"][0]
    assert prompt.count("- id: ") == len(pool)
    assert data.types["T01"]["name"] in prompt and data.types["T09"]["name"] in prompt


def test_empty_free_text_does_not_call_ai(app, fake_ai):
    to_result_with_t01(app)
    click(app, "free_find")
    text = page_text(app)
    assert loader.load_all().settings["text"]["free_empty"] in text and not fake_ai["prompts"]


@pytest.mark.parametrize("wish", ["ㅇ", "없어", "없어요."])
def test_meaningless_free_text_does_not_call_ai(app, fake_ai, tmp_path, wish):
    """'ㅇ', '없어'처럼 원하는 점이 없는 글에는 AI를 부르지 않고 더 적어 달라고 한다. 기본 결과는 그대로다."""
    data = loader.load_all()
    settings = data.settings["text"]
    fake_ai["reply"] = {"matches": [], "unmatched": []}
    to_result_with_t01(app)
    write_wish(app, wish)
    text = page_text(app)
    assert escape(settings["free_unclear"]) in text and not fake_ai["prompts"]
    assert settings["ai_heading"] not in text and settings["ai_none"] not in text
    assert data.types["T01"]["name"] in text and settings["call_button"] in text
    event = [e for e in rows(tmp_path, "events.csv") if e["event"] == "ai"]
    assert [(e["target"], e["value"]) for e in event] == [("unclear", "")]


def test_ai_failure_keeps_basic_result(app, fake_ai, tmp_path):
    """AI가 실패해도 기본 결과는 그대로이고, 오류 기록에 사용자 글이 없다."""
    data = loader.load_all()
    fake_ai["reply"] = TimeoutError(WISH)
    to_result_with_t01(app)
    write_wish(app, WISH)
    text = page_text(app)
    assert data.settings["text"]["ai_fail"] in text and data.types["T01"]["name"] in text
    assert data.settings["text"]["call_button"] in text
    errors = (tmp_path / "errors.log").read_text(encoding="utf-8")
    assert "TimeoutError" in errors and "사무 일" not in errors


def test_nothing_matched_leads_to_general_window(app, fake_ai):
    """맞는 곳이 없으면 못 찾았다고 말하고 함께 찾아 주는 창구로 잇는다. 대표 유형이 없는 사람도 쓸 수 있다."""
    data = loader.load_all()
    fake_ai["reply"] = {"matches": [], "unmatched": ["해외여행"]}
    take_survey(app, base=3)
    write_wish(app, "해외여행을 가고 싶어요")
    text = page_text(app)
    assert data.settings["text"]["ai_none"] in text
    assert data.settings["text"]["ai_heading"] not in text     # 찾은 곳이 없으면 제목을 내지 않는다
    everything = candidates.ai_pool(data.programs, data.types, [], {}, candidates.today_kst())
    assert fake_ai["prompts"][0].count("- id: ") == len(everything)
    assert llm_matcher.NO_TYPE in fake_ai["prompts"][0]


def test_picked_place_already_shown_keeps_call_button(app, fake_ai):
    """AI가 고른 곳이 아래에 이미 나온 곳이어도 이유와 전화 단추를 그 자리에서 보여준다. 글을 고치면 옛 결과를 숨긴다."""
    data = loader.load_all()
    settings = data.settings["text"]
    pool = candidates.ai_pool(data.programs, data.types, ["T01"], {}, candidates.today_kst())
    fake_ai["reply"] = {"matches": [{"id": pool[0]["id"], "reason": "가까운 곳이라 골랐어요."}], "unmatched": ["해외여행"]}
    to_result_with_t01(app)
    calls_before = page_text(app).count(settings["call_button"])
    write_wish(app, WISH)
    text = page_text(app)
    assert escape(settings["ai_seen_note"].format(type=data.types["T01"]["name"])) in text
    assert text.count(settings["call_button"]) > calls_before
    assert "해외여행" in text                                  # 일부만 찾았으면 못 찾은 부분을 알려 준다
    # 직접 적기 구간은 화면 맨 위에 있다: AI가 고른 곳이 대표 유형 상자와 문의할 곳보다 먼저 나온다
    assert text.index(settings["ai_heading"]) < text.index(settings["type_label"])
    assert text.index(settings["ai_heading"]) < text.index(settings["contacts_heading"])

    app.text_area(key="free_text").set_value("다른 글").run()
    text = page_text(app)
    assert escape(settings["ai_stale"]) in text and "가까운 곳이라 골랐어요." not in text
    assert len(fake_ai["prompts"]) == 1


def test_find_button_is_locked_while_searching(app, fake_ai, monkeypatch):
    """찾는 동안에는 '찾는 중'이 켜져 단추와 글 상자가 잠기고, 답이 나오면 풀려서 다시 찾을 수 있다."""
    import streamlit as st

    pool = candidates.ai_pool(loader.load_all().programs, loader.load_all().types, ["T01"], {}, candidates.today_kst())
    fake_ai["reply"] = {"matches": [{"id": pool[0]["id"], "reason": "첫 번째 답이에요."}], "unmatched": []}
    during = []
    real_make = llm_matcher.make_caller

    def make_caller(*args):
        call = real_make(*args)

        def watched(prompt: str) -> str:
            during.append(bool(st.session_state.ai_pending))      # AI가 불리는 순간의 상태
            return call(prompt)
        return watched

    monkeypatch.setattr(llm_matcher, "make_caller", make_caller)
    to_result_with_t01(app)
    assert not app.button(key="free_find").disabled and not app.text_area(key="free_text").disabled

    write_wish(app, WISH)
    assert during == [True] and len(fake_ai["prompts"]) == 1      # 한 번 눌러서 한 번만 부른다
    assert app.session_state.ai_pending is False                   # 답이 나오면 풀린다
    assert not app.button(key="free_find").disabled and not app.text_area(key="free_text").disabled
    assert "첫 번째 답이에요." in page_text(app)

    fake_ai["reply"] = {"matches": [{"id": pool[0]["id"], "reason": "두 번째 답이에요."}], "unmatched": []}
    click(app, "free_find")                                        # 답이 나온 뒤에는 다시 찾을 수 있다
    assert during == [True, True] and len(fake_ai["prompts"]) == 2
    assert "두 번째 답이에요." in page_text(app) and "첫 번째 답이에요." not in page_text(app)


def test_find_button_is_drawn_locked_when_pending(app, fake_ai, monkeypatch):
    """'찾는 중'인 화면은 단추와 글 상자를 잠근 채로 그린다. (AI의 답을 기다리는 동안 보이는 화면)"""
    import streamlit as st

    def never_answers(*args, **kwargs):
        st.stop()                                                  # 호출 도중에 화면을 멈춰, 그 순간 그려진 것을 본다

    monkeypatch.setattr(llm_matcher, "recommend", never_answers)
    to_result_with_t01(app)
    write_wish(app, WISH)
    assert app.session_state.ai_pending is True
    assert app.button(key="free_find").disabled and app.text_area(key="free_text").disabled


def test_detail_question_takes_one_answer(app):
    """'조금 더 맞춰 보기'는 하나만 고른다. 다른 것을 누르면 앞의 것이 풀리고, '아직 모르겠어요'는 없다."""
    to_result_with_t01(app)
    assert "아직 모르겠어요" not in [b.label for b in app.button]
    click(app, "detail_T01_previous_work")
    click(app, "detail_T01_new_work")
    assert app.session_state.details["T01"] == "new_work"
    labels = [b.label for b in app.button]
    assert "✓ 새로운 일을 해보고 싶어요" in labels and "✓ 해봤던 일을 다시 하고 싶어요" not in labels
    click(app, "detail_T01_new_work")                              # 다시 누르면 풀린다
    assert not app.session_state.details["T01"]


def test_no_detail_question_allows_many_answers():
    for type_info in loader.load_all().types.values():
        detail = type_info.get("detail") or {}
        assert detail.get("selection") == "single", type_info["id"]
        assert not [opt for opt in detail["options"] if opt.get("exclusive")], type_info["id"]


# ── 겉모습과 공유 ──

def test_top_bar_and_start_steps_are_shown(app):
    """모든 화면 맨 위에 앱 이름 띠가 있고, 시작 화면에는 순서 안내가 나온다."""
    text = loader.load_all().settings["text"]
    page = page_text(app)
    assert text["top_title"] in page
    assert all(step in page for step in text["start_steps"])
    click(app, "start")
    assert text["top_title"] in page_text(app)


def test_share_box_sends_no_answers(app):
    """결과 화면 맨 아래에 공유 단추가 있다. 공유에 쓰이는 글에는 답, 유형 이름, 기본정보가 들어가지 않는다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, barrier="alone", T01=(5, 5))
    page = page_text(app)
    assert text["share_button"] in page and text["share_heading"] in page

    sent = " ".join(str(frame.proto) for frame in app.get("iframe"))
    assert text["share_message"] in sent
    assert data.types["T01"]["name"] not in sent and "female" not in sent and "61" not in sent
