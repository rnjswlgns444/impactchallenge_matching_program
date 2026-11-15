"""화면 조각: 문항 머리말, 안내 상자, 유형 상자, 프로그램 카드, 맛보기."""
from __future__ import annotations

import re
from html import escape

import streamlit as st

from app.core import logger
from app.core.loader import split_multi

_VIDEO_URL = re.compile(r"(youtube\.com|youtu\.be|\.mp4$|\.webm$)", re.IGNORECASE)


def html(markup: str) -> None:
    st.markdown(markup, unsafe_allow_html=True)


def notice(message: str, kind: str = "") -> None:
    """항상 보이는 안내 상자. kind: ''(주의) / 'fail'(실패) / 'info'(정보)"""
    html(f'<div class="notice {kind}">{escape(message)}</div>')


def question_header(number: int, total: int, text: str, help_text: str = "") -> None:
    html(f'<p class="q-progress">{number} / {total}</p>')
    st.progress(number / total)
    html(f'<p class="q-title">{escape(text)}</p>')
    if help_text:
        html(f'<p class="q-help">{escape(help_text)}</p>')


def type_box(label: str, type_info: dict, axis_labels: list[str]) -> None:
    chips = " · ".join(escape(a) for a in axis_labels)
    html(
        f'<div class="type-box"><p class="type-label">{escape(label)}</p>'
        f'<p class="type-name">{escape(type_info["name"])}</p>'
        f'<p>{escape(type_info["summary"])}</p>'
        f'<p style="margin-top:8px;font-weight:700;color:#0b5c5c">{chips}</p></div>'
    )


def link_button(label: str, url: str, fill: bool = False) -> None:
    """새 창으로 여는 큰 링크 버튼. tel: 주소면 휴대폰에서 바로 전화가 걸린다."""
    target = "" if url.startswith("tel:") else ' target="_blank" rel="noopener"'
    style = "fill" if fill else "line"
    html(f'<a class="a-btn {style}" href="{escape(url, quote=True)}"{target}>{escape(label)}</a>')


def korean_date(iso_date: str) -> str:
    year, month, day = iso_date.split("-")
    return f"{year}년 {int(month)}월 {int(day)}일"


def _taste(program: dict, text: dict, key: str) -> None:
    """앱 안 맛보기. 영상·공개강좌는 화면 안에서 재생하고, 앱체험은 한 단계씩 보여준다."""
    pid = program["id"]
    progress = st.session_state.taste          # 프로그램 id → 지금 보고 있는 단계
    html(f'<p class="sec">{escape(text["card_taste"])}</p>')
    html(f'<p class="small-note">{escape(program["체험제목"])}</p>')

    if pid not in progress:
        def start():
            progress[pid] = 0
            logger.log_event(st.session_state.sid, "taste_start", pid)
        st.button(width="stretch", label=f'▶ {text["taste_start"]}', key=f"taste_start_{key}", on_click=start)
        return

    if program["체험유형"] == "앱체험":
        steps = split_multi(program["체험내용"])
        index = progress[pid]
        html(f'<div class="step">{index + 1} / {len(steps)}<br>{escape(steps[index])}</div>')
        if index < len(steps) - 1:
            def go_next():
                progress[pid] += 1
                if progress[pid] == len(steps) - 1:
                    logger.log_event(st.session_state.sid, "taste_done", pid)
            st.button(width="stretch", label=text["taste_next"], key=f"taste_next_{key}", on_click=go_next, type="primary")
        else:
            notice(text["taste_done"], "info")
    elif _VIDEO_URL.search(program["체험URL"]):
        st.video(program["체험URL"])
    else:
        # 화면 안에서 재생할 수 없는 주소는 링크로 연다
        link_button(text["taste_link"], program["체험URL"])


def program_card(program: dict, text: dict, reason: str = "", key_prefix: str = "") -> None:
    """부담이 적은 순서로 배치한다: 소개 → 진행 방식 → 맛보기 → 연락."""
    key = f"{key_prefix}{program['id']}"
    with st.container(border=True):
        html(f'<p class="p-name">{escape(program["프로그램명"])}</p>'
             f'<p class="p-org">{escape(program["기관명"])}</p>')

        html(f'<p class="sec">{escape(text["card_about"])}</p>')
        st.markdown(program["한줄설명"])
        if reason:
            html(f'<div class="reason">{escape(reason)}</div>')

        html(f'<p class="sec">{escape(text["card_flow"])}</p>')
        facts = [program["진행방식"], program["첫방문안내"]]
        facts += [f"{name}: {program[col]}" for name, col in (("시간", "시간대"), ("비용", "비용"), ("장소", "장소")) if program[col]]
        st.markdown("\n".join(f"- {fact}" for fact in facts if fact))

        if program["체험유형"]:
            _taste(program, text, key)

        html(f'<p class="sec">{escape(text["card_contact"])}</p>')
        if program["공식연락처"]:
            digits = re.sub(r"[^\d+]", "", program["공식연락처"])
            link_button(f'📞 {text["call_button"]} ({program["공식연락처"]})', f"tel:{digits}", fill=True)
        if program["첫연락문장"]:
            html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>“{escape(program["첫연락문장"])}”</div>')
        detail_url = program["상세페이지URL"] or program["홈페이지URL"]
        if detail_url:
            link_button(text["detail_button"], detail_url)

        html(f'<p class="small-note">{escape(text["checked_note"].format(date=korean_date(program["확인날짜"])))}</p>')


def fallback_card(card: dict, text: dict) -> None:
    """추천할 프로그램이 없을 때 보여주는 기본 창구."""
    with st.container(border=True):
        html(f'<p class="p-name">{escape(card["name"])}</p><p class="p-org">{escape(card["org"])}</p>')
        st.markdown(card["description"])
        digits = re.sub(r"[^\d+]", "", card["phone"])
        link_button(f'📞 {text["call_button"]} ({card["phone"]})', f"tel:{digits}", fill=True)
        html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>“{escape(card["say"])}”</div>')
        if card.get("url"):
            link_button(text["detail_button"], card["url"])
