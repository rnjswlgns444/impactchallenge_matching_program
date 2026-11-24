"""화면 조각: 문항 머리말, 안내 상자, 유형 머리말, 프로그램 카드, 목록 카드."""
from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path

import streamlit as st

from app.core import candidates
from app.core.loader import KIND_ALWAYS, KIND_LIST, KIND_PERIOD, NATIONWIDE, UNCONFIRMED, split_multi

_RANGE = re.compile(r"~\s*\d+")                                   # '1619~21'의 '~21'
_NUMBER = re.compile(r"\d{2,4}-\d{3,4}-\d{4}|\d{4}-\d{4}|\d{3,4}")  # 031-481-2919 / 1666-1234 / 129
# 찾아가지 않고 이용하는 곳의 '장소' 칸에 적힌 말. 이런 곳에는 '혼자 가도 되나요', '처음 가면 뭘 하나요'를 붙이지 않는다
REMOTE_PLACES = {"전화 문의", "전화 상담", "전화·온라인 상담", "온라인 상담", "온라인", "비대면", "집으로 방문하는 서비스"}
VISIT_GUIDES = {"alone", "first_visit"}     # 직접 찾아갈 때만 뜻이 있는 걸림돌(questions.yaml의 Q_BARRIER 선택지 id)
CHARACTER_DIR = Path(__file__).resolve().parent / "assets" / "type-characters"   # 유형 캐릭터 그림(유형 12개 × 성별 2)
CHARACTER_WIDTH = 400                       # 보내는 그림의 폭(px). 화면에는 style.py가 200px로 보여 준다(휴대폰에서 선명하게 보이도록 두 배)
# 시작 화면의 그림 상자에 왼쪽부터 세우는 캐릭터 (유형 id, 성별 선택지 id). 팀 포스터와 같은 세 명이다.
# 일자리·여가·생활 분야에서 하나씩 골랐다. 바꾸려면 이 줄만 고친다. 셋이 아니면 home.css의 칸 수도 함께 고친다
HOME_CHARACTERS = (("T01", "male"), ("T05", "female"), ("T12", "female"))


def html(markup: str) -> None:
    st.markdown(markup, unsafe_allow_html=True)


def body(value: str) -> None:
    """정보표의 글을 그대로 보여준다. 마크다운으로 해석하지 않는다('09:00~18:00'의 물결표가 취소선이 되지 않게)."""
    html(f'<p class="body">{escape(value)}</p>')


def notice(message: str, kind: str = "") -> None:
    """항상 보이는 안내 상자. kind: ''(주의) / 'fail'(실패) / 'info'(정보)"""
    html(f'<div class="notice {kind}">{escape(message)}</div>')


def heading(value: str) -> None:
    html(f'<h2 class="q-title">{escape(value)}</h2>')


def topbar(title: str, team: str) -> None:
    """모든 화면 맨 위의 띠: 로고, 앱 이름, 팀 이름."""
    html(f'<p class="topbar"><span class="logo" aria-hidden="true"></span>'
         f'<span class="topbar-name">{escape(title)}</span><span class="topbar-team">{escape(team)}</span></p>')


def steps(items: list[str]) -> None:
    """시작 화면의 순서 안내. 1, 2, 3 번호가 붙은 칸으로 보여준다."""
    rows = "".join(f'<div class="step"><span class="num">{n}</span><p>{escape(item)}</p></div>'
                   for n, item in enumerate(items, start=1))
    html(f'<div class="steps">{rows}</div>')


# 공유 단추를 누르면 실행되는 코드. 앱 화면(부모 문서)에 한 번만 심는다.
# 휴대폰 공유 창 → 안 되면 주소 복사 → 그것도 안 되면 주소를 글로 보여준다. 보내는 것은 소개 글과 앱 주소뿐이다.
_SHARE_CODE = """(function (cfg) {
  document.addEventListener('click', async function (e) {
    const a = e.target.closest && e.target.closest('a.share-btn');
    if (!a) return;
    e.preventDefault();
    const box = a.closest('.share');
    const status = box && box.querySelector('.share-status');
    const link = box && box.querySelector('.share-url');
    const say = function (t, u) { if (status) status.textContent = t; if (link) link.textContent = u || ''; };
    let url = cfg.url;
    if (!url) {
      try { url = window.top.location.href; } catch (_) { url = window.location.href; }
      url = url.split('#')[0].split('?')[0];
    }
    if (navigator.share) {
      try { await navigator.share({ title: cfg.title, text: cfg.message, url: url }); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(cfg.message + ' ' + url); say(cfg.copied); }
    catch (_) { say(cfg.failed, url); }
  });
})(CONFIG);"""


