"""화면 조각: 문항 머리말, 안내 상자, 유형 머리말, 프로그램 카드, 목록 카드."""
from __future__ import annotations

import re
from html import escape

import streamlit as st

from app.core import candidates
from app.core.loader import split_multi

_RANGE = re.compile(r"~\s*\d+")                                   # '1619~21'의 '~21'
_NUMBER = re.compile(r"\d{2,4}-\d{3,4}-\d{4}|\d{4}-\d{4}|\d{3,4}")  # 031-481-2919 / 1666-1234 / 129


def html(markup: str) -> None:
    st.markdown(markup, unsafe_allow_html=True)


def body(value: str) -> None:
    """정보표의 글을 그대로 보여준다. 마크다운으로 해석하지 않는다('09:00~18:00'의 물결표가 취소선이 되지 않게)."""
    html(f'<p class="body">{escape(value)}</p>')


def notice(message: str, kind: str = "") -> None:
    """항상 보이는 안내 상자. kind: ''(주의) / 'fail'(실패) / 'info'(정보)"""
    html(f'<div class="notice {kind}">{escape(message)}</div>')


def heading(value: str) -> None:
    html(f'<p class="q-title">{escape(value)}</p>')


def question_header(number: int, total: int, text: str, help_text: str = "") -> None:
    html(f'<p class="q-progress">{number} / {total}</p>')
    st.progress(number / total)
    heading(text)
    if help_text:
        html(f'<p class="q-help">{escape(help_text)}</p>')


def type_header(label: str, type_info: dict) -> None:
    """유형 구역의 머리말: 유형 이름과, 사용자가 고른 문장."""
    html(
        f'<div class="type-box"><p class="type-label">{escape(label)}</p>'
        f'<p class="type-name">{escape(type_info["name"])}</p>'
        f'<p>{escape(type_info["statement"])}</p></div>'
    )


def link_button(label: str, url: str, fill: bool = False) -> None:
    """새 창으로 여는 큰 링크 버튼. tel: 주소면 휴대폰에서 바로 전화가 걸린다."""
    target = "" if url.startswith("tel:") else ' target="_blank" rel="noopener"'
    style = "fill" if fill else "line"
    html(f'<a class="a-btn {style}" href="{escape(url, quote=True)}"{target}>{escape(label)}</a>')


def korean_date(iso_date: str) -> str:
    year, month, day = iso_date.split("-")
    return f"{year}년 {int(month)}월 {int(day)}일"


def phones(contact: str) -> list[tuple[str, str]]:
    """연락처 칸에서 (걸 번호, 화면에 보일 글)을 뽑는다. 번호가 없으면 빈 목록.

    '031-439-1619~21'은 첫 번호(0314391619)로 건다. '/'로 나눠 적은 번호는 각각 단추가 된다.
    """
    found = []
    for part in contact.split("/"):
        number = _NUMBER.search(_RANGE.sub("", part))
        if number:
            found.append((number.group().replace("-", ""), part.strip()))
    return found


def _call_buttons(contact: str, text: dict) -> None:
    for number, shown in phones(contact):
        # 전화번호가 줄 중간에서 끊기지 않게 번호는 한 덩어리로 둔다
        html(f'<a class="a-btn fill" href="tel:{number}">📞 {escape(text["call_button"])}<br>'
             f'<span class="nowrap">{escape(shown)}</span></a>')


def _bullets(items: list[str]) -> None:
    html('<ul class="facts">' + "".join(f"<li>{item}</li>" for item in items) + "</ul>")


def _kind_chip(program: dict, text: dict) -> str:
    labels = {"상시서비스": text["kind_always"], "기간프로그램": text["kind_period"], "목록": text["kind_list"]}
    label = text["nationwide"] if program["범위"] == candidates.NATIONWIDE else labels.get(program["종류"], "")
    return f'<p class="p-kind">{escape(label)}</p>' if label else ""


def _card_top(program: dict, text: dict) -> None:
    html(f'{_kind_chip(program, text)}<p class="p-name">{escape(program["프로그램명"])}</p>'
         f'<p class="p-org">{escape(program["기관명"])}</p>')
    body(program["한줄설명"])


def _checks(program: dict, text: dict, type_info: dict | None) -> list[str]:
    """본인이 먼저 확인할 점. 개인 자격은 앱이 판정하지 않고 여기에 적어 준다."""
    checks = split_multi(program["확인필요"])
    if program["55~64세참여"] == candidates.UNCONFIRMED:
        checks.append(text["age_unconfirmed"])
    if type_info:
        checks += [text["unconfirmed"].format(column=c) for c in candidates.unconfirmed_columns(program, type_info)]
    return checks


def _checked_note(program: dict, text: dict) -> None:
    html(f'<p class="small-note">{escape(text["checked_note"].format(date=korean_date(program["확인날짜"])))}</p>')


