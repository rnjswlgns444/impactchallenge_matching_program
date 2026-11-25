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
import streamlit as st
from streamlit.testing.v1 import AppTest

from app.core import candidates, clock, llm_matcher, loader, logger
from app.core import selection as sel
from app.ui import result_image

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
        choose(at, qid, value)
    choose(at, "Q_BARRIER", barrier)


BORN = 1965          # 테스트 응답자가 태어난 해. 시계를 2026년에 고정했으므로 만 60~61세다


def choose(at: AppTest, qid: str, option) -> None:
    """선택지를 고른 뒤 '다음'을 누른다. 고르기만 해서는 넘어가지 않는다(11/25)."""
    click(at, f"opt_{qid}_{option}")
    click(at, f"next_{qid}")


def answer_profile(at: AppTest) -> None:
    """기본정보 세 문항(성별, 태어난 해, 일 여부)에 답한다."""
    choose(at, "P_GENDER", "female")
    at.number_input(key="num_P_AGE").set_value(BORN)
    click(at, "next_P_AGE")
    choose(at, "P_WORK", "not_working")


def is_chosen(at: AppTest, key: str) -> bool:
    """그 단추가 '고른 것'으로 그려졌는지. 고른 선택지는 type="primary"로 그리고, style.py가 물빛 바탕과 굵은 테두리를 입힌다."""
    return at.button(key=key).proto.type == "primary"


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
    assert not [key for key in ("opt_Q01_5", "opt_Q01_4") if is_chosen(app, key)]     # 처음에는 고른 것이 없다

    # 고르기만 하면 표시만 되고 넘어가지 않는다. 답으로 치지도 않는다
    click(app, "opt_Q01_4")
    assert text["progress_scale"].format(number=4, total=28) in page_text(app)
    assert "Q01" not in app.session_state.answers
    assert is_chosen(app, "opt_Q01_4") and not is_chosen(app, "opt_Q01_5")
    assert app.button(key="opt_Q01_4").label == data.scale[1]["label"]            # 4점 = '그래요'. 글 앞에 ✓를 붙이지 않는다
    assert not [b.label for b in app.button if "✓" in b.label]
    click(app, "opt_Q01_5")                                                       # '다음'을 누르기 전에는 바꿔 고를 수 있다
    assert is_chosen(app, "opt_Q01_5") and not is_chosen(app, "opt_Q01_4")
    click(app, "opt_Q01_4")

    click(app, "next_Q01")                                                        # '다음'을 눌러야 답이 되고 넘어간다
    assert app.session_state.answers["Q01"] == 4
    assert text["progress_scale"].format(number=5, total=28) in page_text(app)

    click(app, "back_survey")
    assert is_chosen(app, "opt_Q01_4") and not app.button(key="next_Q01").disabled   # 앞서 낸 답이 골라진 채로 보인다
    choose(app, "Q01", 2)                                                         # 고쳐서 답할 수 있다
    assert app.session_state.answers["Q01"] == 2


# ── 결과: 판정 상태별 ──

def test_one_type_to_the_end(app, tmp_path):
    """일터찾기형만 높음: 대표 유형 하나가 나오고, 숨긴 프로그램은 없고, 기록은 한 행이다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, barrier="alone", T01=(5, 5))

    page = page_text(app)
    assert text["type_label"] in page and data.types["T01"]["name"] in page
    assert len(app.get("image")) == 2                           # 캐릭터 그림 한 장 + 맨 아래 저장되는 결과 사진 한 장
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
    assert len(app.get("image")) == 2                           # 본인이 연 유형에는 그림을 더하지 않는다
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
    # 기본정보(성별·나이·일 여부)는 맞는 곳을 고르는 데만 쓰고 기록하지 않는다
    assert not {"gender", "age", "age_band", "work"} & set(row)
    assert "female" not in row.values() and "not_working" not in row.values()
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
    """최고점이 같으면 자동으로 정하지 않고 묻는다. 고른 뒤에 바꿀 수 있다. 고르지 않고 넘어가는 길은 없다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T05=(5, 5), T07=(5, 5))

    page = page_text(app)
    assert text["tie_two"] in page and text["type_label"] not in page
    choices = [b.label for b in app.button if b.key.startswith("priority_")]      # 맨 위 띠의 '처음으로'는 빼고 본다
    assert choices == [data.types["T05"]["statement"], data.types["T07"]["statement"]]
    assert [b.key for b in app.button if b.key.startswith("priority_")] == ["priority_T05", "priority_T07"]
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
    click(app, "priority_T05")
    assert data.types["T05"]["name"] in page_text(app)

    assert len(rows(tmp_path, "responses.csv")) == 1           # 고르는 것은 답을 바꾼 것이 아니다
    events = rows(tmp_path, "events.csv")
    assert [e["target"] for e in events if e["event"] == "priority"] == ["T07", "T05"]
    assert not [e for e in events if e["event"] == "answers_changed"]


