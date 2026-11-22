"""데이터 파일을 읽고, 앱을 켤 때 형식을 검사한다.

입력: data/questions.yaml, types.yaml, programs.csv, settings.yaml, prompts/matching.md
형식이 틀리면 DataError를 던진다. 메시지는 파일을 고치는 팀원이 읽는 한국어 문장이다.
"""
from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from pathlib import Path
from string import Formatter

import yaml

from .scoring import SCALE_MAX, SCALE_MIN
from .selection import (AGE_MAX_COLUMN, AGE_MIN_COLUMN, AGE_Q, BARRIER_Q, CANDIDATE_TYPES, FREE_Q, GENDER_Q,
                        PRIORITY_Q, PROFILE_CHOICES, WORK_Q)

APP_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = APP_DIR / "data"
PROMPT_PATH = APP_DIR / "prompts" / "matching.md"

# 코드가 읽는 열. 재확인일·운영근거·비고는 팀 점검용이라 없어도 된다.
REQUIRED_COLUMNS = [
    "id", "기관명", "프로그램명", "종류", "범위", "한줄설명", "상세설명", "키워드", "유형태그", "세부태그", "첫상담",
    "55~64세참여", "대상", "대상성별", "최소나이", "최대나이", "대상재직상태",
    "확인필요", "보수", "운영상태", "매칭가능", "표시종료일", "종료시각",
    "시간대", "기간", "비용", "장소", "신청방법", "공식연락처", "홈페이지URL", "상세페이지URL", "신청URL",
    "진행방식", "첫방문안내", "혼자참여", "초보참여", "첫연락문장",
    "체험유형", "체험제목", "체험URL", "체험내용", "확인날짜", "출처URL",
]
PLACEHOLDERS = ["{type_name}", "{type_summary}", "{wish_examples}", "{wish_text}", "{candidates}", "{max_n}"]

QUESTION_IDS = [BARRIER_Q, PRIORITY_Q, FREE_Q, GENDER_Q, AGE_Q, WORK_Q]   # 코드가 id로 찾는 문항 (이름은 selection.py)
SELECTIONS = {"single", "multi", "number", "scale", "text"}
OPTION_SOURCES = {CANDIDATE_TYPES}
SCALE_VALUES = list(range(SCALE_MIN, SCALE_MAX + 1))   # 척도 값. 범위는 scoring.py가 정한다
ITEMS_PER_TYPE = 2                                # 유형마다 척도 문항 수. 점수 기준(8점·7점)이 이 수를 전제한다
RULE_KEYS = ("exclude", "first", "last")          # 세부 질문에 붙는 후보 규칙

# programs.csv의 칸에 적는 값. 다른 파일은 글자를 다시 적지 않고 이 이름을 가져다 쓴다
KIND_ALWAYS, KIND_PERIOD, KIND_LIST = "상시서비스", "기간프로그램", "목록"
UNCONFIRMED = "미확인"
NATIONWIDE = "전국"            # 안산에 있지 않은 전화·온라인 창구. 안산 기관 뒤에 보여준다

KINDS = {KIND_ALWAYS, KIND_PERIOD, KIND_LIST}
AGE_VALUES = {"가능", "불가", UNCONFIRMED}
SCOPES = {"안산", NATIONWIDE}
PAY_VALUES = {"해당없음", "유급", "활동비", "무보수", UNCONFIRMED}
TASTE_KINDS = {"", "영상", "공개강좌", "앱체험"}
DATE = re.compile(r"\d{4}-\d{2}-\d{2}")
CLOCK_TIME = re.compile(r"(?:[01]\d|2[0-3]):[0-5]\d")     # 09:00, 16:30 (24시간, 한국 시각)

