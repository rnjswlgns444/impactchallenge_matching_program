"""데이터 파일 5개를 읽고, 앱을 켤 때 형식을 검사한다.

입력: data/questions.yaml, types.yaml, rules.yaml, programs.csv, settings.yaml, prompts/matching.md
형식이 틀리면 DataError를 던진다. 메시지는 파일을 고치는 팀원이 읽는 한국어 문장이다.
"""
from __future__ import annotations

import csv
import itertools
import re
from dataclasses import dataclass
from pathlib import Path

import yaml

APP_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = APP_DIR / "data"
PROMPT_PATH = APP_DIR / "prompts" / "matching.md"

REQUIRED_COLUMNS = [
    "id", "기관명", "프로그램명", "한줄설명", "상세설명", "키워드", "유형태그", "첫상담",
    "55~64세참여", "운영상태", "매칭가능", "시간대", "비용", "장소", "공식연락처",
    "홈페이지URL", "상세페이지URL", "진행방식", "첫방문안내", "첫연락문장",
    "체험유형", "체험제목", "체험URL", "체험내용", "확인날짜",
]
PLACEHOLDERS = ["{type_name}", "{type_summary}", "{wish_examples}", "{wish_text}", "{candidates}", "{max_n}"]
TASTE_KINDS = {"", "영상", "공개강좌", "앱체험"}


class DataError(Exception):
    """데이터 파일 형식 오류. problems에 고칠 곳 목록이 들어 있다."""

    def __init__(self, problems: list[str]):
        super().__init__("\n".join(problems))
        self.problems = problems


@dataclass
class AppData:
    questions: list[dict]
    rules: dict
    types: dict[str, dict]      # 유형 코드 → 유형 정보
    programs: list[dict]
    settings: dict
    prompt: str


def split_multi(value: str) -> list[str]:
    """'a|b|c' 형태의 칸을 목록으로 바꾼다."""
    return [part.strip() for part in (value or "").split("|") if part.strip()]


def _read_yaml(path: Path, problems: list[str]):
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except FileNotFoundError:
        problems.append(f"{path.name}: 파일이 없습니다.")
    except yaml.YAMLError as err:
        problems.append(f"{path.name}: 형식이 잘못됐습니다. 들여쓰기와 따옴표를 확인하세요. ({err})")
    return {}


def _read_programs(path: Path, problems: list[str]) -> list[dict]:
    try:
        with path.open(encoding="utf-8-sig", newline="") as f:
            return [{k: (v or "").strip() for k, v in row.items() if k} for row in csv.DictReader(f)]
    except FileNotFoundError:
        problems.append(f"{path.name}: 파일이 없습니다.")
    except UnicodeDecodeError:
        problems.append(f"{path.name}: 글자가 깨졌습니다. 엑셀에서 'CSV UTF-8' 형식으로 저장하세요.")
    return []


def all_type_codes(rules: dict) -> list[str]:
    """축 조합으로 만들 수 있는 모든 유형 코드."""
    pole_lists = [[p["code"] for p in axis["poles"]] for axis in rules.get("axes", [])]
    return ["".join(combo) for combo in itertools.product(*pole_lists)]