@pytest.mark.parametrize("pair", [(4, 3), (2, 1)])
def test_low_single_top_is_shown_without_asking(app, pair):
    """11/25: 점수가 낮아도 가장 높은 유형이 하나면 묻지 않고 바로 그 유형을 보여 준다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T01=pair)
    page = page_text(app)
    assert text["type_label"] in page and data.types["T01"]["name"] in page
    assert not [b.key for b in app.button if b.key.startswith("priority_")]


def test_all_same_answers_let_the_user_choose(app, tmp_path):
    """모두 '보통': 유형이 없다고 하지 않는다. 12개가 동점이므로 본인이 하나를 고르고, 고르면 그 유형을 보여 준다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, base=3)

    page = page_text(app)
    assert text["tie_many"] in page and text["type_label"] not in page
    assert [b.key for b in app.button if b.key.startswith("priority_")] == [f"priority_{tid}" for tid in data.types]
    row = rows(tmp_path, "responses.csv")[0]
    assert (row["state"], row["primary"]) == ("choose_priority", "") and row["candidates"].count("|") == 11

    click(app, "priority_T07")                                 # 문의할 곳이 없고 목록만 있는 유형은 목록을 보여준다
    page = page_text(app)
    assert text["type_label"] in page and data.types["T07"]["name"] in page
    assert text["lists_heading"] in page and text["no_program"] not in page
    assert text["contacts_heading"] not in page                # 11/22: 동네친구형은 둘러볼 목록(L15·L16)만 있다
    click(app, "more_types")
    click(app, "browse_T09")
    assert data.types["T09"]["statement"] in page_text(app)
    click(app, "browse_T09")                                   # 다시 누르면 닫힌다
    assert data.types["T09"]["statement"] not in page_text(app)
    assert len(rows(tmp_path, "responses.csv")) == 1


