"""지원 탐색 앱. 화면 흐름만 담당한다: 시작 → 설문(기본정보, 척도 24문항, 걸림돌) → 조금 더 맞춰 보기 → 결과
→ (핀을 누르면) 센터 정보.

실행: 프로젝트 루트에서  streamlit run app/main.py
내용(문항, 유형, 프로그램, 문구)은 app/data의 파일에서 읽는다. 판단은 app/core가 한다.
유형은 척도 문항 점수로 정하고(core/scoring.py), 기본 결과는 AI 없이 정보표에서 걸러서 만든다.
대표 유형은 하나만 크게 보여주되, 다른 유형도 본인이 눌러서 열어 볼 수 있다.
'맞춰 보기' 화면에서 원하는 점을 직접 적은 사람에게만, AI가 정보표 후보 안에서 고른 곳을 지도 맨 앞에 놓는다.
"""
from __future__ import annotations

import os
import sys
import time
import uuid
from html import escape
from pathlib import Path
from types import SimpleNamespace

import streamlit as st

# 'streamlit run app/main.py'로 실행해도 app 패키지를 찾을 수 있게 프로젝트 루트를 경로에 넣는다
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core import candidates, clock, llm_matcher, loader, logger, scoring, venues  # noqa: E402
from app.core import selection as sel  # noqa: E402
from app.ui import components as ui  # noqa: E402
from app.ui import result_image, style  # noqa: E402


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
        "draft": {},          # '다음'을 누르기 전까지 고른 것(아직 답이 아니다), '이전으로' 돌아왔을 때 앞서 한 답
        "details": {},        # {유형 id: 세부 질문의 답}
        "view_type": None,    # 둘러보기에서 본인이 누른 유형. 유형 소개 화면(screen_view)과 거기서 연 센터 정보가 쓴다
        "logged": None,       # 기록한 응답의 모양. 한 번 진행에 responses.csv 한 행만 남기려고 둔다
        "ai": None,           # AI 추가 추천 결과(llm_matcher.AiResult). 맞춰 보기에서 '결과 보기'를 누를 때만 바뀐다
        "ai_pending": False,  # AI에게 물어야 하는지. 결과 화면이 지도 자리에서 한 번 부르고 끈다
        "ai_wish": None,      # AI에게 보낼(보낸) 글. 화면에만 두고 기록하지 않는다
        "tuned": False,       # '조금 더 맞춰 보기' 화면을 지나왔는지. 한 번만 거친다
        "save_open": False,   # '내 결과 저장하기'를 눌러 사진을 펼쳤는지
        "more_open": False,   # 결과 화면의 '더 보기'를 펼쳤는지
        "place": None,        # 센터 정보 화면에서 보여 줄 곳의 id. 그릴 때마다 지금 후보에 있는지 다시 확인한다
        "place_from": None,   # 그 곳을 어느 화면에서 열었는지(result, more_places, view). '뒤로 돌아가기'가 그곳으로 간다
        "worry": None,        # 센터 정보 화면에서 눌러 펼친 걱정의 id. 다른 곳을 열면 지운다
        "seen_places": [],    # 센터 정보를 열어 본 곳의 id. 지도에서 물빛으로 보여 준다
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)


HOME_SCREENS = ("tune", "result", "place", "more_places", "browse", "view")   # 맨 위 띠의 앱 이름을 눌러 처음으로 갈 수 있는 화면(설문 중에는 안 된다)
MAP_PINS = 3                              # 첫걸음 지도에 핀으로 놓는 곳의 수. 더 있으면 '다른 곳 n곳' 핀 하나로 묶는다


def restart() -> None:
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.session_state.to_top = True                            # 처음 화면도 맨 위부터 보이게 한다


def go(screen: str) -> None:
    st.session_state.screen = screen
    st.session_state.to_top = True


def ask_restart() -> None:
    """'처음으로'·'처음부터 다시 하기'를 눌렀을 때. 지울 답이 있으면 되묻는 창을 띄우고, 없으면 바로 처음으로 간다.

    질문 없이 둘러보는 화면에는 지울 답이 없으므로 되묻지 않는다.
    """
    state = st.session_state
    if state.answers:
        state.confirm_restart = True          # main()이 이 표시를 보고 되묻는 창을 그린다
    else:
        restart()


def restart_dialog(text) -> None:
    """되묻는 창(st.dialog). '계속 보기'면 그대로 두고, '처음으로 가기'를 눌러야만 답을 지운다.

    창을 띄울지는 confirm_restart 표시로 정한다. 단추는 on_click으로 처리한다. 창 안의 단추를 누르면 Streamlit이
    창만 다시 그리므로, 표시가 꺼져 있으면 앱 전체를 다시 그려(st.rerun) 창을 닫는다. X로 닫아도 표시를 끈다.
    """
    state = st.session_state

    def keep() -> None:
        state.confirm_restart = False

    @st.dialog(text["restart_ask_title"], on_dismiss=keep)
    def box() -> None:
        if not state.get("confirm_restart"):
            st.rerun()
        ui.body(text["restart_ask_body"])
        st.button(width="stretch", label=text["restart_keep"], key="restart_keep", type="primary", on_click=keep)
        st.button(width="stretch", label=text["restart_go"], key="restart_go", on_click=restart)

    box()


SCROLL_TOP = """<script>
// 올리기 표시 {count}. 이 값이 달라야 Streamlit이 새 요소로 보고 스크립트를 다시 돌린다
function up() {{
  const d = window.parent.document;
  d.querySelectorAll('section, [data-testid="stMain"], [data-testid="stAppViewContainer"]').forEach(e => e.scrollTo(0, 0));
  window.parent.scrollTo(0, 0);
}}
// 새 화면이 다 그려진 뒤에도 한 번 더 올린다(긴 화면은 늦게 그려진다)
up(); setTimeout(up, 100); setTimeout(up, 300);
</script>"""


def scroll_to_top() -> None:
    """화면이 바뀌면 맨 위부터 보이게 한다. Streamlit은 화면이 바뀌어도 스크롤 위치를 그대로 둔다.

    설문 끝 → 결과처럼 연달아 두 번 다시 그릴 때, 내용이 똑같은 iframe은 다시 실행되지 않는다.
    그래서 올릴 때마다 다른 값(지금 시각)을 넣는다.
    """
    if st.session_state.pop("to_top", False):
        st.iframe(SCROLL_TOP.format(count=time.time_ns()), height=1)


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
    go("survey")