# 화면(main.py, ui/components.py)이 쓰는 settings.yaml의 text 문구. 화면에 문구를 더하면 여기에도 적는다
# (test_text_keys_match_the_screen_code가 둘이 어긋나면 알려 준다)
TEXT_KEYS = """
    start_heading team_name start_audience start_image_alt
    start_intro start_time start_refresh start_privacy start_privacy_saving start_button
    scale_help number_placeholder number_next number_required multi_help next_button back_button
    type_label type_label_other result_intro secondary_heading more_types_button also_heading
    tie_two tie_many confirm_one repick_button result_heading low_interest edit_hint
    detail_label detail_first widened_note contacts_heading lists_heading no_program no_program_at_all unknown_intro
    browse_heading browse_help consult_heading
    free_privacy free_button free_empty free_unclear free_wait ai_heading ai_reason ai_stale ai_none ai_fail
    kind_always kind_period kind_list nationwide card_ask target_label first_visit_label
    check_heading age_unconfirmed worry_heading say_prefix call_button apply_button detail_button home_button
    list_note list_button
    capture_tip restart_button disclaimer
    share_heading share_help share_button share_message share_copied share_failed
""".split()
# 값을 끼워 넣는 문구와, 그 문구에 쓸 수 있는 자리표시자
TEXT_FIELDS = {
    "progress_scale": {"number", "total"}, "priority_example": {"org", "program"},
    "more_button": {"count"}, "ai_unmatched": {"items"},
    "ai_seen_note": {"type"}, "seen_note": {"type"}, "unconfirmed": {"column"}, "checked_note": {"date"},
}
FALLBACK_KEYS = ["name", "org", "description", "phone", "say"]   # url은 없어도 된다


class DataError(Exception):
    """데이터 파일 형식 오류. problems에 고칠 곳 목록이 들어 있다."""

    def __init__(self, problems: list[str]):
        super().__init__("\n".join(problems))
        self.problems = problems


@dataclass
class AppData:
    questions: list[dict]
    types: dict[str, dict]      # 유형 id → 유형 정보 (파일에 적힌 순서)
    areas: list[dict]
    programs: list[dict]
    settings: dict
    prompt: str
    scale: list[dict]           # 척도 문항의 공통 선택지 (value 5 → 1 순서로 적힌 그대로)


def split_multi(value: str) -> list[str]:
    """'a|b|c' 형태의 칸을 목록으로 바꾼다."""
    return [part.strip() for part in (value or "").split("|") if part.strip()]


# 단추를 누를 때마다 파일을 다시 읽으므로 빠른 C 해석기를 쓴다. 없는 환경에서는 파이썬 해석기로 읽는다(결과는 같다)
_YAML_LOADER = getattr(yaml, "CSafeLoader", yaml.SafeLoader)


def _read_yaml(path: Path, problems: list[str]):
    try:
        return yaml.load(path.read_text(encoding="utf-8"), Loader=_YAML_LOADER) or {}
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


def _check_options(where: str, options: list[dict], problems: list[str]) -> None:
    seen = set()
    for opt in options:
        if not opt.get("id") or not opt.get("label"):
            problems.append(f"{where}의 선택지에 id와 label이 있어야 합니다.")
        elif opt["id"] in seen:
            problems.append(f"{where}에 선택지 id '{opt['id']}'가 두 번 나옵니다.")
        seen.add(opt.get("id"))


def _check_rule(where: str, rule, problems: list[str]) -> None:
    """exclude / first / last 규칙은 {programs.csv의 열 이름: [값]} 꼴이어야 한다."""
    if not isinstance(rule, dict) or not all(isinstance(v, list) for v in rule.values()):
        problems.append(f"{where}는 {{열 이름: [값, 값]}} 꼴로 적어야 합니다.")
        return
    for column in rule:
        if column not in REQUIRED_COLUMNS:
            problems.append(f"{where}의 '{column}'은 programs.csv에 없는 열입니다.")


