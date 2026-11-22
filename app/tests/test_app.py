"""화면 테스트. 실제 데이터 파일로 앱을 끝까지 눌러 보고, 오류와 기록 행 수를 확인한다. 실제 AI는 부르지 않는다.

설문은 28문항(기본정보 3, 척도 24, 걸림돌 1)을 실제로 하나씩 눌러서 지나간다.
"""
from __future__ import annotations

import csv
import json
from datetime import datetime
from html import escape
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from app.core import candidates, clock, llm_matcher, loader, logger
from app.core import selection as sel

MAIN = str(Path(__file__).resolve().parents[1] / "main.py")


NOW = datetime(2026, 11, 22, 12, 0, tzinfo=clock.KST)


@pytest.fixture(autouse=True)
def fixed_clock(monkeypatch):
    """앱과 테스트가 같은 시각을 보게 시계를 고정한다. 그러지 않으면 종료시각이 있는 행 때문에 날짜·시각에 따라 결과가 달라진다."""
    monkeypatch.setattr(clock, "now", lambda: NOW)


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


def take_survey(at: AppTest, base: int = 1, barrier: str = "none", **by_type) -> None:
    """시작 화면에서 결과 화면까지 눌러서 간다. 모든 문항은 답해야 넘어간다.

    척도 문항은 모두 base점으로 답하고, 적어 준 유형의 두 문항만 그 값으로 답한다.
    걸림돌은 하나는 골라야 하므로, 따로 적지 않으면 '특별히 없어요'(none)를 고른다.
    예) take_survey(at, T01=(5, 5))  /  take_survey(at, base=3)  /  take_survey(at, barrier="alone")
    """
    data = loader.load_all()
    values = {q["id"]: base for q in sel.scale_questions(data.questions)}
    for type_id, pair in by_type.items():
        values.update(zip(sel.type_questions(data.questions, data.types)[type_id], pair))

    click(at, "start")
    answer_profile(at)
    for qid, value in values.items():
        click(at, f"opt_{qid}_{value}")
    click(at, f"opt_Q_BARRIER_{barrier}")
    click(at, "next_Q_BARRIER")


def answer_profile(at: AppTest) -> None:
    """기본정보 세 문항(성별, 나이, 일 여부)에 답한다."""
    click(at, "opt_P_GENDER_female")
    at.number_input(key="num_P_AGE").set_value(61)
    click(at, "next_P_AGE")
    click(at, "opt_P_WORK_not_working")


# ── 설문 ──

def test_survey_shows_one_question_at_a_time_without_type_names(app):
    """척도 문항은 단추 5개와 진행 표시가 나오고, 유형 이름은 보이지 않는다. 돌아가면 앞서 고른 답이 표시된다."""
    data = loader.load_all()
    text = data.settings["text"]
    click(app, "start")
    answer_profile(app)
    page = page_text(app)
    assert text["progress_scale"].format(number=4, total=28) in page and text["scale_help"] in page   # 기본정보 3문항 다음
    assert [b.label for b in app.button][:5] == [opt["label"] for opt in data.scale]
    assert not [t["name"] for t in data.types.values() if t["name"] in page]

    click(app, "opt_Q01_4")
    assert text["progress_scale"].format(number=5, total=28) in page_text(app)
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
    # 유형마다 한 곳만 먼저 보이므로(top_n 1), 겹치는 곳을 보려면 '더 보기'로 두 유형을 모두 펼친다
    for key in ("more_T01", "more_T04"):
        if key in [b.key for b in app.button]:
            click(app, key)
    page = page_text(app)
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
    # 선택지 아래의 예시는 그 유형에서 지금 안내할 수 있는 곳(걸러진 후보의 첫 번째)이다
    first = candidates.for_type(data.programs, data.types["T05"], None, clock.now())
    example = (first.contacts or first.lists)[0]
    assert escape(text["priority_example"].format(org=example["기관명"], program=example["프로그램명"])) in page
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

    click(app, "browse_T07")                                   # 문의할 곳이 없고 목록만 있는 유형은 목록을 보여준다
    page = page_text(app)
    assert text["lists_heading"] in page and text["no_program"] not in page
    assert text["contacts_heading"] not in page                # 11/22: 동네친구형은 둘러볼 목록(L15·L16)만 있다
    click(app, "browse_T09")
    assert data.types["T09"]["statement"] in page_text(app)
    click(app, "browse_T09")                                   # 다시 누르면 닫힌다
    assert data.types["T09"]["statement"] not in page_text(app)
    assert len(rows(tmp_path, "responses.csv")) == 1