def check_label(label: str, selected: bool) -> str:
    return f"✓ {label}" if selected else label


# ── 시작 화면 ──

def screen_start(data, text) -> None:
    """그림 → 제목과 한 줄 소개 → 시작 단추 → 둘러보기 단추 → 맨 아래 작은 글씨의 유의사항(11/25).

    맨 위 띠는 main()이 그린다. 배치는 ui/home.css가 정한다.
    기록을 켰을 때(save_log)만은 저장한다는 사실을 작은 글씨로 내리지 않고 시작 단추 위에 상자로 알린다.
    """
    ui_dir = Path(__file__).resolve().parent / "ui"
    st.html(ui_dir / "home.css")
    saving = bool(data.settings.get("save_log", False))      # 기록을 켰을 때만 '저장해요'라고 말한다
    with st.container(key="landing"):
        with st.container(key="landing_panel"):
            ui.home_art()
            with st.container(key="home_copy"):
                st.html(f'<h1 class="landing-title">{escape(text["start_heading"])}</h1>'
                        f'<p class="landing-intro">{escape(text["start_intro"])}</p>')
            with st.container(key="home_actions"):
                if saving:
                    ui.notice(text["start_privacy_saving"], "info")
                st.button(width="stretch", label=text["start_button"], key="start", type="primary",
                          on_click=go, args=("survey",))
                # 설문 없이 어떤 곳이 있는지 먼저 볼 수 있는 길(11/22 결정). 주된 길은 위의 시작 단추다
                st.button(width="stretch", label=text["start_browse_button"], key="start_browse",
                          on_click=go, args=("browse",))
    # 유의사항: 저장·전송 안내, 답이 지워지는 경우, 면책 문구. 저장 안내를 위에서 이미 했으면 되풀이하지 않는다
    notes = [text["start_refresh"], text["disclaimer"]]
    if not saving:
        notes = [text["start_privacy"], text["start_ai_note"]] + notes
    ui.fine_print(text["start_notes_title"], notes)


# ── 질문 화면 ──

def screen_survey(data, text) -> None:
    state = st.session_state
    survey = sel.survey_questions(data.questions)
    # 결과 화면에서 '선택한 답 수정하기'로 왔으면(edit_q) 그 문항 하나만 다시 묻고 결과로 돌아간다
    editing = state.get("edit_q")
    question = next((q for q in survey if q["id"] == editing), None)
    if question is None:
        state.pop("edit_q", None)                 # 고칠 문항이 없으면(문항 파일이 바뀜) 평소대로 다음 문항을 묻는다
        editing = None
        question = sel.next_question(state.answers, data.questions)
    if question is None:
        go("result")
        st.rerun()

    qid = question["id"]
    kind = question["selection"]
    # 진행 표시는 기본정보부터 걸림돌까지 한 줄로 센다('질문 n / 28'). 글자와 막대가 같은 기준이다
    position = survey.index(question) + 1
    if editing:
        # 답 하나만 고치는 중: '질문 5 / 28'을 보여주면 뒤의 문항을 다시 해야 하는 것으로 읽힌다
        ui.notice(text["edit_notice"], "info")
    else:
        # 딱 절반째 문항과 마지막 세 문항에서는 진행 글자 옆에 짧은 응원을 붙인다
        cheer = text["cheer_half"] if position * 2 == len(survey) else text["cheer_last"] if position > len(survey) - 3 else ""
        ui.progress(text["progress_scale"].format(number=position, total=len(survey)), position / len(survey), cheer)

    def answer(value) -> None:
        state.answers[qid] = value
        state.draft.pop(qid, None)
        state.to_top = True
        if editing:
            # 답이 바뀌었으니 결과는 답에서 다시 판정한다. 예전 답으로 AI가 찾아 준 것은 지운다
            state.pop("edit_q", None)
            state.ai = None
            state.ai_pending = False
            go("result")

    # 질문과 선택지는 흰 카드(q_card) 안에, '다음'과 이전 단추는 카드 밖에 둔다. 모든 문항은 답해야 넘어간다.
    # 고른 선택지에는 글 앞에 ✓를 붙이지 않는다. 물빛 바탕과 굵은 테두리로 보여 준다(type="primary" + style.py)
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
                st.button(width="stretch", label=option["label"],
                          key=f"opt_{qid}_{option['id']}", type="primary" if selected else "secondary",
                          on_click=pick, args=(option["id"],))
        # 하나라도 골라야 '다음'이 켜진다. 걸리는 게 없는 사람은 '특별히 없어요'를 고른다
        st.button(width="stretch", label=text["next_button"], key=f"next_{qid}", disabled=not chosen,
                  type="primary" if chosen else "secondary", on_click=answer, args=(list(chosen),))
    elif kind == "number":
        # 폼으로 묶어야, 숫자를 적고 바로 '다음'을 눌러도 적은 값이 함께 넘어온다
        with card, st.form(key=f"form_{qid}", border=False):
            # 칸의 아래쪽 범위는 0으로 열어 둔다. 범위 밖 숫자를 Streamlit이 말없이 가장 가까운 값으로 바꾸지 않게,
            # 범위는 아래에서 직접 보고 안내한다
            st.number_input(question["text"], min_value=0, max_value=question["max"],
                            value=state.draft.get(qid), step=1, key=f"num_{qid}", label_visibility="collapsed",
                            placeholder=text["number_placeholder"])
            if st.form_submit_button(text["number_next"], type="primary", width="stretch", key=f"next_{qid}"):
                number = sel.full_number(question, state.get(f"num_{qid}"))
                if number is None:                       # 비웠거나 범위 밖이면 넘어가지 않고 다시 적어 달라고 한다
                    ui.notice(text["number_required"])
                else:
                    answer(number)
                    st.rerun()
    else:
        # 하나만 고르는 문항과 척도 문항: 누르면 고른 표시만 하고, 아래 '다음'을 눌러야 답이 되어 넘어간다(11/25).
        # 잘못 눌러도 바로 넘어가지 않아 고쳐 고를 수 있다
        if kind == sel.SCALE:
            options = [{"id": opt["value"], "label": opt["label"]} for opt in data.scale]
        else:
            options = sel.options_of(question, data.types)
        chosen = state.draft.get(qid)                   # 방금 고른 것, 또는 '이전으로' 돌아왔을 때 앞서 낸 답
        picked = chosen in [option["id"] for option in options]

        def pick_one(option_id) -> None:
            state.draft[qid] = option_id

        with card:
            for option in options:
                selected = picked and option["id"] == chosen
                st.button(width="stretch", label=option["label"], icon=option.get("icon"),
                          key=f"opt_{qid}_{option['id']}", type="primary" if selected else "secondary",
                          on_click=pick_one, args=(option["id"],))
        st.button(width="stretch", label=text["next_button"], key=f"next_{qid}", disabled=not picked,
                  type="primary" if picked else "secondary", on_click=answer, args=(chosen,))

    if editing:
        def cancel_edit() -> None:
            state.pop("edit_q", None)
            state.draft.pop(qid, None)
            go("result")
        st.button(width="stretch", label=text["edit_cancel"], key="edit_cancel", type="tertiary", on_click=cancel_edit)
        ui.back_guard("edit_cancel")
    else:
        st.button(width="stretch", label=text["back_button"], key="back_survey", type="tertiary",
                  on_click=back_one, args=(data.questions,))
        ui.back_guard("back_survey")                          # 휴대폰 '뒤로 가기'를 눌러도 앞 문항으로 간다


