// 후보 거르기 테스트. app/tests/test_core.py의 거르기 테스트를 같은 이름으로 옮긴 것이다.
// 유형은 실제 자료를 쓰고, 프로그램은 이 파일 안의 가짜 행을 쓴다.
// 그래서 정보표를 고쳐도 테스트가 깨지지 않는다. 날짜는 인자로 넘긴다.

import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import type { Program, TypeInfo } from "@/data/types";

import { aiPool, buildResult, eligible, firstConsult, forType, unconfirmedColumns } from "./candidates";
import { dayOnly, momentOf, type Moment } from "./clock";
import { detailOf } from "./selection";

const { types } = appData;
const typeOf = (id: string): TypeInfo => types.find((t) => t.id === id)!;
const TODAY = dayOnly("2026-11-17");

// 가짜 프로그램 행. 기본값은 '지금 문의할 수 있는 상시 서비스'다.
function row(id: string, tags: string, changes: Record<string, string> = {}): Program {
  return {
    ...Object.fromEntries(Object.keys(appData.programs[0]).map((column) => [column, ""])),
    id, 기관명: "가짜 기관", 프로그램명: `가짜 프로그램 ${id}`, 종류: "상시서비스", 범위: "안산",
    한줄설명: "설명", 유형태그: tags, 첫상담: "N", "55~64세참여": "가능", 보수: "해당없음",
    운영상태: "상시운영", 매칭가능: "Y", 확인날짜: "2026-11-17", 출처URL: "https://example.com/",
    ...changes,
  };
}
const ids = (programs: Program[]) => programs.map((p) => p.id);
const at = (day: number, hour: number, minute: number): Moment => ({
  day: `2026-11-${String(day).padStart(2, "0")}`,
  time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  year: 2026,
});

describe("지금 보여 줘도 되는 곳", () => {
  it("closed_blocked_and_expired_never_pass", () => {
    const programs = [
      row("ok", "T01"),
      row("closed", "T01", { 매칭가능: "N", 운영상태: "모집마감" }),
      row("too_old", "T01", { "55~64세참여": "불가" }),
      row("past", "T01", { 표시종료일: "2026-11-16" }),
      row("today", "T01", { 표시종료일: "2026-11-17" }),
    ];
    expect(ids(eligible(programs, TODAY))).toEqual(["ok", "today"]); // 종료일 당일까지는 보인다
    expect(ids(eligible(programs, dayOnly("2026-11-18")))).toEqual(["ok"]);
  });

  it("end_time_hides_a_row_on_its_last_day: 종료일 당일에는 종료시각부터 빠진다", () => {
    const programs = [
      row("talk", "T01", { 표시종료일: "2026-11-17", 종료시각: "14:00" }),
      row("allday", "T01", { 표시종료일: "2026-11-17" }),
    ];
    expect(ids(eligible(programs, at(17, 13, 59)))).toEqual(["talk", "allday"]);
    expect(ids(eligible(programs, at(17, 14, 0)))).toEqual(["allday"]);
    expect(ids(eligible(programs, at(16, 23, 0)))).toEqual(["talk", "allday"]); // 전날에는 시각과 상관없이 보인다
    expect(ids(eligible(programs, at(18, 0, 0)))).toEqual([]);
    expect(ids(eligible(programs, TODAY))).toEqual(["talk", "allday"]); // 날짜만 주면 시각을 보지 않는다
    // 기기가 다른 시간대여도 한국 시각으로 바꿔서 본다: UTC 05:00 = 한국 14:00
    expect(ids(eligible(programs, momentOf(new Date("2026-11-17T05:00:00Z"))))).toEqual(["allday"]);
    expect(ids(eligible(programs, momentOf(new Date("2026-11-17T04:59:00Z"))))).toEqual(["talk", "allday"]);
  });

  it("unknown_age_is_not_treated_as_blocked: 55~64세참여가 미확인이면 빼지 않는다", () => {
    expect(ids(eligible([row("a", "T01", { "55~64세참여": "미확인" })], TODAY))).toEqual(["a"]);
  });
});