def _plant(flag: str, code: str, config: dict) -> None:
    """단추를 눌렀을 때 실행할 코드를 앱 화면(부모 문서)에 한 번만 심는다. flag는 이미 심었는지 적어 두는 이름."""
    code = code.replace("CONFIG", json.dumps(config, ensure_ascii=False))
    loader_script = (f"<script>const w = window.parent; if (!w.{flag}) {{ w.{flag} = true; "
                     "const s = w.document.createElement('script'); s.textContent = "
                     + json.dumps(code, ensure_ascii=False).replace("</", "<\\/")
                     + "; w.document.head.appendChild(s); }</script>")
    st.iframe(loader_script, height=1)


def share_box(text: dict, title: str, url: str = "") -> None:
    """결과 화면 맨 아래의 '친구에게 공유하기'. 답이나 결과는 보내지 않는다."""
    html(f'<div class="share" id="sec-share"><h2 class="q-title">{escape(text["share_heading"])}</h2>'
         f'<p class="q-help">{escape(text["share_help"])}</p>'
         f'<a class="a-btn share-btn" href="#" role="button">💬 {escape(text["share_button"])}</a>'
         f'<p class="small-note share-status" aria-live="polite"></p><p class="share-url"></p></div>')
    _plant("__shareBound", _SHARE_CODE, {"title": title, "message": text["share_message"],
                                         "copied": text["share_copied"], "failed": text["share_failed"], "url": url})


# '카카오톡·메시지로 보내기'를 누르면 실행되는 코드. 화면에 보이는 결과 사진을 휴대폰 공유 창에 파일로 넘긴다.
# 공유 창은 누른 직후에만 띄울 수 있어서(아이폰), 단추에 손이 닿는 순간 사진을 미리 받아 둔다.
# 사진 파일을 공유하지 못하는 브라우저에서는 안내 글만 보여준다. 보내는 것은 사진 한 장뿐이다.
_SEND_CODE = """(function (cfg) {
  let kept = { src: '', file: null };
  async function load() {
    const img = document.querySelector('.st-key-save_card img');
    if (!img) return null;
    if (kept.file && kept.src === img.src) return kept.file;
    const blob = await (await fetch(img.src)).blob();
    kept = { src: img.src, file: new File([blob], cfg.name, { type: blob.type || 'image/png' }) };
    return kept.file;
  }
  const button = function (e) { return e.target.closest && e.target.closest('a.send-btn'); };
  document.addEventListener('pointerdown', function (e) { if (button(e)) load().catch(function () {}); }, true);
  document.addEventListener('click', async function (e) {
    const a = button(e);
    if (!a) return;
    e.preventDefault();
    const status = a.parentElement.querySelector('.send-status');
    if (status) status.textContent = '';
    try {
      const file = await load();
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: cfg.title });
        return;
      }
    } catch (err) { if (err && err.name === 'AbortError') return; }
    if (status) status.textContent = cfg.failed;
  });
})(CONFIG);"""
SAVE_FILE_NAME = "내결과.png"