# ── 결과 화면 ──

def priority_question(data, text, type_ids: list[str], today) -> None:
    """점수가 가장 높은 유형이 여럿일 때, 무엇부터 볼지 본인이 고른다.

    자동으로 하나를 정하지 않는다. 하나를 골라야 결과로 넘어간다(11/25: '아직 고르지 않을게요'를 없앴다).
    고르기 쉽게, 선택지 아래에 그 유형에서 지금 안내할 수 있는 곳 하나를 예로 보여준다.
    """
    state = st.session_state
    question = sel.question(data.questions, sel.PRIORITY_Q)
    lead = text["tie_two"] if len(type_ids) == 2 else text["tie_many"]

    def choose(option_id: str) -> None:
        state.answers[sel.PRIORITY_Q] = option_id
        state.to_top = True
        logger.log_event(state.sid, "priority", option_id)

    ui.body(lead)
    ui.heading(question["text"])
    # 예로 드는 곳도 candidates가 걸러 준 후보에서만 고른다
    previews = candidates.build_result(data.programs, data.types, type_ids, state.details, today, state.answers)
    examples = {r.type_id: (r.contacts or r.lists)[0] for r in previews if r.contacts or r.lists}
    for option in sel.options_of(question, data.types, type_ids):
        st.button(width="stretch", label=option["label"], key=f"priority_{option['id']}",
                  on_click=choose, args=(option["id"],))
        example = examples.get(option["id"])
        if example:
            line = text["priority_example"].format(org=example["기관명"], program=example["프로그램명"])
            ui.html(f'<p class="small-note example-note">{escape(line)}</p>')


def detail_question(text, type_info: dict, detail: dict, plain: bool = False) -> None:
    """유형의 세부 질문(선택). 답은 후보의 순서와 '이렇게 물어보세요' 문장에 쓰인다.

    plain: 대표 유형의 세부 질문('조금 더 맞춰 보기' 화면, 돌봄형의 결과 화면)은 접지 않고 상자 없이 그린다.
           고른 선택지는 설문처럼 글 앞의 ✓ 없이 물빛 바탕과 테두리로 보여 준다.
    """
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
        # 마음·건강처럼 민감한 질문(log_answer: false)은 답했다는 사실만 남기고, 고른 선택지는 남기지 않는다
        logger.log_event(state.sid, "detail", tid, option_id if detail.get("log_answer", True) else "")

    # 후보를 바꾸는 질문(보탬활동형의 보수)과 먼저 확인해야 하는 질문(돌봄 대상)은 접지 않고 그대로 보여준다
    prominent = bool(detail.get("last") or detail.get("prominent"))
    if plain:
        box = st.container()
    elif prominent:
        box = st.container(border=True)
    else:
        box = st.expander(text["detail_label"], expanded=bool(chosen), key=f"detail_box_{tid}")
    with box:
        ui.html(f'<p class="sec">{escape(detail["text"])}</p>' if plain
                else f'<p class="q-help"><b>{escape(detail["text"])}</b></p>')
        for option in detail["options"]:
            selected = option["id"] in chosen
            label = option["label"] if plain else check_label(option["label"], selected)
            st.button(width="stretch", label=label, key=f"detail_{tid}_{option['id']}",
                      type="primary" if selected else "secondary", on_click=pick, args=(option["id"],))


def no_place(result: candidates.TypeResult) -> bool:
    """이 유형에 안내할 곳이 하나도 없는가. (먼저 골라야 해서 아직 안 보여 주는 경우는 아니다)"""
    return not result.needs_choice and not result.contacts and not result.lists


def consult_section(data, text, consults: list[dict], guides, folded: bool = False) -> None:
    """무엇이 맞을지 함께 찾아 주는 곳(일반 창구).

    folded: 대표 유형에 맞는 곳을 이미 받은 사람에게는 접어 둔다. 대표 유형이 없는 사람에게는 이 창구가
    결과의 중심이므로 펼쳐서 보여준다(11/22 결정).
    """
    if folded:
        box = st.expander(text["consult_heading"], key="consult_box")
    else:
        ui.heading(text["consult_heading"])
        box = st.container()
    with box:
        for program in consults:
            ui.program_card(program, text, None, guides, None, key=f"consult_{program['id']}")


def wish_examples(data, type_ids: list[str]) -> list[str]:
    """AI에게 함께 알려 줄, 사용자가 고른 항목: 세부 질문의 답과 마음에 걸린다고 한 점.

    마음·건강처럼 답을 남기지 않기로 한 세부 질문(log_answer: false)의 선택은 AI로도 보내지 않는다.
    AI 후보는 세부 주제로 좁히지 않으므로, 이 선택을 빼도 같은 유형 안에서 찾아 준다.
    """
    state = st.session_state
    chosen = [opt["label"] for tid in type_ids
              if (sel.detail_of(data.types[tid]) or {}).get("log_answer", True)
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
                                 wish, pool, int(data.settings.get("ai_top_n", 3)), caller)