def test_every_question_must_be_answered(app):
    """넘어가기 단추가 없다. 고르기 전에는 '다음'이 꺼져 있고, 태어난 해를 비우면 넘어가지 않는다."""
    data = loader.load_all()
    text = data.settings["text"]
    survey = sel.survey_questions(data.questions)
    seen_keys: list[str] = []

    def keys() -> list[str]:
        found = [b.key for b in app.button]
        seen_keys.extend(found)
        return found

    def next_is_off(qid: str) -> bool:
        return app.button(key=f"next_{qid}").disabled and app.button(key=f"next_{qid}").label == text["next_button"]

    click(app, "start")
    # 성별: 선택지, 다음, 이전뿐이다. 맨 위 띠의 '처음으로'도 설문 중에는 없다
    assert keys() == ["opt_P_GENDER_male", "opt_P_GENDER_female", "next_P_GENDER", "back_survey"]
    assert next_is_off("P_GENDER")
    click(app, "opt_P_GENDER_female")
    assert not app.button(key="next_P_GENDER").disabled and "P_GENDER" not in app.session_state.answers
    click(app, "next_P_GENDER")

    assert keys() == ["next_P_AGE", "back_survey"]
    click(app, "next_P_AGE")                                                             # 태어난 해를 적지 않고 다음
    assert text["number_required"] in page_text(app) and "P_AGE" not in app.session_state.answers
    app.number_input(key="num_P_AGE").set_value(BORN)
    click(app, "next_P_AGE")
    assert app.session_state.answers["P_AGE"] == BORN
    assert next_is_off("P_WORK")
    choose(app, "P_WORK", "not_working")

    for question in sel.scale_questions(data.questions):
        qid = question["id"]
        assert keys() == [f"opt_{qid}_{opt['value']}" for opt in data.scale] + [f"next_{qid}", "back_survey"]
        assert next_is_off(qid)
        # 응원 한 줄은 딱 절반째 문항에서만 '절반 왔어요'가 나온다
        position = survey.index(question) + 1
        assert (text["cheer_half"] in page_text(app)) == (position * 2 == len(survey))
        choose(app, qid, 3)

    assert next_is_off("Q_BARRIER") and text["cheer_last"] in page_text(app)             # 마지막 문항
    click(app, "opt_Q_BARRIER_none")
    assert not app.button(key="next_Q_BARRIER").disabled
    assert not [b.label for b in app.button if "✓" in b.label]                           # 여러 개 고르는 문항도 ✓ 없이 표시한다
    assert is_chosen(app, "opt_Q_BARRIER_none")
    click(app, "next_Q_BARRIER")
    assert app.session_state.screen == "result"
    assert None not in app.session_state.answers.values()
    assert not [key for key in seen_keys if "skip" in key or key == "to_start"]


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


def start_page(monkeypatch, tmp_path, saving: bool) -> str:
    """save_log를 켜거나 끈 채로 연 시작 화면의 글."""
    real_load = loader.load_all

    def load():
        data = real_load()
        data.settings["save_log"] = saving
        return data

    monkeypatch.setattr(loader, "load_all", load)
    monkeypatch.setattr(logger, "LOG_DIR", tmp_path)
    monkeypatch.setattr(logger, "set_enabled", lambda on: None)   # 앱이 기록 설정을 바꿔 다른 테스트에 남지 않게 한다
    at = AppTest.from_file(MAIN, default_timeout=30)
    at.run()
    assert not at.exception
    return page_text(at)


def notes_of(page: str) -> str:
    """시작 화면 맨 아래 유의사항(작은 글씨) 안의 글."""
    start = page.index('<div class="fine">')
    return page[start:page.index("</div>", start)]


def test_start_screen_warns_that_refresh_clears_answers(app):
    """새로고침·뒤로 가기를 하면 답이 지워진다는 안내는 맨 아래 유의사항에 있다. 눈에 띄는 상자로 두지 않는다(11/25)."""
    text = loader.load_all().settings["text"]
    page = page_text(app)
    notes = notes_of(page)
    assert text["start_notes_title"] in notes and escape(text["start_refresh"]) in notes
    assert escape(text["disclaimer"]) in notes
    assert 'class="notice' not in page and 'class="steps"' not in page                 # 상자와 순서 안내는 없다
    assert [b.key for b in app.button] == ["start", "start_browse"]


def test_start_screen_tells_the_truth_about_saving(monkeypatch, tmp_path):
    """저장하지 않을 때: 개인정보 안내와 AI 전송 안내가 유의사항에 있고, '저장해요'라는 말은 없다."""
    text = loader.load_all().settings["text"]
    page = start_page(monkeypatch, tmp_path, saving=False)
    notes = notes_of(page)
    assert escape(text["start_privacy"]) in notes and escape(text["start_ai_note"]) in notes
    assert escape(text["start_privacy_saving"]) not in page


