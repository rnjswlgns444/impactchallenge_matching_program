"""새 앱(my-app, TypeScript)의 판단 코드가 이 앱(파이썬)과 같은 답을 내는지 견줄 '정답 파일'을 만든다.

이 파일은 앱의 동작을 바꾸지 않는다. 파이썬 함수에 사례를 넣고 그 답을 적어 둘 뿐이다.
만든 파일: my-app/src/core/parity/cases.json  (my-app의 `npm test`가 이 파일과 견준다)

실행: 프로젝트 루트에서
    .venv\\Scripts\\python app\\tests\\make_parity_cases.py

다시 만들어야 할 때
  - app/data의 문항·유형·정보표를 고쳤을 때 (my-app에서 `npm run data`도 함께 돌린다)
  - app/core의 scoring·selection·candidates·privacy·venues를 고쳤을 때
입력이 같으면 결과도 같다(난수 씨앗 고정). pytest는 이 파일을 테스트로 돌리지 않는다.
"""
from __future__ import annotations

import hashlib
import json
import random
import sys
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from app.core import clock, loader, privacy, venues  # noqa: E402
from app.core.candidates import ai_pool, eligible, first_consult, for_type, unconfirmed_columns  # noqa: E402
from app.core.scoring import score  # noqa: E402
from app.core.selection import (ages_from_birth_year, chosen_detail_options, detail_of, full_number,  # noqa: E402
                                next_question, options_of, question, scale_questions, survey_questions, toggle,
                                type_questions)

OUT = ROOT / "my-app" / "src" / "core" / "parity" / "cases.json"
SEED = 20261127
BARRIER = "Q_BARRIER"       # 새 앱은 걸림돌 문항을 싣지 않는다


def canonical(value) -> str:
    """키를 정렬한 한 줄 JSON. 새 앱의 테스트가 같은 방식으로 만들어 지문을 견준다."""
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def ids(programs) -> list[str]:
    return [p["id"] for p in programs]


def moment(day: str, time: str = ""):
    """새 앱의 '때'({day, time, year})와 같은 뜻의 파이썬 값. 시각이 없으면 날짜만 넘긴다."""
    y, m, d = (int(x) for x in day.split("-"))
    if not time:
        return date(y, m, d)
    hh, mm = (int(x) for x in time.split(":"))
    return datetime(y, m, d, hh, mm, tzinfo=clock.KST)