describe("기본정보로 거르기", () => {
  it("profile_filters_by_gender_age_and_work", () => {
    const programs = [
      row("all", "T01", { 첫상담: "Y" }),
      row("women", "T01", { 대상성별: "female", 첫상담: "Y" }),
      row("mid", "T01", { 최소나이: "50", 최대나이: "69" }),
      row("rest", "T01", { 대상재직상태: "not_working|self_employed" }),
    ];
    const who = (gender: string, born: number, work: string) => ({ P_GENDER: gender, P_AGE: born, P_WORK: work, Q01: 5 });

    // TODAY는 2026년이다. 1965년생은 만 60~61세
    expect(ids(eligible(programs, TODAY, who("female", 1965, "not_working")))).toEqual(["all", "women", "mid", "rest"]);
    expect(ids(eligible(programs, TODAY, who("male", 1965, "not_working")))).toEqual(["all", "mid", "rest"]);
    expect(ids(eligible(programs, TODAY, who("female", 1955, "self_employed")))).toEqual(["all", "women", "rest"]); // 만 70~71세
    expect(ids(eligible(programs, TODAY, who("female", 1977, "employed")))).toEqual(["all", "women"]); // 만 48~49세, 재직 중
    expect(ids(eligible(programs, TODAY))).toEqual(["all", "women", "mid", "rest"]); // 설문 없이 볼 때는 거르지 않는다
    expect(ids(eligible(programs, TODAY, {}))).toEqual(["all", "women", "mid", "rest"]);

    // 유형 결과, AI 후보, 일반 창구 모두 같은 거르기를 거친다
    const man = who("male", 1965, "not_working");
    expect(ids(forType(programs, typeOf("T01"), null, TODAY, man).contacts)).toEqual(["all", "mid", "rest"]);
    expect(ids(aiPool(programs, types, ["T01"], {}, TODAY, man))).toEqual(["all", "mid", "rest"]);
    expect(ids(aiPool(programs, types, [], {}, TODAY, man))).toEqual(["all", "mid", "rest"]);
    expect(ids(firstConsult(programs, TODAY, man))).toEqual(["all"]);
  });

  it("birth_year_is_never_off_by_one_against_the_user: 두 나이 중 하나라도 맞으면 빼지 않는다", () => {
    const programs = [row("from50", "T01", { 최소나이: "50" }), row("to69", "T01", { 최대나이: "69" }), row("any", "T01")];
    const born = (year: number) => ({ P_AGE: year });

    expect(ids(eligible(programs, TODAY, born(1975)))).toEqual(["from50", "to69", "any"]); // 만 50~51세
    expect(ids(eligible(programs, TODAY, born(1976)))).toEqual(["from50", "to69", "any"]); // 만 49~50세
    expect(ids(eligible(programs, TODAY, born(1977)))).toEqual(["to69", "any"]); // 만 48~49세
    expect(ids(eligible(programs, TODAY, born(1956)))).toEqual(["from50", "to69", "any"]);
    expect(ids(eligible(programs, TODAY, born(1955)))).toEqual(["from50", "any"]);
    // 나이는 넘겨받은 날짜의 연도로 센다. 해가 바뀌면 같은 사람도 한 살 많아진다
    expect(ids(eligible(programs, dayOnly("2027-01-01"), born(1956)))).toEqual(["from50", "any"]);
    expect(ids(eligible(programs, { day: "2027-01-01", time: "09:00", year: 2027 }, born(1977)))).toEqual(["from50", "to69", "any"]);
  });
});

