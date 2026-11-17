"""화면 테스트. 실제 데이터 파일로 앱을 끝까지 눌러 보고, 오류와 기록 행 수를 확인한다. AI는 부르지 않는다."""
from __future__ import annotations

import csv
from html import escape
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from app.core import loader, logger

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