def test_every_question_must_be_answered(app):
    """넘어가기 단추가 없다. 나이를 비우면 넘어가지 않고, 걸림돌은 하나를 골라야 '다음'이 켜진다."""
    data = loader.load_all()
    text = data.settings["text"]

    def keys() -> list[str]:
        return [b.key for b in app.button]

    click(app, "start")
    assert keys() == ["opt_P_GENDER_male", "opt_P_GENDER_female", "back_survey"]       # 성별: 선택지와 이전뿐
    click(app, "opt_P_GENDER_female")

    assert "skip_P_AGE" not in keys()
    click(app, "next_P_AGE")                                                             # 나이를 적지 않고 다음
    assert text["number_required"] in page_text(app) and "P_AGE" not in app.session_state.answers
    app.number_input(key="num_P_AGE").set_value(61)
    click(app, "next_P_AGE")
    assert app.session_state.answers["P_AGE"] == 61
    click(app, "opt_P_WORK_not_working")

    for question in sel.scale_questions(data.questions):
        assert keys() == [f"opt_{question['id']}_{opt['value']}" for opt in data.scale] + ["back_survey"]
        click(app, f"opt_{question['id']}_3")

    assert app.button(key="next_Q_BARRIER").disabled and app.button(key="next_Q_BARRIER").label == text["next_button"]
    click(app, "opt_Q_BARRIER_none")
    assert not app.button(key="next_Q_BARRIER").disabled
    click(app, "next_Q_BARRIER")
    assert app.session_state.screen == "result"
    assert None not in app.session_state.answers.values()


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


def test_row_disappears_from_the_screen_at_its_end_time(app, monkeypatch):
    """화면이 날짜만이 아니라 시각까지 넘겨서, 종료일 당일 종료시각이 되면 그 행이 결과에서 빠진다."""
    data = loader.load_all()
    timed = next(p for p in data.programs if p["매칭가능"] == "Y" and p["종료시각"])      # 지금은 창업 특강(JOB03)
    type_id = timed["유형태그"].split("|")[0]
    year, month, day = map(int, timed["표시종료일"].split("-"))
    hour, minute = map(int, timed["종료시각"].split(":"))
    end = datetime(year, month, day, hour, minute, tzinfo=clock.KST)

    def shown() -> bool:
        if [b for b in app.button if b.key == f"more_{type_id}"]:
            click(app, f"more_{type_id}")
        return timed["프로그램명"] in page_text(app)

    monkeypatch.setattr(clock, "now", lambda: end.replace(hour=0, minute=0))        # 종료일 0시: 아직 보인다
    take_survey(app, **{type_id: (5, 5)})
    assert shown()
    monkeypatch.setattr(clock, "now", lambda: end)                                   # 종료시각: 빠진다
    app.run()
    assert not app.exception and not shown()


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
    """글을 적고 '찾아보기'를 누른다. 글 상자와 단추는 한 폼이라, 글은 단추를 누를 때 함께 넘어간다."""
    at.text_area(key="free_text").set_value(wish)
    click(at, "free_find")


