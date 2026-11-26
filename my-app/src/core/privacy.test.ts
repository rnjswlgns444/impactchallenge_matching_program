// 개인정보 지우기 테스트. app/tests/test_core.py의 scrub 테스트를 같은 이름으로 옮긴 것이다.

import { describe, expect, it } from "vitest";

import { REMOVED, scrub } from "./privacy";

describe("개인정보 지우기", () => {
  it.each(["010-1234-5678", "01012345678", "031 123 4567", "02.123.4567", "abc.def@example.com"])(
    "scrub_removes_contacts: %s",
    (contact) => {
      expect(scrub(`연락처는 ${contact} 입니다`)).toBe(`연락처는 ${REMOVED} 입니다`);
    }
  );

  it("scrub_removes_resident_number", () => {
    expect(scrub("주민번호 600101-2345678 이에요")).toBe(`주민번호 ${REMOVED} 이에요`);
  });

  it("scrub_keeps_normal_text: 보통 글의 숫자는 지우지 않는다", () => {
    expect(scrub("주 3일, 하루 4시간 2026년")).toBe("주 3일, 하루 4시간 2026년");
  });

  it("빈 글과 없는 글은 빈 글이다", () => {
    expect(scrub("")).toBe("");
    expect(scrub(null)).toBe("");
    expect(scrub(undefined)).toBe("");
  });

  it("한 글에 여러 개가 있으면 모두 지운다", () => {
    expect(scrub("010-1111-2222 또는 a@b.co, 010-3333-4444")).toBe(`${REMOVED} 또는 ${REMOVED}, ${REMOVED}`);
  });

  it("한글에 붙어 있는 번호도 지운다", () => {
    expect(scrub("전화는01012345678이에요")).toBe(`전화는${REMOVED}이에요`);
  });
});
