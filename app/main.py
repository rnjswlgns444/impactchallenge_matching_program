"""지원 탐색 앱. 화면 흐름만 담당한다: 시작 → 질문 3개 → 유형별 결과.

실행: 프로젝트 루트에서  streamlit run app/main.py
내용(문항, 유형, 프로그램, 문구)은 app/data의 파일에서 읽는다. 판단은 app/core가 한다.
유형은 사용자가 고른 문장 그대로이고, 기본 결과는 AI 없이 정보표에서 걸러서 만든다.
결과 화면에서 원하는 점을 직접 적은 사람에게만, AI가 정보표 후보 안에서 고른 곳을 덧붙인다.
"""
from __future__ import annotations

import os
import sys
import uuid
from html import escape
from pathlib import Path

import streamlit as st

# 'streamlit run app/main.py'로 실행해도 app 패키지를 찾을 수 있게 프로젝트 루트를 경로에 넣는다
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core import candidates, llm_matcher, loader, logger  # noqa: E402
from app.core import selection as sel  # noqa: E402
from app.ui import components as ui  # noqa: E402
from app.ui import style  # noqa: E402


def load_data() -> loader.AppData:
    """데이터 파일을 읽는다. 매번 새로 읽어서, 파일을 고치면 새로고침만으로 반영되게 한다."""
    try:
        return loader.load_all()
    except loader.DataError as err:
        st.error("데이터 파일에 고칠 곳이 있습니다. (이 화면은 팀원용입니다)")
        for problem in err.problems:
            st.markdown(f"- {problem}")
        st.stop()


KEY_NAMES = {"gemini": "GEMINI_API_KEY", "anthropic": "ANTHROPIC_API_KEY"}


def get_api_key(provider: str) -> str:
    """API 키를 st.secrets → 환경변수 순서로 찾는다. 없으면 빈 글자."""
    name = KEY_NAMES.get(provider, "ANTHROPIC_API_KEY")
    try:
        key = st.secrets.get(name, "")
    except Exception:  # secrets.toml 파일이 없을 때
        key = ""
    return key or os.environ.get(name, "")


def get_caller(llm: dict):
    """settings.yaml의 llm 설정으로 AI 호출 함수를 만든다. 키가 없으면 None."""
    provider = llm.get("provider", "gemini")
    key = get_api_key(provider)
    if not key:
        return None
    return llm_matcher.make_caller(provider, key, llm.get("model", ""), llm.get("effort", "low"),
                                   float(llm.get("timeout_seconds", 60)))


def init_state() -> None:
    defaults = {
        "screen": "start", "sid": uuid.uuid4().hex,
        "answers": {},        # {문항 id: 답}. 설문에서 확정한 것만 들어간다
        "draft": {},          # 복수 선택 문항에서 '다음'을 누르기 전까지 고른 것
        "details": {},        # {유형 id: 세부 질문의 답}
        "more": [],           # '더 보기'를 누른 유형
        "browsing": False,    # 유형을 정하지 않고 결과에 와서 둘러보는 중인지
        "logged": None,       # 기록한 응답의 모양. 한 번 진행에 responses.csv 한 행만 남기려고 둔다
        "ai": None,           # AI 추가 추천 결과(llm_matcher.AiResult). '찾아보기'를 누를 때만 바뀐다
        "free_empty": False,  # 글을 적지 않고 '찾아보기'를 눌렀는지
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)


def restart() -> None:
    for key in list(st.session_state.keys()):
        del st.session_state[key]


def go(screen: str) -> None:
    st.session_state.screen = screen
    st.session_state.to_top = True


SCROLL_TOP = """<script>
const d = window.parent.document;
d.querySelectorAll('section, [data-testid="stMain"], [data-testid="stAppViewContainer"]').forEach(e => e.scrollTo(0, 0));
window.parent.scrollTo(0, 0);
</script>"""


def scroll_to_top() -> None:
    """화면이 바뀌면 맨 위부터 보이게 한다. Streamlit은 화면이 바뀌어도 스크롤 위치를 그대로 둔다."""
    if st.session_state.pop("to_top", False):
        st.iframe(SCROLL_TOP, height=1)


def back_one(questions: list[dict]) -> None:
    """마지막에 답한 설문 문항으로 돌아간다. 답한 것이 없으면 시작 화면으로 간다."""
    state = st.session_state
    asked = [q["id"] for q in sel.survey_questions(questions) if q["id"] in state.answers]
    if not asked:
        go("start")
        return
    value = state.answers.pop(asked[-1])
    if isinstance(value, list):
        state.draft[asked[-1]] = value          # 골라 둔 것은 남겨서 다시 고르지 않게 한다
    state.answers.pop(sel.PRIORITY_Q, None)
    state.browsing = False
    state.ai = None
    state.free_empty = False
    go("survey")