describe("유형별 후보", () => {
  it("chosen_detail_keeps_only_matching_places: 고른 주제의 세부태그가 붙은 곳만 남긴다", () => {
    const health = typeOf("T12");
    const programs = [
      row("quit", "T12", { 세부태그: "D12.smoking" }),
      row("check", "T12", { 세부태그: "D12.check|D12.habits" }),
      row("plain", "T12"),
      row("book", "T12", { 종류: "목록", 세부태그: "D12.smoking" }),
    ];
    const everything = forType(programs, health, null, TODAY);
    expect(ids(everything.contacts)).toEqual(["check", "plain", "quit"]);
    expect(ids(everything.lists)).toEqual(["book"]);
    expect([everything.widened, everything.needsChoice]).toEqual([false, false]);

    const smoking = forType(programs, health, "smoking", TODAY);
    expect(ids(smoking.contacts)).toEqual(["quit"]);
    expect(ids(smoking.lists)).toEqual(["book"]);
    expect(smoking.widened).toBe(false);
    // AI 후보는 주제로 좁히지 않는다
    expect(ids(aiPool(programs, types, ["T12"], { T12: "smoking" }, TODAY))).toEqual(["quit", "check", "plain"]);

    // 고른 주제에 맞는 곳이 하나도 없으면 빼지 않고 이 유형의 곳을 그대로 보여 주고, 그 사실을 알린다
    const chronic = forType(programs, health, "chronic", TODAY);
    expect(ids(chronic.contacts)).toEqual(["check", "plain", "quit"]);
    expect(chronic.widened).toBe(true);
    expect(ids(forType([row("job", "T01")], health, "chronic", TODAY).contacts)).toEqual([]); // 다른 유형의 곳은 섞지 않는다

    // match_tags가 아닌 세부 질문(일터찾기형)은 고른 뒤에도 빼지 않고 순서만 바꾼다
    const jobs = [row("a", "T01", { 세부태그: "D01.new_work" }), row("b", "T01")];
    const picked = forType(jobs, typeOf("T01"), "new_work", TODAY);
    expect(ids(picked.contacts)).toEqual(["a", "b"]);
    expect(picked.widened).toBe(false);
  });

  it("care_asks_who_before_showing_places: 돌봄은 고르기 전에는 곳을 보여 주지 않는다", () => {
    const care = typeOf("T11");
    expect([care.detail?.require_choice, care.detail?.match_tags]).toEqual([true, true]);
    const programs = [row("mine", "T11", { 세부태그: "D11.self" }), row("parent", "T11", { 세부태그: "D11.adult" })];
    const before = forType(programs, care, null, TODAY);
    expect([before.needsChoice, before.contacts, before.lists]).toEqual([true, [], []]);
    expect(aiPool(programs, types, ["T11"], {}, TODAY)).toEqual([]);
    const after = forType(programs, care, "adult", TODAY);
    expect(ids(after.contacts)).toEqual(["parent"]);
    expect(after.needsChoice).toBe(false);
  });

  it("every_detail_topic_has_a_place_today: 주제를 고르는 세부 질문의 모든 선택지에 맞는 곳이 있다(11/22 기준)", () => {
    // 정보표가 바뀌어 빈 주제가 생기면 이 테스트가 알려 준다. 그때 화면은 그 유형의 곳을 그대로 보여 준다.
    const when: Moment = { day: "2026-11-22", time: "12:00", year: 2026 };
    const empty: string[] = [];
    for (const type of types) {
      const detail = detailOf(type);
      if (!detail?.match_tags) continue;
      for (const opt of detail.options) {
        const result = forType(appData.programs, type, opt.id, when);
        if (result.widened || result.contacts.length + result.lists.length === 0) empty.push(`${type.id}.${opt.id}`);
      }
    }
    expect(empty).toEqual([]);
  });

  it("directory_goes_to_list_area_only: 목록 행은 '목록'에만 나온다", () => {
    const programs = [row("svc", "T05"), row("dir", "T05", { 종류: "목록" }), row("event", "T05", { 종류: "기간프로그램" })];
    const result = forType(programs, typeOf("T05"), null, TODAY);
    expect(ids(result.contacts)).toEqual(["svc", "event"]); // 상시서비스가 먼저
    expect(ids(result.lists)).toEqual(["dir"]);
  });

  it("each_type_gets_its_own_result", () => {
    const programs = [row("hobby", "T05"), row("club", "T07"), row("both", "T05|T07"), row("job", "T01")];
    const results = buildResult(programs, types, ["T05", "T07"], {}, TODAY);
    expect(results.map((r) => r.typeId)).toEqual(["T05", "T07"]);
    expect(ids(results[0].contacts)).toEqual(["both", "hobby"]);
    expect(ids(results[1].contacts)).toEqual(["both", "club"]);
  });

  it("wage_required_drops_unpaid_but_keeps_unconfirmed: 급여가 필요하면 무보수는 빼고 미확인은 남긴다", () => {
    const t02 = typeOf("T02");
    const programs = [
      row("paid", "T02", { 보수: "유급" }),
      row("volunteer", "T02", { 보수: "무보수" }),
      row("unknown_pay", "T02", { 보수: "미확인" }),
      row("counsel", "T02"),
    ];
    const result = forType(programs, t02, "wage_required", TODAY);
    expect(ids(result.contacts)).not.toContain("volunteer");
    expect([...ids(result.contacts)].sort()).toEqual(["counsel", "paid", "unknown_pay"]);
    expect(unconfirmedColumns(programs[2], t02)).toEqual(["보수"]); // 빼지 않고 '확인 필요'로 표시
    expect(unconfirmedColumns(programs[0], t02)).toEqual([]);
  });

  it("unpaid_is_shown_first_only_when_wanted: 무보수는 원할 때만 앞에 보여 준다", () => {
    const t02 = typeOf("T02");
    const programs = [row("a_volunteer", "T02", { 보수: "무보수" }), row("b_paid", "T02", { 보수: "유급" })];
    for (const answer of [null, "unknown", "allowance_ok"]) {
      expect(ids(forType(programs, t02, answer, TODAY).contacts), String(answer)).toEqual(["b_paid", "a_volunteer"]); // 맨 뒤로
    }
    expect(ids(forType(programs, t02, "unpaid_ok", TODAY).contacts)).toEqual(["a_volunteer", "b_paid"]); // 앞으로
  });

  it("detail_tag_overlap_moves_program_up: 세부태그가 겹치면 앞으로 온다", () => {
    const programs = [row("a", "T01"), row("b", "T01", { 세부태그: "D01.explore" })];
    expect(ids(forType(programs, typeOf("T01"), ["explore"], TODAY).contacts)).toEqual(["b", "a"]);
    expect(ids(forType(programs, typeOf("T01"), ["unknown"], TODAY).contacts)).toEqual(["a", "b"]);
  });

  it("nationwide_window_comes_after_local: 전국 전화 창구는 안산 기관 뒤에 온다", () => {
    const programs = [
      row("a_call", "T10", { 범위: "전국" }),
      row("b_local", "T10"),
      row("c_local_event", "T10", { 종류: "기간프로그램" }),
    ];
    expect(ids(forType(programs, typeOf("T10"), null, TODAY).contacts)).toEqual(["b_local", "c_local_event", "a_call"]);
  });

  it("conditions_are_kept_for_display_not_evaluated: 글로 적힌 조건으로는 거르지 않는다", () => {
    const programs = [row("care", "T11", { 확인필요: "돌봄받는 분의 나이|돌봄 필요 정도", 대상: "65세 이상" })];
    expect(ids(forType(programs, typeOf("T11"), ["adult"], TODAY).contacts)).toEqual(["care"]);
  });

  it("first_consult_is_general_window", () => {
    const programs = [
      row("general", "T01", { 첫상담: "Y" }),
      row("closed_general", "T01", { 첫상담: "Y", 매칭가능: "N" }),
      row("x", "T01"),
    ];
    expect(ids(firstConsult(programs, TODAY))).toEqual(["general"]);
  });

  it("same_input_same_result", () => {
    const programs = [row("a", "T01"), row("b", "T01|T04", { 종류: "목록" }), row("c", "T04", { 종류: "기간프로그램" })];
    const once = () => JSON.stringify(buildResult(programs, types, ["T01", "T04"], {}, TODAY).map((r) => [r.typeId, ids(r.contacts), ids(r.lists)]));
    expect(new Set(Array.from({ length: 5 }, once)).size).toBe(1);
  });

  it("넘겨받은 목록의 순서를 바꾸지 않는다", () => {
    const programs = [row("b", "T01"), row("a", "T01")];
    forType(programs, typeOf("T01"), null, TODAY);
    expect(ids(programs)).toEqual(["b", "a"]);
  });
});