def main() -> None:
    data = loader.load_all()
    rng = random.Random(SEED)
    questions = [q for q in data.questions if q["id"] != BARRIER]
    types_list = list(data.types.values())
    columns = loader.REQUIRED_COLUMNS + [loader.PIN_COLUMN]
    programs = [{c: r.get(c, "") for c in columns} for r in data.programs]
    high = data.settings["scoring"]["high"]
    pairs = type_questions(questions, data.types)
    scale_ids = [q["id"] for q in scale_questions(questions)]
    type_ids = list(data.types)

    # 자료의 지문. 새 앱이 읽은 자료가 이것과 다르면, 정답을 다시 만들어야 한다는 뜻이다
    fingerprint = hashlib.sha256(canonical({
        "questions": questions, "scale": data.scale, "types": types_list, "programs": programs, "high": high,
    }).encode("utf-8")).hexdigest()

    # ── 1. 채점 ──
    def judged(answers: dict, priority):
        r = score(answers, pairs, high, priority)
        return {"state": r.state, "primary": r.primary, "secondary": r.secondary, "candidates": r.candidates,
                "secondaryCandidates": r.secondary_candidates, "scores": r.scores}

    scoring_cases = []

    def add_score(values: list[int], priority=None):
        answers = dict(zip(scale_ids, values))
        scoring_cases.append({"values": values, "priority": priority, "expect": judged(answers, priority)})

    for _ in range(300):
        # 답의 폭을 사례마다 달리해 동점이 자주 나오게 한다
        low, top = sorted((rng.randint(1, 5), rng.randint(1, 5)))
        values = [rng.randint(low, top) for _ in scale_ids]
        answers = dict(zip(scale_ids, values))
        first = score(answers, pairs, high)
        choice = rng.choice(["none", "candidate", "any", "none"])
        priority = None if choice == "none" else rng.choice(first.candidates if choice == "candidate" else type_ids)
        add_score(values, priority)
    for base in (1, 2, 3, 4, 5):                       # 전부 같은 점수
        add_score([base] * len(scale_ids))
        add_score([base] * len(scale_ids), "T12")
        add_score([base] * len(scale_ids), "T99")       # 없는 유형을 골랐다고 해도 무시한다
    for tid in type_ids:                               # 유형 하나만 높음 / 둘이 동점 / 둘째가 기준(high) 언저리
        for second, pair in (("T01" if tid != "T01" else "T02", (5, 5)), ("T06" if tid != "T06" else "T07", (4, 4)),
                             ("T09" if tid != "T09" else "T10", (4, 3))):
            values = {qid: 1 for qid in scale_ids}
            values.update({qid: 5 for qid in pairs[tid]})
            values.update(zip(pairs[second], pair))
            for priority in (None, tid, second):
                add_score([values[qid] for qid in scale_ids], priority)

    # ── 2. 후보 거르기 ──
    whens = [
        {"day": "2026-11-27", "time": ""},
        {"day": "2026-11-30", "time": "13:59"},        # JOB03이 끝나기 직전
        {"day": "2026-11-30", "time": "14:00"},        # 끝나는 시각
        {"day": "2026-11-30", "time": ""},             # 시각을 모르면 그날 끝까지 보인다
        {"day": "2026-12-01", "time": "09:00"},
        {"day": "2027-03-01", "time": ""},             # 해가 바뀌면 만 나이가 달라진다
    ]
    profiles = [
        None,
        {},
        {"P_GENDER": "female", "P_AGE": 1964, "P_WORK": "not_working"},
        {"P_GENDER": "male", "P_AGE": 1970, "P_WORK": "employed"},
        {"P_GENDER": "female", "P_AGE": 1955, "P_WORK": "self_employed"},
        {"P_GENDER": "male", "P_AGE": 1977, "P_WORK": "not_working"},
        {"P_GENDER": "female"},                        # 성별만 답함
        {"P_AGE": 1962, "Q01": 5},                     # 다른 문항의 답이 섞여 있음
    ]

    def detail_answers(type_info) -> list:
        """세부 질문에 줄 답: 안 고름, 선택지 하나씩, 없는 선택지, (선택지가 둘 이상이면) 앞의 두 개를 함께."""
        detail = detail_of(type_info)
        if not detail:
            return [None]
        option_ids = [opt["id"] for opt in detail["options"]]
        return [None, *option_ids, "no_such_option", option_ids[:2], []]

    candidate_cases = []
    for when in whens:
        when_py = moment(when["day"], when["time"])
        year = int(when["day"][:4])
        for profile in profiles:
            by_type = {}
            for tid, type_info in data.types.items():
                rows = []
                for answer in detail_answers(type_info):
                    r = for_type(programs, type_info, answer, when_py, profile)
                    rows.append({
                        "answer": answer, "contacts": ids(r.contacts), "lists": ids(r.lists),
                        "needsChoice": r.needs_choice, "widened": r.widened,
                        "aiPool": ids(ai_pool(programs, data.types, [tid], {tid: answer}, when_py, profile)),
                    })
                by_type[tid] = rows
            candidate_cases.append({
                "when": {**when, "year": year}, "profile": profile,
                "eligible": ids(eligible(programs, when_py, profile)),
                "firstConsult": ids(first_consult(programs, when_py, profile)),
                "aiPoolAll": ids(ai_pool(programs, data.types, [], {}, when_py, profile)),
                # 유형 둘을 함께 넘기면 겹치는 곳은 한 번만 나온다
                "aiPoolTwo": ids(ai_pool(programs, data.types, ["T01", "T02"], {"T02": "wage_required"}, when_py, profile)),
                "byType": by_type,
            })

    unconfirmed = {}
    for tid, type_info in data.types.items():
        found = {p["id"]: unconfirmed_columns(p, type_info) for p in programs}
        unconfirmed[tid] = {pid: cols for pid, cols in found.items() if cols}

    # ── 3. 개인정보 지우기 ──
    texts = [
        "", "오전에 갈 수 있는 곳이면 좋겠어요", "주 3일, 하루 4시간 2026년", "무료면 좋겠어요. 2~3명이 함께",
        "연락처는 010-1234-5678 입니다", "01012345678", "전화는01012345678이에요", "031 123 4567", "02.123.4567",
        "02-123-4567", "0311234567", "010 1234 5678로 주세요", "010-1234-56789", "1010-1234-5678", "110-1234-5678",
        "abc.def@example.com", "메일은 홍길동@한글.kr 로", "a+b-c@mail.co.kr입니다", "@만 있는 글", "a@b", "a@b.c",
        "주민번호 600101-2345678 이에요", "600101 - 2345678", "6001012345678", "1600101-2345678",
        "０１０-１２３４-５６７８", "전화 010-1111-2222, 메일 a@b.co, 또 010-3333-4444",
        # 전각 숫자(０~９)도 파이썬의 \d에 들어간다. 새 앱의 정규식이 아스키 숫자만 보면 아래 셋에서 답이 갈린다
        "0１０-１２３４-５６７８", "６００１０１-２３４５６７８", "１010-1234-5678",
        "1966년생이고 2026-11-30에 가고 싶어요", "15:00~17:00 사이", "3,000원 정도", "031-439-1619~21",
        "버스 101번 0123 4567 8901", "02)123-4567", "010.1234.5678.", "ㅇ", "없어요", "  ",
    ]
    privacy_cases = [{"text": t, "expect": privacy.scrub(t)} for t in texts]

    # ── 4. 문항과 선택지 ──
    age_q = question(questions, "P_AGE")
    numbers = [-1, 0, 5, 19, 20, 66, 99, 100, 1919, 1920, 1966, 2010, 2011, 2026]
    toggle_options = [{"id": "a", "label": "가"}, {"id": "b", "label": "나"}, {"id": "none", "label": "없음", "exclusive": True}]
    toggle_cases = []
    for selected in ([], ["a"], ["a", "b"], ["none"], ["b"]):
        for option in ("a", "b", "none"):
            toggle_cases.append({"selected": selected, "option": option, "expect": toggle(selected, option, toggle_options)})
    survey = survey_questions(questions)
    answered = {}
    order = []
    for _ in range(len(survey) + 1):
        nxt = next_question(answered, questions)
        order.append(nxt["id"] if nxt else None)
        if nxt:
            answered[nxt["id"]] = 1
    chosen_cases = []
    for tid, type_info in data.types.items():
        for answer in detail_answers(type_info):
            chosen_cases.append({"type": tid, "answer": answer,
                                 "expect": [opt["id"] for opt in chosen_detail_options(type_info, answer)]})
    selection_cases = {
        "typeQuestions": pairs,
        "surveyOrder": order,
        "fullNumber": [{"value": v, "expect": full_number(age_q, v)} for v in numbers],
        "ages": [{"born": born, "year": year, "expect": list(ages_from_birth_year(born, date(year, 6, 1)))}
                 for born in (1955, 1962, 1976, 1977) for year in (2026, 2027)],
        "toggleOptions": toggle_options,
        "toggle": toggle_cases,
        "priorityOptions": [{"candidates": c, "expect": options_of(question(questions, "Q_PRIORITY"), data.types, c)}
                            for c in (["T05", "T07"], ["T12"], [], type_ids)],
        "chosenDetail": chosen_cases,
    }

    # ── 5. 길찾기 주소 ──
    routes = [{"program": pid, "name": v["name"], "lat": v["lat"], "lon": v["lon"], "expect": venues.route_url(v)}
              for pid, places in venues.load().items() for v in places]

    # ── 6. 기관 한 곳을 화면에 보일 모양으로 다듬기 (app/ui/components.py) ──
    from app.ui import components as ui     # streamlit을 불러오지만 화면을 그리지는 않는다

    text = data.settings["text"]
    all_venues = venues.load()
    kinds = {text["guide_button"]: "guide", text["list_button"]: "list", text["apply_button"]: "apply",
             text["phone_button"]: "phone", text["route_button"]: "route"}
    fact_kinds = {text["fact_where"]: "where", text["fact_where_remote"]: "whereRemote", text["fact_who"]: "who",
                  text["fact_how"]: "how", text["fact_contact"]: "contact"}

    def links(program) -> list:
        """ui.place_actions가 만드는 단추와 같은 순서·주소. 그 함수는 화면에 바로 그리므로 같은 규칙으로 다시 센다."""
        found = []
        is_list = program["종류"] == loader.KIND_LIST
        columns = ("신청URL", "상세페이지URL", "홈페이지URL") if is_list else ("상세페이지URL", "신청URL", "홈페이지URL")
        first = next((program[column] for column in columns if program[column]), "")
        if first:
            found.append({"kind": "list" if is_list else "guide", "note": "", "url": first})
        if not is_list and program["신청URL"] and program["신청URL"] != first:
            found.append({"kind": "apply", "note": "", "url": program["신청URL"]})
        numbers = ui.phones(program["공식연락처"])
        for number, shown in numbers:
            note = f' {shown.partition("(")[0].strip()}' if len(numbers) > 1 else ""
            found.append({"kind": "phone", "note": note, "url": f"tel:{number}"})
        spots = all_venues.get(program["id"], [])
        for spot in spots:
            note = f' ({spot["name"]})' if len(spots) > 1 else ""
            found.append({"kind": "route", "note": note, "url": venues.route_url(spot)})
        return found

    def facts(program) -> list:
        place = program["장소"] or program["진행방식"]
        rows = [(text["fact_where_remote"] if ui._no_visit(place) else text["fact_where"], place),
                (text["fact_who"], program["대상"]),
                (text["fact_how"], program["첫방문안내"] or program["신청방법"]),
                (text["fact_contact"], program["공식연락처"])]
        return [{"kind": fact_kinds[label], "value": value} for label, value in rows
                if value and value != loader.UNCONFIRMED]

    place_cases = []
    for program in programs:
        tagged = [tid for tid in loader.split_multi(program["유형태그"]) if tid in data.types]
        place_cases.append({
            "id": program["id"],
            "name": ui.place_name(program),
            "phones": [{"number": number, "shown": shown} for number, shown in ui.phones(program["공식연락처"])],
            "facts": facts(program),
            "links": links(program),
            # 걱정마다: 유형 없이(일반 창구로 나올 때), 그리고 이 곳이 속한 유형마다
            "worries": {worry["id"]: {tid or "": ui.worry_lines(program, worry, text, data.types[tid] if tid else None)
                                      for tid in [None, *tagged]}
                        for worry in data.settings["worries"]},
        })
    phone_texts = ["", "번호 없음", "031-439-1619~21", "1666-1234", "129", "02-123-4567 / 031-111-2222 (야간)",
                   "안산시 민원콜센터 1666-1234, 경기도 콜센터 031-120", "031-481-2761 ~ 4(본관)", "/", "010-1234-56789"]
    phone_cases = [{"text": t, "expect": [{"number": n, "shown": s} for n, s in ui.phones(t)]} for t in phone_texts]

    result = {
        "about": "app/tests/make_parity_cases.py가 만든 파일입니다. 손으로 고치지 마세요.",
        "fingerprint": fingerprint,
        "high": high,
        "scaleIds": scale_ids,
        "scoring": scoring_cases,
        "candidates": candidate_cases,
        "unconfirmed": unconfirmed,
        "privacy": privacy_cases,
        "selection": selection_cases,
        "routes": routes,
        "places": place_cases,
        "phones": phone_cases,
        # 새 앱의 문구(src/content/text.ts)가 이 문장과 같아야 '먼저 확인할 점'이 같게 나온다
        "checkLabels": {"ageUnconfirmed": text["age_unconfirmed"], "unconfirmed": text["unconfirmed"]},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    type_rows = sum(len(rows) for case in candidate_cases for rows in case["byType"].values())
    print(f"정답 파일을 만들었습니다: {OUT.relative_to(ROOT)}")
    print(f"  채점 {len(scoring_cases)}건, 거르기 {len(candidate_cases)}묶음(유형별 {type_rows}건), "
          f"개인정보 {len(privacy_cases)}건, 길찾기 {len(routes)}건, 기관 {len(place_cases)}곳")


if __name__ == "__main__":
    main()
