"""한국 시각. 서버가 어디에 있든(Codespaces는 UTC) 날짜 판단과 기록 시각을 한국 기준으로 맞춘다."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))


def now() -> datetime:
    return datetime.now(KST)