def test_free_text_and_find_button_share_one_form(app):
    """글 상자와 '찾아보기'는 같은 폼에 있어야 한다.

    따로 두면 휴대폰(한글 자판)에서 단추 누름이 먼저 오고 마지막 글자가 뒤늦게 와서,
    AI가 답을 줘도 '글을 고치셨으면…'만 뜨고 결과가 가려진다.
    """
    to_result_with_t01(app)
    form = app.text_area(key="free_text").proto.form_id
    assert form and form == app.button(key="free_find").proto.form_id
    # 글만 적고 단추를 누르지 않으면 아무것도 넘어가지 않는다
    app.text_area(key="free_text").set_value(WISH).run()
    assert not app.session_state.free_text and app.session_state.ai is None


def test_free_text_adds_ai_picks_with_reasons(app, fake_ai, tmp_path):
    """글을 적고 찾아보기를 누르면 AI가 고른 곳과 이유가 나온다. 지어낸 id는 나오지 않고, 글은 남지 않는다."""
    data = loader.load_all()
    settings = data.settings["text"]
    pool = candidates.ai_pool(data.programs, data.types, ["T01"], {}, clock.now())
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
    pool = candidates.ai_pool(data.programs, data.types, ["T01", "T09"], {}, clock.now())
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
    everything = candidates.ai_pool(data.programs, data.types, [], {}, clock.now())
    assert fake_ai["prompts"][0].count("- id: ") == len(everything)
    assert llm_matcher.NO_TYPE in fake_ai["prompts"][0]


def test_picked_place_already_shown_keeps_call_button(app, fake_ai):
    """AI가 고른 곳이 아래에 이미 나온 곳이어도 이유와 전화 단추를 그 자리에서 보여준다. 글을 고치면 옛 결과를 숨긴다."""
    data = loader.load_all()
    settings = data.settings["text"]
    pool = candidates.ai_pool(data.programs, data.types, ["T01"], {}, clock.now())
    fake_ai["reply"] = {"matches": [{"id": pool[0]["id"], "reason": "가까운 곳이라 골랐어요."}], "unmatched": ["해외여행"]}
    to_result_with_t01(app)
    calls_before = page_text(app).count(settings["call_button"])
    write_wish(app, WISH)
    text = page_text(app)
    assert escape(settings["ai_seen_note"].format(type=data.types["T01"]["name"])) in text
    assert text.count(settings["call_button"]) > calls_before
    assert "해외여행" in text                                  # 일부만 찾았으면 못 찾은 부분을 알려 준다
    # 직접 적기 구간은 대표 유형 바로 아래에 있다(11/22): AI가 고른 곳은 대표 유형과 그 문의할 곳 다음에 나온다
    assert text.index(settings["type_label"]) < text.index(settings["contacts_heading"]) < text.index(settings["ai_heading"])
    assert text.index(settings["ai_heading"]) < text.index(settings["share_heading"])

    # 글만 고치고 '찾아보기'를 다시 누르지 않으면: 예전 결과가 그대로 있고 AI를 또 부르지 않는다
    app.text_area(key="free_text").set_value("다른 글").run()
    text = page_text(app)
    assert "가까운 곳이라 골랐어요." in text and escape(settings["ai_stale"]) not in text
    assert len(fake_ai["prompts"]) == 1


def test_find_button_is_locked_while_searching(app, fake_ai, monkeypatch):
    """찾는 동안에는 '찾는 중'이 켜져 단추가 잠기고, 답이 나오면 풀려서 다시 찾을 수 있다. 적은 글은 그대로 남는다."""
    import streamlit as st

    pool = candidates.ai_pool(loader.load_all().programs, loader.load_all().types, ["T01"], {}, clock.now())
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
    assert not app.button(key="free_find").disabled

    write_wish(app, WISH)
    assert during == [True] and len(fake_ai["prompts"]) == 1      # 한 번 눌러서 한 번만 부른다
    assert app.session_state.ai_pending is False                   # 답이 나오면 풀린다
    assert not app.button(key="free_find").disabled
    assert app.text_area(key="free_text").value == WISH           # 찾고 난 뒤에도 적은 글이 지워지지 않는다
    assert "첫 번째 답이에요." in page_text(app)

    fake_ai["reply"] = {"matches": [{"id": pool[0]["id"], "reason": "두 번째 답이에요."}], "unmatched": []}
    click(app, "free_find")                                        # 답이 나온 뒤에는 다시 찾을 수 있다
    assert during == [True, True] and len(fake_ai["prompts"]) == 2
    assert "두 번째 답이에요." in page_text(app) and "첫 번째 답이에요." not in page_text(app)