def program_card(program: dict, text: dict, type_info: dict | None = None, guides: list[dict] | None = None,
                 asked: list[str] | None = None, open_part: str | None = None, key: str = "") -> None:
    """문의할 수 있는 곳 한 곳. 이런 곳이에요 → 물어볼 준비 → 문의·신청 방법 순서로 둔다.

    guides: 사용자가 고른 걸림돌(selection.barrier_guides). 정보표에 확인된 내용이 있으면 그 내용을,
            없으면 기관에 물어볼 문장을 보여준다. 확인되지 않은 것을 지어내지 않는다.
    asked: 세부 질문에서 고른 문장. 그대로 물어볼 문장에 넣는다.
    open_part: 먼저 펼쳐 둘 곳(about / ask / contact). 내용이 빈 곳은 제목도 내지 않는다.
    물어볼 문장과 전화 단추는 접지 않고 카드 아래에 항상 보여준다.
    """
    open_part = open_part or "about"
    with st.container(border=True):
        _card_top(program, text)

        # ── 이런 곳이에요 ──
        fact_columns = [(text["target_label"], "대상"), ("시간", "시간대"), ("비용", "비용"), ("장소", "장소"),
                        (text["first_visit_label"], "첫방문안내")]
        if program["종류"] == "기간프로그램":
            fact_columns.insert(1, ("기간", "기간"))
        facts = [f"<b>{escape(name)}</b>: {escape(program[col])}" for name, col in fact_columns if program[col]]
        if facts:
            with st.expander(text["card_about"], expanded=open_part == "about", key=f"about_{key}"):
                _bullets(facts)

        # ── 물어볼 준비 ──
        checks = _checks(program, text, type_info)
        worries, sentences = [], [program["첫연락문장"]] if program["첫연락문장"] else []
        sentences += list(asked or [])
        for guide in guides or []:
            known = [program[col].replace("|", ", ") for col in guide.get("show") or []
                     if program.get(col) and program[col] != candidates.UNCONFIRMED]
            if known:
                worries.append(f'<b>{escape(guide["label"])}</b>: {escape(" / ".join(known))}')
            elif guide.get("ask"):
                sentences.append(guide["ask"])
        if checks or worries:
            with st.expander(text["card_ask"], expanded=open_part == "ask", key=f"ask_{key}"):
                if checks:
                    html(f'<p class="sec">{escape(text["check_heading"])}</p>')
                    _bullets([escape(c) for c in checks])
                if worries:
                    html(f'<p class="sec">{escape(text["worry_heading"])}</p>')
                    _bullets(worries)

        # ── 문의·신청 방법 ──
        detail_url = program["상세페이지URL"] or program["홈페이지URL"]
        if program["신청방법"] or program["신청URL"] or detail_url:
            with st.expander(text["card_contact"], expanded=open_part == "contact", key=f"contact_{key}"):
                if program["신청방법"]:
                    body(program["신청방법"])
                if program["신청URL"]:
                    link_button(text["apply_button"], program["신청URL"])
                if detail_url and detail_url != program["신청URL"]:
                    link_button(text["detail_button"], detail_url)

        # ── 항상 보이는 곳: 물어볼 문장과 전화 ──
        if sentences:
            lines = "<br>".join(f"“{escape(s)}”" for s in sentences)
            html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>{lines}</div>')
        _call_buttons(program["공식연락처"], text)
        _checked_note(program, text)


def ai_reason(label: str, reason: str) -> None:
    """AI가 쓴 추천 이유. 글은 그대로 보여주고 마크다운이나 HTML로 해석하지 않는다."""
    html(f'<div class="reason"><b>{escape(label)}</b><br>{escape(reason)}</div>')


def picked_card(program: dict, text: dict, reason: str, type_name: str) -> None:
    """AI가 고른 곳인데 위쪽 유형 구역에 이미 카드가 있는 경우. 이유, 물어볼 문장, 전화 단추만 다시 보여준다."""
    with st.container(border=True):
        html(f'<p class="p-name">{escape(program["프로그램명"])}</p><p class="p-org">{escape(program["기관명"])}</p>')
        if reason:
            ai_reason(text["ai_reason"], reason)
        if program["첫연락문장"]:
            html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>“{escape(program["첫연락문장"])}”</div>')
        _call_buttons(program["공식연락처"], text)
        body(text["ai_seen_note"].format(type=type_name))
        _checked_note(program, text)


def seen_card(program: dict, text: dict, type_name: str) -> None:
    """위쪽 유형 구역에 이미 나온 곳. 같은 카드를 되풀이하지 않고 한 줄로 알려 준다."""
    with st.container(border=True):
        html(f'<p class="p-name">{escape(program["프로그램명"])}</p><p class="p-org">{escape(program["기관명"])}</p>')
        body(text["seen_note"].format(type=type_name))


def list_card(program: dict, text: dict) -> None:
    """목록(강좌 목록 등). 무엇을 신청할 수 있는지는 사용자가 목록에서 직접 확인한다."""
    with st.container(border=True):
        _card_top(program, text)
        notice(text["list_note"], "info")
        checks = _checks(program, text, None)
        if checks:
            html(f'<p class="sec">{escape(text["check_heading"])}</p>')
            _bullets([escape(c) for c in checks])
        list_url = program["신청URL"] or program["상세페이지URL"] or program["홈페이지URL"]
        if list_url:
            link_button(text["list_button"], list_url, fill=True)
        _call_buttons(program["공식연락처"], text)
        _checked_note(program, text)


def fallback_card(card: dict, text: dict) -> None:
    """정보표에서 안내할 곳을 하나도 찾지 못했을 때 보여주는 기본 창구."""
    with st.container(border=True):
        html(f'<p class="p-name">{escape(card["name"])}</p><p class="p-org">{escape(card["org"])}</p>')
        body(card["description"])
        _call_buttons(card["phone"], text)
        html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>“{escape(card["say"])}”</div>')
        if card.get("url"):
            link_button(text["detail_button"], card["url"])