def validate(questions, rules, types_list, programs, prompt) -> list[str]:
    problems: list[str] = []

    # ── 규칙의 축 ──
    axes = {}
    for i, axis in enumerate(rules.get("axes") or [], 1):
        poles = [p.get("code") for p in axis.get("poles") or []]
        if not axis.get("id") or len(poles) != 2:
            problems.append(f"rules.yaml: axes의 {i}번째 축에는 id와 poles 2개가 있어야 합니다.")
            continue
        axes[axis["id"]] = poles
    if not axes:
        problems.append("rules.yaml: axes(축)가 하나도 없습니다.")

    # ── 문항 ──
    option_to_question = {}
    tie_questions = {}
    seen_q = set()
    for i, q in enumerate(questions, 1):
        qid = q.get("id")
        if not qid or not q.get("text") or len(q.get("options") or []) < 2:
            problems.append(f"questions.yaml: {i}번째 문항에는 id, text, 선택지 2개 이상이 있어야 합니다.")
            continue
        if qid in seen_q:
            problems.append(f"questions.yaml: 문항 id '{qid}'가 두 번 나옵니다.")
        seen_q.add(qid)
        for opt in q["options"]:
            if not opt.get("id") or not opt.get("label"):
                problems.append(f"questions.yaml: 문항 '{qid}'의 선택지에 id와 label이 있어야 합니다.")
            elif opt["id"] in option_to_question:
                problems.append(f"questions.yaml: 선택지 id '{opt['id']}'가 두 번 나옵니다.")
            else:
                option_to_question[opt["id"]] = qid
        tie_axis = (q.get("show_when") or {}).get("tie")
        if tie_axis:
            if tie_axis not in axes:
                problems.append(f"questions.yaml: 문항 '{qid}'의 show_when이 가리키는 축 '{tie_axis}'가 rules.yaml에 없습니다.")
            tie_questions[tie_axis] = qid

    # ── 점수 규칙 ──
    for opt_id, effect in (rules.get("scores") or {}).items():
        if opt_id not in option_to_question:
            problems.append(f"rules.yaml: scores의 '{opt_id}'는 questions.yaml에 없는 선택지입니다.")
        for axis_id, value in (effect or {}).items():
            pole_codes = list(value) if isinstance(value, dict) else [value]
            if axis_id not in axes:
                problems.append(f"rules.yaml: scores의 '{opt_id}'가 가리키는 축 '{axis_id}'가 axes에 없습니다.")
            else:
                for code in pole_codes:
                    if code not in axes[axis_id]:
                        problems.append(f"rules.yaml: scores의 '{opt_id}'에서 '{code}'는 축 '{axis_id}'의 값이 아닙니다. ({'/'.join(axes[axis_id])} 중 하나)")

    # ── 동점 규칙 ──
    for axis_id, how in (rules.get("tie_break") or {}).items():
        if axis_id not in axes:
            problems.append(f"rules.yaml: tie_break의 축 '{axis_id}'가 axes에 없습니다.")
        elif how == "ask":
            if axis_id not in tie_questions:
                problems.append(f"rules.yaml: 축 '{axis_id}'의 동점 처리가 ask인데, questions.yaml에 show_when: {{tie: {axis_id}}} 문항이 없습니다.")
        elif how not in axes[axis_id]:
            problems.append(f"rules.yaml: tie_break의 '{axis_id}: {how}'는 ask 또는 {'/'.join(axes[axis_id])} 중 하나여야 합니다.")
    for axis_id in axes:
        if axis_id not in (rules.get("tie_break") or {}):
            problems.append(f"rules.yaml: 축 '{axis_id}'의 동점 처리(tie_break)가 없습니다.")

    # ── 예외 규칙 ──
    for i, rule in enumerate(rules.get("overrides") or [], 1):
        for qid, opt_id in (rule.get("if") or {}).items():
            if option_to_question.get(opt_id) != qid:
                problems.append(f"rules.yaml: overrides {i}번째의 조건 '{qid}: {opt_id}'가 questions.yaml과 맞지 않습니다.")
        for axis_id, code in (rule.get("then") or {}).items():
            if code not in axes.get(axis_id, []):
                problems.append(f"rules.yaml: overrides {i}번째의 결과 '{axis_id}: {code}'가 axes와 맞지 않습니다.")

    # ── 유형 ──
    type_codes = [t.get("code") for t in types_list]
    known_tags = set()
    for code in all_type_codes(rules) if axes else []:
        if code not in type_codes:
            problems.append(f"types.yaml: 유형 '{code}'가 없습니다. 축 조합마다 유형이 하나씩 있어야 합니다.")
    for t in types_list:
        code = t.get("code", "?")
        for field in ("name", "summary", "tags", "wish_question", "wish_examples"):
            if not t.get(field):
                problems.append(f"types.yaml: 유형 '{code}'에 {field}가 없습니다.")
        known_tags.update(t.get("tags") or [])

    # ── 프로그램 정보표 ──
    if programs:
        missing = [c for c in REQUIRED_COLUMNS if c not in programs[0]]
        if missing:
            problems.append(f"programs.csv: 다음 열이 없습니다: {', '.join(missing)}")
        else:
            seen_ids = set()
            for row_no, row in enumerate(programs, 2):  # 1행은 제목이므로 2부터
                pid = row["id"]
                if not pid or pid in seen_ids:
                    problems.append(f"programs.csv {row_no}행: id가 비었거나 중복입니다.")
                seen_ids.add(pid)
                for tag in split_multi(row["유형태그"]):
                    if tag not in known_tags:
                        problems.append(f"programs.csv {row_no}행({pid}): 유형태그 '{tag}'가 types.yaml의 tags에 없습니다.")
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", row["확인날짜"]):
                    problems.append(f"programs.csv {row_no}행({pid}): 확인날짜는 2026-11-15 같은 형식이어야 합니다.")
                if row["체험유형"] not in TASTE_KINDS:
                    problems.append(f"programs.csv {row_no}행({pid}): 체험유형은 영상/공개강좌/앱체험 중 하나이거나 비워 둡니다.")
                if row["체험유형"] == "앱체험" and not split_multi(row["체험내용"]):
                    problems.append(f"programs.csv {row_no}행({pid}): 체험유형이 앱체험이면 체험내용에 단계를 적어야 합니다.")
                if row["체험유형"] in ("영상", "공개강좌") and not row["체험URL"]:
                    problems.append(f"programs.csv {row_no}행({pid}): 체험유형이 {row['체험유형']}이면 체험URL이 있어야 합니다.")
    else:
        problems.append("programs.csv: 프로그램이 하나도 없습니다.")

    # ── AI 지시문 ──
    for placeholder in PLACEHOLDERS:
        if placeholder not in prompt:
            problems.append(f"prompts/matching.md: 자리표시자 {placeholder}가 없습니다. 지우지 마세요.")

    return problems


def load_all(data_dir: Path = DATA_DIR, prompt_path: Path = PROMPT_PATH) -> AppData:
    problems: list[str] = []
    questions = (_read_yaml(data_dir / "questions.yaml", problems) or {}).get("questions") or []
    rules = _read_yaml(data_dir / "rules.yaml", problems)
    types_list = (_read_yaml(data_dir / "types.yaml", problems) or {}).get("types") or []
    settings = _read_yaml(data_dir / "settings.yaml", problems)
    programs = _read_programs(data_dir / "programs.csv", problems)
    try:
        prompt = prompt_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        prompt = ""
        problems.append("prompts/matching.md: 파일이 없습니다.")

    if not problems:
        problems = validate(questions, rules, types_list, programs, prompt)
    if problems:
        raise DataError(problems)
    return AppData(questions, rules, {t["code"]: t for t in types_list}, programs, settings, prompt)