def check_label(label: str, selected: bool) -> str:
    return f"✓ {label}" if selected else label


# ── 시작 화면 ──

def screen_start(data, text) -> None:
    ui.html(f'<p class="app-title">{escape(data.settings["app_title"])}</p>')
    ui.body(text["start_intro"])
    ui.body(f'⏱ {text["start_time"]}')
    saving = bool(data.settings.get("save_log", False))      # 기록을 켰을 때만 '저장해요'라고 말한다
    ui.notice(text["start_privacy_saving"] if saving else text["start_privacy"], "info")
    st.button(width="stretch", label=text["start_button"], key="start", type="primary", on_click=go, args=("survey",))
    ui.html(f'<p class="small-note">{escape(text["disclaimer"])}</p>')


# ── 질문 화면 ──

def screen_survey(data, text) -> None:
    state = st.session_state
    question = sel.next_question(state.answers, data.questions)
    if question is None:
        go("result")
        st.rerun()

    survey = sel.survey_questions(data.questions)
    qid = question["id"]
    ui.question_header(survey.index(question) + 1, len(survey), question["text"], question.get("help", ""))
    options = sel.options_of(question, data.types)

    def answer(value) -> None:
        state.answers[qid] = value
        state.to_top = True

    if question["selection"] == "multi":
        chosen = state.draft.setdefault(qid, [])
        ui.html(f'<p class="q-help">{escape(text["multi_help"])}</p>')

        def pick(option_id: str) -> None:
            state.draft[qid] = sel.toggle(state.draft.get(qid, []), option_id, options)

        area_labels = {a["id"]: a["label"] for a in data.areas}
        shown_area = None
        for option in options:
            area = option.get("area")
            if area != shown_area and area in area_labels:      # 유형 선택지는 영역별로 묶어 보여준다
                ui.html(f'<p class="area">{escape(area_labels[area])}</p>')
            shown_area = area
            selected = option["id"] in chosen
            st.button(width="stretch", label=check_label(option["label"], selected), key=f"opt_{qid}_{option['id']}",
                      type="primary" if selected else "secondary", on_click=pick, args=(option["id"],))
        st.divider()
        st.button(width="stretch", label=text["next_button"].format(count=len(chosen)) if chosen else text["skip_button"], key=f"next_{qid}",
                  type="primary" if chosen else "secondary", on_click=answer, args=(list(chosen),))
    else:
        for option in options:
            st.button(width="stretch", label=option["label"], key=f"opt_{qid}_{option['id']}",
                      on_click=answer, args=(option["id"],))
        st.button(width="stretch", label=text["skip_button"], key=f"next_{qid}", type="tertiary",
                  on_click=answer, args=(None,))

    st.button(width="stretch", label=text["back_button"], key="back_survey", type="tertiary",
              on_click=back_one, args=(data.questions,))


# ── 결과 화면 ──

def priority_question(data, type_ids: list[str]) -> None:
    """유형이 둘 이상일 때 무엇부터 볼지 묻는다. 순서만 바꾸고 다른 유형은 그대로 둔다."""
    state = st.session_state
    question = sel.question(data.questions, sel.PRIORITY_Q)

    def choose(option_id: str) -> None:
        state.answers[sel.PRIORITY_Q] = option_id
        logger.log_event(state.sid, "priority", option_id)

    with st.container(border=True):
        ui.html(f'<p class="q-help"><b>{escape(question["text"])}</b></p>')
        for option in sel.options_of(question, data.types, type_ids):
            st.button(width="stretch", label=option["label"], key=f"priority_{option['id']}",
                      on_click=choose, args=(option["id"],))


