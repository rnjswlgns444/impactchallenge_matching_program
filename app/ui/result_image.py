"""'내 결과 저장하기'의 사진을 그린다. 세로 1080×1350 PNG 한 장.

화면(Streamlit)과 무관한 순수 함수다. 글자와 그림 경로만 받으므로 설문 답·점수·전화번호가 사진에 들어갈 길이 없다.
들어가는 것: 앱 이름, 캐릭터 그림, 유형 이름과 설명, 특징 글, 곳 이름(프로그램명·기관명) 최대 3곳, 맨 아래 글.
치수는 1080×1350 기준 px이다. 가장자리가 매끄럽도록 두 배로 그린 뒤 줄인다.
서버(리눅스)에는 한글 글꼴이 없어서 assets/fonts의 글꼴 파일을 쓴다.
"""
from __future__ import annotations

import io
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1080, 1350
MAX_PLACES = 3
SCALE = 2                                    # 두 배로 그리고 줄인다
FONT_DIR = Path(__file__).resolve().parent / "assets" / "fonts"

# 색은 style.py의 :root 값과 같다
CANVAS, INK, BODY, MUTED, TEAL, RULE = "#F8FBF7", "#143F3C", "#263C37", "#4B615A", "#12675F", "#D3E1D8"
YELLOW, YELLOW_RULE, PILL_INK = "#FEE500", "#857810", "#202E27"
AREA_COLORS = {                              # 영역별 유형 상자의 (바탕, 테두리). style.py의 --area-wash / --area-rule
    "work": ("#DDF4EC", "#B8D0C2"), "leisure": ("#FBEEDE", "#DDC4AD"), "life": ("#E8F1F2", "#B2CBD0"),
}
PLAIN_COLORS = ("#DDF4EC", "#B8D0C2")        # 대표 유형이 없을 때의 제목 상자

PAD_X, PAD_TOP, PAD_BOTTOM = 64, 48, 40
TOP_H, FOOT_H, GAP, MID_GAP = 52, 40, 24, 28
BOX_W = WIDTH - 2 * PAD_X                    # 952
CHAR_MAX, CHAR_MIN = 320, 200
FEATURE_MAX_LINES = 6
# 글자 크기와 줄 높이(px). 휴대폰에서는 사진이 0.36배쯤으로 보이므로 본문을 36px 아래로 줄이지 않는다
STATE, FEATURE, HEADING, NAME, ORG = (36, 50), (36, 50), (30, 42), (38, 50), (28, 38)


@lru_cache(maxsize=None)
def _font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    name = "Pretendard-Bold.otf" if bold else "Pretendard-Regular.otf"
    return ImageFont.truetype(str(FONT_DIR / name), size * SCALE)


def _width(text: str, font) -> float:
    return font.getlength(text) / SCALE


def _clip(text: str, font, width: int) -> str:
    """한 줄에 들어가게 자르고 끝에 …을 붙인다."""
    if _width(text, font) <= width:
        return text
    while text and _width(text + "…", font) > width:
        text = text[:-1]
    return text.rstrip() + "…"


def wrap(text: str, font, width: int, max_lines: int) -> list[str]:
    """낱말 단위로 줄을 바꾼다(한글이 낱말 중간에서 끊기지 않게). 한 낱말이 너무 길 때만 글자 단위로 끊는다.

    max_lines를 넘으면 마지막 줄 끝에 …을 붙인다.
    """
    lines: list[str] = []
    line = ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if _width(trial, font) <= width:
            line = trial
            continue
        if line:
            lines.append(line)
        while _width(word, font) > width:                 # 한 낱말이 한 줄보다 길다
            cut = len(word)
            while cut > 1 and _width(word[:cut], font) > width:
                cut -= 1
            lines.append(word[:cut])
            word = word[cut:]
        line = word
    if line:
        lines.append(line)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = _clip(lines[-1] + "…", font, width)
    return lines


