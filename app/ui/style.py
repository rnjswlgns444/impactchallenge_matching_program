"""55~64세 사용자를 위한 큰 글씨·큰 버튼 CSS.

기준: 본문 20px 이상, 문항 제목 24px 이상, 유형 이름 28px 이상, 줄간격 1.6 이상,
버튼 높이 56px 이상, 버튼 사이 간격 12px 이상. 휴대폰 세로 화면(폭 360~430px) 기준.

색은 세 가지만 쓴다: 흰 바탕, 거의 검은 글자, 노란 포인트. 색 값은 아래 :root 한 곳에서 고친다.
노란색은 바탕 칠로만 쓴다. 흰 바탕 위의 노란 글자나 노란 테두리는 보이지 않는다.
"""
import streamlit as st

# 말풍선 모양 로고. 직접 그린 것이며 다른 회사의 로고가 아니다.
LOGO = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'>"
        "<path d='M24 5C12.4 5 3 12.6 3 22c0 5.9 3.7 11.1 9.4 14.2L10.5 44l8.8-5.4c1.5.3 3.1.4 4.7.4 "
        "11.6 0 21-7.6 21-17S35.6 5 24 5z' fill='%23FEE500' stroke='%23191919' stroke-width='2.5' "
        "stroke-linejoin='round'/><circle cx='24' cy='19' r='5' fill='%23191919'/>"
        "<path d='M24 33l-6-9h12z' fill='%23191919'/><circle cx='24' cy='19' r='2' fill='%23FEE500'/></svg>")