def detail_question(text, type_info: dict, detail: dict) -> None:
    """유형의 세부 질문(선택). 답은 후보의 순서와 '이렇게 물어보세요' 문장에 쓰인다."""
    state = st.session_state
    tid = type_info["id"]
    multi = detail["selection"] == "multi"
    current = state.details.get(tid)
    chosen = current if isinstance(current, list) else [current] if current else []

    def pick(option_id: str) -> None:
        if multi:
            state.details[tid] = sel.toggle(chosen, option_id, detail["options"])
        else:
            state.details[tid] = None if option_id in chosen else option_id
        logger.log_event(state.sid, "detail", tid, option_id)

    # 후보를 바꾸는 질문(보탬활동형의 보수)은 접지 않고 맨 위에 그대로 보여준다
    prominent = bool(detail.get("last"))
    box = st.container(border=True) if prominent else st.expander(text["detail_label"], expanded=bool(chosen),
                                                                 key=f"detail_box_{tid}")
    with box:
        ui.html(f'<p class="q-help"><b>{escape(detail["text"])}</b></p>')
        for option in detail["options"]:
            selected = option["id"] in chosen
            st.button(width="stretch", label=check_label(option["label"], selected), key=f"detail_{tid}_{option['id']}",
                      type="primary" if selected else "secondary", on_click=pick, args=(option["id"],))


def visible_contacts(result: candidates.TypeResult, top_n: int) -> list[dict]:
    if result.type_id in st.session_state.more:
        return result.contacts
    return result.contacts[:top_n]


def type_section(data, text, result: candidates.TypeResult, guides, open_part, top_n: int,
                 seen: dict[str, str], consults: list[dict]) -> None:
    """유형 하나의 구역. seen은 {이미 카드로 나온 프로그램 id: 그 유형 이름}이고, 여기서 나온 것을 더한다."""
    state = st.session_state
    tid = result.type_id
    type_info = data.types[tid]
    ui.type_header(text["type_label"], type_info)

    if not result.contacts and not result.lists:
        # 안내할 곳이 없으면 세부 질문을 묻지 않고, 함께 찾아 주는 창구를 바로 붙인다
        ui.notice(text["no_program"])
        for program in consults[:1]:
            if program["id"] in seen:
                ui.seen_card(program, text, seen[program["id"]])
            else:
                seen[program["id"]] = type_info["name"]
                ui.program_card(program, text, None, guides, None, open_part, key=f"{tid}_consult_{program['id']}")
        return

    detail = sel.detail_of(type_info)
    if detail:
        detail_question(text, type_info, detail)
    asked = [opt["label"] for opt in sel.chosen_detail_options(type_info, state.details.get(tid))]

    if result.contacts:
        ui.html(f'<p class="sec">{escape(text["contacts_heading"])}</p>')
        shown = visible_contacts(result, top_n)
        for program in shown:
            if program["id"] in seen:
                ui.seen_card(program, text, seen[program["id"]])
                continue
            seen[program["id"]] = type_info["name"]
            ui.program_card(program, text, type_info, guides, asked, open_part, key=f"{tid}_{program['id']}")
        hidden = len(result.contacts) - len(shown)
        if hidden:
            def show_more() -> None:
                state.more.append(tid)
                logger.log_event(state.sid, "more", tid)
            st.button(width="stretch", label=text["more_button"].format(count=hidden), key=f"more_{tid}",
                      on_click=show_more)

    if result.lists:
        ui.html(f'<p class="sec">{escape(text["lists_heading"])}</p>')
        for program in result.lists:
            ui.list_card(program, text)


def browse_types(data, text, type_ids: list[str], draw_section) -> None:
    """유형을 정하지 않은 사람이 12개 유형을 둘러본다. 본인이 누른 것만 유형으로 더한다.

    누른 유형의 안내는 그 단추 바로 아래에 그린다(draw_section). 화면 밖에 생기면 찾지 못한다.
    """
    state = st.session_state
    options = sel.options_of(sel.question(data.questions, sel.TYPE_Q), data.types)

    def pick(type_id: str) -> None:
        state.answers[sel.TYPE_Q] = sel.toggle(state.answers.get(sel.TYPE_Q) or [], type_id, options)
        logger.log_event(state.sid, "browse", type_id)

    ui.heading(text["browse_heading"])
    ui.html(f'<p class="q-help">{escape(text["browse_help"])}</p>')
    for area in data.areas:
        ui.html(f'<p class="area">{escape(area["label"])}</p>')
        for type_info in data.types.values():
            if type_info.get("area") != area["id"]:
                continue
            selected = type_info["id"] in type_ids
            st.button(width="stretch", label=check_label(f'{type_info["name"]}: {type_info["purpose"]}', selected),
                      key=f"browse_{type_info['id']}", type="primary" if selected else "secondary",
                      on_click=pick, args=(type_info["id"],))
            if selected:
                draw_section(type_info["id"])


def consult_section(data, text, consults: list[dict], guides, open_part) -> None:
    ui.heading(text["consult_heading"])
    for program in consults:
        ui.program_card(program, text, None, guides, None, open_part, key=f"consult_{program['id']}")