def judge(data) -> scoring.Score:
    """지금 답으로 유형을 판정한다. 점수는 화면에 보여주지 않는다. 본인이 고른 것(Q_PRIORITY)은 지금 후보에 있을 때만 쓰인다."""
    state = st.session_state
    return scoring.score(state.answers, sel.type_questions(data.questions, data.types),
                         data.settings["scoring"]["high"], state.answers.get(sel.PRIORITY_Q))


def result_context(data, today, view: str | None = None) -> SimpleNamespace:
    """결과·센터 정보·다른 곳 목록 화면이 함께 쓰는 것. 저장해 두지 않고 화면을 그릴 때마다 답과 정보표에서 다시 만든다.

    view(유형 id)를 주면 설문 없이 그 유형을 본다(둘러보기). 채점하지 않고, 기본정보 답이 없으니 대상 조건으로
    거르지 않으며, AI 후보와 걸림돌 안내도 없다. 운영 중·종료일·유형 거르기는 똑같이 candidates가 한다.

    거르기는 모두 candidates가 한다(운영 중, 종료일·종료시각, 기본정보, 유형). 여기서는 걸러진 것의 순서만 정한다.
    places: 지도와 '다른 곳' 목록에 놓을 곳 전체. 대표 유형의 문의할 곳 → 목록 순서이고, 둘 다 없으면 일반 창구다.
            AI가 고른 곳은 맨 앞으로 옮긴다. AI가 준 id는 지금의 AI 후보(pool)에 있을 때만 쓴다.
    reasons: {AI가 고른 곳의 id: 추천 이유}. 센터 정보 화면은 places에 있는 곳만 그린다.
    """
    state = st.session_state
    if view:
        judged, primary, profile, guides, ai = None, view, None, [], None
    else:
        judged = judge(data)
        primary, profile, ai = judged.primary, state.answers, state.ai
        guides = sel.barrier_guides(state.answers, data.questions)
    # 결과 화면은 대표 유형만 다룬다(11/26: 다른 유형을 여는 길을 뺐다). 동점이라 아직 고르기 전이면 대표가 없다
    shown_types = [primary] if primary else []
    results = candidates.build_result(data.programs, data.types, shown_types, state.details, today, profile)
    by_type = {r.type_id: r for r in results}
    consults = candidates.first_consult(data.programs, today, profile)
    pool, places, reasons = [], [], {}
    if primary:
        if not view:
            pool = candidates.ai_pool(data.programs, data.types, shown_types, state.details, today, profile)
        result = by_type[primary]
        base = result.contacts + result.lists
        if not base and not result.needs_choice:                   # 먼저 골라야 하는 유형(돌봄)은 고르기 전에 창구로 대신하지 않는다
            base = consults
        by_id = {p["id"]: p for p in pool}
        for match in (ai.matches if ai is not None else []):
            if match["id"] in by_id:
                reasons.setdefault(match["id"], match["reason"])
        places = [by_id[pid] for pid in reasons] + [p for p in base if p["id"] not in reasons]
    return SimpleNamespace(judged=judged, primary=primary, shown_types=shown_types, by_type=by_type,
                           consults=consults, guides=guides,
                           pool=pool, places=places, reasons=reasons)


# ── 조금 더 맞춰 보기 (설문 끝과 결과 사이, 전부 선택 사항) ──

def screen_tune(data, text) -> None:
    """대표 유형의 세부 질문과 직접 적기. 둘 다 안 해도 되고, 맨 위에서 바로 건너뛸 수 있다. 한 번만 거친다.

    유형 이름은 여기서 보여 주지 않는다(결과 화면에서 처음 본다).
    글 상자와 '결과 보기'는 한 폼(free_form)이다. 묶지 않으면 휴대폰(한글 자판)에서 단추 누름이 먼저 오고
    마지막 글자가 뒤늦게 와서, 적은 글의 끝이 빠진 채 넘어간다. 글 상자는 잠그지 않는다(폼 안에서 잠그면 글이 지워진다).
    '결과 보기'는 AI를 바로 부르지 않고 '물어야 함'(ai_pending)만 켠다. 실제 호출은 결과 화면이 한 번 한다.
    적은 글은 기록하지 않는다. AI에는 privacy.scrub을 거친 글만 간다(llm_matcher.build_prompt).
    """
    state = st.session_state
    if sel.next_question(state.answers, data.questions) is not None:
        go("survey")
        st.rerun()
    context = result_context(data, clock.now())
    if not context.primary:                                   # 동점이면 결과 화면에서 먼저 고른다
        go("result")
        st.rerun()
    type_info = data.types[context.primary]
    question = sel.question(data.questions, sel.FREE_Q)

    def leave(wish: str) -> None:
        state.tuned = True
        state.ai = None
        state.ai_pending = False
        state.ai_wish = wish or None
        if wish:
            if llm_matcher.has_wish(wish, data.settings.get("free_empty_words") or []):
                state.ai_pending = True
            else:
                # "ㅇ", "없어"처럼 원하는 점이 없는 글: AI를 부르지 않고, 결과 화면에서 조금 더 적어 달라고 한다
                state.ai = llm_matcher.AiResult(llm_matcher.UNCLEAR)
                logger.log_event(state.sid, "ai", state.ai.status, "")
        go("result")

    def done() -> None:
        leave((state.get("free_text") or "").strip())

    def skip() -> None:
        leave("")                                             # 건너뛰기: 적던 글은 버린다

    ui.html(f'<p class="tune-badge">{escape(text["tune_badge"])}</p>')
    ui.heading(text["tune_heading"])
    ui.notice(text["tune_help"], "info")
    st.button(width="stretch", label=text["tune_skip"], key="tune_skip", type="tertiary", on_click=skip)

    detail = sel.detail_of(type_info)
    if detail and not no_place(context.by_type[context.primary]):     # 안내할 곳이 없는 유형에는 세부 질문을 묻지 않는다
        detail_question(text, type_info, detail, plain=True)

    ui.html(f'<p class="sec">{escape(question["text"])}</p>')
    if question.get("help"):
        ui.html(f'<p class="q-help">{escape(question["help"])}</p>')
    with st.form(key="free_form", border=False):
        st.text_area(question["text"], value=state.get("ai_wish") or "", key="free_text",
                     max_chars=int(question.get("max_characters", 500)), label_visibility="collapsed",
                     placeholder=text["free_placeholder"])    # 적기 전에만 보이는 회색 글. 누르면 사라진다(style.py)
        # AI로 무엇을 보내는지는 작은 글이지만 단추 바로 위에 둔다. 누르기 전에 읽을 수 있어야 한다
        ui.html(f'<p class="fine tight">{escape(text["free_privacy"])}</p>')
        st.form_submit_button(text["tune_done"], key="tune_done", type="primary", width="stretch", on_click=done)


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


