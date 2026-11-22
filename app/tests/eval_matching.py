"""정답표(matching_cases.yaml)로 실제 AI 추가 추천의 정확도와 시간을 잰다.

실제 AI를 부르므로 평소 pytest에는 포함하지 않는다. 키가 있을 때만 따로 실행한다.
실행: 프로젝트 루트에서
  python app/tests/eval_matching.py                      # settings.yaml의 모델과 생각 깊이
  python app/tests/eval_matching.py gemini-3.8-flash medium
  python app/tests/eval_matching.py --check              # AI를 부르지 않고 정답표가 지금 정보표와 맞는지만 본다
키는 .streamlit/secrets.toml에서 읽는다(settings.yaml의 llm.provider에 맞는 키). 키 값은 출력하지 않는다.
"""
import sys
import time
import tomllib
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from app.core import candidates, clock, loader  # noqa: E402
from app.core.llm_matcher import make_caller, recommend  # noqa: E402
from app.core.selection import chosen_detail_options  # noqa: E402

PAUSE_SECONDS = 12   # 무료 구간의 분당 호출 한도에 걸리지 않게 쉰다 (5초로는 한도에 걸렸음)
KEY_NAMES = {"gemini": "GEMINI_API_KEY", "anthropic": "ANTHROPIC_API_KEY"}


def stale(case: dict, data, pool: list[dict]) -> list[str]:
    """정답표가 지금 데이터와 맞지 않는 점. 정보표나 유형을 고친 뒤 정답표를 안 고쳤을 때 잡힌다."""
    problems = [f"유형 {tid}가 types.yaml에 없음" for tid in case.get("types", []) if tid not in data.types]
    pool_ids = {p["id"] for p in pool}
    for field in ("first", "include"):
        problems += [f"{field}의 {pid}가 지금 후보에 없음" for pid in case.get(field, []) if pid not in pool_ids]
    known = {p["id"] for p in data.programs}
    problems += [f"exclude의 {pid}가 정보표에 없음(오타인지 확인)" for pid in case.get("exclude", []) if pid not in known]
    return problems


def check(case: dict, result) -> list[str]:
    """틀린 점 목록을 돌려준다. 비어 있으면 통과."""
    if result.status == "fail":
        return [f"AI 호출 실패({result.error})"]
    ids = [m["id"] for m in result.matches]
    wrong = []
    if case.get("status") and result.status != case["status"]:
        wrong.append(f"상태가 {case['status']}여야 하는데 {result.status}")
    if case.get("first") and (not ids or ids[0] not in case["first"]):
        wrong.append(f"1순위가 {case['first']} 중 하나여야 하는데 {ids[:1]}")
    for pid in case.get("include", []):
        if pid not in ids:
            wrong.append(f"{pid}가 빠짐")
    for pid in case.get("exclude", []):
        if pid in ids:
            wrong.append(f"{pid}가 나오면 안 됨")
    if case.get("none") and ids:
        wrong.append(f"아무것도 고르지 않아야 하는데 {ids}")
    if case.get("unmatched") is True and not result.unmatched:
        wrong.append("맞는 것이 없는 희망이 표시되지 않음")
    if case.get("unmatched") is False and result.unmatched:
        wrong.append(f"없는 희망으로 잘못 표시: {result.unmatched}")
    if case.get("reason_any") and ids:
        reason = result.matches[0]["reason"]
        if not any(word in reason for word in case["reason_any"]):
            wrong.append(f"추천 이유에 {case['reason_any']} 중 하나가 없음")
    return wrong


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--check"]
    check_only = "--check" in sys.argv[1:]
    data = loader.load_all()
    llm = data.settings["llm"]
    top_n = int(data.settings.get("top_n", 3))
    today = clock.now()
    cases = yaml.safe_load((Path(__file__).parent / "matching_cases.yaml").read_text(encoding="utf-8"))["cases"]

    prepared, broken = [], 0
    for case in cases:
        type_ids = [tid for tid in case.get("types", []) if tid in data.types]
        details = case.get("details") or {}
        pool = candidates.ai_pool(data.programs, data.types, type_ids, details, today)
        problems = stale(case, data, pool)
        broken += bool(problems)
        for line in problems:
            print(f"정답표를 고쳐야 함 | {case['name']}: {line}")
        prepared.append((case, type_ids, details, pool))
    if broken:
        sys.exit(f"정답표 {broken}건이 지금 데이터와 맞지 않습니다. matching_cases.yaml을 먼저 고쳐 주세요.")
    if check_only:
        print(f"정답표 {len(cases)}건이 지금 정보표와 맞습니다. (AI는 부르지 않았습니다)")
        return

    provider = llm.get("provider", "gemini")
    model = args[0] if args else llm["model"]
    effort = args[1] if len(args) > 1 else llm.get("effort", "low")
    key = tomllib.loads((ROOT / ".streamlit" / "secrets.toml").read_text(encoding="utf-8"))[KEY_NAMES[provider]]
    caller = make_caller(provider, key, model, effort, float(llm.get("timeout_seconds", 60)))

    print(f"{provider} / 모델 {model} / 생각 깊이 {effort} / 기준일 {today:%Y-%m-%d %H:%M}")
    passed, times = 0, []
    for i, (case, type_ids, details, pool) in enumerate(prepared, 1):
        examples = [opt["label"] for tid in type_ids for opt in chosen_detail_options(data.types[tid], details.get(tid))]
        start = time.perf_counter()
        result = recommend(data.prompt, [data.types[tid] for tid in type_ids], examples, case["text"], pool, top_n, caller)
        seconds = time.perf_counter() - start
        times.append(seconds)
        wrong = check(case, result)
        passed += not wrong
        ids = [m["id"] for m in result.matches]
        print(f"{i}. {'통과' if not wrong else '틀림'} {seconds:5.1f}초 | {case['name']} → {ids} 없는희망={result.unmatched}")
        for line in wrong:
            print(f"     - {line}")
        if ids:
            print(f"     이유: {result.matches[0]['reason']}")
        sys.stdout.flush()
        if i < len(prepared):
            time.sleep(PAUSE_SECONDS)
    print(f"결과: {passed}/{len(cases)} 통과 | 평균 {sum(times) / len(times):.1f}초, 가장 느린 것 {max(times):.1f}초")


if __name__ == "__main__":
    main()