describe("실제 정보표", () => {
  it("real_table_never_shows_unavailable_rows: 끝났거나 참여할 수 없는 곳은 나오지 않는다", () => {
    const blocked = new Set(appData.programs.filter((p) => p["매칭가능"] !== "Y" || p["55~64세참여"] === "불가").map((p) => p.id));
    for (const when of [TODAY, dayOnly("2027-06-01")]) {
      for (const result of buildResult(appData.programs, types, types.map((t) => t.id), {}, when)) {
        const shown = [...result.contacts, ...result.lists];
        expect(shown.filter((p) => blocked.has(p.id))).toEqual([]);
        expect(shown.every((p) => !p["표시종료일"] || p["표시종료일"] >= when.day)).toBe(true);
      }
    }
  });
});

describe("AI에게 보낼 후보", () => {
  it("ai_pool_has_only_showable_contacts", () => {
    const programs = [
      row("a", "T01"), row("b", "T04"), row("both", "T01|T04"), row("other", "T09"),
      row("closed", "T01", { 매칭가능: "N" }), row("blocked", "T01", { "55~64세참여": "불가" }),
      row("expired", "T01", { 표시종료일: "2026-11-16" }), row("list", "T01", { 종류: "목록" }),
    ];
    expect([...ids(aiPool(programs, types, ["T01", "T04"], {}, TODAY))].sort()).toEqual(["a", "b", "both"]);
    // 유형을 정하지 않았으면 보여 줘도 되는 곳 전체(목록 제외)
    expect([...ids(aiPool(programs, types, [], {}, TODAY))].sort()).toEqual(["a", "b", "both", "other"]);
  });

  it("ai_pool_follows_detail_exclude", () => {
    const programs = [row("paid", "T02", { 보수: "유급" }), row("unpaid", "T02", { 보수: "무보수" })];
    expect(ids(aiPool(programs, types, ["T02"], { T02: "wage_required" }, TODAY))).toEqual(["paid"]);
  });
});