def answer_label(data, question: dict, value) -> str:
    """설문 답을 화면에 보여줄 글로 바꾼다. 예) 4 → '그래요', ['alone'] → '혼자 가기 망설여져요'."""
    if question["selection"] == sel.SCALE:
        options = [{"id": opt["value"], "label": opt["label"]} for opt in data.scale]
    else:
        options = question.get("options") or []
    values = value if isinstance(value, list) else [value]
    labels = [str(opt["label"]) for opt in options if opt["id"] in values]
    return ", ".join(labels) or str(value)


def edit_answers(data, text) -> None:
    """설문 답변 확인·수정. 문항 하나를 골라 그 답만 고친다. 처음부터 다시 하지 않아도 된다."""
    state = st.session_state
    survey = sel.survey_questions(data.questions)
    lines = {
        q["id"]: text["edit_option"].format(number=number, question=q["text"],
                                            answer=answer_label(data, q, state.answers.get(q["id"])))
        for number, q in enumerate(survey, 1)
    }

    def edit(qid: str) -> None:
        value = state.answers.get(qid)
        state.draft[qid] = list(value) if isinstance(value, list) else value    # 지금 답을 표시해 준다
        state.edit_q = qid
        go("survey")

    # 고르는 상자(selectbox)는 휴대폰에서 글자가 작고 긴 줄이 잘려서, 문항마다 단추 하나로 둔다
    with st.expander(text["edit_heading"], key="edit_box"):
        ui.html(f'<p class="q-help">{escape(text["edit_select"])}</p>')
        for qid, line in lines.items():
            st.button(width="stretch", label=line, key=f"edit_{qid}", on_click=edit, args=(qid,))


def card_places(text, result: candidates.TypeResult, consults: list[dict]) -> tuple[str, list[dict]]:
    """결과 사진에 이름을 넣을 곳과 그 소제목. 대표 유형의 문의할 곳 → 둘러볼 목록 → 일반 창구 순서로 처음 있는 것.

    새로 거르지 않는다. candidates가 이미 거른 후보의 앞에서부터 고른다.
    """
    if result.contacts:
        return text["card_places_heading"], result.contacts[:result_image.MAX_PLACES]
    if result.lists:
        return text["lists_heading"], result.lists[:result_image.MAX_PLACES]
    return text["consult_heading"], consults[:result_image.MAX_PLACES]


@st.cache_data(show_spinner=False, max_entries=64)
def draw_card(title: str, team: str, footer: str, heading: str, places: tuple, type_name: str, statement: str,
              feature: str, area: str, character: str) -> bytes:
    """결과 사진을 그린다. 같은 내용이면 다시 그리지 않는다(화면을 누를 때마다 그리면 느리다).

    받는 것은 사진에 찍히는 글자와 그림 경로뿐이다. 설문 답은 여기로 오지 않는다.
    """
    return result_image.render(title, team, footer, heading, list(places), type_name, statement, feature, area,
                               Path(character) if character else None)


def save_result(data, text, result: candidates.TypeResult, consults: list[dict], gender: str | None, today) -> None:
    """'내 결과 저장하기'를 눌렀을 때: 유형·특징과 곳 이름만 담은 사진을 보여 주고 저장·보내기 단추를 둔다.

    result는 대표 유형의 결과다. 사진은 그 자리에서 만들어 보여 줄 뿐이고 앱에 남기지 않는다.
    사진에 넘기는 것은 글자와 그림 경로뿐이다. 답(answers)이나 프로그램 행을 통째로 넘기지 않는다.
    """
    heading, places = card_places(text, result, consults)
    names = tuple((p["프로그램명"], p["기관명"]) for p in places)
    footer = text["card_footer"].format(date=f"{today.month}월 {today.day}일")
    title = text.get("top_title") or data.settings["app_title"]
    type_info = data.types[result.type_id]
    character = ui.character_image(result.type_id, gender)
    image = draw_card(title, text["team_name"], footer, heading, names, type_info["name"], type_info["statement"],
                      type_info["feature"], type_info.get("area", ""), str(character or ""))
    ui.save_box(text, data.settings["app_title"], image, text["save_help"])


def flip(key: str) -> None:
    """펼침 표시(save_open, more_open)를 뒤집는다."""
    st.session_state[key] = not st.session_state.get(key)


def open_place(program_id: str) -> None:
    """지도의 핀이나 목록의 줄을 눌렀을 때: 그 곳의 안내 화면으로 간다. 어느 곳을 열었는지만 기록한다."""
    state = st.session_state
    state.place, state.place_from, state.worry = program_id, state.screen, None
    if program_id not in state.seen_places:
        state.seen_places = state.seen_places + [program_id]
    logger.log_event(state.sid, "place", program_id)
    go("place")


def worry_area(data, text, program: dict, type_info: dict | None) -> None:
    """'무엇이 걱정되세요?' 단추들(11/26: 설문의 걸림돌 문항을 대신한다). 누르면 그 아래에 이 기관의 해당 내용이 나온다.

    한 번에 하나만 펼치고, 다시 누르면 접는다. 무엇을 눌렀는지만 기록한다(worry 사건: 기관 id, 걱정 id).
    정보표에 확인된 내용이 없으면 지어내지 않고 그 사실을 알린다. 단추의 글과 칸은 settings.yaml의 worries다.
    """
    state = st.session_state
    worries = data.settings.get("worries") or []
    if not worries:
        return

    def pick(worry_id: str) -> None:
        if state.get("worry") == worry_id:
            state.worry = None
            return
        state.worry = worry_id
        logger.log_event(state.sid, "worry", program["id"], worry_id)

    ui.html(f'<p class="sec">{escape(text["worry_ask"])}</p>')
    chosen = next((worry for worry in worries if worry["id"] == state.get("worry")), None)
    with st.container(key="worry_row"):
        for worry in worries:
            st.button(worry["label"], key=f"worry_{worry['id']}", type="primary" if worry is chosen else "secondary",
                      on_click=pick, args=(worry["id"],))
    if chosen:
        ui.worry_answer(chosen["label"], ui.worry_lines(program, chosen, text, type_info), text["worry_unknown"])


