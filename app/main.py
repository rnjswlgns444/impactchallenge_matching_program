"""지원 탐색 유형 진단 앱. 화면 흐름만 담당한다: 시작 → 설문 → 유형·세부 희망 → 결과.

실행: 프로젝트 루트에서  streamlit run app/main.py
내용(문항, 유형, 규칙, 프로그램, 문구, AI 지시문)은 app/data, app/prompts의 파일에서 읽는다.
"""
from __future__ import annotations

import os
import sys
import uuid
from pathlib import Path

import streamlit as st

# 'streamlit run app/main.py'로 실행해도 app 패키지를 찾을 수 있게 프로젝트 루트를 경로에 넣는다
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core import loader, logger  # noqa: E402
from app.core.llm_matcher import make_caller, recommend  # noqa: E402
from app.core.rules_engine import active_questions, decide_type, next_question, pole_label  # noqa: E402
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
    name = KEY_NAMES.get(provider, "ANTHROPIC_API_KEY")
    try:
        key = st.secrets.get(name, "")
    except Exception:  # secrets.toml 파일이 없을 때
        key = ""
    return key or os.environ.get(name, "")


@st.cache_resource
def get_llm_caller(provider: str, api_key: str, model: str, effort: str, timeout: float):
    return make_caller(provider, api_key, model, effort, timeout)


def init_state() -> None:
    defaults = {
        "screen": "start", "answers": {}, "sid": uuid.uuid4().hex,
        "wishes": [], "wish_saved": "", "unsure": False, "result": None, "taste": {},
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)


def restart() -> None:
    for key in list(st.session_state.keys()):
        del st.session_state[key]


def go(screen: str) -> None:
    st.session_state.screen = screen


# ── 시작 화면 ──

def screen_start(data, text) -> None:
    ui.html(f'<p class="app-title">{data.settings["app_title"]}</p>')
    st.markdown(text["start_intro"])
    st.markdown(f'⏱ {text["start_time"]}')
    ui.notice(text["start_privacy"], "info")
    st.button(width="stretch", label=text["start_button"], type="primary", on_click=go, args=("survey",))


# ── 설문 화면 ──

def screen_survey(data, text) -> None:
    answers = st.session_state.answers
    question = next_question(answers, data.questions, data.rules)
    if question is None:
        go("wish")
        st.rerun()

    total = len(active_questions(answers, data.questions, data.rules))
    ui.question_header(len(answers) + 1, total, question["text"], question.get("help", ""))

    def choose(question_id, option_id):
        st.session_state.answers[question_id] = option_id

    for option in question["options"]:
        st.button(width="stretch", label=option["label"], key=f"opt_{option['id']}", on_click=choose, args=(question["id"], option["id"]))

    st.button(width="stretch", label=text["back_button"], key="back_survey", type="tertiary", on_click=back_one)


def back_one() -> None:
    """마지막에 답한 문항으로 돌아간다. 답한 것이 없으면 시작 화면으로 간다."""
    answers = st.session_state.answers
    if answers:
        answers.pop(next(reversed(answers)))
        st.session_state.wishes = []
        go("survey")
    else:
        go("start")


# ── 유형 결과 + 세부 희망 화면 ──

