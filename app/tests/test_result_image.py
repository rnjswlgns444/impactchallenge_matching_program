"""결과 사진(내 결과 저장하기) 그리기 테스트. 화면 없이 그림 파일만 본다."""
from __future__ import annotations

import io

import pytest
from PIL import Image

from app.core import loader
from app.core.selection import question
from app.ui import result_image
from app.ui.components import character_image

FOOT = "11월 23일에 저장한 결과예요. 정보는 바뀔 수 있으니 앱에서 다시 확인하세요."
LONG_NAME = "공공체육시설 월별 프로그램(라인댄스·수영·헬스 등) 추첨 신청과 그 밖의 아주 긴 이름을 가진 프로그램 안내 창구"


def opened(png: bytes) -> Image.Image:
    return Image.open(io.BytesIO(png))


@pytest.fixture(scope="module")
def data():
    return loader.load_all()


def test_every_type_and_gender_is_drawn(data):
    """유형 12개 × 성별 2개 모두 정해진 크기의 PNG로 그려진다. 긴 이름 세 곳을 넣어도 오류가 없다."""
    genders = [option["id"] for option in question(data.questions, "P_GENDER")["options"]]
    for tid, info in data.types.items():
        for gender in genders:
            png = result_image.render("안산 프로그램 찾기", "안산노믹스", FOOT, "물어볼 수 있는 곳",
                                      [(LONG_NAME, "기관 이름")] * 3, info["name"], info["statement"],
                                      info["feature"], info["area"], character_image(tid, gender))
            image = opened(png)
            assert image.format == "PNG" and image.size == (result_image.WIDTH, result_image.HEIGHT)


def test_empty_cases_do_not_fail():
    """그림이 없거나, 곳이 하나도 없거나, 대표 유형이 없어도 그려진다."""
    for kwargs in (dict(type_name="취미발견형", statement="설명", feature="특징"),            # 그림 없음
                   dict(type_name="취미발견형"),                                              # 설명·특징 없음
                   dict(plain_title="먼저 이런 곳에 물어볼 수 있어요")):                       # 대표 유형 없음
        for places in ([], [("이름", "")], [("이름", "기관")] * 5):
            assert opened(result_image.render("앱", "팀", FOOT, "소제목", places, **kwargs)).size == (1080, 1350)


def test_wrap_keeps_words_whole_and_marks_the_cut():
    font = result_image._font(False, 32)
    lines = result_image.wrap("시간 날 때 즐길 새 취미를 찾는 분이 먼저 살펴보는 유형이에요. " * 6, font, 400, 3)
    assert len(lines) == 3 and lines[-1].endswith("…")
    assert all(result_image._width(line, font) <= 400 for line in lines)
    assert result_image.wrap("짧은 글", font, 400, 3) == ["짧은 글"]
    assert "".join(result_image.wrap("가" * 80, font, 400, 9)) == "가" * 80      # 띄어쓰기 없는 긴 낱말은 글자 단위로 끊는다


def test_at_most_three_places_are_used():
    """곳은 앞의 3개까지만 쓴다. 더 넘겨도 사진이 달라지지 않는다."""
    places = [(f"곳 {n}", "기관") for n in range(1, 6)]
    args = ("앱", "팀", FOOT, "소제목")
    assert result_image.render(*args, places) == result_image.render(*args, places[:3])
