"""AI에게 보내기 전에 주관식 글에서 주민번호, 전화번호, 이메일 형태를 지운다. 이름과 주소는 지우지 못한다."""
from __future__ import annotations

import re

REMOVED = "[삭제됨]"
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
# 010-1234-5678, 01012345678, 031 123 4567, 02.123.4567 같은 형태
_PHONE = re.compile(r"(?<!\d)0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)")


_RESIDENT = re.compile(r"(?<!\d)\d{6}\s*-\s*\d{7}(?!\d)")     # 주민등록번호 형태


def scrub(text: str) -> str:
    text = _EMAIL.sub(REMOVED, text or "")
    text = _RESIDENT.sub(REMOVED, text)
    return _PHONE.sub(REMOVED, text)