def save_box(text: dict, title: str, image: bytes, help_text: str) -> None:
    """결과 화면 아래의 '내 결과 저장하기'. image는 result_image.render가 만든 사진(PNG)이다.

    사진 미리보기 → 저장 단추 → 보내기 단추. 사진은 길게 눌러서도 저장할 수 있다(단추가 안 되는 브라우저의 마지막 방법).
    help_text는 사진에 무엇이 들어가는지 알리는 글이다(대표 유형이 있을 때와 없을 때가 다르다).
    """
    html(f'<div class="save-head" id="sec-save"><h2 class="q-title">{escape(text["save_heading"])}</h2></div>'
         f'<p class="q-help">{escape(help_text)}</p>')
    with st.container(key="save_card"):
        # PNG 그대로 보여 준다. 정하지 않으면 Streamlit이 JPG로 바꿔서 글자가 흐려지고, 길게 눌러 저장한 사진도 흐리다
        st.image(image, alt=text["save_image_alt"], output_format="PNG")
    # 누르면 사진만 내려받고 화면은 다시 그리지 않는다(on_click="ignore")
    st.download_button(text["save_button"], data=image, file_name=SAVE_FILE_NAME, mime="image/png",
                       key="save_image", type="primary", width="stretch", on_click="ignore")
    html(f'<div class="send"><a class="a-btn line send-btn" href="#" role="button">💬 {escape(text["save_send_button"])}</a>'
         f'<p class="small-note send-status" aria-live="polite"></p></div>')
    _plant("__sendBound", _SEND_CODE, {"title": title, "name": SAVE_FILE_NAME, "failed": text["save_send_failed"]})


def section_head(number: int, title: str, anchor: str) -> None:
    """대표 유형 아래의 구역 제목: 번호 동그라미 + 제목. anchor는 목차가 찾아오는 표시(id)다.

    표시는 제목(h2)이 아니라 바깥 상자에 붙인다. Streamlit이 제목 태그의 id를 자기 값으로 바꾸기 때문이다.
    """
    html(f'<div class="sec-head" id="{escape(anchor, quote=True)}"><span class="sec-num" aria-hidden="true">{number}</span>'
         f'<h2 class="q-title">{escape(title)}</h2></div>')


def feature_text(value: str) -> None:
    """유형의 특징 글(types.yaml의 feature). 상자 없이 본문 글로 보여준다."""
    html(f'<p class="body feature">{escape(value)}</p>')


def page_nav(text: dict, type_name: str, places_title: str, places_short: str) -> None:
    """스크롤을 따라다니는 목차. 휴대폰에서는 화면 위에 붙는 띠, 넓은 화면에서는 본문 오른쪽 상자다(style.py).

    링크만으로 움직인다(스크립트 없음). 결과 화면의 맨 바깥에서 그려야 한다. 상자 안에서 그리면 그 상자 안에서만 따라다닌다.
    places_title, places_short는 3번 구역의 이름이다(문의할 곳이 있을 때와 목록만 있을 때가 다르다).
    """
    def item(number: int, anchor: str, short: str, long: str) -> str:
        return (f'<li><a href="#{anchor}"><span class="toc-num">{number}</span>'
                f'<span class="toc-short">{escape(short)}</span><span class="toc-long">{escape(long)}</span></a></li>')

    html(
        f'<nav class="toc" aria-label="{escape(text["nav_label"], quote=True)}">'
        f'<div class="toc-head"><p class="toc-label">{escape(text["nav_type_label"])}</p>'
        f'<p class="toc-name">{escape(type_name)}</p></div>'
        f'<p class="toc-title">{escape(text["nav_label"])}</p><ol class="toc-row">'
        + item(1, "sec-traits", text["nav_feature"], text["feature_heading"])
        + item(2, "sec-tune", text["nav_tune"], text["tune_heading"])
        + item(3, "sec-places", places_short, places_title)
        + f'<li class="toc-first-act"><a class="toc-act" href="#sec-save"><span><span class="toc-short">'
          f'{escape(text["nav_save"])}</span><span class="toc-long">{escape(text["save_heading"])}</span></span></a></li>'
          f'<li class="toc-wide-only"><a class="toc-act" href="#sec-share"><span>{escape(text["share_button"])}</span></a></li>'
          '</ol></nav>'
    )


