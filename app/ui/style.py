"""50~60대 사용자를 위한 큰 글씨·큰 버튼 CSS. (11/21 팀원 디자인: 연녹색 바탕, 청록 글자, 노란 주요 단추)

기준: 본문 20px(1.25rem), 문항 제목 25px 이상, 줄간격 1.5 이상, 버튼 높이 62px(3.875rem).
휴대폰 세로 화면(폭 320~430px) 기준. 색 값은 아래 :root 한 곳에서 고친다.
노란색은 주요 단추의 바탕 칠로만 쓴다. 고른 답은 물빛 바탕과 청록 테두리로 구분한다.
"""
import streamlit as st


CSS = """
<style>
:root {
  --canvas: #F8FBF7;
  --surface: #FFFFFF;
  --ink: #143F3C;
  --body: #263C37;
  --muted: #4B615A;
  --teal: #12675F;
  --aqua: #DDF4EC;
  --clay: #984A32;
  --rule: #D3E1D8;
  --line: #77897C;
  --yellow: #FEE500;
  --focus: #125864;
  --font-ui: "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", "Noto Sans KR", system-ui, sans-serif;
  --card-radius: 1.125rem;
}
.stApp { background: var(--canvas); color: var(--body); font-family: var(--font-ui); }
[data-testid="stHeader"] { background: transparent; }
[data-testid="stSidebar"], [data-testid="stSidebarCollapsedControl"] { display: none; }
.block-container { max-width: 42rem; padding: 2.75rem 1rem 4rem; }
.stApp [data-testid="stVerticalBlock"] { gap: .75rem; }
/* Streamlit이 문단 아래에 두는 여백을 없앤다. 직접 만든 요소는 간격을 따로 정한다. */
.stApp [data-testid="stMarkdown"] [data-testid="stMarkdownContainer"]:has(> [class]) {
  margin-bottom: 0;
}
.stApp :where(p,h1,h2,h3,h4,li,dt,dd,button,a,label,summary,textarea,input,select) {
  font-family: var(--font-ui); word-break: keep-all; overflow-wrap: anywhere;
}
.stApp [data-testid="stMarkdownContainer"] :where(p:not([class]),li), .stApp .body {
  color: var(--body); font-size: 1.25rem; line-height: 1.62;
}
.stApp .body, .stApp .q-help, .stApp .small-note { padding: 0; margin: 0; }
.stApp .q-help { font-size: 1.1875rem; line-height: 1.6; color: var(--muted); }
.stApp .small-note, .stApp [data-testid="stCaptionContainer"] p {
  font-size: 1.0625rem; color: var(--muted); line-height: 1.6;
}

/* 해와 물결 표식은 홈, 질문, 결과에서 같은 크기 비율로 쓴다. */
.stApp .logo {
  position: relative; display: inline-block; width: 2.4rem; height: 2.4rem; flex: none;
  overflow: hidden; border-radius: 27%; background-color: var(--ink);
}
.stApp .logo::before {
  content: ""; position: absolute; left: 21%; top: 18%; width: 42%; height: 25%;
  border-radius: 999px 999px 0 0; background: #FFBF6C;
}
.stApp .logo::after {
  content: ""; position: absolute; left: 17%; top: 48%; width: 66%; height: 24%;
  border-top: .125rem solid #8EDFCB; border-bottom: .125rem solid #8EDFCB;
  border-radius: 42% 16% 42% 16%; transform: skewY(-7deg);
}
.stApp .topbar {
  display: flex; align-items: center; gap: .7rem; padding: 0 0 .85rem; margin: 0 0 .35rem;
  border-bottom: 1px solid var(--rule); color: var(--ink); font-size: 1.1875rem; font-weight: 750;
}
.stApp .app-title, .stApp .q-title, .stApp .area, .stApp .sec, .stApp .p-name, .stApp .type-name {
  color: var(--ink); margin: 0; padding: 0; line-height: 1.4; font-weight: 750;
}
.stApp .app-title { font-size: clamp(1.9rem, 5vw, 2.65rem); }
.stApp .q-title { font-size: clamp(1.55rem, 4.5vw, 2rem); }
.stApp .area, .stApp .sec { margin-top: .6rem; font-size: 1.25rem; }
.stApp .area {
  display: flex; align-items: center; gap: .7rem; padding-top: .65rem;
}
.stApp .area::after { content: ""; height: 1px; flex: 1; background: var(--rule); }

/* 넓은 클릭 영역과 키보드 포커스. 주 행동만 노랑, 선택한 답은 체크 표시와 물빛으로 구분한다. */
.stApp :is(.stButton,.stFormSubmitButton) > button, .stApp a.a-btn {
  width: 100%; min-height: 3.875rem; box-sizing: border-box; padding: .68rem 1.1rem;
  background: var(--surface); color: var(--ink); border: 1.5px solid var(--line);
  border-radius: .85rem; box-shadow: none; text-decoration: none;
}
.stApp :is(.stButton,.stFormSubmitButton) > button p, .stApp a.a-btn {
  color: var(--ink); font-size: 1.25rem; line-height: 1.45; font-weight: 650;
}
.stApp :is(.stButton,.stFormSubmitButton) > button:is([kind="primary"],[kind="primaryFormSubmit"]),
.stApp a.a-btn.fill {
  background: var(--yellow); color: #202E27; border-color: #857810;
}
.stApp :is(.stButton,.stFormSubmitButton) > button:is([kind="primary"],[kind="primaryFormSubmit"]) p {
  color: #202E27; font-weight: 750;
}
@media (hover: hover) {
  .stApp :is(.stButton,.stFormSubmitButton) > button:enabled:hover, .stApp a.a-btn:hover {
    background: #F0F5EB; border-color: var(--teal); color: var(--ink);
  }
  .stApp :is(.stButton,.stFormSubmitButton) > button:is([kind="primary"],[kind="primaryFormSubmit"]):enabled:hover,
  .stApp a.a-btn.fill:hover { background: #F4DA02; border-color: #857810; }
}
.stApp .stButton > button[kind="tertiary"] {
  width: 100%; min-height: 3rem; border: 1px solid transparent; background: transparent;
}
.stApp .stButton > button[kind="tertiary"] p {
  color: var(--teal); font-size: 1.125rem; text-decoration: underline; text-underline-offset: .2em;
}
.stApp :is(.stButton,.stFormSubmitButton) > button:disabled {
  background: #EBEBE2; border-color: var(--rule); color: #58645D;
}
.stApp :is(.stButton,.stFormSubmitButton) > button:disabled p { color: #58645D; }
.stApp :is(a,button,summary,input,textarea,[role="combobox"]):focus-visible {
  outline: 3px solid var(--focus); outline-offset: 3px;
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"],[class*="st-key-browse_T"]) button {
  justify-content: flex-start; gap: .85rem; text-align: left;
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"],[class*="st-key-browse_T"]) button p {
  text-align: left;
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button::before {
  content: ""; width: 1.35rem; height: 1.35rem; flex: none; box-sizing: border-box;
  border: 1.5px solid var(--line); border-radius: 50%; background: var(--surface);
}
.stApp [class*="st-key-opt_Q_BARRIER_"] button::before { border-radius: .25rem; }
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"],[class*="st-key-browse_T"]) button[kind="primary"] {
  border: 2px solid var(--teal); background: var(--aqua);
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button[kind="primary"]::before {
  border: .39rem solid var(--teal);
}
.stApp [class*="st-key-browse_T"] button::after {
  content: ""; width: .5rem; height: .5rem; flex: none; margin-left: auto;
  border: solid var(--teal); border-width: 0 2px 2px 0; transform: rotate(45deg);
}
.stApp [class*="st-key-browse_T"] button[kind="primary"]::after { transform: rotate(225deg); }

/* 설문 */
.stApp .q-progress {
  margin: .35rem 0 .4rem; color: var(--teal); font-size: 1.125rem; font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.stApp .bar { height: .55rem; overflow: hidden; border-radius: 999px; background: #D9DFD3; }
.stApp .bar i { display: block; height: 100%; border-radius: inherit; background: var(--teal); }
.stApp .st-key-q_card, .stApp [data-testid="stVerticalBlock"]:has(> [data-testid="stElementContainer"] .p-name) {
  border: 1px solid var(--rule); border-radius: var(--card-radius); background: var(--surface);
  box-shadow: 0 3px 14px rgba(48,55,37,.045);
  padding: clamp(1rem, 3vw, 1.65rem);
}
.stApp .st-key-q_card { margin-top: .35rem; }
.stApp .st-key-q_card .q-title, .stApp .st-key-q_card .q-help { text-align: left; }
.stApp .st-key-q_card .q-help { margin-top: .32rem; }
.stApp [data-testid="stForm"] { border: 0; padding: 0; }
.stApp [class*="st-key-next_"]:has(button[kind="primary"]) {
  position: sticky; bottom: .6rem; z-index: 2; border-radius: .85rem;
  box-shadow: 0 0 0 4px var(--canvas);
}
.stApp .stTextArea [data-baseweb="textarea"], .stApp .stNumberInput [data-baseweb="input"] {
  background: var(--surface); border: 1.5px solid var(--line); border-radius: .8rem;
}
.stApp .stTextArea [data-baseweb="textarea"]:focus-within, .stApp .stNumberInput [data-baseweb="input"]:focus-within {
  border-color: var(--focus); outline: 2px solid var(--focus); outline-offset: 1px;
}
.stApp .stTextArea textarea, .stApp .stNumberInput input {
  color: var(--body); background: var(--surface); font-size: 1.25rem; line-height: 1.55;
}
.stApp .stNumberInput input { min-height: 3.25rem; }
.stApp .stTextArea label p, .stApp [data-testid="stSelectbox"] label p { font-size: 1.125rem; }

/* 결과 안내 */
.stApp .type-box {
  border-radius: var(--card-radius); background: var(--aqua);
  border: 1px solid #B8D0C2; border-inline-start: .32rem solid var(--teal);
  padding: .8rem 1.1rem;
}
.stApp .type-label { margin: 0; font-size: 1.0625rem; font-weight: 700; color: var(--teal); }
.stApp .type-name { font-size: clamp(1.65rem, 4.7vw, 1.95rem); margin: .13rem 0; }
.stApp .type-statement { margin: 0; font-size: 1.1875rem; line-height: 1.5; color: var(--ink); }
.stApp .p-name { font-size: clamp(1.4rem, 4vw, 1.65rem); }
.stApp .p-org { margin: .18rem 0 0; color: var(--teal); font-weight: 650; font-size: 1.125rem; }
.stApp .p-kind {
  display: inline-block; margin: .38rem 0 0; padding: .15rem .55rem; border-radius: .4rem;
  color: #6F432F; background: #F6E9D8; font-size: 1.02rem; font-weight: 650;
}
.stApp .card-facts {
  display: grid; grid-template-columns: minmax(4.5em, max-content) minmax(0,1fr);
  align-items: baseline; gap: .35rem .8rem; margin: 0; font-size: 1.1875rem; line-height: 1.55;
}
.stApp .card-facts dt { color: var(--muted); font-weight: 700; }
.stApp .card-facts dd { margin: 0; color: var(--body); }
.stApp a.a-btn {
  display: flex; align-items: center; justify-content: center; gap: .35em;
  text-align: center; margin: .2rem 0; color: var(--ink);
}
.stApp a.phone-link { flex-wrap: wrap; background: var(--surface); }
.stApp a.share-btn { background: var(--aqua); border-color: var(--teal); }
.stApp [data-testid="stExpander"] details {
  background: var(--surface); border: 1px solid var(--rule); border-radius: .85rem;
}
.stApp [data-testid="stExpander"] summary { min-height: 3.25rem; }
.stApp [data-testid="stExpander"] summary p {
  color: var(--ink); font-size: 1.1875rem; font-weight: 650;
}
.stApp .notice, .stApp .say, .stApp .reason, .stApp .share {
  margin: .2rem 0; border-radius: .85rem; padding: .85rem 1rem;
  color: var(--body); font-size: 1.1875rem; line-height: 1.6;
}
.stApp .notice, .stApp .say { background: #FBEEDE; border-inline-start: .25rem solid var(--clay); }
.stApp .notice.fail { background: #F9E8E2; border-color: #A33C2E; }
.stApp .notice.info, .stApp .reason { background: var(--aqua); border: 1px solid #B8D0C2; }
.stApp .share { padding: 1rem; background: var(--surface); border: 1px solid var(--rule); }
.stApp .share .share-url { word-break: break-all; user-select: all; }
.stApp .share .share-status:empty, .stApp .share .share-url:empty { display: none; }
.stApp ul.facts { margin: 0; padding-left: 1.4rem; }

/* 시작 화면의 순서 안내(1·2·3), 가운데 정렬, 줄바꿈 막기 */
.stApp .center { text-align: center; }
.stApp .steps { display: flex; flex-direction: column; gap: .6rem; margin: .25rem 0; }
.stApp .step {
  display: flex; align-items: center; gap: .85rem; padding: .8rem 1rem;
  background: var(--surface); border: 1px solid var(--rule); border-radius: .85rem;
}
.stApp .step .num {
  flex: none; width: 2.4rem; height: 2.4rem; border-radius: 50%; background: var(--aqua); color: var(--teal);
  display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 750;
}
.stApp .step p { margin: 0; font-size: 1.1875rem; line-height: 1.5; font-weight: 650; color: var(--ink); }
.stApp .nowrap { white-space: nowrap; }

.stApp .topbar-name { flex: 1; min-width: 0; }
.stApp .topbar-team { font-size: 1rem; font-weight: 650; color: var(--muted); }
.stApp [data-area="work"] { --area-ink: var(--teal); --area-wash: var(--aqua); --area-rule: #B8D0C2; }
.stApp [data-area="leisure"] { --area-ink: var(--clay); --area-wash: #FBEEDE; --area-rule: #DDC4AD; }
.stApp [data-area="life"] { --area-ink: #295B72; --area-wash: #E8F1F2; --area-rule: #B2CBD0; }
.stApp .type-box[data-area] {
  background: var(--area-wash); border-color: var(--area-rule); border-inline-start-color: var(--area-ink);
}
.stApp .type-box[data-area] .type-label, .stApp .area[data-area] { color: var(--area-ink); }
.stApp .area[data-area]::after { background: var(--area-rule); }

@media (max-width: 420px) {
  .block-container { padding-inline: .85rem; }
  .stApp .st-key-q_card { padding: .95rem; }
  .stApp .card-facts { grid-template-columns: 1fr; gap: .05rem; }
  .stApp .card-facts dd + dt { margin-top: .42rem; }
}
@media (max-width: 600px) and (max-height: 740px) {
  .block-container { padding-top: 2.4rem; }
  .stApp .topbar { padding-bottom: .5rem; margin-bottom: 0; }
  .stApp .st-key-q_card { gap: .45rem; padding: .8rem; }
  .stApp .st-key-q_card button { min-height: 3.5rem; }
  .stApp .q-progress { margin: .1rem 0 .25rem; }
}
@media (max-height: 540px) {
  .stApp [class*="st-key-next_"]:has(button[kind="primary"]) { position: static; box-shadow: none; }
}
@media (forced-colors: active) {
  .stApp .bar { border: 1px solid CanvasText; }
  .stApp .bar i { background: Highlight; forced-color-adjust: none; }
}
</style>
"""


def apply() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