def validate_types(areas: list[dict], types_list: list[dict]) -> list[str]:
    problems: list[str] = []
    area_ids = {a.get("id") for a in areas}
    if not types_list:
        problems.append("types.yaml: 유형이 하나도 없습니다.")
    seen, detail_ids = set(), set()
    for i, t in enumerate(types_list, 1):
        tid = t.get("id")
        if not tid:
            problems.append(f"types.yaml: {i}번째 유형에 id가 없습니다.")
            continue
        if tid in seen:
            problems.append(f"types.yaml: 유형 id '{tid}'가 두 번 나옵니다.")
        seen.add(tid)
        for field in ("name", "statement"):
            if not t.get(field):
                problems.append(f"types.yaml: 유형 '{tid}'에 {field}가 없습니다.")
        if t.get("area") not in area_ids:
            problems.append(f"types.yaml: 유형 '{tid}'의 area '{t.get('area')}'가 areas에 없습니다.")
        detail = t.get("detail")
        if not detail:
            continue
        where = f"types.yaml: 유형 '{tid}'의 세부 질문"
        if not detail.get("id") or not detail.get("text") or detail.get("selection") not in ("single", "multi"):
            problems.append(f"{where}에는 id, text, selection(single 또는 multi)이 있어야 합니다.")
        if detail.get("id") in detail_ids:
            problems.append(f"{where} id '{detail.get('id')}'가 다른 유형과 겹칩니다.")
        detail_ids.add(detail.get("id"))
        options = detail.get("options") or []
        if len(options) < 2:
            problems.append(f"{where}에 선택지가 2개 이상 있어야 합니다.")
        _check_options(where, options, problems)
        if "last" in detail:
            _check_rule(f"{where} last", detail["last"], problems)
        for flag in ("log_answer", "match_tags", "require_choice"):
            if not isinstance(detail.get(flag, True), bool):
                problems.append(f"{where}의 {flag}는 true 또는 false로 적습니다.")
        for opt in options:
            for key in ("exclude", "first"):
                if key in opt:
                    _check_rule(f"{where} 선택지 '{opt.get('id')}'의 {key}", opt[key], problems)
    return problems


def _is_int(value) -> bool:
    return type(value) is int


def validate_scale(scale: list[dict]) -> list[str]:
    """척도 선택지는 value 1~5를 한 번씩 쓰고 label이 있어야 한다."""
    values = [opt.get("value") for opt in scale if isinstance(opt, dict)]
    if len(values) != len(scale) or sorted(v for v in values if _is_int(v)) != SCALE_VALUES or len(values) != len(SCALE_VALUES):
        return ["questions.yaml: scale에는 value 1, 2, 3, 4, 5가 한 번씩 있어야 합니다. label만 고쳐 주세요."]
    if not all(opt.get("label") for opt in scale):
        return ["questions.yaml: scale의 선택지마다 label이 있어야 합니다."]
    return []


def validate_scoring(settings: dict) -> list[str]:
    """대표 유형 기준. 유형 점수 범위(문항 수 × 1~5) 안에서 confirm < high 여야 한다."""
    scoring = settings.get("scoring") or {}
    high, confirm = scoring.get("high"), scoring.get("confirm")
    low, top = ITEMS_PER_TYPE * SCALE_VALUES[0], ITEMS_PER_TYPE * SCALE_VALUES[-1]
    if not _is_int(high) or not _is_int(confirm):
        return ["settings.yaml: scoring에 high와 confirm을 숫자로 적어야 합니다. 예) high: 8, confirm: 7"]
    if not low <= confirm < high <= top:
        return [f"settings.yaml: scoring은 {low} 이상 {top} 이하이고 confirm이 high보다 작아야 합니다. (지금: high {high}, confirm {confirm})"]
    return []


