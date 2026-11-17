"""55~64세 사용자를 위한 큰 글씨·큰 버튼 CSS.

기준: 본문 20px 이상, 문항 제목 24px 이상, 유형 이름 28px 이상, 줄간격 1.6 이상,
버튼 높이 56px 이상, 버튼 사이 간격 12px 이상. 휴대폰 세로 화면(폭 360~430px) 기준.
"""
import streamlit as st

CSS = """
<style>
.block-container { max-width: 560px; padding: 2.5rem 1rem 5rem; }
[data-testid="stSidebar"], [data-testid="stSidebarCollapsedControl"] { display: none; }

/* 본문 글씨 */
.stApp [data-testid="stMarkdownContainer"] p:not([class]),
.stApp [data-testid="stMarkdownContainer"] li { font-size: 20px; line-height: 1.7; color: #1a1a1a; }
/* 한글 낱말이 중간에 끊기지 않게 한다 */
.stApp p, .stApp li, .stApp div, .stApp a, .stApp button { word-break: keep-all; overflow-wrap: break-word; }
[data-testid="stVerticalBlock"] { gap: 14px; }

/* 버튼: 화면 폭 전체, 높이 60px */
.stButton > button { width: 100%; min-height: 60px; padding: 12px 16px; border-radius: 12px;
  border: 2px solid #0b5c5c; }
.stButton > button p { font-size: 21px !important; font-weight: 600; line-height: 1.4; }
.stButton > button[kind="secondary"] { background: #ffffff; }
.stApp .stButton > button[kind="secondary"] p { color: #0b5c5c; }
.stApp .stButton > button[kind="primary"] p { color: #ffffff; }
.stButton > button[kind="tertiary"] { border: none; min-height: 56px; }
.stApp .stButton > button[kind="tertiary"] p { color: #444444; font-weight: 500; text-decoration: underline; }
.stButton > button:focus-visible { outline: 4px solid #f2a900; outline-offset: 2px; }

/* 글 입력칸 */
.stTextArea textarea { font-size: 20px !important; line-height: 1.6; }
.stTextArea label p { font-size: 20px !important; font-weight: 600; }

/* 직접 만든 요소 (.stApp을 앞에 붙여 Streamlit 기본 글씨 크기보다 우선하게 한다) */
.stApp .q-progress { font-size: 20px; font-weight: 700; color: #0b5c5c; margin: 0; }
.stApp .q-title { font-size: 26px; font-weight: 700; line-height: 1.5; margin: 4px 0; color: #1a1a1a; }
.stApp .q-help { font-size: 20px; color: #444444; margin: 0; line-height: 1.6; }
.stApp .app-title { font-size: 30px; font-weight: 800; line-height: 1.4; margin: 0 0 4px; color: #1a1a1a; }
.stApp .type-box { background: #eef5f4; border-radius: 14px; padding: 18px; }
.stApp .type-label { font-size: 20px; color: #0b5c5c; font-weight: 700; margin: 0; }
.stApp .type-name { font-size: 30px; font-weight: 800; line-height: 1.4; margin: 2px 0 6px; color: #1a1a1a; }
.stApp .type-box p:not([class]) { font-size: 20px; line-height: 1.7; margin: 0; }
.stApp .notice { border: 2px solid #9a6700; background: #fff8e6; border-radius: 12px; padding: 14px 16px;
  margin: 4px 0 10px; font-size: 20px; line-height: 1.7; color: #1a1a1a; }
.stApp .notice.fail { border-color: #b3261e; background: #fdeceb; }
.stApp .notice.info { border-color: #0b5c5c; background: #eef5f4; }
.stApp .sec { font-size: 21px; font-weight: 800; color: #0b5c5c; margin: 10px 0 2px; }
.stApp .p-kind { display: inline-block; font-size: 20px; font-weight: 700; color: #0b5c5c; background: #eef5f4;
  border-radius: 8px; padding: 2px 10px; margin: 0 0 6px; }
.stApp .body { font-size: 20px; line-height: 1.7; margin: 0; color: #1a1a1a; }
.stApp ul.facts { margin: 0; padding-left: 24px; }
.stApp ul.facts li { font-size: 20px; line-height: 1.7; color: #1a1a1a; }
.stApp .area { font-size: 21px; font-weight: 800; color: #0b5c5c; margin: 12px 0 0; }
.stApp [data-testid="stExpander"] summary p { font-size: 21px !important; font-weight: 700; color: #0b5c5c; }
.stApp [data-testid="stExpander"] summary { min-height: 56px; }
.stApp .p-name { font-size: 25px; font-weight: 800; line-height: 1.4; margin: 0; color: #1a1a1a; }
.stApp .p-org { font-size: 20px; color: #444444; margin: 0; }
.stApp .reason { background: #eef5f4; border-left: 6px solid #0b5c5c; padding: 12px 14px; border-radius: 8px;
  font-size: 20px; line-height: 1.7; }
.stApp .say { background: #f4f4f4; border-radius: 10px; padding: 12px 14px; font-size: 20px; line-height: 1.7; }
.stApp .small-note { font-size: 20px; color: #444444; line-height: 1.6; }
.stApp a.a-btn { display: flex; align-items: center; justify-content: center; min-height: 60px; width: 100%;
  box-sizing: border-box; padding: 12px 16px; border-radius: 12px; border: 2px solid #0b5c5c;
  font-size: 21px; font-weight: 600; text-decoration: none; text-align: center; margin: 6px 0; }
.stApp a.a-btn.fill { background: #0b5c5c; color: #ffffff !important; }
.stApp a.a-btn.line { background: #ffffff; color: #0b5c5c !important; }
</style>
"""


def apply() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
