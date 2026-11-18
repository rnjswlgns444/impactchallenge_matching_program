"""화면 테스트. 실제 데이터 파일로 앱을 끝까지 눌러 보고, 오류와 기록 행 수를 확인한다. 실제 AI는 부르지 않는다."""
from __future__ import annotations

import csv
import json
from html import escape
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from app.core import candidates, llm_matcher, loader, logger

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


def test_two_types_to_the_end(app, tmp_path):
    """일터찾기형 + 실력쌓기형: 두 구역이 모두 나오고, 숨긴 프로그램은 없고, 기록은 한 행이다."""
    data = loader.load_all()
    for key in ("start", "opt_Q_NEEDS_T01", "opt_Q_NEEDS_T04", "next_Q_NEEDS",
                "opt_Q_BARRIER_alone", "next_Q_BARRIER", "opt_Q_START_prepare"):
        click(app, key)

    text = page_text(app)
    assert data.types["T01"]["name"] in text and data.types["T04"]["name"] in text
    assert "혼자 가도 괜찮을까요?" in text                 # 걸림돌이 물어볼 문장으로 이어진다
    shown = {p["프로그램명"] for p in data.programs if p["매칭가능"] == "Y"}
    hidden = {p["프로그램명"] for p in data.programs if p["매칭가능"] != "Y"} - shown
    assert not [name for name in hidden if name in text]

    # 두 유형에 모두 해당하는 곳은 카드를 되풀이하지 않고 한 줄로 알린다
    assert escape(data.settings["text"]["seen_note"].format(type=data.types["T01"]["name"])) in text
    assert data.settings["text"]["call_button"] in text       # 전화 단추는 접지 않고 보인다

    click(app, "priority_T04")                              # 먼저 볼 유형을 고르면 순서만 바뀐다
    text = page_text(app)
    assert text.index(data.types["T04"]["name"]) < text.index(data.types["T01"]["name"])

    click(app, "detail_T01_previous_work")                  # 세부 답은 물어볼 문장에 들어간다
    assert "해봤던 일을 다시 하고 싶어요" in page_text(app)

    logged = rows(tmp_path, "responses.csv")
    assert len(logged) == 1
    assert logged[0]["type_ids"] == "T01|T04" and logged[0]["barriers"] == "alone" and logged[0]["start"] == "prepare"


def test_unknown_browses_all_types(app, tmp_path):
    """'아직 모르겠어요': 유형을 붙이지 않고 일반 창구와 둘러보기를 보여준다. 누른 유형만 더한다."""
    data = loader.load_all()
    for key in ("start", "opt_Q_NEEDS_unknown", "next_Q_NEEDS", "next_Q_BARRIER", "next_Q_START"):
        click(app, key)

    text = page_text(app)
    assert data.settings["text"]["consult_heading"] in text
    assert data.settings["text"]["type_label"] not in text    # 아직 유형 구역이 없다
    assert rows(tmp_path, "responses.csv")[0]["type_ids"] == ""

    click(app, "browse_T07")                                  # 안내할 곳이 없는 유형도 막다른 화면이 아니다
    assert data.settings["text"]["no_program"] in page_text(app)
    click(app, "browse_T09")
    assert data.types["T09"]["statement"] in page_text(app)
    assert len(rows(tmp_path, "responses.csv")) == 1


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
    for key in ("start", "opt_Q_NEEDS_T01", "next_Q_NEEDS", "next_Q_BARRIER", "next_Q_START"):
        click(at, key)


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

    # AI에게는 걸러진 후보만, 전화번호를 지운 글만 간다
    prompt = fake_ai["prompts"][0]
    assert prompt.count("- id: ") == len(pool) and "010-1234-5678" not in prompt
    blocked = [p["프로그램명"] for p in data.programs if p["매칭가능"] != "Y"]
    assert not [name for name in blocked if name in prompt]

    # 기록에는 상태와 고른 id만 남는다
    event = [e for e in rows(tmp_path, "events.csv") if e["event"] == "ai"]
    assert event == [{**event[0], "target": "ok", "value": pool[-1]["id"]}]
    saved = "".join(path.read_text(encoding="utf-8-sig") for path in tmp_path.iterdir())
    assert "사무 일" not in saved and "010-1234-5678" not in saved

    click(app, "detail_T01_previous_work")                   # 다른 단추를 눌러도 AI를 다시 부르지 않는다
    assert len(fake_ai["prompts"]) == 1 and settings["ai_heading"] in page_text(app)


def test_empty_free_text_does_not_call_ai(app, fake_ai):
    to_result_with_t01(app)
    click(app, "free_find")
    text = page_text(app)
    assert loader.load_all().settings["text"]["free_empty"] in text and not fake_ai["prompts"]


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
    """맞는 곳이 없으면 못 찾았다고 말하고 함께 찾아 주는 창구로 잇는다. 유형을 정하지 않은 사람도 쓸 수 있다."""
    data = loader.load_all()
    fake_ai["reply"] = {"matches": [], "unmatched": ["해외여행"]}
    for key in ("start", "opt_Q_NEEDS_unknown", "next_Q_NEEDS", "next_Q_BARRIER", "next_Q_START"):
        click(app, key)
    write_wish(app, "해외여행을 가고 싶어요")
    text = page_text(app)
    assert data.settings["text"]["ai_none"] in text
    assert data.settings["text"]["ai_heading"] not in text     # 찾은 곳이 없으면 제목을 내지 않는다
    everything = candidates.ai_pool(data.programs, data.types, [], {}, candidates.today_kst())
    assert fake_ai["prompts"][0].count("- id: ") == len(everything)


def test_picked_place_already_shown_keeps_call_button(app, fake_ai):
    """AI가 고른 곳이 위에 이미 나온 곳이어도 이유와 전화 단추를 그 자리에서 보여준다. 글을 고치면 옛 결과를 숨긴다."""
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
    # 직접 적기 구간은 화면 맨 위에 있다: AI가 고른 곳이 결과 제목과 유형 구역보다 먼저 나온다
    assert text.index(settings["ai_heading"]) < text.index(settings["result_heading"])
    assert text.index(settings["ai_heading"]) < text.index(settings["contacts_heading"])

    app.text_area(key="free_text").set_value("다른 글").run()
    text = page_text(app)
    assert escape(settings["ai_stale"]) in text and "가까운 곳이라 골랐어요." not in text
    assert len(fake_ai["prompts"]) == 1