def validate_text(settings: dict) -> list[str]:
    """화면이 쓰는 문구가 settings.yaml에 다 있는지 본다.

    빠진 문구는 그 문구가 나오는 화면에서만 오류가 나서, 드물게 나오는 화면은 실험 중에야 드러난다.
    """
    problems: list[str] = []
    if not isinstance(settings.get("app_title"), str) or not settings["app_title"]:
        problems.append("settings.yaml: app_title(앱 이름)이 없습니다.")
    text = settings.get("text")
    if not isinstance(text, dict):
        return problems + ["settings.yaml: text(화면 문구)가 없습니다."]
    for key in TEXT_KEYS + list(TEXT_FIELDS):
        value = text.get(key)
        if not isinstance(value, str):
            problems.append(f"settings.yaml: text에 '{key}' 문구가 없습니다. 지우지 말고 글만 고쳐 주세요. (글은 따옴표로 감쌉니다)")
            continue
        if key not in TEXT_FIELDS:
            continue
        allowed = TEXT_FIELDS[key]
        try:
            used = {name for _, name, _, _ in Formatter().parse(value) if name is not None}
        except ValueError:
            used = {""}
        if not used <= allowed:
            can = ", ".join("{" + name + "}" for name in sorted(allowed))
            problems.append(f"settings.yaml: text의 '{key}'에는 중괄호를 {can} 꼴로만 쓸 수 있습니다.")
    card = settings.get("fallback_card")
    for key in FALLBACK_KEYS:
        if not isinstance(card, dict) or not isinstance(card.get(key), str) or not card[key]:
            problems.append(f"settings.yaml: fallback_card에 '{key}'가 없습니다.")
    return problems


def validate_questions(questions: list[dict], types_list: list[dict] | None = None) -> list[str]:
    """types_list를 주면 척도 문항이 유형마다 정해진 수만큼 있는지도 본다."""
    problems: list[str] = []
    seen = set()
    per_type: dict[str, int] = {}
    for i, q in enumerate(questions, 1):
        qid = q.get("id")
        if not qid or not q.get("text"):
            problems.append(f"questions.yaml: {i}번째 문항에는 id와 text가 있어야 합니다.")
            continue
        if qid in seen:
            problems.append(f"questions.yaml: 문항 id '{qid}'가 두 번 나옵니다.")
        seen.add(qid)
        where = f"questions.yaml: 문항 '{qid}'"
        if q.get("selection") not in SELECTIONS:
            problems.append(f"{where}의 selection은 single, multi, number, scale, text 중 하나여야 합니다.")
        if q.get("options_from") and q["options_from"] not in OPTION_SOURCES:
            problems.append(f"{where}의 options_from은 candidate_types여야 합니다.")
        if q.get("selection") == "scale":
            if not q.get("type"):
                problems.append(f"{where}은 척도 문항이므로 type에 유형 번호(T01 등)를 적어야 합니다.")
            else:
                per_type[q["type"]] = per_type.get(q["type"], 0) + 1
            if q.get("where") == "result":
                problems.append(f"{where}은 척도 문항이므로 where: result를 쓸 수 없습니다.")
        elif "type" in q:
            problems.append(f"{where}의 type은 척도 문항(selection: scale)에만 적습니다.")
        if q.get("selection") == "number":
            low, top = q.get("min"), q.get("max")
            if not _is_int(low) or not _is_int(top) or low > top:
                problems.append(f"{where}에는 min과 max를 숫자로 적어야 합니다. 예) min: 0, max: 120")
        options = q.get("options") or []
        if q.get("selection") in ("single", "multi") and not q.get("options_from") and len(options) < 2:
            problems.append(f"{where}에 선택지가 2개 이상 있어야 합니다.")
        _check_options(where, options, problems)
        for opt in options:
            for column in opt.get("show") or []:
                if column not in REQUIRED_COLUMNS:
                    problems.append(f"{where} 선택지 '{opt.get('id')}'의 show에 적힌 '{column}'은 programs.csv에 없는 열입니다.")
    # 척도 문항은 한 덩어리로 붙어 있어야 한다. 화면의 진행 표시가 '척도 앞 / 척도 / 척도 뒤' 세 묶음으로 센다
    survey = [q for q in questions if q.get("where") != "result"]
    scale_at = [i for i, q in enumerate(survey) if q.get("selection") == "scale"]
    if scale_at:
        for q in survey[scale_at[0]:scale_at[-1] + 1]:
            if q.get("selection") != "scale":
                problems.append(f"questions.yaml: 문항 '{q.get('id')}'가 척도 문항 사이에 끼어 있습니다. 척도 문항들의 앞이나 뒤로 옮겨 주세요.")
    for qid in QUESTION_IDS:
        if qid not in seen:
            problems.append(f"questions.yaml: 문항 '{qid}'가 없습니다. 이 id는 코드가 쓰므로 지우거나 바꾸면 안 됩니다.")
    for qid, column, allowed in PROFILE_CHOICES:        # 정보표의 대상 조건 칸이 이 선택지 id로 적혀 있다
        found = next((q for q in questions if q.get("id") == qid), None)
        if found and {opt.get("id") for opt in found.get("options") or []} != set(allowed):
            problems.append(f"questions.yaml: 문항 '{qid}'의 선택지 id는 {' / '.join(allowed)}여야 합니다. "
                            f"programs.csv의 '{column}' 칸이 이 값으로 적혀 있습니다.")
    if types_list is not None:
        type_ids = [t.get("id") for t in types_list if t.get("id")]
        for tid in per_type:
            if tid not in type_ids:
                problems.append(f"questions.yaml: 척도 문항의 type '{tid}'가 types.yaml에 없습니다.")
        for tid in type_ids:
            if per_type.get(tid, 0) != ITEMS_PER_TYPE:
                problems.append(f"questions.yaml: 유형 '{tid}'의 척도 문항은 {ITEMS_PER_TYPE}개여야 합니다. (지금: {per_type.get(tid, 0)}개)")
    return problems


