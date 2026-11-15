"""익명 기록. 저장 방식을 나중에 바꿀 수 있게 함수 두 개로 감싼다.

- responses.csv: 결과가 나올 때마다 한 행
- events.csv: 맛보기를 시작하거나 끝까지 봤을 때 한 행
이름·연락처·주관식 원문은 받지도 저장하지도 않는다. 시각은 시간 단위까지만 남긴다.
"""
from __future__ import annotations

import csv
import json
from datetime import datetime
from pathlib import Path

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"

RESPONSE_FIELDS = [
    "session_id", "hour", "option_ids", "axis_scores", "type_code",
    "wish_examples", "wrote_text", "unsure", "status", "program_ids",
]
EVENT_FIELDS = ["session_id", "hour", "event", "program_id"]


def _hour() -> str:
    return datetime.now().strftime("%Y-%m-%d %H시")


def _append(path: Path, fields: list[str], row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    is_new = not path.exists()
    with path.open("a", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fields)
        if is_new:
            writer.writeheader()
        writer.writerow(row)


def log_response(session_id, option_ids, axis_scores, type_code, wish_examples,
                 wrote_text, unsure, status, program_ids, log_dir: Path = LOG_DIR) -> None:
    _append(log_dir / "responses.csv", RESPONSE_FIELDS, {
        "session_id": session_id,
        "hour": _hour(),
        "option_ids": "|".join(option_ids),
        "axis_scores": json.dumps(axis_scores, ensure_ascii=False),
        "type_code": type_code,
        "wish_examples": "|".join(wish_examples),
        "wrote_text": "Y" if wrote_text else "N",
        "unsure": "Y" if unsure else "N",
        "status": status,
        "program_ids": "|".join(program_ids),
    })


def log_event(session_id, event, program_id, log_dir: Path = LOG_DIR) -> None:
    """event: taste_start(맛보기 시작) 또는 taste_done(끝까지 봄)."""
    _append(log_dir / "events.csv", EVENT_FIELDS, {
        "session_id": session_id, "hour": _hour(), "event": event, "program_id": program_id,
    })


def log_error(kind: str, log_dir: Path = LOG_DIR) -> None:
    """AI 호출 실패 원인을 종류만 남긴다. 사용자가 적은 글은 남기지 않는다."""
    log_dir.mkdir(parents=True, exist_ok=True)
    with (log_dir / "errors.log").open("a", encoding="utf-8") as f:
        f.write(f"{datetime.now():%Y-%m-%d %H:%M} {kind}\n")