class _Pen:
    """1080×1350 기준 치수로 그리면 두 배 크기 그림에 옮겨 그린다."""

    def __init__(self) -> None:
        self.image = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), CANVAS)
        self.draw = ImageDraw.Draw(self.image)

    def box(self, x, y, w, h, radius, fill, outline=None, line=0) -> None:
        self.draw.rounded_rectangle([x * SCALE, y * SCALE, (x + w) * SCALE, (y + h) * SCALE], radius=radius * SCALE,
                                    fill=fill, outline=outline, width=line * SCALE)

    def text(self, x, y, value, font, fill, line_height) -> None:
        """줄 높이(line_height) 안에서 글자를 세로 가운데에 둔다."""
        self.draw.text((x * SCALE, (y + line_height / 2) * SCALE), value, font=font, fill=fill, anchor="lm")

    def centered(self, y, value, font, fill, line_height) -> None:
        self.draw.text((WIDTH / 2 * SCALE, (y + line_height / 2) * SCALE), value, font=font, fill=fill, anchor="mm")

    def lines(self, x, y, values, font, fill, line_height, center=False) -> int:
        for value in values:
            if center:
                self.centered(y, value, font, fill, line_height)
            else:
                self.text(x, y, value, font, fill, line_height)
            y += line_height
        return y

    def logo(self, x, y, size) -> None:
        """해와 물결 표식을 단순하게 그린다. 사진 맨 위, 앱 이름 왼쪽에 들어간다."""
        self.box(x, y, size, size, 14, INK)
        sun = [(x + size * .21) * SCALE, (y + size * .18) * SCALE, (x + size * .63) * SCALE, (y + size * .68) * SCALE]
        self.draw.pieslice(sun, 180, 360, fill="#FFBF6C")
        for top in (.48, .69):
            self.draw.line([(x + size * .17) * SCALE, (y + size * top) * SCALE,
                            (x + size * .83) * SCALE, (y + size * top) * SCALE], fill="#8EDFCB", width=3 * SCALE)

    def picture(self, path: Path, y, size) -> None:
        with Image.open(path) as source:
            art = source.convert("RGBA")
        art.thumbnail((size * SCALE, size * SCALE), Image.LANCZOS)
        left = (WIDTH * SCALE - art.width) // 2
        top = int(y * SCALE) + (size * SCALE - art.height) // 2
        self.image.paste(art, (left, top), art)

    def png(self) -> bytes:
        out = io.BytesIO()
        self.image.resize((WIDTH, HEIGHT), Image.LANCZOS).save(out, format="PNG", optimize=True)
        return out.getvalue()