def detail_tags(types_list: list[dict]) -> set[str]:
    """programs.csv의 세부태그에 쓸 수 있는 값. '세부질문id.선택지id' 꼴."""
    return {
        f"{t['detail']['id']}.{opt['id']}"
        for t in types_list if t.get("detail")
        for opt in t["detail"].get("options") or [] if not opt.get("exclusive")
    }


def validate_programs(programs: list[dict], types_list: list[dict]) -> list[str]:
    problems: list[str] = []
    if not programs:
        return ["programs.csv: 프로그램이 하나도 없습니다."]
    missing = [c for c in REQUIRED_COLUMNS if c not in programs[0]]
    if missing:
        return [f"programs.csv: 다음 열이 없습니다: {', '.join(missing)}"]

    type_ids = {t.get("id") for t in types_list}
    known_details = detail_tags(types_list)
    seen_ids = set()
    for row_no, row in enumerate(programs, 2):  # 1행은 제목이므로 2부터
        pid = row["id"]
        where = f"programs.csv {row_no}행({pid})"
        if not pid or pid in seen_ids:
            problems.append(f"programs.csv {row_no}행: id가 비었거나 중복입니다.")
        seen_ids.add(pid)

        tags = split_multi(row["유형태그"])
        if not tags and row["첫상담"] != "Y":   # 일반 창구(첫상담 Y)는 유형과 상관없이 안내하므로 비워도 된다
            problems.append(f"{where}: 유형태그가 비었습니다. T01 같은 유형 번호를 적어 주세요.")
        for tag in tags:
            if tag not in type_ids:
                problems.append(f"{where}: 유형태그 '{tag}'가 types.yaml에 없습니다.")
        for tag in split_multi(row["세부태그"]):
            if tag not in known_details:
                problems.append(f"{where}: 세부태그 '{tag}'가 types.yaml에 없습니다. 'D02.wage_required'처럼 적습니다.")

        for column, allowed in (("종류", KINDS), ("범위", SCOPES), ("매칭가능", {"Y", "N"}), ("55~64세참여", AGE_VALUES), ("보수", PAY_VALUES)):
            if row[column] not in allowed:
                problems.append(f"{where}: '{column}' 칸은 {' / '.join(sorted(allowed))} 중 하나여야 합니다. (지금: '{row[column]}')")
        if not DATE.fullmatch(row["확인날짜"]):
            problems.append(f"{where}: 확인날짜는 2026-11-15 같은 형식이어야 합니다.")
        if row["표시종료일"] and not DATE.fullmatch(row["표시종료일"]):
            problems.append(f"{where}: 표시종료일은 비워 두거나 2026-11-20 같은 형식으로 적습니다.")
        if row["종료시각"] and not (row["표시종료일"] and CLOCK_TIME.fullmatch(row["종료시각"])):
            problems.append(f"{where}: 종료시각은 표시종료일과 함께, 16:00 같은 형식(한국 시각)으로 적습니다. 모르면 비워 둡니다.")
        for _, column, allowed in PROFILE_CHOICES:
            if set(split_multi(row[column])) - set(allowed):
                problems.append(f"{where}: '{column}' 칸은 비워 두거나 {' / '.join(allowed)} 중에서 적습니다. (지금: '{row[column]}')")
        limits = [row[AGE_MIN_COLUMN], row[AGE_MAX_COLUMN]]
        if any(value and not re.fullmatch(r"[0-9]{1,3}", value) for value in limits):
            problems.append(f"{where}: 최소나이·최대나이는 만 나이를 숫자로만 적습니다. 제한이 없으면 비워 둡니다.")
        elif all(limits) and int(limits[0]) > int(limits[1]):
            problems.append(f"{where}: 최소나이가 최대나이보다 큽니다.")
        if row["매칭가능"] == "Y" and not row["출처URL"]:
            problems.append(f"{where}: 매칭가능이 Y이면 출처URL이 있어야 합니다. 확인한 공식 페이지 주소를 적어 주세요.")

        if row["체험유형"] not in TASTE_KINDS:
            problems.append(f"{where}: 체험유형은 영상/공개강좌/앱체험 중 하나이거나 비워 둡니다.")
        if row["체험유형"] == "앱체험" and not split_multi(row["체험내용"]):
            problems.append(f"{where}: 체험유형이 앱체험이면 체험내용에 단계를 적어야 합니다.")
        if row["체험유형"] in ("영상", "공개강좌") and not row["체험URL"]:
            problems.append(f"{where}: 체험유형이 {row['체험유형']}이면 체험URL이 있어야 합니다.")
    return problems