def progress(label: str, fraction: float) -> None:
    """label은 '질문 3 / 28' 같은 진행 글자, fraction은 전체 설문에서 지금까지 온 비율(0~1)이다.

    화면 읽기 도구에도 퍼센트 대신 같은 진행 글자를 읽어 준다(aria-valuetext).
    """
    percent = round(fraction * 100)
    # 퍼센트 숫자는 보여주지 않는다. 진행 글자('질문 1 / 24')와 기준이 달라 어긋나 보인다
    html(f'<p class="q-progress" aria-live="polite">{escape(label)}</p>'
         f'<div class="bar" role="progressbar" aria-label="진행 정도" aria-valuemin="0" aria-valuemax="100" '
         f'aria-valuenow="{percent}" aria-valuetext="{escape(label, quote=True)}">'
         f'<i style="width:{percent}%"></i></div>')


def question_text(text: str, help_text: str = "") -> None:
    # 문항은 그 화면의 가장 큰 제목이다. 문항이 바뀌면 화면 읽기 도구가 새 문항을 읽어 준다
    html(f'<h1 class="q-title" aria-live="polite">{escape(text)}</h1>')
    if help_text:
        html(f'<p class="q-help">{escape(help_text)}</p>')


def character_image(type_id: str, gender: str | None) -> Path | None:
    """유형 캐릭터 그림의 경로. 파일 이름은 't01-female.webp'처럼 유형 id와 성별 선택지 id(P_GENDER의 답)로 정한다.

    성별 답이 없거나 그 그림 파일이 없으면 None이다. 그러면 화면은 그림 없이 유형 상자만 그린다.
    """
    if not gender:
        return None
    path = CHARACTER_DIR / f"{type_id.lower()}-{gender}.webp"
    return path if path.is_file() else None


def home_art() -> None:
    """시작 화면의 그림 상자. 유형 캐릭터를 나란히 세운다. 노란 바탕·바닥·해는 home.css가 그린다.

    꾸밈 그림이라 설명 글(alt)을 비운다. 화면 읽기 도구는 그림을 건너뛰고 바로 제목을 읽는다.
    이름표는 붙이지 않는다(캐릭터 자료의 유형 이름이 앱의 이름과 달라서, 11/24 결정).
    그림 파일이 없는 캐릭터는 건너뛰고, 하나도 없으면 상자를 그리지 않는다.
    """
    images = [path for path in (character_image(type_id, gender) for type_id, gender in HOME_CHARACTERS) if path]
    if not images:
        return
    with st.container(key="home_art"):
        for path in images:
            st.image(str(path), width=CHARACTER_WIDTH, alt="")


def type_header(label: str, type_info: dict, image: Path | None = None, alt: str = "") -> None:
    """유형 구역의 머리말: 작은 글(label), 유형 이름, 유형 설명 문장.

    image를 주면 그림을 유형 이름 위에 두고 한 카드로 묶는다(대표 유형에만 쓴다. 한 화면에 한 번만 그린다).
    """
    box = (
        f'<div class="type-box" data-area="{escape(type_info.get("area", ""), quote=True)}">'
        f'<p class="type-label">{escape(label)}</p>'
        f'<h2 class="type-name">{escape(type_info["name"])}</h2>'
        f'<p class="type-statement">{escape(type_info["statement"])}</p></div>'
    )
    if image is None:
        html(box)
        return
    with st.container(key="type_hero"):
        st.image(str(image), width=CHARACTER_WIDTH, alt=alt)
        html(box)


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
        # 전화번호가 줄 중간에서 끊기지 않게 번호만 한 덩어리로 둔다. 뒤의 괄호 설명은 길면 줄이 바뀐다
        digits, bracket, rest = shown.partition("(")
        note = f" {escape(bracket + rest)}" if bracket else ""
        html(f'<a class="a-btn line phone-link" href="tel:{number}"><span>📞 {escape(text["call_button"])}</span>'
             f'<span><span class="nowrap">{escape(digits.strip())}</span>{note}</span></a>')


def _bullets(items: list[str]) -> None:
    html('<ul class="facts">' + "".join(f"<li>{item}</li>" for item in items) + "</ul>")


def _kind_chip(program: dict, text: dict) -> str:
    labels = {KIND_ALWAYS: text["kind_always"], KIND_PERIOD: text["kind_period"], KIND_LIST: text["kind_list"]}
    label = text["nationwide"] if program["범위"] == NATIONWIDE else labels.get(program["종류"], "")
    return f'<p class="p-kind">{escape(label)}</p>' if label else ""