def test_start_screen_says_so_loudly_when_it_saves(monkeypatch, tmp_path):
    """저장할 때(save_log): 저장 안내는 작은 글씨로 내리지 않고 상자로 보여 준다. '저장하지 않아요'라는 글은 내지 않는다."""
    text = loader.load_all().settings["text"]
    page = start_page(monkeypatch, tmp_path, saving=True)
    assert f'<div class="notice info">{escape(text["start_privacy_saving"])}</div>' in page
    assert page.index(text["start_privacy_saving"][:20]) < page.index('<div class="fine">')
    assert escape(text["start_privacy"]) not in page and escape(text["start_ai_note"]) not in page
    assert escape(text["start_refresh"]) in notes_of(page)                             # 나머지 유의사항은 그대로 있다


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
    assert "female" not in prompt and "not_working" not in prompt and str(BORN) not in prompt
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
    """맞는 곳이 없으면 못 찾았다고 말하고 함께 찾아 주는 창구로 잇는다."""
    data = loader.load_all()
    fake_ai["reply"] = {"matches": [], "unmatched": ["해외여행"]}
    take_survey(app, T01=(5, 5))
    write_wish(app, "해외여행을 가고 싶어요")
    text = page_text(app)
    assert data.settings["text"]["ai_none"] in text
    assert data.settings["text"]["ai_heading"] not in text     # 찾은 곳이 없으면 제목을 내지 않는다
    pool = candidates.ai_pool(data.programs, data.types, ["T01"], {}, clock.now(), app.session_state.answers)
    assert fake_ai["prompts"][0].count("- id: ") == len(pool)


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


def test_browse_without_the_survey(app, tmp_path):
    """첫 화면에서 설문 없이 분야별로 볼 수 있다. 답이 없으니 거르지 않고, 응답 기록도 남기지 않는다."""
    data = loader.load_all()
    text = data.settings["text"]
    click(app, "start_browse")
    assert app.session_state.screen == "browse" and not app.session_state.answers
    page = page_text(app)
    assert text["browse_intro"] in page and text["browse_heading"] in page
    assert "free_find" not in [b.key for b in app.button]             # 직접 적기(AI)는 설문 결과 화면에만 있다

    click(app, "browse_T01")
    page = page_text(app)
    everyone = candidates.for_type(data.programs, data.types["T01"], None, clock.now())
    assert data.types["T01"]["statement"] in page and everyone.contacts[0]["프로그램명"] in page
    assert not app.get("image")                                        # 성별 답이 없으니 캐릭터 그림도 없다
    women_only = [p for p in everyone.contacts if p["대상성별"]]
    assert women_only                                                 # 성별 조건이 있는 곳도 빼지 않고 후보에 둔다
    click(app, "more_T01")
    assert not [p for p in women_only if p["프로그램명"] not in page_text(app)]

    click(app, "browse_T11")                                          # 돌봄은 여기서도 먼저 골라야 나온다
    assert escape(text["detail_first"]) in page_text(app)
    assert not (tmp_path / "responses.csv").exists()

    click(app, "browse_to_start")                                     # 나가면 열어 본 분야를 지운다
    assert app.session_state.screen == "start" and app.session_state.opened == []
    click(app, "start_browse")
    click(app, "browse_to_survey")
    assert app.session_state.screen == "survey"


