"""기관 카드: 접지 않아도 기관·장소·공식 안내·전화가 보이는지, 전화로만 이용하는 곳에 방문용 질문이 붙지 않는지 확인한다."""
from contextlib import contextmanager, nullcontext

from app.core.loader import load_all
from app.ui import components


def test_card_actions_and_visit_prompt(monkeypatch):
    data = load_all()
    text = data.settings["text"]
    alone = next(item for q in data.questions if q["id"] == "Q_BARRIER" for item in q["options"] if item["id"] == "alone")
    messages = []      # (접힘 안인지, 그린 HTML)
    opened = []

    @contextmanager
    def expander(label, **kwargs):
        opened.append(label)
        try:
            yield
        finally:
            opened.pop()

    monkeypatch.setattr(components.st, "container", lambda **kwargs: nullcontext())
    monkeypatch.setattr(components.st, "expander", expander)
    monkeypatch.setattr(components, "html", lambda value: messages.append((bool(opened), value)))

    # JOB01은 찾아가는 곳, JOB11은 전화 상담이다
    for pid, visit_expected in (("JOB01", True), ("JOB11", False)):
        row = next(p for p in data.programs if p["id"] == pid)
        messages.clear()
        components.program_card(row, text, guides=[alone], key=pid)
        visible = "".join(value for nested, value in messages if not nested)
        assert row["기관명"] in visible and row["장소"] in visible
        assert 0 <= visible.find('href="https:') < visible.index('href="tel:')     # 공식 안내가 전화보다 먼저
        assert text["say_prefix"] in visible                                       # 물어볼 문장은 접지 않는다
        assert (alone["ask"] in visible) == visit_expected                         # '혼자 가도 괜찮을까요?'는 찾아가는 곳에만