def place_area(data, text, context: SimpleNamespace) -> None:
    """첫걸음 지도 구역. 글을 적고 온 사람은 여기서 AI에게 한 번 묻는다(찾는 동안의 표시도 이 자리에 나온다).

    AI가 실패하거나 못 찾아도 지도는 그대로 그린다. 그 사실만 지도 위에 한 줄로 알린다.
    """
    state = st.session_state
    result = context.by_type[context.primary]
    type_info = data.types[context.primary]
    if state.ai_pending:
        # 한 번만 부르고, 끝나면 화면을 다시 그려 고른 곳을 지도 맨 앞에 놓는다. 후보는 candidates.ai_pool이 걸러 준 것뿐이다
        with st.spinner(text["free_wait"]):
            state.ai = ask_ai(data, context.shown_types, context.pool, state.get("ai_wish") or "")
        state.ai_pending = False
        logger.log_event(state.sid, "ai", state.ai.status, "|".join(m["id"] for m in state.ai.matches))
        if state.ai.status == "fail":
            logger.log_error(f"AI 추가 추천 실패 {state.ai.error}")
        st.rerun()

    answer = state.ai
    if answer is not None:
        if answer.status == llm_matcher.UNCLEAR:
            ui.notice(text["free_unclear"])
        elif answer.status == "fail":
            ui.notice(text["ai_fail"], "fail")
            if data.settings.get("show_error_kind"):
                ui.html(f'<p class="small-note">(점검용) {escape(answer.error)}</p>')
        elif not context.reasons:
            ui.notice(text["ai_none"], "info")
        elif answer.unmatched:
            ui.notice(text["ai_unmatched"].format(items=", ".join(answer.unmatched)))

    if result.needs_choice:
        # 먼저 골라야 하는 세부 질문(돌봄: 누구의 돌봄인지). 이 경우만 결과 화면에 질문이 남는다. 고르면 그 자리에 지도가 나온다
        detail_question(text, type_info, sel.detail_of(type_info), plain=True)
        ui.notice(text["detail_first"], "info")
        return
    if not context.places:
        ui.notice(text["no_program_at_all"], "fail")
        ui.fallback_card(data.settings["fallback_card"], text)
        return
    if no_place(result):
        ui.notice(text["no_program"])                              # 이 유형의 곳은 없어 일반 창구를 지도에 놓았다
    if result.widened:
        ui.notice(text["widened_note"], "info")
    rest = len(context.places) - MAP_PINS
    # 제목 바로 아래의 작은 글: 누르면 자세히 볼 수 있다는 것. 지도 아래에 두면 휴대폰에서 지도에 밀려 먼저 보이지 않는다.
    # 별의 뜻은 별이 붙은 곳이 있을 때만 지도 안 왼쪽 위에 적는다(11/26)
    ui.map_notes(text["map_hint"])
    ui.place_map(context.places[:MAP_PINS], set(context.reasons), set(state.seen_places), open_place,
                 text["pin_more"].format(count=rest) if rest > 0 else "", go_more_places,
                 star_note=text["map_star_note"] if context.reasons else "")


def go_more_places() -> None:
    logger.log_event(st.session_state.sid, "more_places")
    go("more_places")


def more_area(data, text, context: SimpleNamespace, today) -> None:
    """'더 보기'를 펼쳤을 때. 순서(11/26): 답변 확인·수정 → 바라는 점 다시 적기 → 함께 찾아 주는 곳 → 먼저 볼 분야 다시 고르기.

    다른 유형을 늘어놓지 않는다(11/26에 '함께 볼 유형'과 '다른 분야도 보기'를 뺐다. 다른 유형은 시작 화면의
    '질문 없이 먼저 둘러보기'에서 본다). '먼저 볼 분야 다시 고르기'는 가장 높은 점수의 유형이 여럿이어서 본인이
    골랐을 때만 나오고, 누르면 그 동점 유형들 가운데서 다시 고른다.
    네 항목은 같은 모양의 줄이다(style.py의 .st-key-more_rows). 지도에 이미 놓인 창구는 되풀이하지 않는다.
    """
    state = st.session_state
    on_map = {p["id"] for p in context.places}
    with st.container(key="more_rows"):
        edit_answers(data, text)
        st.button(width="stretch", label=text["tune_again"], key="tune_again", on_click=go, args=("tune",))
        rest = [p for p in context.consults if p["id"] not in on_map]
        if rest:
            consult_section(data, text, rest, context.guides, folded=True)
        if sel.PRIORITY_Q in state.answers:
            st.button(width="stretch", label=text["repick_button"], key="repick", on_click=repick)


def repick() -> None:
    """동점에서 고른 '먼저 볼 분야'를 다시 고른다. 예전 유형으로 AI가 찾아 준 것은 지운다."""
    state = st.session_state
    state.answers.pop(sel.PRIORITY_Q, None)
    state.ai = None
    state.ai_pending = False
    state.to_top = True


def browse_gender(data, type_id: str) -> str:
    """둘러보기에서 쓸 캐릭터 그림의 성별. 성별 답이 없으므로 유형 순서대로 여성·남성을 번갈아 쓴다."""
    return "female" if list(data.types).index(type_id) % 2 == 0 else "male"


def leave_browse(screen: str) -> None:
    """둘러보기(목록, 유형 소개)를 떠난다. 여기서 본 유형과 고른 주제가 나중의 설문 결과 화면에 섞이지 않게 지운다."""
    state = st.session_state
    state.view_type, state.details, state.place, state.seen_places = None, {}, None, []
    go(screen)


def open_type(type_id: str) -> None:
    """둘러보기 목록의 칸을 눌렀을 때: 그 유형의 소개 화면으로 간다. 어느 유형을 열었는지만 기록한다."""
    state = st.session_state
    state.view_type, state.details, state.place = type_id, {}, None
    logger.log_event(state.sid, "browse", type_id)
    go("view")