def wish_examples(data, type_ids: list[str]) -> list[str]:
    """AI에게 함께 알려 줄, 사용자가 고른 항목: 세부 질문의 답과 마음에 걸린다고 한 점."""
    state = st.session_state
    chosen = [opt["label"] for tid in type_ids
              for opt in sel.chosen_detail_options(data.types[tid], state.details.get(tid))]
    worries = [f'마음에 걸리는 점: {guide["label"]}' for guide in sel.barrier_guides(state.answers, data.questions)]
    return chosen + worries


def ask_ai(data, type_ids: list[str], pool: list[dict], wish: str) -> llm_matcher.AiResult:
    """AI를 한 번 부른다. 무엇이 실패해도 예외를 밖으로 던지지 않는다."""
    try:
        caller = get_caller(data.settings.get("llm") or {})
    except Exception as err:  # AI 라이브러리가 없는 등 호출 함수를 만들지 못했을 때
        return llm_matcher.AiResult("fail", error=llm_matcher.error_kind(err))
    return llm_matcher.recommend(data.prompt, [data.types[tid] for tid in type_ids], wish_examples(data, type_ids),
                                 wish, pool, int(data.settings.get("top_n", 3)), caller)


def free_wish_section(data, text, type_ids: list[str], pool: list[dict], guides, open_part,
                      seen: dict[str, str], consults: list[dict]) -> None:
    """원하는 점을 직접 적는 칸(Q_FREE)과, 적은 사람에게만 보여주는 AI 추가 추천.

    pool은 candidates.ai_pool이 걸러 준 후보다. AI에는 이 후보만 보내고, 답도 이 후보와 대조한다.
    추천은 글 상자 바로 아래에 그린다. 적은 글은 기록하지 않는다.
    """
    state = st.session_state
    question = sel.question(data.questions, sel.FREE_Q)
    ui.heading(question["text"])
    if question.get("help"):
        ui.html(f'<p class="q-help">{escape(question["help"])}</p>')
    ui.html(f'<p class="small-note">{escape(text["free_privacy"])}</p>')     # 적기 전에 읽도록 글 상자 위에 둔다
    st.text_area(question["text"], key="free_text", max_chars=int(question.get("max_characters", 500)),
                 label_visibility="collapsed")

    if st.button(width="stretch", label=text["free_button"], key="free_find", type="primary"):
        wish = (state.get("free_text") or "").strip()
        state.free_empty = not wish
        state.ai = None
        if wish:
            with st.spinner(text["free_wait"]):
                state.ai = ask_ai(data, type_ids, pool, wish)
            state.ai_wish = wish                          # 어떤 글로 찾은 결과인지. 화면에만 두고 기록하지 않는다
            logger.log_event(state.sid, "ai", state.ai.status, "|".join(m["id"] for m in state.ai.matches))
            if state.ai.status == "fail":
                logger.log_error(f"AI 추가 추천 실패 {state.ai.error}")

    if state.free_empty:
        ui.notice(text["free_empty"])
    result = state.ai
    if result is None:
        return
    if (state.get("free_text") or "").strip() != state.get("ai_wish"):
        ui.notice(text["ai_stale"], "info")               # 글을 고쳤으면 예전 글로 찾은 결과를 보여주지 않는다
        return
    if result.status == "fail":
        ui.notice(text["ai_fail"], "fail")
        if data.settings.get("show_error_kind"):
            ui.html(f'<p class="small-note">(점검용) {escape(result.error)}</p>')
        return

    # 답을 받은 뒤 유형이나 세부 답이 바뀌었을 수 있으므로, 지금의 후보에 있는 것만 그린다
    by_id = {p["id"]: p for p in pool}
    matches = [m for m in result.matches if m["id"] in by_id]
    if matches:
        ui.heading(text["ai_heading"])
    for match in matches:
        program = by_id[match["id"]]
        if program["id"] in seen:
            # 위에 이미 나온 곳도 이유, 물어볼 문장, 전화 단추는 여기서 바로 볼 수 있게 한다
            ui.picked_card(program, text, match["reason"], seen[program["id"]])
        else:
            seen[program["id"]] = text["ai_heading"]
            if match["reason"]:
                ui.ai_reason(text["ai_reason"], match["reason"])
            ui.program_card(program, text, None, guides, None, open_part, key=f"ai_{program['id']}")
    if not matches:
        ui.notice(text["ai_none"], "info")
    elif result.unmatched:
        ui.notice(text["ai_unmatched"].format(items=", ".join(result.unmatched)))
    if not matches or result.unmatched:
        for program in consults[:1]:                       # 맞는 곳이 없으면 함께 찾아 주는 창구로 잇는다
            if program["id"] in seen:
                ui.seen_card(program, text, seen[program["id"]])
            else:
                seen[program["id"]] = text["ai_heading"]
                ui.program_card(program, text, None, guides, None, open_part, key=f"ai_consult_{program['id']}")


