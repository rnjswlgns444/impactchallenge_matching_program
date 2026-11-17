"""익명 기록. 저장 방식을 나중에 바꿀 수 있게 함수로 감싼다.

- responses.csv: 결과 화면에 처음 도착했을 때 한 행 (한 번 진행에 한 행)
- events.csv: 그 뒤의 행동마다 한 행 (먼저 볼 유형 고르기, 세부 질문 답하기, 맛보기 등)
이름·연락처·주관식 원문은 받지도 저장하지도 않는다. 시각은 시간 단위까지만 남긴다.
"""
from __future__ import annotations

import csv
from datetime import datetime, timedelta, timezone
from pathlib import Path

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"

ENABLED = True      # settings.yaml의 save_log 값. False면 아무것도 쓰지 않는다


def set_enabled(on: bool) -> None:
    global ENABLED
    ENABLED = bool(on)


RESPONSE_FIELDS = ["session_id", "hour", "type_ids", "barriers", "start", "program_ids"]
EVENT_FIELDS = ["session_id", "hour", "event", "target", "value"]


KST = timezone(timedelta(hours=9))     # 서버가 어디에 있든 한국 시각으로 남긴다


def _hour() -> str:
    return datetime.now(KST).strftime("%Y-%m-%d %H시")


def _append(path: Path, fields: list[str], row: dict) -> None:
    """한 행을 덧붙인다. 파일이 잠겨 있는 등으로 실패해도 사용자 화면은 멈추지 않게 한다."""
    if not ENABLED:
        return
    try:
        _write(path, fields, row)
    except OSError as err:
        try:
            log_error(f"기록 실패 {path.name} {type(err).__name__}", path.parent)
        except OSError:
            pass


def _write(path: Path, fields: list[str], row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        with path.open(encoding="utf-8-sig", newline="") as f:
            header = next(csv.reader(f), [])
        if header != fields:
            # 예전 형식의 파일이면 이름을 바꿔 보관하고 새로 시작한다. 열이 어긋난 채 쌓이지 않게 한다.
            path.rename(path.with_name(f"{path.stem}_이전형식_{datetime.now():%Y%m%d_%H%M%S}{path.suffix}"))
    is_new = not path.exists()
    with path.open("a", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fields)
        if is_new:
            writer.writeheader()
        writer.writerow(row)


def log_response(session_id, type_ids, barriers, start, program_ids, log_dir: Path | None = None) -> None:
    """고른 유형, 걸림돌, 시작 방식, 화면에 나온 프로그램을 남긴다."""
    _append((log_dir or LOG_DIR) / "responses.csv", RESPONSE_FIELDS, {
        "session_id": session_id,
        "hour": _hour(),
        "type_ids": "|".join(type_ids),
        "barriers": "|".join(barriers),
        "start": start or "",
        "program_ids": "|".join(program_ids),
    })


def log_event(session_id, event, target="", value="", log_dir: Path | None = None) -> None:
    """event 예: priority(먼저 볼 유형), detail(세부 질문 답), taste_start, taste_done.

    target은 유형·프로그램 id, value는 고른 선택지 id다. 사용자가 적은 글은 넣지 않는다.
    """
    _append((log_dir or LOG_DIR) / "events.csv", EVENT_FIELDS, {
        "session_id": session_id, "hour": _hour(), "event": event, "target": target, "value": value,
    })


def log_error(kind: str, log_dir: Path | None = None) -> None:
    """AI 호출 실패 원인을 종류만 남긴다. 사용자가 적은 글은 남기지 않는다."""
    log_dir = log_dir or LOG_DIR
    log_dir.mkdir(parents=True, exist_ok=True)
    with (log_dir / "errors.log").open("a", encoding="utf-8") as f:
        f.write(f"{datetime.now():%Y-%m-%d %H:%M} {kind}\n")