def _card_top(program: dict, text: dict) -> None:
    html(f'<h3 class="p-name">{escape(program["프로그램명"])}</h3>'
         f'<p class="p-org">{escape(program["기관명"])}</p>{_kind_chip(program, text)}')
    body(program["한줄설명"])


def _official_button(program: dict, text: dict) -> str:
    """공식 안내로 가는 노란 단추 하나. 상세 안내가 없으면 신청 페이지, 그것도 없으면 기관 홈페이지를 연다.

    연 주소를 돌려준다(없으면 빈 글자). 같은 주소로 가는 단추를 또 그리지 않게 하기 위해서다.
    """
    for column, label in (("상세페이지URL", text["detail_button"]), ("신청URL", text["apply_button"]),
                          ("홈페이지URL", text["home_button"])):
        if program[column]:
            link_button(label, program[column], fill=True)
            return program[column]
    return ""


def _facts(items: list[tuple[str, str]]) -> None:
    """'이름: 값' 표. 비어 있거나 '미확인'인 칸은 내지 않는다(미확인은 '먼저 확인해 보세요'에서 따로 알린다)."""
    rows = "".join(f"<dt>{escape(label)}</dt><dd>{escape(value)}</dd>" for label, value in items
                   if value and value != UNCONFIRMED)
    if rows:
        html(f'<dl class="card-facts">{rows}</dl>')


def _no_visit(place: str) -> bool:
    """찾아가지 않고 전화·온라인으로 이용하거나, 집으로 찾아오는 곳인지."""
    return place in REMOTE_PLACES or place.startswith("전화 안내.")


def _checks(program: dict, text: dict, type_info: dict | None) -> list[str]:
    """본인이 먼저 확인할 점. 개인 자격은 앱이 판정하지 않고 여기에 적어 준다."""
    checks = split_multi(program["확인필요"])
    if program["55~64세참여"] == UNCONFIRMED:
        checks.append(text["age_unconfirmed"])
    if type_info:
        checks += [text["unconfirmed"].format(column=c) for c in candidates.unconfirmed_columns(program, type_info)]
    return checks


def _checked_note(program: dict, text: dict) -> None:
    html(f'<p class="small-note">{escape(text["checked_note"].format(date=korean_date(program["확인날짜"])))}</p>')