def log_once(type_ids: list[str], shown_ids: list[str]) -> None:
    """결과에 처음 왔을 때 한 행만 남긴다. 돌아가서 답을 바꾸면 행을 늘리지 않고 events.csv에 남긴다."""
    state = st.session_state
    barriers = state.answers.get(sel.BARRIER_Q) or []
    start = state.answers.get(sel.START_Q) or ""
    shape = ("|".join(type_ids), "|".join(barriers), start)
    if state.logged is None:
        logger.log_response(state.sid, type_ids, barriers, start, shown_ids)
    elif state.logged != shape and not state.browsing:
        logger.log_event(state.sid, "answers_changed", shape[0], f"{shape[1]};{shape[2]}")
    state.logged = shape


def screen_result(data, text) -> None:
    state = st.session_state
    today = candidates.today_kst()
    top_n = int(data.settings.get("top_n", 3))
    type_ids = sel.selected_types(state.answers, data.types)
    if not type_ids:
        state.browsing = True

    # 기본 결과는 저장해 두지 않고 화면을 그릴 때마다 정보표에서 다시 만든다
    ordered = sel.ordered_types(type_ids, state.answers.get(sel.PRIORITY_Q))
    results = candidates.build_result(data.programs, data.types, ordered, state.details, today)
    consults = candidates.first_consult(data.programs, today)
    guides = sel.barrier_guides(state.answers, data.questions)
    open_part = sel.card_part_to_open(state.answers, data.questions)

    shown_ids = [p["id"] for r in results for p in visible_contacts(r, top_n) + r.lists]
    log_once(type_ids, shown_ids or [p["id"] for p in consults])

    seen: dict[str, str] = {}
    by_type = {r.type_id: r for r in results}
    pool = candidates.ai_pool(data.programs, data.types, ordered, state.details, today)

    def draw_section(type_id: str) -> None:
        type_section(data, text, by_type[type_id], guides, open_part, top_n, seen, consults)

    ui.heading(text["result_heading"])
    if state.browsing:
        # 유형을 정하지 않은 사람: 일반 창구를 먼저, 그 아래에서 유형을 둘러본다
        ui.notice(text["unknown_intro"], "info")
        if consults:
            consult_section(data, text, consults, guides, open_part)
            seen.update({p["id"]: text["consult_heading"] for p in consults})
        else:
            ui.fallback_card(data.settings["fallback_card"], text)
        browse_types(data, text, type_ids, draw_section)
        free_wish_section(data, text, ordered, pool, guides, open_part, seen, consults)
    else:
        ui.body(text["result_intro"])
        if len(type_ids) >= 2 and sel.PRIORITY_Q not in state.answers:
            priority_question(data, type_ids)
        for result in results:
            draw_section(result.type_id)
        free_wish_section(data, text, ordered, pool, guides, open_part, seen, consults)
        rest = [p for p in consults if p["id"] not in seen]           # 위에 이미 나온 창구는 다시 내지 않는다
        if rest:
            consult_section(data, text, rest, guides, open_part)
        elif not shown_ids:
            ui.notice(text["no_program_at_all"], "fail")
            ui.fallback_card(data.settings["fallback_card"], text)

    ui.notice(text["capture_tip"], "info")
    st.button(width="stretch", label=text["back_button"], key="back_result", type="tertiary",
              on_click=back_one, args=(data.questions,))
    st.button(width="stretch", label=text["restart_button"], key="restart", on_click=restart)
    ui.html(f'<p class="small-note">{escape(text["disclaimer"])}</p>')


def main() -> None:
    data = load_data()
    text = data.settings["text"]
    logger.set_enabled(data.settings.get("save_log", False))
    st.set_page_config(page_title=data.settings["app_title"], page_icon="🌿", layout="centered",
                       initial_sidebar_state="collapsed")
    style.apply()
    init_state()
    scroll_to_top()
    screens = {"start": screen_start, "survey": screen_survey, "result": screen_result}
    screens[st.session_state.screen](data, text)


main()
