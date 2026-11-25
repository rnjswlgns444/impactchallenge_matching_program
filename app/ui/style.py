"""50~60대 사용자를 위한 큰 글씨·큰 버튼 CSS. (11/21 팀원 디자인: 연녹색 바탕, 청록 글자, 노란 주요 단추)

기준: 본문 20px(1.25rem), 문항 제목 25px 이상, 줄간격 1.5 이상, 버튼 높이 62px(3.875rem).
예외 둘(11/25 사용자 결정): 맨 위 띠의 '처음으로' 단추는 44px, 유의사항 글(.fine)은 10px이다.
휴대폰 세로 화면(폭 320~430px) 기준. 색 값은 아래 :root 한 곳에서 고친다.
노란색은 주요 단추의 바탕 칠과 맨 위 띠에 쓴다(시작 화면 그림 상자의 연노랑은 예외이고 home.css에 있다). 고른 답은 물빛 바탕과 굵은 청록 테두리로 구분한다.
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
  font-size: 1.125rem; color: var(--muted); line-height: 1.6;
}
/* 동점 선택지 아래의 '예: 기관 · 프로그램'. 어느 단추의 예인지 알 수 있게 위 단추에 붙인다 */
.stApp .example-note { margin: -.4rem 0 .5rem; padding-left: .3rem; }

/* 맨 위 띠(ui.topbar): 노란 바탕, 왼쪽에 앱 이름과 작은 풀이, 오른쪽에 '처음으로' 단추(있을 때만).
   상자(st-key-topbar) 안의 글 하나와 단추 하나를 한 줄에 놓는다. 넓은 화면에서는 본문 폭의 둥근 띠,
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
/* 띠의 '처음으로': 흰 알약 모양의 작은 단추. 높이 44px */
.stApp .st-key-topbar .st-key-to_start button {
  width: auto; min-height: 2.75rem; padding: 0 .85rem; gap: .3rem;
  border: 1.5px solid var(--ink); border-radius: 999px; background: var(--surface);
}
.stApp .st-key-topbar .st-key-to_start button p { font-size: 1.0625rem; font-weight: 700; white-space: nowrap; }
@media (max-width: 340px) {
  .stApp .st-key-topbar .st-key-to_start button { padding: 0 .65rem; }
}
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
.stApp [class*="st-key-browse_T"] button::after {
  content: ""; width: .5rem; height: .5rem; flex: none; margin-left: auto;
  border: solid var(--teal); border-width: 0 2px 2px 0; transform: rotate(45deg);
}
.stApp [class*="st-key-browse_T"] button[kind="primary"]::after { transform: rotate(225deg); }

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

.stApp :is([data-area="work"], .st-key-type_hero:has([data-area="work"])) {
  --area-ink: var(--teal); --area-wash: var(--aqua); --area-rule: #B8D0C2;
}
.stApp :is([data-area="leisure"], .st-key-type_hero:has([data-area="leisure"])) {
  --area-ink: var(--clay); --area-wash: #FBEEDE; --area-rule: #DDC4AD;
}
.stApp :is([data-area="life"], .st-key-type_hero:has([data-area="life"])) {
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

/* 따라다니는 목차(대표 유형이 있는 결과 화면). 휴대폰: 유형 상자 아래에 있다가 스크롤하면 화면 위에 붙는 얇은 띠.
   sticky는 띠가 아니라 Streamlit이 씌운 바깥 껍데기에 준다. 띠에 주면 껍데기 높이 안에서만 붙어서 따라오지 않는다 */
.stApp [data-testid="stElementContainer"]:has(nav.toc) { position: sticky; top: 0; z-index: 5; }
.stApp .toc { --toc-h: 3rem; background: var(--canvas); border-bottom: 1px solid var(--rule); }
.stApp .toc-head, .stApp .toc-title, .stApp .toc-long { display: none; }
.stApp .toc-row {
  display: flex; align-items: stretch; margin: 0; padding: 0; list-style: none;
  overflow-x: auto; scrollbar-width: none;
}
.stApp .toc-row::-webkit-scrollbar { display: none; }
.stApp .toc-row li { flex: 1 0 auto; display: flex; margin: 0; padding: 0; }
.stApp .toc a {
  flex: 1; min-height: var(--toc-h); display: flex; align-items: center; justify-content: center; gap: .3em;
  padding: 0 .2rem; white-space: nowrap; text-decoration: none; color: var(--ink);
  font-size: clamp(1rem, 4.4vw, 1.125rem); font-weight: 650;
}
.stApp .toc-num { color: var(--teal); font-weight: 750; }
.stApp .toc a.toc-act > span {
  display: flex; align-items: center; min-height: 2.25rem; padding: 0 .6rem;
  border: 1.5px solid var(--line); border-radius: 999px; background: var(--surface);
}
.stApp .toc li.toc-wide-only { display: none; }
/* 목차를 눌러 내려갔을 때 띠가 구역 제목을 가리지 않게, 제목 위에 띠 높이만큼 자리를 둔다 */
.stApp [id^="sec-"] { scroll-margin-top: 4.25rem; }
[data-testid="stMain"] { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { [data-testid="stMain"] { scroll-behavior: auto; } }
/* 넓은 화면: 본문(42rem) 오른쪽에 뜨는 상자 */
@media (min-width: 1180px) {
  .stApp [data-testid="stElementContainer"]:has(nav.toc) { position: static; }
  .stApp .toc {
    position: fixed; top: 5.5rem; left: calc(50% + 21rem + 1.25rem); width: 14rem; z-index: 5;
    padding: 1rem; background: var(--surface); border: 1px solid var(--rule); border-radius: var(--card-radius);
  }
  .stApp .toc-head { display: block; padding-bottom: .85rem; border-bottom: 1px solid var(--rule); }
  .stApp .toc-head .toc-label { margin: 0; font-size: 1rem; color: var(--muted); line-height: 1.4; }
  .stApp .toc-head .toc-name { margin: 0; font-size: 1.25rem; font-weight: 750; color: var(--ink); line-height: 1.4; }
  .stApp .toc-title { display: block; margin: .85rem 0 .25rem; font-size: 1rem; font-weight: 700; color: var(--muted); }
  .stApp .toc-row { flex-direction: column; padding: 0; overflow: visible; }
  .stApp .toc-short { display: none; }
  .stApp .toc-long { display: inline; }
  .stApp .toc a { justify-content: flex-start; white-space: normal; padding: 0 .6rem; font-size: 1.125rem; }
  .stApp .toc li.toc-wide-only { display: flex; }
  .stApp .toc li.toc-first-act { margin-top: .75rem; }
  .stApp .toc a.toc-act { padding: .3rem 0; }
  .stApp .toc a.toc-act > span { flex: 1; justify-content: center; min-height: 3rem; border-radius: .85rem; }
  .stApp [id^="sec-"] { scroll-margin-top: 1.5rem; }
}
@media (hover: hover) {
  .stApp .toc a:hover { background: #F0F5EB; }
  .stApp .toc a.toc-act:hover { background: none; }
  .stApp .toc a.toc-act:hover > span { border-color: var(--teal); background: #F0F5EB; }
}

/* 대표 유형 아래의 구역 제목: 번호 동그라미 + 제목. 구역은 선이 아니라 위 여백으로 나눈다 */
.stApp .sec-head { display: flex; align-items: center; gap: .65rem; margin: 1.1rem 0 0; }
.stApp .sec-num {
  flex: none; width: 2.1rem; height: 2.1rem; border-radius: 50%; background: var(--aqua); color: var(--teal);
  display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 750;
}
.stApp .save-head { margin-top: 1.1rem; }

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


def apply() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