CSS = """
<style>
:root {
  --yellow: #FEE500; --yellow-deep: #F5D400; --yellow-wash: #FFFBE3; --yellow-soft: #FFF6BF;
  --ink: #191919; --ink-sub: #4a4a4a; --line: #8c8c8c; --line-soft: #e4e1d6; --gray: #f4f3ef; --white: #ffffff;
  --shadow: 0 1px 2px rgba(25,25,25,.06), 0 8px 24px rgba(25,25,25,.08);
}
.stApp { background: linear-gradient(165deg, var(--yellow-wash) 0%, var(--white) 42%, var(--gray) 100%) fixed; }
[data-testid="stHeader"] { background: transparent; }
.block-container { max-width: 560px; padding: 2.5rem 1rem 5rem; }
[data-testid="stSidebar"], [data-testid="stSidebarCollapsedControl"] { display: none; }

/* 본문 글씨 */
.stApp [data-testid="stMarkdownContainer"] p:not([class]),
.stApp [data-testid="stMarkdownContainer"] li { font-size: 20px; line-height: 1.7; color: var(--ink); }
/* 한글 낱말이 중간에 끊기지 않게 한다 */
.stApp p, .stApp li, .stApp div, .stApp a, .stApp button { word-break: keep-all; overflow-wrap: break-word; }
[data-testid="stVerticalBlock"] { gap: 14px; }

/* 버튼: 화면 폭 전체, 높이 64px */
.stButton > button, .stFormSubmitButton > button { width: 100%; min-height: 64px; padding: 12px 16px;
  border-radius: 16px; border: 2px solid var(--line); background: var(--white); }
.stButton > button p, .stFormSubmitButton > button p { font-size: 21px !important; font-weight: 600; line-height: 1.4; }
.stApp .stButton > button p, .stApp .stFormSubmitButton > button p { color: var(--ink); }
.stButton > button:hover, .stFormSubmitButton > button:hover { border-color: var(--ink); background: var(--white); }
/* 주요 단추와 고른 단추: 노란 바탕에 검은 글자 */
.stButton > button[kind="primary"], .stFormSubmitButton > button[kind="primaryFormSubmit"] {
  background: var(--yellow); border-color: var(--yellow-deep); box-shadow: 0 6px 16px rgba(245,212,0,.4); }
.stButton > button[kind="primary"]:hover, .stFormSubmitButton > button[kind="primaryFormSubmit"]:hover,
.stButton > button[kind="primary"]:active, .stFormSubmitButton > button[kind="primaryFormSubmit"]:active {
  background: var(--yellow-deep); border-color: var(--ink); }
.stApp .stButton > button[kind="primary"] p, .stApp .stFormSubmitButton > button p { font-weight: 800; }
.stButton > button:disabled { background: var(--gray); border-color: var(--line-soft); box-shadow: none; }
.stApp .stButton > button:disabled p { color: var(--ink-sub); }
.stButton > button[kind="tertiary"], .stButton > button[kind="tertiary"]:hover {
  border: none; background: transparent; min-height: 56px; box-shadow: none; }
.stApp .stButton > button[kind="tertiary"] p { color: var(--ink-sub); font-weight: 500; text-decoration: underline; }
.stButton > button:focus-visible, .stFormSubmitButton > button:focus-visible, .stApp a.a-btn:focus-visible {
  outline: 3px solid var(--ink); outline-offset: 3px; }

/* 고르는 단추: 왼쪽에 동그라미를 두고 글은 왼쪽부터 쓴다. 고르면 동그라미가 채워진다 */
.stApp [class*="st-key-opt_"] button, .stApp [class*="st-key-detail_"] button {
  justify-content: flex-start; gap: 14px; text-align: left; }
.stApp [class*="st-key-opt_"] button > div, .stApp [class*="st-key-detail_"] button > div,
.stApp [class*="st-key-opt_"] button > div > span, .stApp [class*="st-key-detail_"] button > div > span {
  flex: 1; width: 100%; justify-content: flex-start; text-align: left; }
.stApp [class*="st-key-opt_"] button p, .stApp [class*="st-key-detail_"] button p { text-align: left; width: 100%; }

/* 기관 카드(테두리 상자): 흰 바탕, 둥근 모서리, 은은한 그림자 */
.stApp [data-testid="stVerticalBlock"]:has(> [data-testid="stElementContainer"] .p-name) {
  background: var(--white); border: 1px solid var(--line-soft); border-radius: 20px; box-shadow: var(--shadow);
  padding: 20px 16px; }
.stApp [data-testid="stExpander"] details { background: var(--white); border-radius: 16px; }

/* 입력칸: 흰 바탕에 또렷한 테두리 */
.stApp .stTextArea [data-baseweb="textarea"], .stApp .stNumberInput [data-baseweb="input"] {
  background: var(--white) !important; border: 2px solid var(--line) !important; border-radius: 16px !important; }
.stApp .stTextArea [data-baseweb] > div, .stApp .stTextArea textarea,
.stApp .stNumberInput [data-baseweb] > div, .stApp .stNumberInput input { background: var(--white) !important; }
.stApp .stTextArea [data-baseweb="textarea"]:focus-within, .stApp .stNumberInput [data-baseweb="input"]:focus-within {
  border-color: var(--ink) !important; }
.stApp [class*="st-key-opt_"] button::before, .stApp [class*="st-key-detail_"] button::before {
  content: ""; flex: none; width: 26px; height: 26px; border-radius: 50%; box-sizing: border-box;
  border: 2px solid var(--line); background: var(--white); }
.stApp [class*="st-key-opt_"] button[kind="primary"], .stApp [class*="st-key-detail_"] button[kind="primary"],
.stApp [class*="st-key-browse_"] button[kind="primary"] { border-color: var(--ink); box-shadow: none; }
.stApp [class*="st-key-opt_"] button[kind="primary"]::before,
.stApp [class*="st-key-detail_"] button[kind="primary"]::before {
  border: 8px solid var(--ink); background: var(--yellow); }

/* 질문 카드 */
.stApp .st-key-q_card { background: var(--white); border-radius: 20px; box-shadow: var(--shadow); padding: 24px 16px;
  margin-top: 8px; }

/* 선택지가 많은 질문의 '다음' 단추는 화면 아래에 붙여 둔다 */
.stApp [class*="st-key-next_"]:has(button[kind="primary"]) { position: sticky; bottom: 12px; z-index: 50;
  background: var(--white); border-radius: 16px; box-shadow: 0 0 0 8px rgba(255,255,255,.92); }
.stApp [data-testid="stForm"] { padding: 0; border: none; }

/* 숫자 입력칸 */
.stNumberInput input { font-size: 24px !important; min-height: 60px; }
.stNumberInput input::placeholder { font-size: 18px; }

/* 글 입력칸 */
.stTextArea textarea { font-size: 20px !important; line-height: 1.6; }
.stTextArea label p { font-size: 20px !important; font-weight: 600; }

/* 직접 만든 요소 (.stApp을 앞에 붙여 Streamlit 기본 글씨 크기보다 우선하게 한다) */
.stApp .topbar { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: var(--ink);
  margin: 0 0 8px; padding: 0 0 12px; border-bottom: 1px solid var(--line-soft); }
.stApp .logo { display: inline-block; flex: none; width: 32px; height: 32px;
  background: url("LOGO_URL") center / contain no-repeat; }
.stApp .logo.big { display: block; width: 88px; height: 88px; margin: 8px auto 0; }
.stApp .center { text-align: center; }
.stApp .steps { display: flex; flex-direction: column; gap: 12px; margin: 4px 0; }
.stApp .step { display: flex; align-items: center; gap: 14px; background: var(--white); border-radius: 16px;
  box-shadow: var(--shadow); padding: 16px; }
.stApp .step .num { flex: none; width: 44px; height: 44px; border-radius: 50%; background: var(--yellow-soft);
  display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: var(--ink); }
.stApp .step p { margin: 0; font-size: 20px; line-height: 1.5; font-weight: 600; color: var(--ink); }
.stApp .q-progress { display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
  font-size: 20px; font-weight: 700; color: var(--ink); margin: 0; }
.stApp .bar { height: 14px; border-radius: 99px; background: var(--white); border: 2px solid var(--ink);
  overflow: hidden; box-sizing: border-box; }
.stApp .bar i { display: block; height: 100%; background: var(--yellow); border-right: 2px solid var(--ink);
  box-sizing: border-box; }
.stApp .q-title { font-size: 26px; font-weight: 800; line-height: 1.5; margin: 4px 0; color: var(--ink); }
.stApp .st-key-q_card .q-title { text-align: center; }
.stApp .q-help { font-size: 20px; color: var(--ink-sub); margin: 0; line-height: 1.6; }
.stApp .st-key-q_card .q-help { text-align: center; }
.stApp .app-title { font-size: 30px; font-weight: 800; line-height: 1.4; margin: 0 0 4px; color: var(--ink); }
.stApp .type-box { background: linear-gradient(150deg, var(--yellow) 0%, var(--yellow-deep) 100%);
  border-radius: 20px; padding: 26px 20px; text-align: center; margin-top: 12px; }
.stApp .type-label { font-size: 20px; color: var(--ink); font-weight: 700; margin: 0; }
.stApp .type-name { font-size: 32px; font-weight: 800; line-height: 1.35; margin: 4px 0 8px; color: var(--ink); }
.stApp .type-box p:not([class]) { font-size: 20px; line-height: 1.7; margin: 0; color: var(--ink); }
.stApp .notice { border: 2px solid #9a6700; background: #fff8e6; border-radius: 16px; padding: 14px 16px;
  margin: 4px 0 10px; font-size: 20px; line-height: 1.7; color: var(--ink); }
.stApp .notice.fail { border-color: #b3261e; background: #fdeceb; }
.stApp .notice.info { border: 1px solid var(--line-soft); background: var(--white); }
.stApp .sec { font-size: 21px; font-weight: 800; color: var(--ink); margin: 10px 0 2px; }
.stApp .p-kind { display: inline-block; font-size: 18px; font-weight: 700; color: var(--ink); background: var(--gray);
  border-radius: 99px; padding: 4px 14px; margin: 0 0 6px; }
.stApp .body { font-size: 20px; line-height: 1.7; margin: 0; color: var(--ink); }
.stApp ul.facts { margin: 0; padding-left: 24px; }
.stApp ul.facts li { font-size: 20px; line-height: 1.7; color: var(--ink); }
.stApp .area { font-size: 21px; font-weight: 800; color: var(--ink); margin: 12px 0 0; }
.stApp [data-testid="stExpander"] summary p { font-size: 21px !important; font-weight: 700; color: var(--ink); }
.stApp [data-testid="stExpander"] summary { min-height: 56px; }
.stApp .p-name { font-size: 25px; font-weight: 800; line-height: 1.4; margin: 0; color: var(--ink); }
.stApp .p-org { font-size: 20px; color: var(--ink-sub); margin: 0; }
.stApp .reason { background: var(--gray); padding: 14px 18px; border-radius: 4px 20px 20px 20px;
  font-size: 20px; line-height: 1.7; color: var(--ink); }
.stApp .say { background: var(--yellow); padding: 14px 18px; border-radius: 20px 4px 20px 20px;
  font-size: 20px; line-height: 1.7; color: var(--ink); }
.stApp .small-note { font-size: 20px; color: var(--ink-sub); line-height: 1.6; }
.stApp a.a-btn { display: flex; align-items: center; justify-content: center; min-height: 64px; width: 100%;
  box-sizing: border-box; padding: 12px 16px; border-radius: 16px; border: 2px solid var(--ink);
  font-size: 21px; font-weight: 700; text-decoration: none; text-align: center; margin: 6px 0; }
.stApp a.a-btn { flex-direction: column; line-height: 1.5; }
.stApp .nowrap { white-space: nowrap; }
.stApp .share { background: var(--white); border-radius: 20px; box-shadow: var(--shadow); padding: 24px 16px;
  text-align: center; margin-top: 8px; }
.stApp .share .share-status { margin: 8px 0 0; word-break: break-all; }
.stApp .share .share-status:empty { display: none; }
.stApp a.a-btn.fill { background: var(--yellow); border-color: var(--yellow-deep); color: var(--ink) !important; }
.stApp a.a-btn.line { background: var(--white); color: var(--ink) !important; }
</style>
""".replace("LOGO_URL", LOGO)


def apply() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