def screen_wish(data, text) -> None:
    decided = decide_type(st.session_state.answers, data.questions, data.rules)
    type_info = data.types[decided["code"]]
    axis_labels = [pole_label(data.rules, axis, pole) for axis, pole in decided["poles"].items()]
    ui.type_box(text["type_heading"], type_info, axis_labels)

    ui.html(f'<p class="q-title">{type_info["wish_question"]}</p>')
    ui.html(f'<p class="q-help">{text["wish_help"]}</p>')

    def toggle(example):
        wishes = st.session_state.wishes
        wishes.remove(example) if example in wishes else wishes.append(example)

    for i, example in enumerate(type_info["wish_examples"]):
        selected = example in st.session_state.wishes
        st.button(width="stretch", label=f"✓ {example}" if selected else example, key=f"wish_{i}",
                  type="primary" if selected else "secondary", on_click=toggle, args=(example,))

    # 개인정보 안내는 입력칸 바로 위에 항상 보이게 둔다
    ui.notice(text["wish_privacy"])
    st.text_area(text["wish_text_label"], key="wish_text", height=120, max_chars=300, placeholder=text["wish_text_tip"])

    def submit(unsure: bool):
        written = st.session_state.get("wish_text", "").strip()
        if not unsure and not st.session_state.wishes and not written:
            st.session_state.need_input = True
            return
        st.session_state.need_input = False
        st.session_state.unsure = unsure
        st.session_state.wish_saved = "" if unsure else written
        if unsure:
            st.session_state.wishes = []
        st.session_state.result = None
        go("result")

    if st.session_state.get("need_input"):
        ui.notice(text["wish_need_input"], "fail")
    st.button(width="stretch", label=f'🔍 {text["wish_submit"]}', key="wish_submit", type="primary", on_click=submit, args=(False,))
    st.button(width="stretch", label=text["wish_unsure"], key="wish_unsure", on_click=submit, args=(True,))
    st.button(width="stretch", label=text["back_button"], key="back_wish", type="tertiary", on_click=back_one)


# ── 결과 화면 ──

def find_programs(data, text, decided):
    """추천을 계산하고 익명 기록을 남긴다. 주관식 원문은 기록하지 않는다."""
    state = st.session_state
    llm = data.settings.get("llm", {})
    provider = llm.get("provider", "gemini")
    api_key = get_api_key(provider)
    caller = None
    if api_key:
        caller = get_llm_caller(provider, api_key, llm["model"], llm.get("effort", "low"),
                                float(llm.get("timeout_seconds", 30)))
    with st.spinner(text["loading"]):
        result = recommend(data, decided["code"], state.wishes, state.wish_saved, state.unsure,
                           caller, on_error=logger.log_error)
    logger.log_response(
        state.sid, list(state.answers.values()), decided["scores"], decided["code"], state.wishes,
        bool(state.wish_saved), state.unsure, result.status,
        [p["id"] for p in result.programs + result.consults],
    )
    return result


def screen_result(data, text) -> None:
    state = st.session_state
    decided = decide_type(state.answers, data.questions, data.rules)
    type_info = data.types[decided["code"]]
    if state.result is None:
        state.result = find_programs(data, text, decided)
    result = state.result

    axis_labels = [pole_label(data.rules, axis, pole) for axis, pole in decided["poles"].items()]
    ui.type_box(text["type_heading"], type_info, axis_labels)

    if result.status == "C":
        ui.notice(text["fail_c"], "fail")
        ui.fallback_card(data.settings["fallback_card"], text)
    else:
        if result.status == "A":
            ui.notice(text["fail_a"], "fail")

            def retry():
                state.result = None
            st.button(width="stretch", label=f'↻ {text["fail_a_retry"]}', key="retry", type="primary", on_click=retry)
            heading = text["fail_a_default_heading"]
        elif result.status == "B":
            ui.notice(text["fail_b"].format(items=", ".join(result.unmatched)))
            heading = text["result_heading"]
        elif result.status == "unsure":
            heading = text["unsure_heading"]
        else:
            heading = text["result_heading"]

        if result.programs:
            ui.html(f'<p class="q-title">{heading}</p>')
        for program in result.programs:
            ui.program_card(program, text, result.reasons.get(program["id"], ""))
        if result.consults:
            ui.html(f'<p class="q-title">{text["consult_heading"]}</p>')
            for program in result.consults:
                ui.program_card(program, text, key_prefix="consult_")

    ui.notice(text["capture_tip"], "info")
    st.button(width="stretch", label=text["restart_button"], key="restart", on_click=restart)
    ui.html(f'<p class="small-note">{text["disclaimer"]}</p>')


def main() -> None:
    data = load_data()
    text = data.settings["text"]
    st.set_page_config(page_title=data.settings["app_title"], page_icon="🌿", layout="centered",
                       initial_sidebar_state="collapsed")
    style.apply()
    init_state()
    screens = {"start": screen_start, "survey": screen_survey, "wish": screen_wish, "result": screen_result}
    screens[st.session_state.screen](data, text)


main()