def test_find_button_is_drawn_locked_when_pending(app, fake_ai, monkeypatch):
    """'찾는 중'인 화면은 단추를 잠근 채로 그린다. 글 상자는 잠그지 않는다(폼 안에서 잠그면 적은 글이 지워진다)."""
    import streamlit as st

    def never_answers(*args, **kwargs):
        st.stop()                                                  # 호출 도중에 화면을 멈춰, 그 순간 그려진 것을 본다

    monkeypatch.setattr(llm_matcher, "recommend", never_answers)
    to_result_with_t01(app)
    write_wish(app, WISH)
    assert app.session_state.ai_pending is True
    assert app.button(key="free_find").disabled and not app.text_area(key="free_text").disabled
    assert app.text_area(key="free_text").value == WISH


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


def test_mind_and_health_detail_answers_are_not_logged(app, tmp_path):
    """마음·건강 세부 질문은 화면에는 쓰지만, 기록을 켜 두어도 고른 선택지를 파일에 남기지 않는다."""
    data = loader.load_all()
    for tid in ("T08", "T12"):
        assert sel.detail_of(data.types[tid]) and data.types[tid]["detail"]["log_answer"] is False, tid

    take_survey(app, T12=(5, 5))
    click(app, "detail_T12_chronic")
    assert app.session_state.details["T12"] == "chronic"
    events = [e for e in rows(tmp_path, "events.csv") if e["event"] == "detail"]
    assert [(e["target"], e["value"]) for e in events] == [("T12", "")]
    assert "chronic" not in (tmp_path / "events.csv").read_text(encoding="utf-8-sig")
    assert "chronic" not in (tmp_path / "responses.csv").read_text(encoding="utf-8-sig")


def test_one_answer_can_be_fixed_from_the_result(app):
    """결과 화면에서 문항 하나를 골라 답을 고치면, 그 문항만 다시 묻고 결과를 다시 판정한다."""
    data = loader.load_all()
    text = data.settings["text"]
    first, second = sel.type_questions(data.questions, data.types)["T01"]
    take_survey(app, T01=(5, 5))
    assert text["type_label"] in page_text(app)

    # 고르기만 하고 '수정하지 않고 결과로'를 누르면 아무것도 바뀌지 않는다
    app.selectbox(key="edit_pick").set_value(first).run()
    click(app, "edit_answer")
    assert app.session_state.screen == "survey"
    assert sel.question(data.questions, first)["text"] in page_text(app)
    assert "✓ " + data.scale[0]["label"] in [b.label for b in app.button]          # 지금 답(5점)이 표시되어 있다
    assert "back_survey" not in [b.key for b in app.button]                         # 고치는 중에는 '이전으로'가 없다
    click(app, "edit_cancel")
    assert app.session_state.screen == "result" and app.session_state.answers[first] == 5
    assert text["type_label"] in page_text(app)

    # 5점을 1점으로 고치면 그 문항만 묻고 바로 결과로 돌아온다. 일터찾기형은 6점이 되어 대표 유형이 사라진다
    app.selectbox(key="edit_pick").set_value(first).run()
    click(app, "edit_answer")
    click(app, f"opt_{first}_1")
    assert app.session_state.screen == "result" and "edit_q" not in app.session_state
    assert app.session_state.answers[first] == 1 and app.session_state.answers[second] == 5
    assert len([q for q in sel.survey_questions(data.questions) if q["id"] in app.session_state.answers]) == 28
    page = page_text(app)
    assert text["type_label"] not in page and text["low_interest"] in page