def test_one_answer_can_be_fixed_from_the_result(app):
    """결과 화면에서 문항 하나를 골라 답을 고치면, 그 문항만 다시 묻고 결과를 다시 판정한다."""
    data = loader.load_all()
    text = data.settings["text"]
    first, second = sel.type_questions(data.questions, data.types)["T01"]
    take_survey(app, T01=(5, 5))
    assert text["type_label"] in page_text(app)

    # 고르기만 하고 '수정하지 않고 결과로'를 누르면 아무것도 바뀌지 않는다
    click(app, f"edit_{first}")
    assert app.session_state.screen == "survey"
    page = page_text(app)
    assert sel.question(data.questions, first)["text"] in page
    assert text["edit_notice"] in page and "aria-valuetext" not in page             # 진행 표시 대신 안내 한 줄
    assert is_chosen(app, f"opt_{first}_5")                                         # 지금 답(5점)이 골라진 채로 보인다
    assert "back_survey" not in [b.key for b in app.button]                         # 고치는 중에는 '이전으로'가 없다
    assert "to_start" not in [b.key for b in app.button]                            # 답을 고치는 화면도 설문 화면이다
    click(app, "edit_cancel")
    assert app.session_state.screen == "result" and app.session_state.answers[first] == 5
    assert text["type_label"] in page_text(app)

    # 5점을 1점으로 고치면 그 문항만 묻고 바로 결과로 돌아온다. 일터찾기형은 6점이 되지만 여전히 가장 높아 대표로 남는다
    click(app, f"edit_{first}")
    click(app, f"opt_{first}_1")                                                    # 고르기만 해서는 바뀌지 않는다
    assert app.session_state.screen == "survey" and app.session_state.answers[first] == 5
    click(app, f"next_{first}")
    assert app.session_state.screen == "result" and "edit_q" not in app.session_state
    assert app.session_state.answers[first] == 1 and app.session_state.answers[second] == 5
    assert len([q for q in sel.survey_questions(data.questions) if q["id"] in app.session_state.answers]) == 28
    page = page_text(app)
    assert text["type_label"] in page and data.types["T01"]["name"] in page


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


