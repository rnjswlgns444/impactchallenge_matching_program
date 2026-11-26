"""50~60대 사용자를 위한 큰 글씨·큰 버튼 CSS. (11/21 팀원 디자인: 연녹색 바탕, 청록 글자, 노란 주요 단추)

기준: 본문 20px(1.25rem), 문항 제목 25px 이상, 줄간격 1.5 이상, 버튼 높이 62px(3.875rem).
예외 둘(11/25 사용자 결정): 맨 위 띠의 '처음으로' 단추는 44px, 유의사항 글(.fine)은 10px이다.
휴대폰 세로 화면(폭 320~430px) 기준. 색 값은 아래 :root 한 곳에서 고친다.
노란색은 주요 단추의 바탕 칠과 맨 위 띠에 쓴다(시작 화면 그림 상자의 연노랑은 예외이고 home.css에 있다). 고른 답은 물빛 바탕과 굵은 청록 테두리로 구분한다.
"""
import streamlit as st

from . import pins


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
  /* 첫걸음 지도의 색: 풀밭, 짙은 풀밭, 나무 점. 길과 물의 색은 그림(ui/pins.py의 map_art) 안에 있다 */
  --map-grass: #DDEBCA; --map-grass-deep: #CFE4BC; --map-dot: #79A48E; --map-rule: #C2D4B0;
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
  font-size: 1.125rem; color: var(--muted); line-height: 1.6;
}
/* 동점 선택지 아래의 '예: 기관 · 프로그램'. 어느 단추의 예인지 알 수 있게 위 단추에 붙인다 */
.stApp .example-note { margin: -.4rem 0 .5rem; padding-left: .3rem; }

/* 맨 위 띠(ui.topbar): 노란 바탕에 앱 이름과 작은 풀이. 앱 이름은 누를 수 있는 화면에서만 단추다(to_start).
   넓은 화면에서는 본문 폭의 둥근 띠,
   휴대폰에서는 화면 양 끝까지 닿는 띠다(--bleed 는 본문 양옆 여백과 같은 값) */
.stApp .st-key-topbar {
  --bleed: 0rem;
  flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: space-between; gap: .6rem;
  box-sizing: border-box; width: calc(100% + 2 * var(--bleed)); max-width: none; min-height: 3.6rem;
  margin: 0 calc(-1 * var(--bleed)) .35rem; padding: .45rem 1rem; border-radius: .85rem; background: var(--yellow);
}
.stApp .st-key-topbar > div { width: auto; min-width: 0; flex: 0 1 auto; }
.stApp .st-key-topbar > div:has(.stButton) { flex: none; }
.stApp .topbar { display: flex; flex-direction: column; margin: 0; padding: 0; color: var(--ink); line-height: 1.2; }
.stApp .topbar-name { font-size: 1.45rem; font-weight: 800; letter-spacing: .06em; }
.stApp .topbar-sub { font-size: .9375rem; font-weight: 650; white-space: nowrap; }
@media (max-width: 600px) {
  .stApp .st-key-topbar { --bleed: 1rem; border-radius: 0; }
}
@media (max-width: 420px) {
  .stApp .st-key-topbar { --bleed: .85rem; padding-inline: .85rem; }
}
/* 폭이 아주 좁으면 '처음으로' 옆에서 풀이 글이 두 줄로 꺾이지 않게 조금 줄인다 */
@media (max-width: 340px) {
  .stApp .topbar-sub { font-size: .875rem; letter-spacing: -.03em; }
}
/* 유의사항(ui.fine_print): 계약서의 유의사항처럼 맨 아래 작은 회색 글. 상자·굵은 글씨·색 바탕이 없다.
   크기는 사용자가 정한 10px이다(11/25). 휴대폰에서 글씨를 키운 사람에게는 함께 커지도록 rem 으로 적는다 */