def render(title: str, team: str, footer: str, places_heading: str, places: list[tuple[str, str]],
           type_name: str = "", statement: str = "", feature: str = "", area: str = "",
           character: Path | None = None, plain_title: str = "") -> bytes:
    """결과 사진(PNG)을 돌려준다.

    places는 (프로그램명, 기관명) 목록이고 앞의 3개까지만 쓴다. 고르기는 부르는 쪽(candidates가 거른 후보)이 한다.
    type_name이 있으면 유형 상자(그림·이름·설명)와 특징 글을 그리고, 없으면 plain_title을 제목 상자로 그린다.
    자리가 모자라면 그림을 먼저 줄이고, 그래도 넘치면 마지막 곳을 뺀다.
    """
    places = [(name.strip(), org.strip()) for name, org in places if name.strip()][:MAX_PLACES]
    has_art = bool(type_name) and character is not None and Path(character).is_file()

    f_app, f_team, f_foot = _font(True, 32), _font(False, 26), _font(False, 28)
    f_pill, f_state, f_feature = _font(True, 48), _font(False, STATE[0]), _font(False, FEATURE[0])
    f_title, f_heading, f_name, f_org = _font(True, 46), _font(True, HEADING[0]), _font(True, NAME[0]), _font(False, ORG[0])

    inner = BOX_W - 2 * 36                                   # 유형 상자 안쪽 폭
    text_w = BOX_W - 2 * 12                                  # 특징·곳 구역의 글 폭
    state_lines = wrap(statement, f_state, inner, 2) if type_name else []
    title_lines = wrap(plain_title, f_title, inner, 3) if not type_name else []
    feature_lines = wrap(feature, f_feature, text_w, FEATURE_MAX_LINES) if type_name and feature else []
    pill_text = _clip(type_name, f_pill, inner - 2 * 52) if type_name else ""

    def measure(shown: list[tuple[str, str]], art: int) -> tuple[int, int, int, list[list[str]]]:
        """(유형 상자 높이, 특징 높이, 곳 구역 높이, 곳마다 이름 줄들)"""
        if type_name:
            hero = 24 + (art + 10 if has_art else 0) + 80 + (16 + STATE[1] * len(state_lines) if state_lines else 0) + 32
        else:
            hero = 48 + 62 * len(title_lines) + 48 if title_lines else 0
        feat = FEATURE[1] * len(feature_lines)
        names = [wrap(name, f_name, text_w, 2) for name, _ in shown]
        spots = 0
        if shown:
            spots = 2 + 24 + HEADING[1] + 12 + sum(NAME[1] * len(n) + (ORG[1] if org else 0) for n, (_, org) in zip(names, shown))
            spots += 16 * (len(shown) - 1)
        return hero, feat, spots, names

    def total(parts: tuple[int, int, int, list]) -> int:
        blocks = [h for h in parts[:3] if h]
        return sum(blocks) + MID_GAP * (len(blocks) - 1)

    mid_top = PAD_TOP + TOP_H + GAP
    mid_h = HEIGHT - PAD_BOTTOM - FOOT_H - GAP - mid_top
    art = CHAR_MAX
    shown = list(places)
    parts = measure(shown, art)
    if has_art and total(parts) > mid_h:                     # 1) 그림을 줄인다
        art = max(CHAR_MIN, art - (total(parts) - mid_h))
        parts = measure(shown, art)
    while total(parts) > mid_h and len(shown) > 1:           # 2) 마지막 곳을 뺀다
        shown = shown[:-1]
        parts = measure(shown, art)
    hero_h, feature_h, places_h, names = parts

    pen = _Pen()
    # 머리줄: 표식, 앱 이름, 팀 이름
    pen.logo(PAD_X, PAD_TOP, TOP_H)
    team = _clip(team, f_team, 300)
    team_w = _width(team, f_team)
    pen.text(PAD_X + TOP_H + 16, PAD_TOP, _clip(title, f_app, BOX_W - TOP_H - 16 - team_w - 24), f_app, INK, TOP_H)
    pen.text(WIDTH - PAD_X - team_w, PAD_TOP, team, f_team, MUTED, TOP_H)

    y = mid_top + max(0, (mid_h - total(parts)) // 2)        # 가운데 덩어리는 세로 가운데에 둔다
    if hero_h:
        wash, rule = AREA_COLORS.get(area, PLAIN_COLORS) if type_name else PLAIN_COLORS
        pen.box(PAD_X, y, BOX_W, hero_h, 40, wash, rule, 2)
        if type_name:
            cursor = y + 24
            if has_art:
                pen.picture(Path(character), cursor, art)
                cursor += art + 10
            pill_w = _width(pill_text, f_pill) + 2 * 52
            pen.box((WIDTH - pill_w) / 2, cursor, pill_w, 80, 40, YELLOW, YELLOW_RULE, 2)
            pen.centered(cursor, pill_text, f_pill, PILL_INK, 80)
            pen.lines(0, cursor + 80 + 16, state_lines, f_state, INK, STATE[1], center=True)
        else:
            pen.lines(0, y + 48, title_lines, f_title, INK, 62, center=True)
        y += hero_h + MID_GAP
    if feature_h:
        pen.lines(PAD_X + 12, y, feature_lines, f_feature, BODY, FEATURE[1])
        y += feature_h + MID_GAP
    if places_h:
        pen.box(PAD_X, y, BOX_W, 2, 0, RULE)
        cursor = y + 2 + 24
        pen.text(PAD_X + 12, cursor, _clip(places_heading, f_heading, text_w), f_heading, TEAL, HEADING[1])
        cursor += HEADING[1] + 12
        for lines, (_, org) in zip(names, shown):
            cursor = pen.lines(PAD_X + 12, cursor, lines, f_name, INK, NAME[1])
            if org:
                pen.text(PAD_X + 12, cursor, _clip(org, f_org, text_w), f_org, MUTED, ORG[1])
                cursor += ORG[1]
            cursor += 16
    pen.centered(HEIGHT - PAD_BOTTOM - FOOT_H, _clip(footer, f_foot, BOX_W), f_foot, MUTED, FOOT_H)
    return pen.png()