def screen_browse(data, text) -> None:
    """설문 없이 둘러보기: 12개 유형을 3개씩 4줄의 칸(그림 + 유형 이름)으로 한눈에 보여 준다(11/26).

    칸을 누르면 그 유형의 소개 화면(screen_view)으로 간다. 유형을 판정하지 않으므로 응답 기록(responses.csv)을
    남기지 않고, 직접 적기(AI)도 두지 않는다. 그림은 칸 단추의 바탕으로 깐다(ui.type_grid_art).
    """
    ui.heading(text["browse_heading"])
    ui.html(f'<p class="q-help">{escape(text["browse_help"])}</p>')
    ui.type_grid_art({tid: ui.character_image(tid, browse_gender(data, tid)) for tid in data.types})
    with st.container(key="type_grid"):
        for tid, type_info in data.types.items():
            # 칸의 바탕색은 분야에 따라 다르다(style.py가 상자 이름의 분야 id를 본다)
            with st.container(key=f"tile_{type_info.get('area', '')}_{tid}"):
                st.button(width="stretch", label=type_info["name"], key=f"browse_type_{tid}",
                          on_click=open_type, args=(tid,))
    st.button(width="stretch", label=text["browse_to_survey"], key="browse_to_survey", type="primary",
              on_click=leave_browse, args=("survey",))
    st.button(width="stretch", label=text["browse_to_start"], key="browse_to_start", type="tertiary",
              on_click=leave_browse, args=("start",))
    ui.back_guard("browse_to_start")                          # 휴대폰 '뒤로 가기'를 눌러도 시작 화면으로 간다


def screen_view(data, text) -> None:
    """유형 소개 화면: 둘러보기에서 고른 유형의 기본 결과 화면. 유형 카드 → 이 유형의 특징 → 지도 → 돌아가기.

    설문 답이 없으므로 맞춰 보기, AI, 저장·공유, 더 보기, 답변 수정, 응답 기록이 없다.
    기본정보 답이 없으니 성별·나이로 거르지 않는다(대상 조건은 센터 정보의 '대상' 칸에 글로 나온다).
    """
    state = st.session_state
    type_id = state.get("view_type")
    if type_id not in data.types:
        go("browse")
        st.rerun()
    context = result_context(data, clock.now(), type_id)
    type_info = data.types[type_id]
    ui.type_header(text["type_label_browse"], type_info, ui.character_image(type_id, browse_gender(data, type_id)),
                   text["type_image_alt"].format(name=type_info["name"]))
    with st.expander(text["feature_heading"], key="feature_box"):
        ui.feature_text(type_info["feature"])

    ui.heading(text["map_heading"])
    place_area(data, text, context)

    st.button(width="stretch", label=text["view_back"], key="view_back", on_click=go, args=("browse",))
    st.button(width="stretch", label=text["browse_to_survey"], key="view_to_survey", type="primary",
              on_click=leave_browse, args=("survey",))
    notes = [text["disclaimer"]]
    dates = [p["확인날짜"] for p in context.places[:MAP_PINS]]
    if dates and not context.by_type[type_id].needs_choice:
        notes.append(text["map_checked_note"].format(date=ui.korean_date(min(dates))))
    ui.fine_print("", notes)
    ui.back_guard("view_back")                                # 휴대폰 '뒤로 가기'를 눌러도 유형 목록으로 간다


def screen_result(data, text) -> None:
    """결과 화면(11/25): 유형 카드 → 내 특징 자세히 보기 → 첫걸음 지도 → 저장·공유 → 더 보기 → 처음부터 다시 하기 → 작은 글.

    센터 정보는 여기에 늘어놓지 않는다. 지도의 핀을 누르면 그 곳의 화면(screen_place)으로 간다.
    """
    state = st.session_state
    if sel.next_question(state.answers, data.questions) is not None:
        # 결과를 보는 동안 문항 파일이 바뀌어 답이 빠진 문항이 생겼으면, 오류 화면 대신 그 문항을 다시 묻는다
        go("survey")
        st.rerun()
    state.view_type = None                                    # 설문 결과에서는 둘러보기에서 본 유형을 쓰지 않는다
    today = clock.now()                                       # 시각까지 넘겨야 종료시각이 지난 회차가 빠진다
    context = result_context(data, today)
    judged, primary = context.judged, context.primary
    # 기록: 지도에 핀으로 놓이는 곳. 곳이 없으면(동점이라 아직 고르기 전 포함) 일반 창구
    shown_ids = [p["id"] for p in context.places[:MAP_PINS]]
    log_once(data, judged, shown_ids or [p["id"] for p in context.consults])

    if judged.state == scoring.CHOOSE:
        # 가장 높은 유형이 여럿: 먼저 볼 유형을 본인이 고른 뒤에 결과를 보여준다
        priority_question(data, text, judged.candidates, today)
        edit_answers(data, text)
        st.button(width="stretch", label=text["restart_button"], key="restart", type="tertiary", on_click=ask_restart)
        ui.fine_print("", [text["disclaimer"]])
        return
    if not state.tuned:
        go("tune")                                            # 대표 유형이 정해진 뒤 한 번만 '조금 더 맞춰 보기'를 거친다
        st.rerun()

    result = context.by_type[primary]
    type_info = data.types[primary]
    gender = state.answers.get(sel.GENDER_Q)                  # 캐릭터 그림을 고르는 데만 쓴다. 저장하지 않는다

    ui.type_header(text["type_label"], type_info, ui.character_image(primary, gender),
                   text["type_image_alt"].format(name=type_info["name"]))
    with st.expander(text["feature_heading"], key="feature_box"):     # 특징 글은 카드 밖, 알고 싶은 사람만 펼쳐 본다
        ui.feature_text(type_info["feature"])

    ui.heading(text["map_heading"])
    place_area(data, text, context)

    # 저장·공유: 단추 두 개를 한 줄로. 사진은 '내 결과 저장하기'를 눌렀을 때만 만든다
    with st.container(key="save_share"):
        st.button(width="stretch", label=text["save_heading"], key="save_toggle", on_click=flip, args=("save_open",))
        ui.share_button(text)
    ui.share_script(text, data.settings["app_title"], str(text.get("share_url") or ""))
    if state.save_open:
        save_result(data, text, result, context.consults, gender, today)

    opened = state.more_open
    st.button(width="stretch", label=text["more_toggle_close"] if opened else text["more_toggle"], key="more_toggle",
              icon=":material/expand_less:" if opened else ":material/expand_more:", icon_position="right",
              on_click=flip, args=("more_open",))
    if opened:
        more_area(data, text, context, today)

    st.button(width="stretch", label=text["restart_button"], key="restart", type="tertiary", on_click=ask_restart)
    notes = [text["disclaimer"]]
    dates = [p["확인날짜"] for p in context.places[:MAP_PINS]]
    if dates and not result.needs_choice:
        notes.append(text["map_checked_note"].format(date=ui.korean_date(min(dates))))
    ui.fine_print("", notes + [text["share_help"]])