def test_care_type_asks_who_first(app):
    """돌봄동행형: 누구의 돌봄인지 고르기 전에는 곳을 보여주지 않고, 고르면 그 주제의 곳만 보여준다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T11=(5, 5))
    page = page_text(app)
    assert escape(text["detail_first"]) in page and text["contacts_heading"] not in page
    assert text["no_program"] not in page                          # '안내할 곳이 없다'가 아니라 '먼저 골라 달라'다

    click(app, "detail_T11_child")
    page = page_text(app)
    mine = candidates.for_type(data.programs, data.types["T11"], "child", clock.now(), app.session_state.answers)
    assert escape(text["detail_first"]) not in page and mine.contacts[0]["프로그램명"] in page
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


def test_health_detail_choice_is_not_sent_to_ai(app, fake_ai):
    """마음·건강 세부 질문에서 고른 것은 AI 지시문에도 넣지 않는다. 다른 유형의 세부 선택은 넣는다."""
    data = loader.load_all()
    fake_ai["reply"] = {"matches": [], "unmatched": []}
    take_survey(app, T12=(5, 5))
    click(app, "detail_T12_chronic")
    write_wish(app, WISH)
    label = next(o["label"] for o in data.types["T12"]["detail"]["options"] if o["id"] == "chronic")
    assert len(fake_ai["prompts"]) == 1 and label not in fake_ai["prompts"][0]


def test_job_detail_choice_is_sent_to_ai(app, fake_ai):
    data = loader.load_all()
    fake_ai["reply"] = {"matches": [], "unmatched": []}
    to_result_with_t01(app)
    click(app, "detail_T01_previous_work")
    write_wish(app, WISH)
    label = next(o["label"] for o in data.types["T01"]["detail"]["options"] if o["id"] == "previous_work")
    assert label in fake_ai["prompts"][0]


def test_no_detail_question_allows_many_answers():
    for type_info in loader.load_all().types.values():
        detail = type_info.get("detail") or {}
        assert detail.get("selection") == "single", type_info["id"]
        assert not [opt for opt in detail["options"] if opt.get("exclusive")], type_info["id"]


# ── 겉모습과 공유 ──

def test_start_screen_shows_the_home_characters(app):
    """시작 화면의 그림 상자에는 캐릭터 그림이 정해 둔 수만큼 나온다. 설문 화면으로 가면 사라진다."""
    from app.ui.components import HOME_CHARACTERS
    images = app.get("image")
    assert len(images) == len(HOME_CHARACTERS)
    # 꾸밈 그림이라 설명 글이 빈 값이다. 빼면 화면 읽기 도구가 그림 주소를 읽는다
    assert all(image.proto.imgs[0].alt == "" and not image.proto.imgs[0].caption for image in images)
    click(app, "start")
    assert not app.get("image")


def has_top_bar(at: AppTest, text: dict) -> bool:
    return f'<p class="topbar"><b class="topbar-name">{text["top_title"]}</b>' in page_text(at) and text["top_sub"] in page_text(at)


def test_top_bar_is_on_every_screen_and_home_only_where_it_is_safe(app):
    """맨 위 띠(앱 이름 + 풀이)는 모든 화면에 있다. '처음으로' 단추는 결과·둘러보기 화면에만 있고, 설문 중에는 없다."""
    text = loader.load_all().settings["text"]

    def home_button() -> list[str]:
        return [b.label for b in app.button if b.key == "to_start"]

    assert has_top_bar(app, text) and not home_button()        # 시작 화면: 이미 처음이다
    click(app, "start_browse")
    assert has_top_bar(app, text) and home_button() == [text["to_start_button"]]
    click(app, "to_start")                                     # 둘러보기에는 지울 답이 없어 되묻지 않고 바로 간다
    assert app.session_state.screen == "start" and escape(text["restart_ask_body"]) not in page_text(app)

    click(app, "start")
    assert has_top_bar(app, text) and not home_button()        # 설문: 잘못 누르면 답이 지워지므로 두지 않는다
    click(app, "back_survey")
    take_survey(app, T01=(5, 5))
    assert has_top_bar(app, text) and home_button() == [text["to_start_button"]]


@pytest.mark.parametrize("opener", ["to_start", "restart"])
def test_going_home_asks_first(app, opener):
    """'처음으로'(띠)와 '처음부터 다시 하기'(결과 아래)는 한 번 되묻는다. '처음으로 가기'를 눌러야만 답이 지워진다."""
    text = loader.load_all().settings["text"]
    ask = escape(text["restart_ask_body"])
    take_survey(app, T01=(5, 5))
    answers = dict(app.session_state.answers)
    assert ask not in page_text(app)

    click(app, opener)
    assert ask in page_text(app)                               # 되묻는 창이 뜬다. 아직 아무것도 지우지 않았다
    assert app.session_state.screen == "result" and dict(app.session_state.answers) == answers
    assert [app.button(key=key).label for key in ("restart_keep", "restart_go")] == [text["restart_keep"], text["restart_go"]]

    click(app, "restart_keep")                                 # 계속 보기: 창만 닫히고 답과 결과는 그대로다
    assert ask not in page_text(app) and "restart_go" not in [b.key for b in app.button]
    assert app.session_state.screen == "result" and dict(app.session_state.answers) == answers
    assert loader.load_all().types["T01"]["name"] in page_text(app)

    click(app, opener)
    click(app, "restart_go")                                   # 처음으로 가기: 답을 지우고 시작 화면으로
    assert app.session_state.screen == "start" and not app.session_state.answers
    assert ask not in page_text(app) and [b.key for b in app.button] == ["start", "start_browse"]


def test_share_box_sends_no_answers(app):
    """결과 화면 맨 아래에 공유 단추가 있다. 공유에 쓰이는 글에는 답, 유형 이름, 기본정보가 들어가지 않는다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, barrier="alone", T01=(5, 5))
    page = page_text(app)
    assert text["share_button"] in page and text["share_heading"] in page

    sent = " ".join(str(frame.proto) for frame in app.get("iframe"))
    assert text["share_message"] in sent
    assert data.types["T01"]["name"] not in sent and "female" not in sent and str(BORN) not in sent


# ── 결과 화면의 구역 순서, 따라다니는 목차, 내 결과 저장하기 (11/23) ──

@pytest.fixture
def cards(monkeypatch):
    """결과 사진에 무엇이 넘어가는지 모은다. 실제 그리기 대신 작은 그림을 돌려준다.

    한 장은 (앱 이름, 팀 이름, 맨 아래 글, 소제목, 곳 목록, 유형 이름, 설명, 특징, 영역, 그림 경로, 유형 없을 때 제목)이다.
    """
    st.cache_data.clear()                                     # 앞선 테스트가 그려 둔 사진을 다시 쓰지 않게 한다
    real = result_image.render("앱", "팀", "아래", "곳", [])
    drawn = []

    def render(*args):
        drawn.append(args)
        return real

    monkeypatch.setattr(result_image, "render", render)
    yield drawn
    st.cache_data.clear()