def test_result_order_and_folded_consult(app):
    """대표 유형이 있으면: 유형 결과가 직접 적기보다 먼저 나오고, 함께 찾아 주는 창구는 접혀 있다."""
    data = loader.load_all()
    text = data.settings["text"]
    wish = sel.question(data.questions, sel.FREE_Q)["text"]
    take_survey(app, T01=(5, 5))
    page = page_text(app)
    assert page.index(data.types["T01"]["name"]) < page.index(wish) < page.index(text["share_heading"])
    assert "more_types" in [b.key for b in app.button]             # 다른 유형은 그 아래에서 연다
    assert [e.label for e in app.expander if e.label == text["consult_heading"]]


def test_consult_stays_open_without_a_primary_type(app):
    """대표 유형이 없으면 함께 찾아 주는 창구가 결과의 중심이므로 펼쳐서 보여주고, 직접 적기는 그 아래에 둔다."""
    data = loader.load_all()
    text = data.settings["text"]
    wish = sel.question(data.questions, sel.FREE_Q)["text"]
    take_survey(app, base=3)
    page = page_text(app)
    assert not [e.label for e in app.expander if e.label == text["consult_heading"]]
    assert page.index(text["consult_heading"]) < page.index(wish) < page.index(text["browse_heading"])


def test_care_type_asks_who_first(app):
    """돌봄동행형: 누구의 돌봄인지 고르기 전에는 곳을 보여주지 않고, 고르면 그 주제의 곳만 보여준다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T11=(5, 5))
    page = page_text(app)
    assert text["detail_first"] in page and text["contacts_heading"] not in page
    assert text["no_program"] not in page                          # '안내할 곳이 없다'가 아니라 '먼저 골라 달라'다

    click(app, "detail_T11_child")
    page = page_text(app)
    mine = candidates.for_type(data.programs, data.types["T11"], "child", clock.now(), app.session_state.answers)
    assert text["detail_first"] not in page and mine.contacts[0]["프로그램명"] in page
    others = candidates.for_type(data.programs, data.types["T11"], "adult", clock.now(), app.session_state.answers)
    assert not [p for p in others.contacts if p["프로그램명"] in page]      # 다른 주제의 곳은 빠진다


def test_no_exact_topic_shows_the_type_places_with_a_note(app, monkeypatch):
    """고른 주제에 맞는 곳이 없으면 빈 화면 대신 그 유형의 곳을 보여주고 한 줄로 알린다."""
    data = loader.load_all()
    text = data.settings["text"]
    real = candidates.for_type

    def nothing_exact(programs, type_info, detail_answer, today, profile=None, narrow=True):
        result = real(programs, type_info, None, today, profile)        # 주제에 맞는 곳이 없는 상황을 만든다
        result.widened = bool(detail_answer) and narrow
        return result
    monkeypatch.setattr(candidates, "for_type", nothing_exact)

    take_survey(app, T12=(5, 5))
    assert text["widened_note"] not in page_text(app)                   # 고르기 전에는 알릴 것이 없다
    click(app, "detail_T12_smoking")
    page = page_text(app)
    assert text["widened_note"] in page and text["contacts_heading"] in page and text["no_program"] not in page


def test_no_detail_question_allows_many_answers():
    for type_info in loader.load_all().types.values():
        detail = type_info.get("detail") or {}
        assert detail.get("selection") == "single", type_info["id"]
        assert not [opt for opt in detail["options"] if opt.get("exclusive")], type_info["id"]


# ── 겉모습과 공유 ──

def test_top_bar_and_start_steps_are_shown(app):
    """시작 화면에는 순서 안내가, 그 뒤 화면에는 맨 위에 앱 이름 띠가 나온다."""
    text = loader.load_all().settings["text"]
    page = page_text(app)
    assert 'class="topbar"' not in page                        # 시작 화면은 큰 제목이 있어 띠를 겹쳐 그리지 않는다
    assert all(step in page for step in text["start_steps"])
    click(app, "start")
    assert 'class="topbar"' in page_text(app) and text["top_title"] in page_text(app)


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