def program_card(program: dict, text: dict, type_info: dict | None = None, guides: list[dict] | None = None,
                 asked: list[str] | None = None, key: str = "") -> None:
    """문의할 수 있는 곳 한 곳. 카드를 펴지 않아도 무엇을 어디서 하는지 읽고 공식 안내·전화로 갈 수 있다.

    순서: 이름·기관·한 줄 설명 → 공식 안내·신청 단추 → 이렇게 물어보세요 → 전화 단추
          → 장소·처음 이용할 때·대상·시간·비용 → (접힘) 물어볼 준비 → 확인 날짜
    물어볼 문장은 전화 단추 바로 위에 둔다. 전화를 누르는 순간에 문장이 눈에 보여야 한다.
    guides: 사용자가 고른 걸림돌(selection.barrier_guides). 정보표에 확인된 내용이 있으면 그 내용을,
            없으면 기관에 물어볼 문장을 보여준다. 확인되지 않은 것을 지어내지 않는다.
    asked: 세부 질문에서 고른 문장. 그대로 물어볼 문장에 넣는다.
    물어볼 문장과 전화 단추는 접지 않고 항상 보여준다.
    """
    with st.container(border=True):
        _card_top(program, text)

        place = program["장소"] or program["진행방식"]
        no_visit = _no_visit(place)
        first_step = program["첫방문안내"] or program["신청방법"]
        timing = program["기간"] if program["종류"] == KIND_PERIOD else ""

        # ── 공식 안내(노랑) → 신청 ──
        primary_url = _official_button(program, text)
        if program["신청URL"] and program["신청URL"] != primary_url:
            link_button(text["apply_button"], program["신청URL"])

        # ── 물어볼 문장 → 전화 ──
        checks = _checks(program, text, type_info)
        worries, sentences = [], [program["첫연락문장"]] if program["첫연락문장"] else []
        sentences += list(asked or [])
        for guide in guides or []:
            if no_visit and guide.get("id") in VISIT_GUIDES:
                continue
            known = [program[col].replace("|", ", ") for col in guide.get("show") or []
                     if program.get(col) and program[col] != UNCONFIRMED]
            if known:
                worries.append(f'<b>{escape(guide["label"])}</b>: {escape(" / ".join(known))}')
            elif guide.get("ask"):
                sentences.append(guide["ask"])
        if sentences:
            lines = "<br>".join(f"“{escape(s)}”" for s in dict.fromkeys(sentences))     # 같은 문장은 한 번만
            html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>{lines}</div>')
        _call_buttons(program["공식연락처"], text)

        # ── 한눈에 보는 정보 ──
        _facts([("이용 방법" if no_visit else "장소", place),
                (text["first_visit_label"], first_step),
                (text["target_label"], program["대상"]),
                ("일정" if timing else "시간", timing or program["시간대"]),
                ("비용", program["비용"])])

        # 위 표에 못 다 적은 것: 기간 프로그램의 시간대, '처음 이용할 때'에 쓰지 않은 신청 방법
        extra_facts = []
        if timing and program["시간대"] and program["시간대"] not in timing:
            extra_facts.append(("시간", program["시간대"]))
        if program["신청방법"] and program["신청방법"] != first_step:
            extra_facts.append(("신청 방법", program["신청방법"]))
        if extra_facts or checks or worries:
            with st.expander(text["card_ask"], key=f"ask_{key}"):
                _facts(extra_facts)
                if checks:
                    html(f'<p class="sec">{escape(text["check_heading"])}</p>')
                    _bullets([escape(c) for c in checks])
                if worries:
                    html(f'<p class="sec">{escape(text["worry_heading"])}</p>')
                    _bullets(worries)
        _checked_note(program, text)


def ai_reason(label: str, reason: str) -> None:
    """AI가 쓴 추천 이유. 글은 그대로 보여주고 마크다운이나 HTML로 해석하지 않는다."""
    html(f'<div class="reason"><b>{escape(label)}</b><br>{escape(reason)}</div>')


def picked_card(program: dict, text: dict, reason: str, type_name: str) -> None:
    """직접 적기 구간에 나오는 곳인데 같은 화면의 다른 구역에 이미 카드가 있는 경우. 이유, 물어볼 문장, 전화 단추만 다시 보여준다."""
    with st.container(border=True):
        html(f'<h3 class="p-name">{escape(program["프로그램명"])}</h3><p class="p-org">{escape(program["기관명"])}</p>')
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
        html(f'<h3 class="p-name">{escape(program["프로그램명"])}</h3><p class="p-org">{escape(program["기관명"])}</p>')
        body(text["seen_note"].format(type=type_name))


def list_card(program: dict, text: dict) -> None:
    """목록(강좌 목록 등). 무엇을 신청할 수 있는지는 사용자가 목록에서 직접 확인한다."""
    with st.container(border=True):
        _card_top(program, text)
        body(text["list_note"])
        list_url = program["신청URL"] or program["상세페이지URL"] or program["홈페이지URL"]
        if list_url:
            link_button(text["list_button"], list_url, fill=True)
        checks = _checks(program, text, None)
        if checks:
            html(f'<p class="sec">{escape(text["check_heading"])}</p>')
            _bullets([escape(c) for c in checks])
        _call_buttons(program["공식연락처"], text)
        _checked_note(program, text)


def fallback_card(card: dict, text: dict) -> None:
    """정보표에서 안내할 곳을 하나도 찾지 못했을 때 보여주는 기본 창구."""
    with st.container(border=True):
        html(f'<h3 class="p-name">{escape(card["name"])}</h3><p class="p-org">{escape(card["org"])}</p>')
        body(card["description"])
        if card.get("url"):
            link_button(text["detail_button"], card["url"], fill=True)
        _call_buttons(card["phone"], text)
        html(f'<div class="say"><b>{escape(text["say_prefix"])}</b><br>“{escape(card["say"])}”</div>')
