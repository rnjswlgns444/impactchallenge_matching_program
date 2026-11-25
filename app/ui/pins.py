"""첫걸음 지도의 핀 그림. 정보표(programs.csv)의 '핀그림' 칸에 적은 낱말마다 핀 하나를 SVG로 그린다.

화면과 무관한 글자만 만든다. style.py가 이 그림들을 CSS 변수(--pin-이름)로 넣고,
components.place_map이 곳마다 어느 핀을 쓸지 상자 이름(pinbox_..._k_이름)으로 알려 준다.
낱말 묶음은 loader.PIN_WORDS가 정한다. 낱말을 더하려면 loader.PIN_WORDS와 아래 WORDS·ICONS에 함께 더한다
(test_every_pin_word_has_a_picture가 어긋남을 잡는다).
"""
from __future__ import annotations

from urllib.parse import quote

# 색은 style.py의 :root 값과 같다. SVG 글 안에는 CSS 변수를 못 써서 여기에 한 번 더 적는다
TEAL, CLAY, INK, YELLOW, WHITE = "#12675F", "#984A32", "#143F3C", "#FEE500", "#FFFFFF"

# 정보표의 낱말 → CSS에 쓰는 영어 이름
WORDS = {
    "건강": "health", "상담": "talk", "일": "work", "가게": "shop", "배움": "learn", "문화": "culture",
    "운동": "sport", "모임": "group", "봉사": "help", "돌봄": "care", "돈": "money", "혜택": "gift",
    "전화": "phone", "온라인": "online",
}
DEFAULT, MORE = "place", "more"          # 낱말이 없는 곳의 기본 핀, '다른 곳 n곳' 핀
REMOTE = ("phone", "online")             # 찾아가지 않고 쓰는 곳. 물방울 모양 대신 둥근 흙색 핀으로 구분한다

# 핀 안의 그림. 24×24 칸에 선으로 그린다
ICONS = {
    "health": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "talk": '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
    "work": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    "shop": '<path d="M5 11v9h14v-9"/><path d="M3 9l2-5h14l2 5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M10 20v-5h4v5"/>',
    "learn": '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13"/>',
    "culture": '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    "sport": '<path d="M3.5 9.5v5M6.5 7v10M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
    "group": '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14c2.7.2 4.5 2 4.5 5"/>',
    "help": '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11 4.5a1.5 1.5 0 0 1 3 0V11 6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.4L4 14.2a1.5 1.5 0 0 1 2.5-1.6z"/>',
    "care": '<path d="M4 11l8-7 8 7v9H4z"/><path d="M12 17.5s-3-1.9-3-4.2a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2.3-3 4.2-3 4.2z"/>',
    "money": '<circle cx="12" cy="12" r="8.5"/><path d="M8 9l1.6 6 2.4-5 2.4 5L16 9M7.5 12h9"/>',
    "gift": '<rect x="4.5" y="11" width="15" height="9" rx="1"/><path d="M3 7.5h18V11H3zM12 7.5V20M12 7.5c-2.2-4.2-6.2-2-4 0M12 7.5c2.2-4.2 6.2-2 4 0"/>',
    "phone": '<path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a3 3 0 0 1-3 3A15 15 0 0 1 3 6a3 3 0 0 1 3-3z"/>',
    "online": '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
    DEFAULT: '<circle cx="12" cy="12" r="4.5"/>',
    MORE: '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="3.4"/>',
}


def _url(svg: str) -> str:
    return 'url("data:image/svg+xml,' + quote(svg, safe="") + '")'


def pin(name: str) -> str:
    """핀 그림 한 장(CSS에 넣을 url(...) 값).

    찾아가는 곳은 청록 물방울, 전화·온라인으로 쓰는 곳은 흙색 동그라미, '다른 곳'은 점선 동그라미다.
    모양·색·안의 그림이 모두 달라서 색을 구분하기 어려운 분도 알아볼 수 있다.
    """
    if name == MORE:
        color, center = TEAL, 30
        base = f'<circle cx="24" cy="30" r="20" fill="{WHITE}" stroke="{color}" stroke-width="2.5" stroke-dasharray="5 4"/>'
    elif name in REMOTE:
        color, center = CLAY, 30
        base = (f'<circle cx="24" cy="30" r="21" fill="{color}" stroke="{WHITE}" stroke-width="2"/>'
                f'<circle cx="24" cy="30" r="15" fill="{WHITE}"/>')
    else:
        color, center = TEAL, 22.5
        base = (f'<path d="M24 2C12 2 3 11 3 22.5 3 37 24 58 24 58s21-21 21-35.5C45 11 36 2 24 2z" fill="{color}" '
                f'stroke="{WHITE}" stroke-width="2"/><circle cx="24" cy="22.5" r="14.5" fill="{WHITE}"/>')
    icon = (f'<g transform="translate(14.4,{center - 9.6}) scale(.8)" fill="none" stroke="{color}" stroke-width="2.3" '
            f'stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g>')
    return _url(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60">{base}{icon}</svg>')


def star() -> str:
    """AI가 고른 곳의 핀에 붙는 작은 별."""
    return _url('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 '
                f'5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" fill="{YELLOW}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/></svg>')


def hand() -> str:
    """첫 핀 옆의 손가락 그림. '눌러 보세요'를 글 없이 알린다."""
    return _url('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="none" stroke="' + CLAY + '" stroke-width="2" '
                'stroke-linecap="round"><path d="M6.5 7.5 4 5M12 5V1.5M17.5 7.5 20 5"/></g><path d="M10 17V9.5a2 2 0 0 1 4 0V15l7.6 1.5a2.5 '
                '2.5 0 0 1 2 2.8l-.8 6a4 4 0 0 1-4 3.7h-5a4 4 0 0 1-3.2-1.6L6 21.2a1.8 1.8 0 0 1 2.8-2.2z" '
                f'fill="{WHITE}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/></svg>')


def map_art() -> str:
    """지도 바탕: 물(호수)과 굽은 길. 상자 크기에 맞춰 늘어난다. 실제 지도가 아니라 꾸밈 그림이다."""
    road = "M-6 13C34 6 46 24 34 37S50 58 78 55 96 70 60 80 30 96 110 97"
    return _url('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">'
                '<path d="M64 -4C58 8 66 20 80 21S104 12 104 -4z" fill="#C9E3EA"/>'
                '<path d="M70 4c5-2 9 2 14 0M74 11c4-2 8 2 12 0" fill="none" stroke="#FFFFFF" stroke-width="2" '
                'stroke-linecap="round" vector-effect="non-scaling-stroke"/><g fill="none" stroke-linecap="round">'
                f'<path d="{road}" stroke="#FFF2C7" stroke-width="34" vector-effect="non-scaling-stroke"/>'
                f'<path d="{road}" stroke="#CC8A51" stroke-width="2.5" stroke-dasharray="2 11" vector-effect="non-scaling-stroke"/>'
                '</g></svg>')


def css() -> str:
    """style.py에 끼워 넣는 CSS: 그림 변수와, 상자 이름에 따라 핀을 고르는 규칙."""
    names = list(dict.fromkeys(list(WORDS.values()) + [DEFAULT, MORE]))
    variables = "".join(f"  --pin-{name}: {pin(name)};\n" for name in names)
    rules = "".join(f'.stApp .st-key-place_map [class*="_k_{name}"] {{ --pin: var(--pin-{name}); }}\n' for name in names)
    return (":root {\n" + variables + f"  --pin-star: {star()};\n  --pin-hand: {hand()};\n  --map-art: {map_art()};\n}}\n" + rules)