.stApp .fine { margin: 1.75rem 0 0; padding: 0; color: var(--muted); font-size: .625rem; line-height: 1.6; }
.stApp .fine :is(p, ul, li) { margin: 0; padding: 0; color: inherit; font-size: inherit; line-height: inherit; }
.stApp .fine ul { list-style: none; }
.stApp .fine li { padding-left: .8em; text-indent: -.8em; }
.stApp .fine li::before { content: "· "; }
.stApp .app-title, .stApp .q-title, .stApp .area, .stApp .sec, .stApp .p-name, .stApp .type-name {
  color: var(--ink); margin: 0; padding: 0; line-height: 1.4; font-weight: 750;
}
/* 제목 태그(h1~h3) 옆에 Streamlit이 붙이는 '링크 복사' 아이콘은 숨긴다. 잘못 누르면 주소만 바뀌어 헷갈린다 */
.stApp [data-testid="stHeaderActionElements"] { display: none; }
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
  color: var(--teal); font-size: 1.1875rem; text-decoration: underline; text-underline-offset: .2em;
}
.stApp :is(.stButton,.stFormSubmitButton) > button:disabled {
  background: #EBEBE2; border-color: var(--rule); color: #58645D;
}
.stApp :is(.stButton,.stFormSubmitButton) > button:disabled p { color: #58645D; }
/* 띠의 앱 이름 단추(누르면 처음 화면으로): 글자처럼 보이게 테두리와 바탕을 뺀다. 글자 모양은 .topbar-name 과 같다 */
.stApp .st-key-topbar .st-key-topbar_brand { gap: 0; width: auto; }
.stApp .st-key-topbar .st-key-topbar_brand > div { width: auto; }
.stApp .st-key-topbar .st-key-to_start button {
  width: auto; min-height: 1.9rem; padding: 0; border: 0; border-radius: .3rem; background: none; box-shadow: none;
  justify-content: flex-start;
}
.stApp .st-key-topbar .st-key-to_start button p {
  color: var(--ink); font-size: 1.45rem; font-weight: 800; letter-spacing: .06em; line-height: 1.2; white-space: nowrap;
}
@media (hover: hover) {
  .stApp .st-key-topbar .st-key-to_start button:enabled:hover { background: none; }
  .stApp .st-key-topbar .st-key-to_start button:enabled:hover p { text-decoration: underline; }
}
.stApp :is(a,button,summary,input,textarea,[role="combobox"]):focus-visible {
  outline: 3px solid var(--focus); outline-offset: 3px;
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button {
  justify-content: flex-start; gap: .85rem; text-align: left;
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button p {
  text-align: left;
}
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button::before {
  content: ""; width: 1.35rem; height: 1.35rem; flex: none; box-sizing: border-box;
  border: 1.5px solid var(--line); border-radius: 50%; background: var(--surface);
}
.stApp [class*="st-key-opt_Q_BARRIER_"] button::before { border-radius: .25rem; }
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button[kind="primary"] {
  border: 2px solid var(--teal); background: var(--aqua);
}
/* 설문 선택지의 글은 왼쪽부터 쓴다. Streamlit이 단추 안에 한 겹 더 씌운 상자가 글을 가운데로 모으므로 그 상자에도 적는다 */
.stApp [class*="st-key-opt_"] button > div { justify-content: flex-start; }
/* 설문에서 고른 답: 글 앞의 ✓ 없이 물빛 바탕 + 굵은 청록 테두리(11/25). 앞 동그라미가 채워지는 것은 그대로다(색을 구분하기 어려운 분도 모양으로 안다) */
.stApp [class*="st-key-opt_"] button[kind="primary"] { border-width: 2.5px; }
/* 선택지 앞에 그림이 있으면(questions.yaml의 icon) 동그라미 대신 둥근 바탕의 그림을 보여 준다 */
.stApp [class*="st-key-opt_"] button:has([data-testid="stIconMaterial"])::before { content: none; }
.stApp [class*="st-key-opt_"] button [data-testid="stIconMaterial"] {
  flex: none; width: 2.6rem; height: 2.6rem; display: grid; place-items: center; border-radius: 50%;
  background: var(--aqua); color: var(--teal); font-size: 1.6rem;
}
/* 그림을 감싼 칸은 Streamlit이 작은 폭으로 잡아 둔다. 둥근 바탕만큼 넓히고 글과 사이를 띄운다 */
.stApp [class*="st-key-opt_"] button span:has(> [data-testid="stIconMaterial"]) {
  flex: none; display: flex; width: auto; height: auto; margin: 0 .75rem 0 0;
}
.stApp [class*="st-key-opt_"] button[kind="primary"] [data-testid="stIconMaterial"] { background: var(--teal); color: #fff; }
.stApp :is([class*="st-key-opt_"],[class*="st-key-detail_"]) button[kind="primary"]::before {
  border: .39rem solid var(--teal);
}

/* ── 둘러보기: 12개 유형을 3개씩 4줄의 칸으로(11/26). 한 칸 = 캐릭터 그림 + 유형 이름, 칸 전체가 단추다 ──
   그림은 단추의 바탕 그림이다(ui.type_grid_art가 유형마다 넣는다). 위쪽 안쪽 여백(%는 칸 폭 기준)이 그림 자리다.
   폭이 좁아도 3칸을 지킨다. 이름(5글자)이 한 줄에 들어가게 글씨는 폭에 따라 15~17px로 한다 */
.stApp .st-key-type_grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; margin-bottom: .6rem;
}
.stApp .st-key-type_grid > * { min-width: 0; width: 100%; }
.stApp .st-key-type_grid .stButton > button {
  display: block; width: 100%; min-height: 0; padding: 86% .1rem .5rem;
  border: 1.5px solid var(--area-rule, var(--rule)); border-radius: var(--card-radius);
  background-color: var(--area-wash, var(--surface));
  /* 단추의 다른 상태(마우스 올림 등)가 바탕을 통째로 바꿔도 그림 자리는 그대로 둔다 */
  background-repeat: no-repeat !important; background-position: 50% .35rem !important; background-size: 88% auto !important;
}
.stApp .st-key-type_grid .stButton > button p {
  color: var(--ink); font-size: clamp(.9375rem, 4.4vw, 1.0625rem); font-weight: 750; line-height: 1.3;
  text-align: center; white-space: nowrap;
}
@media (hover: hover) {
  /* 마우스를 올려도 바탕 그림이 지워지지 않게 바탕색만 그대로 두고 테두리만 짙게 한다 */
  .stApp .st-key-type_grid .stButton > button:enabled:hover {
    background-color: var(--area-wash, var(--surface)); border-color: var(--area-ink, var(--teal));
  }
}

/* 설문 */
.stApp .q-progress {
  display: flex; align-items: baseline; justify-content: space-between; gap: .6rem;
  margin: .35rem 0 .4rem; color: var(--teal); font-size: 1.125rem; font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.stApp .q-cheer { color: var(--clay); font-weight: 700; }     /* 진행 글자 오른쪽의 응원 한 줄 */
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
/* 숫자 칸의 +/- 단추는 숨긴다. 태어난 해는 직접 적는 값이고, 좁은 화면에서 이 단추가 칸 안의 안내 글을 가린다 */
.stApp .stNumberInput :is([data-testid="stNumberInputStepUp"], [data-testid="stNumberInputStepDown"]) { display: none; }
.stApp .stTextArea label p, .stApp [data-testid="stSelectbox"] label p { font-size: 1.125rem; }
/* 입력칸 구석에 뜨는 영어 안내('Press Ctrl+Enter to submit form')는 숨긴다 */
.stApp [data-testid="InputInstructions"] { display: none; }

/* 결과 안내 */
.stApp .type-box {
  border-radius: var(--card-radius); background: var(--aqua);
  border: 1px solid #B8D0C2; border-inline-start: .32rem solid var(--teal);
  padding: .8rem 1.1rem;
}
.stApp .type-label { margin: 0; font-size: 1.125rem; font-weight: 700; color: var(--teal); }
.stApp .type-name { font-size: clamp(1.65rem, 4.7vw, 1.95rem); margin: .13rem 0; }
.stApp .type-statement { margin: 0; font-size: 1.1875rem; line-height: 1.5; color: var(--ink); }
.stApp .p-name { font-size: clamp(1.4rem, 4vw, 1.65rem); }
.stApp .p-org { margin: .18rem 0 0; color: var(--teal); font-weight: 650; font-size: 1.125rem; }
.stApp .p-kind {
  display: inline-block; margin: .38rem 0 0; padding: .2rem .6rem; border-radius: .4rem;
  color: #6F432F; background: #F6E9D8; font-size: 1.125rem; font-weight: 650;
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
/* 결과 화면 '더 보기' 안의 줄: 접힌 칸(답변 확인·수정, 함께 찾아 주는 곳)과 단추(바라는 점 다시 적기, 다시 고르기)를
   같은 테두리·높이·글자로 맞춘다. '›'도 접힌 칸과 같은 자리(글 왼쪽)·같은 크기로 둔다(11/26) */
.stApp .st-key-more_rows .stButton > button {
  min-height: 3.4375rem; padding: 0 .75rem; justify-content: flex-start; gap: .5rem; text-align: left;   /* 접힌 칸의 실제 높이(55px)와 같게 */
  background: var(--surface); border: 1px solid var(--rule); border-radius: .85rem; box-shadow: none;
}
.stApp .st-key-more_rows .stButton > button > div { justify-content: flex-start; }
.stApp .st-key-more_rows .stButton > button p { color: var(--ink); font-size: 1.1875rem; font-weight: 650; }
.stApp .st-key-more_rows .stButton > button::before {
  content: ""; flex: none; width: .4rem; height: .4rem; margin: 0 .35rem 0 .25rem;
  border: solid var(--ink); border-width: 0 1.5px 1.5px 0; transform: rotate(-45deg);
}
/* 접힌 칸 안의 단추(문항 목록 등)는 예전 모양 그대로 둔다 */
.stApp .st-key-more_rows [data-testid="stExpander"] .stButton > button {
  min-height: 3.875rem; padding: .25rem .75rem; justify-content: center; border: 1.5px solid var(--line); border-radius: .9rem;
}
.stApp .st-key-more_rows [data-testid="stExpander"] .stButton > button::before { content: none; }
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

/* 가운데 정렬, 줄바꿈 막기 */
.stApp .center { text-align: center; }
.stApp .nowrap { white-space: nowrap; }

.stApp :is([data-area="work"], .st-key-type_hero:has([data-area="work"]), [class*="st-key-tile_work_"]) {
  --area-ink: var(--teal); --area-wash: var(--aqua); --area-rule: #B8D0C2;
}
.stApp :is([data-area="leisure"], .st-key-type_hero:has([data-area="leisure"]), [class*="st-key-tile_leisure_"]) {
  --area-ink: var(--clay); --area-wash: #FBEEDE; --area-rule: #DDC4AD;
}
.stApp :is([data-area="life"], .st-key-type_hero:has([data-area="life"]), [class*="st-key-tile_life_"]) {
  --area-ink: #295B72; --area-wash: #E8F1F2; --area-rule: #B2CBD0;
}
.stApp .type-box[data-area] {
  background: var(--area-wash); border-color: var(--area-rule); border-inline-start-color: var(--area-ink);
}
/* 대표 유형 카드: 캐릭터 그림 → 작은 글 → 유형 이름 → 설명. 그림과 글을 한 카드로 묶고 가운데에 둔다.
   그림에는 글자가 없어서, 글씨를 키워도 그림과 따로 움직인다 */
.stApp .st-key-type_hero {
  align-items: center; gap: .35rem; padding: 1rem 1.1rem 1.15rem; border-radius: var(--card-radius);
  background: var(--area-wash, var(--aqua)); border: 1px solid var(--area-rule, #B8D0C2);
}
.stApp .st-key-type_hero [data-testid="stImage"] { margin-inline: auto; }
/* 그림은 400px로 받아 200px로 보여 준다. Streamlit이 그림 태그에 폭(400px)을 직접 적어 넣으므로 !important로 덮는다 */
.stApp .st-key-type_hero img {
  display: block; width: min(200px, 56vw) !important; max-width: 100%; height: auto; margin-inline: auto;
}
.stApp .st-key-type_hero [data-testid="stElementToolbar"] { display: none; }   /* 그림 크게 보기 단추는 쓰지 않는다 */
.stApp .st-key-type_hero .type-box[data-area] {
  padding: 0; border: 0; background: none; text-align: center; word-break: keep-all;
}
.stApp .type-box[data-area] .type-label, .stApp .area[data-area] { color: var(--area-ink); }
.stApp .area[data-area]::after { background: var(--area-rule); }

/* 내 결과 저장하기: 사진 미리보기, 저장 단추(주요 단추와 같은 모양), 보내기 단추 */
.stApp .st-key-save_card img { border: 1px solid var(--rule); border-radius: .85rem; }
.stApp .st-key-save_card [data-testid="stElementToolbar"] { display: none; }   /* 그림 크게 보기 단추는 쓰지 않는다 */
.stApp .stDownloadButton > button {
  width: 100%; min-height: 3.875rem; box-sizing: border-box; padding: .68rem 1.1rem;
  background: var(--yellow); color: #202E27; border: 1.5px solid #857810; border-radius: .85rem; box-shadow: none;
}
.stApp .stDownloadButton > button p { color: #202E27; font-size: 1.25rem; line-height: 1.45; font-weight: 750; }
@media (hover: hover) {
  .stApp .stDownloadButton > button:enabled:hover { background: #F4DA02; border-color: #857810; }
}
.stApp .send .send-status:empty { display: none; }

/* ── 조금 더 맞춰 보기 화면 ── */
.stApp .tune-badge {
  display: inline-block; margin: 0; padding: .25rem .8rem; border-radius: 999px; background: var(--map-grass); color: var(--ink);
  font-size: 1.125rem; font-weight: 700;
}
.stApp .st-key-tune_skip button { justify-content: flex-start; padding-inline: 0; }
.stApp .st-key-tune_skip button > div { justify-content: flex-start; }
.stApp .fine.tight { margin-top: 0; }

/* ── 결과 화면: 유형 카드의 딱지. 특징 글은 카드 아래의 접힌 칸(feature_box)에 있다 ── */
.stApp .st-key-type_hero .type-box[data-area] .type-label {
  display: inline-block; padding: .15rem .8rem; border-radius: 999px; background: var(--area-ink, var(--teal)); color: #fff;
}
.stApp .st-key-feature_box .feature { margin: 0; font-size: 1.1875rem; line-height: 1.6; }

/* ── 첫걸음 지도(ui.place_map) ──
   상자(st-key-place_map) 안에는 단추만 있다. 풀밭·길·물·나무는 상자의 바탕 여러 겹이고, 감싸는 요소를 따로 만들지 않는다.
   핀 그림은 단추의 ::before, 이름표는 단추의 글(p), 이름표 끝 '›'는 글의 ::after 다.
   어느 핀 그림을 쓸지는 단추를 감싼 상자의 이름(pinbox_번호_k_그림이름)이 정한다(규칙은 ui/pins.py의 css가 만든다) */
.stApp .st-key-place_map {
  position: relative; overflow: hidden; gap: 1rem; padding: 1.2rem .6rem 1.3rem;
  border: 1px solid var(--map-rule); border-radius: var(--card-radius); background-color: var(--map-grass);
  background-image:
    radial-gradient(circle closest-side, var(--map-dot) 94%, transparent),
    radial-gradient(circle closest-side, var(--map-dot) 94%, transparent),
    radial-gradient(circle closest-side, var(--map-dot) 94%, transparent),
    radial-gradient(circle closest-side, var(--map-dot) 94%, transparent),
    radial-gradient(ellipse closest-side, var(--map-grass-deep) 96%, transparent),
    radial-gradient(ellipse closest-side, var(--map-grass-deep) 96%, transparent),
    var(--map-art);
  background-repeat: no-repeat;
  background-position: 93% 44%, 86% 50%, 5% 66%, 12% 97%, 8% 40%, 90% 86%, 0 0;
  background-size: .8rem .8rem, .6rem .6rem, .75rem .75rem, .65rem .65rem, 38% 22%, 44% 20%, 100% 100%;
}
/* 핀은 좌우로 어긋나게 놓는다: 1번 왼쪽, 2번 오른쪽, 3번 조금 안쪽, '다른 곳'은 오른쪽 */
.stApp .st-key-place_map [class*="st-key-pinbox_"] { position: relative; z-index: 1; width: fit-content; max-width: 94%; }
.stApp .st-key-place_map :is([class*="st-key-pinbox_2_"], [class*="st-key-pinbox_more_"]) { margin-left: auto; }
.stApp .st-key-place_map [class*="st-key-pinbox_3_"] { margin-left: 7%; }
.stApp .st-key-place_map .stButton > button {
  position: relative; width: auto; min-height: 3.875rem; padding: 0; gap: .25rem;
  border: 0; border-radius: .9rem; background: none; justify-content: flex-start; text-align: left;
}
.stApp .st-key-place_map .stButton > button > div { justify-content: flex-start; min-width: 0; }
.stApp .st-key-place_map .stButton > button::before {     /* 핀 그림. AI가 고른 곳은 같은 자리에 별을 한 겹 더 얹는다 */
  content: ""; flex: none; width: 3rem; height: 3.75rem;
  background: var(--badge, none) right -.05rem top -.05rem / 1.35rem 1.35rem no-repeat,
              var(--pin, var(--pin-place)) center / contain no-repeat;
  filter: drop-shadow(0 2px 1.5px rgba(20, 63, 60, .35));
}
.stApp .st-key-place_map [class*="st-key-pinbox_"][class*="_ai"] { --badge: var(--pin-star); }
.stApp .st-key-place_map .stButton > button p {           /* 이름표: 흰 바탕 + 테두리 + 바닥 그림자(단추다운 모양) */
  display: block; position: relative; min-height: 3.25rem; margin: 0; padding: .45rem 2rem .45rem .8rem;
  background: var(--surface); border: 1.5px solid var(--line); border-radius: .9rem; box-shadow: 0 4px 0 #A3B3A6;
  color: var(--body); font-size: 1rem; font-weight: 500; line-height: 1.4; text-align: left; word-break: keep-all;
}
/* 이름표의 첫 줄(굵은 글)은 기관 이름: 크게. 둘째 줄은 하는 일: 작게(11/26). '다른 곳' 목록의 줄도 같다 */
.stApp :is(.st-key-place_map, [class*="st-key-more_row_"], [class*="st-key-more_ai_"]) .stButton > button p strong {
  color: var(--ink); font-size: 1.1875rem; font-weight: 750; line-height: 1.35;
}
.stApp :is([class*="st-key-more_row_"], [class*="st-key-more_ai_"]) .stButton > button p {
  color: var(--body); font-size: 1rem; font-weight: 500; line-height: 1.4; word-break: keep-all;
}
.stApp .st-key-place_map .stButton > button p::after {    /* 이름표 끝의 '›' */
  content: ""; position: absolute; right: .8rem; top: 50%; width: .6rem; height: .6rem; margin-top: -.35rem;
  border: solid var(--teal); border-width: 0 2.5px 2.5px 0; transform: rotate(-45deg);
}
/* 누르는 순간과, 보고 온 곳: 물빛 */
.stApp .st-key-place_map .stButton > button:active p { background: var(--aqua); box-shadow: none; transform: translateY(4px); }
.stApp .st-key-place_map [class*="_seen"] .stButton > button p { background: var(--aqua); border: 2px solid var(--teal); }
@media (hover: hover) {
  .stApp .st-key-place_map .stButton > button:enabled:hover { background: none; }
  .stApp .st-key-place_map .stButton > button:enabled:hover p { border-color: var(--teal); }
}
/* AI가 고른 곳(적어 주신 내용에 맞춘 곳): 이름 앞에 별을 붙이고 이름표 테두리를 노랗게 한다. 뜻은 지도 아래 글이 알린다 */
.stApp .st-key-place_map [class*="st-key-pinbox_"][class*="_ai"] .stButton > button p { border: 2.5px solid var(--yellow); }
.stApp :is(.st-key-place_map [class*="st-key-pinbox_"][class*="_ai"], [class*="st-key-more_ai_"]) .stButton > button p::before {
  content: ""; flex: none; display: inline-block; width: 1.25rem; height: 1.25rem; margin-right: .1rem;
  background: var(--pin-star) center / contain no-repeat; vertical-align: -.2rem;
}
/* 별의 뜻: 지도 안 왼쪽 위의 작은 딱지(별이 붙은 곳이 있을 때만) */
.stApp .st-key-place_map .map-legend {
  position: relative; z-index: 1; width: fit-content; max-width: 100%; margin: -.5rem 0 -.2rem; padding: .2rem .6rem;
  background: rgba(255, 255, 255, .9); border: 1px solid var(--map-rule); border-radius: .7rem;
}
.stApp .st-key-place_map .map-legend .map-note.star { align-items: flex-start; font-size: .875rem; font-weight: 500; }   /* 14px: 핀의 글보다 작게(11/26) */
.stApp .st-key-place_map .map-legend .map-note.star::before { width: 1rem; height: 1rem; margin-top: .15rem; }
/* 지도 제목 아래의 작은 글: 누르면 자세히 볼 수 있다는 안내 */
.stApp .map-notes { margin: -.35rem .1rem .1rem; }      /* 제목 바로 아래, 지도 위에 놓인다 */
.stApp .map-note { margin: 0; color: var(--muted); font-size: 1.0625rem; line-height: 1.5; }
.stApp .map-note.star { display: flex; align-items: center; gap: .35rem; color: var(--body); font-weight: 650; }
.stApp .map-note.star::before {
  content: ""; flex: none; width: 1.2rem; height: 1.2rem; background: var(--pin-star) center / contain no-repeat;
}
/* 직접 적기 글 상자의 회색 글: 적으려고 누르면 사라진다(브라우저 기본은 글자를 칠 때까지 남는다) */
.stApp .st-key-free_text textarea::placeholder { color: #66736C; opacity: 1; }
.stApp .st-key-free_text textarea:focus::placeholder { color: transparent; }

/* ── 저장·공유: 단추 두 개를 한 줄로. 노란색은 쓰지 않는다 ── */
.stApp .st-key-save_share { display: grid; grid-template-columns: 1fr 1fr; align-items: start; gap: .6rem; margin-top: .6rem; }
.stApp .st-key-save_share > div { width: auto; min-width: 0; }
.stApp .st-key-save_share .share { margin: 0; padding: 0; border: 0; background: none; }
.stApp .st-key-save_share :is(.stButton > button, a.share-btn) { margin: 0; padding-inline: .5rem; background: var(--surface); border-color: var(--line); }

/* ── 기관 세부 화면(11/26, 팀원 화면의 모양을 우리 색으로 옮김) ──
   머리 상자: 베이지 바탕에 작은 글('○○형에 추천!') + 기관 이름, 오른쪽에 캐릭터 그림 */
.stApp .place-head {
  display: flex; align-items: center; justify-content: space-between; gap: .75rem;
  padding: .7rem .8rem .7rem 1rem; border-radius: var(--card-radius);
  background: #FBF0DE; border: 1px solid #EDDDC7;
}
.stApp .place-head > div { min-width: 0; }
.stApp .place-type { margin: 0 0 .2rem; color: var(--teal); font-size: 1.125rem; font-weight: 700; }
.stApp .place-title {
  margin: 0; padding: 0; color: var(--ink); font-size: clamp(1.6rem, 6.4vw, 2.1rem); line-height: 1.28;
  word-break: keep-all; overflow-wrap: anywhere;
}
.stApp .place-pic { flex: none; width: clamp(64px, 20vw, 92px); height: auto; }
.stApp .place-work { margin: 0; padding: 0; color: var(--ink); font-size: 1.375rem; line-height: 1.4; word-break: keep-all; }
/* 단추 줄(ui.place_actions): 나란히 놓고, 좁으면 다음 줄로 넘긴다. 높이 52px. 첫 단추만 짙은 바탕이다 */
.stApp .place-actions { display: flex; flex-wrap: wrap; gap: .5rem; }
.stApp .place-actions a {
  flex: 1 1 auto; min-height: 3.25rem; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
  padding: .55rem 1rem; border: 1.5px solid var(--line); border-radius: .85rem; background: var(--surface);
  color: var(--ink); font-size: 1.1875rem; font-weight: 700; line-height: 1.35; text-align: center; text-decoration: none;
  word-break: keep-all;
}
.stApp .place-actions a:first-child { background: var(--teal); border-color: var(--teal); color: #fff; }
@media (hover: hover) {
  .stApp .place-actions a:hover { border-color: var(--teal); }
}
/* 무엇이 걱정되세요?: 작은 단추들을 나란히. 누른 것은 물빛 바탕 + 굵은 청록 테두리. 높이 48px */
.stApp .st-key-worry_row { flex-direction: row; flex-wrap: wrap; gap: .5rem; }
.stApp .st-key-worry_row > div { width: auto; flex: 0 1 auto; min-width: 0; }
.stApp .st-key-worry_row .stButton > button {
  width: auto; min-height: 3rem; padding: .4rem .95rem; border-radius: 999px;
}
.stApp .st-key-worry_row .stButton > button p { font-size: 1.125rem; font-weight: 650; }
.stApp .st-key-worry_row .stButton > button[kind="primary"] { background: var(--aqua); border: 2px solid var(--teal); }
.stApp .st-key-worry_row .stButton > button[kind="primary"] p { color: var(--ink); }
.stApp .worry-answer {
  padding: .75rem 1rem; border-radius: var(--card-radius); background: var(--aqua); border: 1px solid #B8D0C2;
  color: var(--body); font-size: 1.1875rem; line-height: 1.6; word-break: keep-all;
}
.stApp .worry-answer b { color: var(--ink); }
/* 접힌 칸 '지원을 처음 경험할 때' 안의 줄: 물음(굵게) 아래에 답 */
.stApp .place-facts { margin: 0; }
.stApp .place-facts dt { margin-top: .7rem; color: var(--ink); font-size: 1.1875rem; font-weight: 700; }
.stApp .place-facts dt:first-child { margin-top: 0; }
.stApp .place-facts dd { margin: .1rem 0 0; color: var(--body); font-size: 1.1875rem; line-height: 1.6; word-break: keep-all; }

/* ── 센터 정보·다른 곳 목록 화면 맨 위의 한 줄(ui.title_row): '←' 단추 + 제목 ── */
.stApp .st-key-title_row { flex-direction: row; flex-wrap: nowrap; align-items: flex-start; gap: .7rem; }
.stApp .st-key-title_row > div { width: auto; min-width: 0; flex: 0 1 auto; }
.stApp .st-key-title_row > div:has(.stButton) { flex: none; }
.stApp .st-key-title_row .st-key-back_top button {
  width: 3.25rem; min-height: 3.25rem; padding: 0; border: 1.5px solid var(--teal); border-radius: .85rem;
}
.stApp .st-key-title_row .st-key-back_top button [data-testid="stIconMaterial"] { color: var(--teal); font-size: 1.7rem; }
/* 단추의 글('뒤로')은 화면 읽기 도구만 읽게 눈에는 숨긴다 */
.stApp .st-key-title_row .st-key-back_top button p {
  position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
.stApp .st-key-title_row .q-title { padding-top: .35rem; text-wrap: balance; }
/* 맨 아래 '← 결과로 돌아가기', 목록 화면의 곳 이름 줄: 왼쪽부터 쓰고 청록 테두리 */
.stApp :is(.st-key-back_bottom, [class*="st-key-open_"]) button { justify-content: flex-start; text-align: left; }
.stApp :is(.st-key-back_bottom, [class*="st-key-open_"]) button > div { justify-content: flex-start; }
.stApp .st-key-back_bottom button { border-color: var(--teal); }
.stApp .st-key-back_bottom button p { color: var(--teal); font-weight: 750; }
.stApp [class*="st-key-open_"] button p { text-align: left; }
.stApp [class*="st-key-open_"] button::after {
  content: ""; width: .55rem; height: .55rem; flex: none; margin-left: auto;
  border: solid var(--teal); border-width: 0 2.5px 2.5px 0; transform: rotate(-45deg);
}

/* 되묻는 창(st.dialog, main.restart_dialog). 창은 .stApp 밖에 그려져서 위의 규칙이 닿지 않는다.
   그래서 본문 글씨와 단추 모양(높이 62px, 노란 주요 단추)을 여기에 한 번 더 적는다 */
[data-testid="stDialog"] :where(h2, p, button) { font-family: var(--font-ui); word-break: keep-all; overflow-wrap: anywhere; }
[data-testid="stDialog"] [role="dialog"] { border-radius: var(--card-radius); background: var(--surface); }
[data-testid="stDialog"] [role="dialog"] :is(h2, [data-testid="stDialogHeader"]) {
  color: var(--ink); font-size: 1.55rem; font-weight: 750; line-height: 1.4;
}
[data-testid="stDialog"] [data-testid="stVerticalBlock"] { gap: .75rem; }
[data-testid="stDialog"] .body { margin: 0 0 .6rem; padding: 0; color: var(--body); font-size: 1.25rem; line-height: 1.62; }
[data-testid="stDialog"] .stButton > button {
  width: 100%; min-height: 3.875rem; box-sizing: border-box; padding: .68rem 1.1rem;
  background: var(--surface); color: var(--ink); border: 1.5px solid var(--line); border-radius: .85rem; box-shadow: none;
}
[data-testid="stDialog"] .stButton > button p { color: var(--ink); font-size: 1.25rem; line-height: 1.45; font-weight: 650; }
[data-testid="stDialog"] .stButton > button[kind="primary"] { background: var(--yellow); border-color: #857810; }
[data-testid="stDialog"] .stButton > button[kind="primary"] p { color: #202E27; font-weight: 750; }
[data-testid="stDialog"] :is(button, [role="button"]):focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }

@media (max-width: 420px) {
  .block-container { padding-inline: .85rem; }
  .stApp .st-key-q_card { padding: .95rem; }
  .stApp .card-facts { grid-template-columns: 1fr; gap: .05rem; }
  .stApp .card-facts dd + dt { margin-top: .42rem; }
}
@media (max-width: 600px) and (max-height: 740px) {
  .block-container { padding-top: 2.4rem; }
  .stApp .st-key-topbar { margin-bottom: 0; }
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
# 지도의 핀·별·손가락·바탕 그림(SVG)과, 상자 이름으로 핀을 고르는 규칙을 끝에 덧붙인다(ui/pins.py가 만든다)
CSS = CSS.replace("</style>", pins.css() + "</style>")


def apply() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