def test_primary_result_follows_the_new_order(app):
    """대표 유형: 유형 → 특징 → 조금 더 맞춰 보기(세부 질문·직접 적기) → 문의할 곳 → 저장 → 공유. 목차가 있다."""
    data = loader.load_all()
    text = data.settings["text"]
    wish = sel.question(data.questions, sel.FREE_Q)["text"]
    take_survey(app, T01=(5, 5))
    page = page_text(app)
    order = [data.types["T01"]["statement"], text["feature_heading"] + "</h2>", escape(data.types["T01"]["feature"]),
             text["tune_heading"] + "</h2>", escape(data.types["T01"]["detail"]["text"]), wish,
             text["contacts_heading"] + "</h2>", escape(text["result_intro"]), text["save_heading"] + "</h2>",
             text["share_heading"]]
    places = [page.index(part) for part in order]
    assert places == sorted(places)
    assert 'class="toc"' in page and 'href="#sec-places"' in page and 'id="sec-places"' in page
    assert text["tune_help"] in page
    assert not [e for e in app.expander if e.label == text["detail_label"]]   # 대표 유형의 세부 질문은 접지 않는다
    assert len(app.get("download_button")) == 1


def test_nav_and_save_box_follow_the_state(app, cards):
    """동점 화면에는 목차도 저장도 없다. 하나를 고르면 둘 다 나온다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T05=(5, 5), T07=(5, 5))
    page = page_text(app)
    saving = text["save_heading"] + "</h2>"                    # 저장 구역의 제목(화면 글에는 CSS 주석도 섞여 있다)
    assert text["tie_two"] in page and 'class="toc"' not in page and saving not in page
    assert not cards and not app.get("download_button")

    click(app, "priority_T05")
    page = page_text(app)
    assert 'class="toc"' in page and saving in page and cards


def test_card_has_type_and_place_names_only(app, cards):
    """사진에는 유형 이름·설명·특징과 곳 이름만 넘어간다. 곳은 화면 후보의 앞 3개이고, 답·전화번호는 넘어가지 않는다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, barrier="alone", T01=(5, 5))
    title, team, footer, heading, places, type_name, statement, feature, area, character, plain = cards[-1]
    info = data.types["T01"]
    assert (type_name, statement, feature, area, plain) == (info["name"], info["statement"], info["feature"], info["area"], "")
    assert character.name == "t01-female.webp"                 # 화면의 캐릭터 그림과 같은 그림
    assert footer == text["card_footer"].format(date="11월 22일") and heading == text["card_places_heading"]

    shown = candidates.for_type(data.programs, info, None, clock.now(), app.session_state.answers)
    assert places == [(p["프로그램명"], p["기관명"]) for p in shown.contacts[:3]] and 1 <= len(places) <= 3
    words = " ".join([title, team, footer, heading, type_name, statement, feature, *sum(map(list, places), [])])
    phones = [p["공식연락처"] for p in data.programs if p["공식연락처"]]
    assert not [phone for phone in phones if phone in words]
    assert str(BORN) not in words and "혼자" not in words     # 태어난 해, 걸림돌 답


def test_type_with_lists_only_names_the_section_differently(app, cards):
    """문의할 곳이 없고 목록만 있는 대표 유형(동네친구형): 구역 제목과 목차가 '문의할 곳'이라고 말하지 않는다."""
    data = loader.load_all()
    text = data.settings["text"]
    take_survey(app, T07=(5, 5))
    page = page_text(app)
    assert text["places_heading"] + "</h2>" in page and text["nav_places"] in page
    assert text["contacts_heading"] not in page and text["nav_contacts"] not in page
    heading, places = cards[-1][3], cards[-1][4]
    assert heading == text["lists_heading"] and places