# ── 센터 정보 화면, 다른 곳 목록 화면 ──

def screen_place(data, text) -> None:
    """핀이나 목록의 줄을 눌러서 온 기관 세부 화면(11/26에 팀원 화면의 모양으로 다시 짰다).

    순서: 머리 상자('←' + '○○형에 추천!' + 기관 이름 + 그림) → 하는 일 + 한 줄 설명 → 단추 줄(공식 안내·전화·길찾기)
          → 무엇이 걱정되세요?(눌러 보기) → 접힌 칸 '지원을 처음 경험할 때' → 확인 날짜 → '← 뒤로 돌아가기'
    그릴 때마다 지금의 후보를 다시 만든다. state.place가 그 안에 없으면(끝난 곳, 답을 고쳐 빠진 곳, 없는 id)
    아무것도 그리지 않고 돌려보낸다. 두 돌아가기 단추는 이 곳을 연 화면(결과, 다른 곳 목록, 유형 소개)으로 간다.
    '이렇게 물어보세요' 문장은 넣지 않는다(11/26 결정). 전화 단추는 접지 않는다.
    """
    state = st.session_state
    view = state.get("view_type")                             # 둘러보기에서 왔으면 설문·맞춰 보기를 확인하지 않는다
    home = "view" if view else "result"
    if not view and sel.next_question(state.answers, data.questions) is not None:
        go("survey")
        st.rerun()
    context = result_context(data, clock.now(), view)
    program = next((p for p in context.places if p["id"] == state.get("place")), None)
    if program is None or not (view or state.tuned):
        go(home)
        st.rerun()

    back = state.get("place_from") if state.get("place_from") in (home, "more_places") else home
    type_info = data.types[context.primary]
    own = context.primary in loader.split_multi(program["유형태그"])     # 대표 유형의 곳인지(AI가 고른 다른 유형의 곳, 일반 창구는 아니다)
    gender = browse_gender(data, view) if view else state.answers.get(sel.GENDER_Q)

    with st.container(key="place_card"):                      # 흰 카드 하나로 묶는다(팀원 화면의 모양)
        ui.place_head(ui.place_name(program), text["place_for_type"].format(name=type_info["name"]) if own else "",
                      ui.character_image(context.primary, gender), text["back_label"], go, (back,))
        reason = context.reasons.get(program["id"])
        if reason:
            ui.ai_reason(text["ai_reason"], reason)
        ui.html(f'<h2 class="place-work">{escape(program["프로그램명"])}</h2>')
        ui.body(program["한줄설명"])
        if program["종류"] == loader.KIND_LIST:
            ui.body(text["list_note"])
        ui.place_actions(program, text, venues.load().get(program["id"], []))
        worry_area(data, text, program, type_info if own else None)
        with st.expander(text["first_time_heading"], key="first_time_box"):
            ui.place_facts(program, text)
        ui.checked_note(program, text)
    st.button(width="stretch", label=text["back_to_result"], key="back_bottom", on_click=go, args=(back,))
    ui.back_guard("back_bottom")                              # 휴대폰 '뒤로 가기'를 눌러도 온 화면으로 돌아간다


def screen_more_places(data, text) -> None:
    """'다른 곳 n곳' 핀을 눌러서 온 화면: 지도에 못 놓은 나머지 곳의 이름 줄. 줄을 누르면 그 곳의 안내 화면으로 간다."""
    state = st.session_state
    view = state.get("view_type")
    home = "view" if view else "result"
    if not view and sel.next_question(state.answers, data.questions) is not None:
        go("survey")
        st.rerun()
    context = result_context(data, clock.now(), view)
    rest = context.places[MAP_PINS:]
    if not rest or not (view or state.tuned):
        go(home)
        st.rerun()

    ui.title_row(text["more_places_heading"].format(type=data.types[context.primary]["name"]), text["back_label"],
                 go, (home,))
    if any(program["id"] in context.reasons for program in rest):
        ui.map_notes("", text["map_star_note"])
    for program in rest:
        # AI가 고른 곳은 상자 이름(more_ai_…)으로 표시해 이름 앞에 별을 붙인다(style.py). 지도에 못 놓인 곳일 수 있다
        picked = program["id"] in context.reasons
        with st.container(key=f"more_{'ai' if picked else 'row'}_{program['id']}"):
            st.button(width="stretch", label=ui.place_label(program), key=f"open_{program['id']}",
                      on_click=open_place, args=(program["id"],))
        ui.html(f'<p class="small-note example-note">{escape(program["한줄설명"])}</p>')
    st.button(width="stretch", label=text["back_to_result"], key="back_bottom", on_click=go, args=(home,))
    ui.back_guard("back_bottom")


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
    # 맨 위 띠는 모든 화면에 있다. '처음으로' 단추는 결과·둘러보기 화면에만 둔다.
    # 앱 이름(ANTI)을 누르면 처음 화면으로 간다(11/26: 오른쪽 '처음으로' 단추를 없앴다).
    # 설문 중에는 누를 수 없다(잘못 누르면 답이 지워진다. 앞 문항으로는 화면 아래 '이전으로'로 간다)
    home = st.session_state.screen in HOME_SCREENS
    ui.topbar(text.get("top_title") or data.settings["app_title"], text["top_sub"],
              text["to_start_button"] if home else "", ask_restart)
    screens = {"start": screen_start, "survey": screen_survey, "tune": screen_tune, "result": screen_result,
               "place": screen_place, "more_places": screen_more_places, "browse": screen_browse, "view": screen_view}
    screens[st.session_state.screen](data, text)
    if st.session_state.get("confirm_restart"):
        restart_dialog(text)


main()
