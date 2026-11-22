"""지원 탐색 앱. 화면 흐름만 담당한다: 시작 → 설문(기본정보, 척도 24문항, 걸림돌) → 먼저 살펴볼 유형과 결과.

실행: 프로젝트 루트에서  streamlit run app/main.py
내용(문항, 유형, 프로그램, 문구)은 app/data의 파일에서 읽는다. 판단은 app/core가 한다.
유형은 척도 문항 점수로 정하고(core/scoring.py), 기본 결과는 AI 없이 정보표에서 걸러서 만든다.
대표 유형은 하나만 크게 보여주되, 다른 유형도 본인이 눌러서 열어 볼 수 있다.
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

from app.core import candidates, llm_matcher, loader, logger, scoring  # noqa: E402
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
        "draft": {},          # 복수 선택 문항에서 '다음'을 누르기 전까지 고른 것, '이전으로' 돌아왔을 때 앞서 한 답
        "details": {},        # {유형 id: 세부 질문의 답}
        "more": [],           # '더 보기'를 누른 유형
        "opened": [],         # 결과 화면에서 본인이 눌러서 연 유형(대표 유형 외)
        "show_all": False,    # 대표 유형이 있을 때 '다른 분야도 보기'를 눌렀는지
        "logged": None,       # 기록한 응답의 모양. 한 번 진행에 responses.csv 한 행만 남기려고 둔다
        "ai": None,           # AI 추가 추천 결과(llm_matcher.AiResult). '찾아보기'를 누를 때만 바뀐다
        "free_empty": False,  # 글을 적지 않고 '찾아보기'를 눌렀는지
        "ai_pending": False,  # AI에게 묻는 중인지. 켜져 있는 동안 '찾아보기' 단추와 글 상자를 잠근다
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
    if value is not None:
        state.draft[asked[-1]] = value          # 답했던 것은 남겨서, 돌아갔을 때 표시해 준다
    state.answers.pop(sel.PRIORITY_Q, None)
    state.ai = None
    state.ai_pending = False
    state.free_empty = False
    go("survey")


def check_label(label: str, selected: bool) -> str:
    return f"✓ {label}" if selected else label


# ── 시작 화면 ──

def screen_start(data, text) -> None:
    """팀 이름 띠 → 그림 → 제목과 소개 → 저장 안내와 시작 단추. 배치는 ui/home.css가 정한다."""
    ui_dir = Path(__file__).resolve().parent / "ui"
    st.html(ui_dir / "home.css")
    saving = bool(data.settings.get("save_log", False))      # 기록을 켰을 때만 '저장해요'라고 말한다
    with st.container(key="landing"):
        ui.html(f'<header class="home-mast"><strong><span class="logo" aria-hidden="true"></span>'
                f'{escape(text["team_name"])}</strong>'
                f'<span class="mast-audience">{escape(text["start_audience"])}</span></header>')
        with st.container(key="landing_panel"):
            with st.container(key="home_art"):
                st.image(str(ui_dir / "assets" / "ansan-lake.webp"), width="stretch", alt=text["start_image_alt"])
            with st.container(key="home_copy"):
                st.html(f'<h1 class="landing-title">{escape(text["start_heading"])}</h1>'
                        f'<p class="landing-intro">{escape(text["start_intro"])}</p>')
            with st.container(key="home_actions"):
                # 저장·전송 안내는 시작 단추보다 위에 둔다. 누르기 전에 읽을 수 있어야 한다
                ui.notice(text["start_privacy_saving"] if saving else text["start_privacy"], "info")
                st.button(width="stretch", label=text["start_button"], key="start", type="primary",
                          on_click=go, args=("survey",))
                ui.html(f'<p class="survey-length">⏱ {escape(text["start_time"])}</p>')
    ui.notice(text["start_refresh"])                          # 새로고침·뒤로 가기를 하면 답이 지워진다는 안내. 단추 가까이 둔다
    start_steps = text.get("start_steps") or []              # 없어도 되는 문구라 loader가 검사하지 않는다
    if start_steps:
        ui.steps([str(step) for step in start_steps])
    ui.html(f'<p class="small-note">{escape(text["disclaimer"])}</p>')


# ── 질문 화면 ──

def progress_label(text, survey: list[dict], question: dict) -> str:
    """문항 위의 진행 표시. 척도 문항은 '질문 n / 24'로, 그 앞뒤 문항은 따로 센다."""
    scale = [q for q in survey if q["selection"] == sel.SCALE]
    if question in scale:
        return text["progress_scale"].format(number=scale.index(question) + 1, total=len(scale))
    first = survey.index(scale[0]) if scale else len(survey)
    position = survey.index(question)
    if position < first:
        return text["progress_before"].format(number=position + 1, total=first)
    after = survey[first + len(scale):]
    return text["progress_after"].format(number=after.index(question) + 1, total=len(after))


def screen_survey(data, text) -> None:
    state = st.session_state
    question = sel.next_question(state.answers, data.questions)
    if question is None:
        go("result")
        st.rerun()

    survey = sel.survey_questions(data.questions)
    qid = question["id"]
    kind = question["selection"]
    ui.progress(progress_label(text, survey, question), (survey.index(question) + 1) / len(survey))

    def answer(value) -> None:
        state.answers[qid] = value
        state.draft.pop(qid, None)
        state.to_top = True

    # 질문과 선택지는 흰 카드(q_card) 안에, 이전 단추는 카드 밖에 둔다. 모든 문항은 답해야 넘어간다
    card = st.container(key="q_card")
    with card:
        ui.question_text(question["text"], question.get("help") or (text["scale_help"] if kind == sel.SCALE else ""))

    if kind == "multi":
        options = sel.options_of(question, data.types)
        chosen = state.draft.setdefault(qid, [])

        def pick(option_id: str) -> None:
            state.draft[qid] = sel.toggle(state.draft.get(qid, []), option_id, options)

        with card:
            ui.html(f'<p class="q-help">{escape(text["multi_help"])}</p>')
            for option in options:
                selected = option["id"] in chosen
                st.button(width="stretch", label=check_label(option["label"], selected),
                          key=f"opt_{qid}_{option['id']}", type="primary" if selected else "secondary",
                          on_click=pick, args=(option["id"],))
        # 하나라도 골라야 '다음'이 켜진다. 걸리는 게 없는 사람은 '특별히 없어요'를 고른다
        st.button(width="stretch", label=text["next_button"], key=f"next_{qid}", disabled=not chosen,
                  type="primary" if chosen else "secondary", on_click=answer, args=(list(chosen),))
    elif kind == "number":
        # 폼으로 묶어야, 숫자를 적고 바로 '다음'을 눌러도 적은 값이 함께 넘어온다
        with card, st.form(key=f"form_{qid}", border=False):
            st.number_input(question["text"], min_value=question["min"], max_value=question["max"],
                            value=state.draft.get(qid), step=1, key=f"num_{qid}", label_visibility="collapsed",
                            placeholder=text["number_placeholder"])
            if st.form_submit_button(text["number_next"], type="primary", width="stretch", key=f"next_{qid}"):
                number = state.get(f"num_{qid}")
                if number is None:                       # 비워 두고 누르면 넘어가지 않고 적어 달라고 한다
                    ui.notice(text["number_required"])
                else:
                    answer(number)
                    st.rerun()
    else:
        # 하나만 고르는 문항과 척도 문항: 누르면 바로 다음 문항으로 간다
        if kind == sel.SCALE:
            options = [{"id": opt["value"], "label": opt["label"]} for opt in data.scale]
        else:
            options = sel.options_of(question, data.types)
        before = state.draft.get(qid)                   # '이전으로' 돌아왔을 때, 앞서 고른 답을 표시해 준다
        with card:
            for option in options:
                selected = option["id"] == before
                st.button(width="stretch", label=check_label(option["label"], selected),
                          key=f"opt_{qid}_{option['id']}", type="primary" if selected else "secondary",
                          on_click=answer, args=(option["id"],))

    st.button(width="stretch", label=text["back_button"], key="back_survey", type="tertiary",
              on_click=back_one, args=(data.questions,))


# ── 결과 화면 ──

def priority_question(data, text, type_ids: list[str]) -> None:
    """점수가 가장 높은 유형이 여럿이거나 확인이 필요한 점수일 때, 무엇부터 볼지 본인이 고른다.

    자동으로 하나를 정하지 않는다. '아직 고르지 않을게요'를 누르면 대표 유형 없이 둘러본다.
    """
    state = st.session_state
    question = sel.question(data.questions, sel.PRIORITY_Q)
    lead = text["confirm_one"] if len(type_ids) == 1 else text["tie_two"] if len(type_ids) == 2 else text["tie_many"]

    def choose(option_id: str) -> None:
        state.answers[sel.PRIORITY_Q] = option_id
        state.to_top = True
        logger.log_event(state.sid, "priority", option_id)

    ui.body(lead)
    ui.heading(question["text"])
    for option in sel.options_of(question, data.types, type_ids):
        st.button(width="stretch", label=option["label"], key=f"priority_{option['id']}",
                  type="tertiary" if option["id"] == sel.DEFER else "secondary", on_click=choose, args=(option["id"],))


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

    # 후보를 바꾸는 질문(보탬활동형의 보수)과 먼저 확인해야 하는 질문(돌봄 대상)은 접지 않고 그대로 보여준다
    prominent = bool(detail.get("last") or detail.get("prominent"))
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


def type_section(data, text, result: candidates.TypeResult, label: str, guides, top_n: int,
                 seen: dict[str, str], consults: list[dict], intro: str = "") -> None:
    """유형 하나의 구역. seen은 {이미 카드로 나온 프로그램 id: 그 유형 이름}이고, 여기서 나온 것을 더한다.

    label은 유형 이름 위의 작은 글(대표 유형인지, 본인이 연 유형인지), intro는 머리말 아래 안내다.
    """
    state = st.session_state
    tid = result.type_id
    type_info = data.types[tid]
    ui.type_header(label, type_info)

    if not result.contacts and not result.lists:
        # 안내할 곳이 없으면 세부 질문을 묻지 않고, 함께 찾아 주는 창구를 바로 붙인다
        ui.notice(text["no_program"])
        for program in consults[:1]:
            if program["id"] in seen:
                ui.seen_card(program, text, seen[program["id"]])
            else:
                seen[program["id"]] = type_info["name"]
                ui.program_card(program, text, None, guides, None, key=f"{tid}_consult_{program['id']}")
        return

    if intro:                                                 # '확인한 곳이에요'는 보여줄 곳이 있을 때만 말한다
        ui.body(intro)
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
            ui.program_card(program, text, type_info, guides, asked, key=f"{tid}_{program['id']}")
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


def type_buttons(data, type_ids: list[str], opened: list[str], draw_section) -> None:
    """유형을 여는 단추들. 본인이 누른 것만 연다(state.opened). 다시 누르면 닫힌다.

    누른 유형의 안내는 그 단추 바로 아래에 그린다(draw_section). 화면 밖에 생기면 찾지 못한다.
    """
    state = st.session_state

    def pick(type_id: str) -> None:
        if type_id in state.opened:
            state.opened = [tid for tid in state.opened if tid != type_id]
        else:
            state.opened = state.opened + [type_id]
        logger.log_event(state.sid, "browse", type_id)

    for tid in type_ids:
        type_info = data.types[tid]
        selected = tid in opened
        st.button(width="stretch", label=check_label(f'{type_info["name"]}: {type_info["purpose"]}', selected),
                  key=f"browse_{tid}", type="primary" if selected else "secondary", on_click=pick, args=(tid,))
        if selected:
            draw_section(tid)


def browse_types(data, text, type_ids: list[str], first: list[str], opened: list[str], draw_section) -> None:
    """유형을 영역별로 둘러본다. first는 점수가 높았던 유형으로, 맨 위에 따로 묶어 보여준다."""
    ui.heading(text["browse_heading"])
    ui.html(f'<p class="q-help">{escape(text["browse_help"])}</p>')
    first = [tid for tid in type_ids if tid in first]
    if first:
        ui.html(f'<p class="area">{escape(text["also_heading"])}</p>')
        type_buttons(data, first, opened, draw_section)
    for area in data.areas:
        in_area = [tid for tid in type_ids if data.types[tid].get("area") == area["id"] and tid not in first]
        if in_area:
            ui.html(f'<p class="area" data-area="{escape(area["id"], quote=True)}">{escape(area["label"])}</p>')
            type_buttons(data, in_area, opened, draw_section)


def consult_section(data, text, consults: list[dict], guides) -> None:
    ui.heading(text["consult_heading"])
    for program in consults:
        ui.program_card(program, text, None, guides, None, key=f"consult_{program['id']}")


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


def free_wish_form(data, text) -> None:
    """원하는 점을 직접 적는 칸(Q_FREE)과 '찾아보기' 단추. 결과 화면 맨 위에 먼저 그린다.

    단추는 AI를 바로 부르지 않고 '찾는 중'(ai_pending)만 켠다. 찾는 동안에는 단추와 글 상자가 잠겨서
    다시 눌러도 AI를 또 부르지 않는다. 실제 호출은 free_wish_result가 한다. 적은 글은 기록하지 않는다.
    """
    state = st.session_state
    question = sel.question(data.questions, sel.FREE_Q)

    def find() -> None:
        wish = (state.get("free_text") or "").strip()
        state.free_empty = not wish
        state.ai = None
        state.ai_pending = False
        if not wish:
            return
        state.ai_wish = wish                              # 어떤 글로 찾는지. 화면에만 두고 기록하지 않는다
        if llm_matcher.has_wish(wish, data.settings.get("free_empty_words") or []):
            state.ai_pending = True
        else:
            # "ㅇ", "없어"처럼 원하는 점이 없는 글: AI를 부르지 않고 조금 더 적어 달라고 한다
            state.ai = llm_matcher.AiResult(llm_matcher.UNCLEAR)
            logger.log_event(state.sid, "ai", state.ai.status, "")

    ui.heading(question["text"])
    if question.get("help"):
        ui.html(f'<p class="q-help">{escape(question["help"])}</p>')
    ui.html(f'<p class="small-note">{escape(text["free_privacy"])}</p>')     # 적기 전에 읽도록 글 상자 위에 둔다
    # 찾는 동안 글을 고치면 실행이 끊겨 AI를 다시 부르게 되므로 글 상자도 함께 잠근다
    st.text_area(question["text"], key="free_text", max_chars=int(question.get("max_characters", 500)),
                 label_visibility="collapsed", disabled=state.ai_pending)
    st.button(width="stretch", label=text["free_button"], key="free_find", type="primary",
              on_click=find, disabled=state.ai_pending)
    if state.free_empty:
        ui.notice(text["free_empty"])


def free_wish_result(data, text, type_ids: list[str], pool: list[dict], guides,
                     seen: dict[str, str], consults: list[dict]) -> None:
    """글을 적은 사람에게만 보여주는 AI 추가 추천. 아래 유형 구역을 그린 뒤에 채운다(seen을 알아야 해서).

    pool은 candidates.ai_pool이 걸러 준 후보다. AI에는 이 후보만 보내고, 답도 이 후보와 대조한다.
    """
    state = st.session_state
    if state.ai_pending:
        # 찾는 중: 한 번만 부르고, 끝나면 화면을 다시 그려 단추를 푼다
        with st.spinner(text["free_wait"]):
            state.ai = ask_ai(data, type_ids, pool, state.get("ai_wish") or "")
        state.ai_pending = False
        logger.log_event(state.sid, "ai", state.ai.status, "|".join(m["id"] for m in state.ai.matches))
        if state.ai.status == "fail":
            logger.log_error(f"AI 추가 추천 실패 {state.ai.error}")
        st.rerun()

    result = state.ai
    if result is None:
        return
    if (state.get("free_text") or "").strip() != state.get("ai_wish"):
        ui.notice(text["ai_stale"], "info")               # 글을 고쳤으면 예전 글로 찾은 결과를 보여주지 않는다
        return
    if result.status == llm_matcher.UNCLEAR:
        ui.notice(text["free_unclear"])
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
            # 아래쪽 유형 구역에 카드가 있는 곳도 이유, 물어볼 문장, 전화 단추는 여기서 바로 볼 수 있게 한다
            ui.picked_card(program, text, match["reason"], seen[program["id"]])
        else:
            seen[program["id"]] = text["ai_heading"]
            if match["reason"]:
                ui.ai_reason(text["ai_reason"], match["reason"])
            ui.program_card(program, text, None, guides, None, key=f"ai_{program['id']}")
    if not matches:
        ui.notice(text["ai_none"], "info")
    elif result.unmatched:
        ui.notice(text["ai_unmatched"].format(items=", ".join(result.unmatched)))
    if not matches or result.unmatched:
        for program in consults[:1]:                       # 맞는 곳이 없으면 함께 찾아 주는 창구로 잇는다
            if program["id"] in seen:
                # 아래쪽에 이미 카드가 있는 창구: 물어볼 문장과 전화 단추만 여기서 바로 보여준다
                ui.picked_card(program, text, "", seen[program["id"]])
            else:
                seen[program["id"]] = text["ai_heading"]
                ui.program_card(program, text, None, guides, None, key=f"ai_consult_{program['id']}")


def log_once(data, judged: scoring.Score, shown_ids: list[str]) -> None:
    """결과에 처음 왔을 때 한 행만 남긴다. 돌아가서 답을 바꾸면 행을 늘리지 않고 events.csv에 남긴다.

    먼저 볼 유형을 고르거나 다른 유형을 여는 것은 답이 바뀐 것이 아니다. 그건 각각 priority, browse 이벤트로 남는다.
    """
    state = st.session_state
    scale_ids = [qid for qids in sel.type_questions(data.questions, data.types).values() for qid in qids]
    fields = logger.response_fields(judged, state.answers, scale_ids, shown_ids)    # 무엇을 남길지는 logger가 정한다
    shape = (fields["scores"], "|".join(fields["barriers"]))
    if state.logged is None:
        logger.log_response(state.sid, fields)
    elif state.logged != shape:
        logger.log_event(state.sid, "answers_changed", *shape)
    state.logged = shape


def result_footer(data, text, judged: scoring.Score) -> None:
    state = st.session_state

    def repick() -> None:
        state.answers.pop(sel.PRIORITY_Q, None)
        state.to_top = True

    if sel.PRIORITY_Q in state.answers:
        st.button(width="stretch", label=text["repick_button"], key="repick", type="tertiary", on_click=repick)
    st.button(width="stretch", label=text["back_button"], key="back_result", type="tertiary",
              on_click=back_one, args=(data.questions,))
    st.button(width="stretch", label=text["restart_button"], key="restart", on_click=restart)
    ui.html(f'<p class="small-note">{escape(text["disclaimer"])}</p>')


def screen_result(data, text) -> None:
    state = st.session_state
    if sel.next_question(state.answers, data.questions) is not None:
        # 결과를 보는 동안 문항 파일이 바뀌어 답이 빠진 문항이 생겼으면, 오류 화면 대신 그 문항을 다시 묻는다
        go("survey")
        st.rerun()
    today = candidates.today_kst()
    top_n = int(data.settings.get("top_n", 3))

    # 유형 판정. 점수는 화면에 보여주지 않는다. 본인이 고른 것(Q_PRIORITY)은 지금 후보에 있을 때만 쓰인다.
    setting = data.settings["scoring"]
    priority = state.answers.get(sel.PRIORITY_Q)
    judged = scoring.score(state.answers, sel.type_questions(data.questions, data.types),
                           setting["high"], setting["confirm"], priority)
    deferred = priority == sel.DEFER
    primary = judged.primary
    opened = [tid for tid in data.types if tid in state.opened and tid != primary]
    shown_types = ([primary] if primary else []) + opened

    # 기본 결과는 저장해 두지 않고 화면을 그릴 때마다 정보표에서 다시 만든다
    results = candidates.build_result(data.programs, data.types, shown_types, state.details, today)
    consults = candidates.first_consult(data.programs, today)
    guides = sel.barrier_guides(state.answers, data.questions)
    shown_ids = [p["id"] for r in results for p in visible_contacts(r, top_n) + r.lists]
    log_once(data, judged, shown_ids or [p["id"] for p in consults])

    if judged.state in (scoring.CHOOSE, scoring.CONFIRM) and not deferred:
        # 동점이거나 확인이 필요한 점수: 먼저 볼 유형을 본인이 고른 뒤에 결과를 보여준다
        priority_question(data, text, judged.candidates)
        result_footer(data, text, judged)
        return

    seen: dict[str, str] = {}
    by_type = {r.type_id: r for r in results}
    pool = candidates.ai_pool(data.programs, data.types, shown_types, state.details, today)

    def draw_section(type_id: str) -> None:
        type_section(data, text, by_type[type_id], text["type_label_other"], guides, top_n, seen, consults)

    # 직접 적기 구간은 화면 맨 위에 둔다. 글 상자와 단추는 먼저 그려서, 찾는 동안 바로 잠기게 한다.
    # AI가 고른 곳은 자리만 먼저 잡고, 아래 구역을 그린 뒤에 채운다.
    # 그래야 '이미 카드로 나온 곳'(seen)을 알고 그릴 수 있다.
    with st.container():
        free_wish_form(data, text)
    top = st.container()
    if primary:
        # 대표 유형 하나를 크게 보여준다
        type_section(data, text, by_type[primary], text["type_label"], guides, top_n, seen, consults,
                     intro=text["result_intro"])
        if judged.secondary:
            ui.html(f'<p class="sec">{escape(text["secondary_heading"])}</p>')
            type_buttons(data, [judged.secondary], opened, draw_section)
        rest = [p for p in consults if p["id"] not in seen]           # 위에 이미 나온 창구는 다시 내지 않는다
        if rest:
            consult_section(data, text, rest, guides)
            seen.update({p["id"]: text["consult_heading"] for p in rest})
        elif not shown_ids:
            ui.notice(text["no_program_at_all"], "fail")
            ui.fallback_card(data.settings["fallback_card"], text)

        # 다른 유형은 첫 화면에 늘어놓지 않고, 원하는 사람만 펼쳐 본다
        others = [tid for tid in data.types if tid not in (primary, judged.secondary)]

        def show_all() -> None:
            state.show_all = True

        # 한 번 펼치면 단추는 사라지고 목록만 남는다. 다시 접는 단추는 두지 않는다(연 유형이 숨어 버리지 않게)
        showing = state.show_all or any(tid in opened for tid in others)
        if not showing:
            st.button(width="stretch", label=text["more_types_button"], key="more_types", on_click=show_all)
        else:
            tied = [] if judged.secondary else judged.secondary_candidates
            browse_types(data, text, others, tied, opened, draw_section)
    else:
        # 대표 유형이 없는 사람: 일반 창구를 먼저, 그 아래에서 유형을 둘러본다
        ui.heading(text["result_heading"])
        if deferred:
            ui.notice(text["unknown_intro"], "info")
        else:
            ui.notice(text["low_interest"], "info")
            ui.html(f'<p class="small-note">{escape(text["edit_hint"])}</p>')
        if consults:
            consult_section(data, text, consults, guides)
            seen.update({p["id"]: text["consult_heading"] for p in consults})
        else:
            ui.fallback_card(data.settings["fallback_card"], text)
        browse_types(data, text, list(data.types), judged.candidates if deferred else [], opened, draw_section)

    with top:
        free_wish_result(data, text, shown_types, pool, guides, seen, consults)
    ui.notice(text["capture_tip"], "info")
    ui.share_box(text, data.settings["app_title"], str(text.get("share_url") or ""))
    result_footer(data, text, judged)


def main() -> None:
    data = load_data()
    text = data.settings["text"]
    logger.set_enabled(data.settings.get("save_log", False))
    st.set_page_config(page_title=data.settings["app_title"], page_icon="🌿", layout="centered",
                       initial_sidebar_state="collapsed")
    # 화면 읽기 도구가 한국어로 읽도록 페이지 언어를 알려 준다(Streamlit 기본값은 영어)
    st.html("<script>document.documentElement.lang = 'ko';</script>", unsafe_allow_javascript=True)
    style.apply()
    init_state()
    scroll_to_top()
    if st.session_state.screen != "start":                    # 시작 화면에는 팀 이름 띠와 큰 제목이 따로 있다
        ui.topbar(text.get("top_title") or data.settings["app_title"], text["team_name"])
    screens ={"start": screen_start, "survey": screen_survey, "result": screen_result}
    screens[st.session_state.screen](data, text)


main()