def validate_prompt(prompt: str) -> list[str]:
    return [f"prompts/matching.md: 자리표시자 {p}가 없습니다. 지우지 마세요." for p in PLACEHOLDERS if p not in prompt]


def validate(areas, types_list, questions, programs, prompt, scale, settings) -> list[str]:
    problems = validate_types(areas, types_list) + validate_scale(scale) + validate_questions(questions, types_list)
    problems += validate_scoring(settings) + validate_text(settings)
    return problems + validate_programs(programs, types_list) + validate_prompt(prompt)


def load_all(data_dir: Path = DATA_DIR, prompt_path: Path = PROMPT_PATH) -> AppData:
    problems: list[str] = []
    questions_file = _read_yaml(data_dir / "questions.yaml", problems) or {}
    questions = questions_file.get("questions") or []
    scale = questions_file.get("scale") or []
    types_file = _read_yaml(data_dir / "types.yaml", problems) or {}
    areas = types_file.get("areas") or []
    types_list = types_file.get("types") or []
    settings = _read_yaml(data_dir / "settings.yaml", problems)
    programs = _read_programs(data_dir / "programs.csv", problems)
    try:
        prompt = prompt_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        prompt = ""
        problems.append("prompts/matching.md: 파일이 없습니다.")

    if not problems:
        problems = validate(areas, types_list, questions, programs, prompt, scale, settings)
    if problems:
        raise DataError(problems)
    return AppData(questions, {t["id"]: t for t in types_list}, areas, programs, settings, prompt, scale)
